"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { getSettingNumber } from "@/lib/settings";
import { normalizePhoneForKpay, makeExternalId } from "@/lib/kpay";
import type { PaymentIntent } from "@/lib/kpay-direct";

export type DeclareManualPaymentResult =
  | { ok: true; paymentId: string }
  | { ok: false; error: string };

/**
 * Déclaration manuelle d'un paiement d'abonnement escort (Mobile Money envoyé
 * directement au compte de la plateforme, hors API K-Pay).
 *
 * Crée un Payment PENDING avec provider=MANUAL. Un admin vérifie la réception
 * côté /admin/paiements puis valide → applique l'intent (active l'abonnement).
 */
export async function declareManualSubscriptionPaymentAction(input: {
  tier: "STANDARD" | "PREMIUM" | "VIP";
  months: 1 | 3 | 12;
  autoRenew?: boolean;
  senderPhone: string;
  reference: string;
}): Promise<DeclareManualPaymentResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Non authentifié" };

  const ip = (await headers()).get("x-forwarded-for") ?? "anon";
  const limited = await rateLimit(`manualsub:${session.user.id}:${ip}`, {
    limit: 5,
    windowMs: 60_000,
  });
  if (!limited.success) return { ok: false, error: "Trop de tentatives, réessayez dans une minute" };

  const reference = input.reference.trim();
  if (reference.length < 4) return { ok: false, error: "Référence de transaction invalide" };

  const senderPhone = normalizePhoneForKpay(input.senderPhone);
  if (senderPhone.length !== 12 || !senderPhone.startsWith("237")) {
    return { ok: false, error: "Numéro Cameroun invalide" };
  }

  const months = ([1, 3, 12].includes(input.months) ? input.months : 1) as 1 | 3 | 12;

  // Anti-spam : une seule déclaration en attente à la fois pour l'abonnement
  const pending = await prisma.payment.findFirst({
    where: {
      userId: session.user.id,
      status: "PENDING",
      provider: "MANUAL",
      intent: { path: ["type"], equals: "ESCORT_SUBSCRIPTION" },
    },
    select: { id: true },
  });
  if (pending) {
    return {
      ok: false,
      error: "Vous avez déjà une déclaration en attente de validation par un admin.",
    };
  }

  const tierKey = input.tier.toLowerCase();
  const fallback = input.tier === "VIP" ? 15000 : input.tier === "PREMIUM" ? 5000 : 2000;
  const monthly = await getSettingNumber(`pricing.escortSubscription.${tierKey}.amount`, fallback);
  const daysPerMonth = await getSettingNumber("pricing.escortSubscription.days", 30);

  const discountPercent = months >= 12 ? 15 : months >= 3 ? 5 : 0;
  const amount = Math.round(monthly * months * (1 - discountPercent / 100));
  const days = daysPerMonth * months;

  const intent: PaymentIntent = {
    type: "ESCORT_SUBSCRIPTION",
    payload: { userId: session.user.id, tier: input.tier, months, days, autoRenew: input.autoRenew },
  };

  const payment = await prisma.payment.create({
    data: {
      userId: session.user.id,
      amount,
      currency: "XAF",
      provider: "MANUAL",
      status: "PENDING",
      providerRef: makeExternalId("manualsub", session.user.id),
      intent: intent as unknown as Prisma.InputJsonValue,
      metadata: { declaredPhone: senderPhone, declaredReference: reference, submittedVia: "manual" },
    },
  });

  revalidatePath("/escort/abonnement");
  return { ok: true, paymentId: payment.id };
}
