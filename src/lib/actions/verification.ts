"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export type VerificationState =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Relance gratuite après un refus : l'escorte a déjà payé lors de sa
 * première demande, donc pas de nouveau paiement — on recrée juste une
 * IdVerification PENDING. Les documents sont envoyés directement sur
 * Telegram (cf. /escort/verification), pas d'upload sur le site.
 */
export async function retryVerificationAction(): Promise<VerificationState> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Non authentifié" };

  const latest = await prisma.idVerification.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  if (!latest || latest.status !== "REJECTED") {
    return { ok: false, error: "Aucune vérification refusée à relancer." };
  }

  await prisma.idVerification.create({
    data: { userId: session.user.id, status: "PENDING" },
  });

  revalidatePath("/escort/verification");
  return { ok: true };
}
