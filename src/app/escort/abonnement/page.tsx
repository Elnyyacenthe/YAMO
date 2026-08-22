import { redirect } from "next/navigation";
import { CreditCard, Check, Crown, Star, Sparkles, AlertTriangle, Clock, Gift } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSettingString } from "@/lib/settings";
import {
  getEscortSubscriptionStatus,
  getEscortSubscriptionPricing,
  getFreeTrialConfig,
  formatTrialDuration,
} from "@/lib/escort-subscription";
import { SubscribeButtons } from "./_buttons";

export default async function EscortAbonnementPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion?callbackUrl=/escort/abonnement");

  const [status, trialConfig, user, stdPricing, premPricing, vipPricing, recipientName, mtnNumber, orangeNumber, instructions, pendingPayment, paidSubscriptions] =
    await Promise.all([
      getEscortSubscriptionStatus(session.user.id),
      getFreeTrialConfig(),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { phone: true },
      }),
      getEscortSubscriptionPricing("STANDARD"),
      getEscortSubscriptionPricing("PREMIUM"),
      getEscortSubscriptionPricing("VIP"),
      getSettingString("payment.manual.recipientName", ""),
      getSettingString("payment.manual.mtnNumber", "678876470"),
      getSettingString("payment.manual.orangeNumber", "640528712"),
      getSettingString("payment.manual.instructions", ""),
      prisma.payment.findFirst({
        where: {
          userId: session.user.id,
          status: "PENDING",
          provider: "MANUAL",
          intent: { path: ["type"], equals: "ESCORT_SUBSCRIPTION" },
        },
        orderBy: { createdAt: "desc" },
      }),
      // A-t-elle déjà payé un abonnement ? Sert à distinguer « essai terminé »
      // d'un abonnement payant simplement arrivé à échéance.
      prisma.payment.count({
        where: {
          userId: session.user.id,
          status: "PAID",
          intent: { path: ["type"], equals: "ESCORT_SUBSCRIPTION" },
        },
      }),
    ]);

  const manualPaymentInfo = { recipientName, mtnNumber, orangeNumber, instructions };
  /** Essai consommé, jamais payé ensuite → on affiche le message « fin d'essai ». */
  const trialJustEnded = !!status.trialEndsAt && !status.isActive && paidSubscriptions === 0;

  const PLANS = [
    {
      tier: "STANDARD" as const,
      name: "Standard",
      monthly: stdPricing.amount,
      days: stdPricing.days,
      icon: Check,
      color: "border-border",
      features: ["1 annonce active", "3 photos max", "Tri normal", "Bump 500 FCFA/clic"],
    },
    {
      tier: "PREMIUM" as const,
      name: "Premium",
      monthly: premPricing.amount,
      days: premPricing.days,
      icon: Star,
      color: "border-primary/50",
      badge: "Recommandé",
      features: ["3 annonces actives", "10 photos par annonce", "Mise en avant ville", "Badge Premium", "Sticky 2 000 FCFA/clic"],
    },
    {
      tier: "VIP" as const,
      name: "VIP",
      monthly: vipPricing.amount,
      days: vipPricing.days,
      icon: Crown,
      color: "border-amber-500/50",
      badge: "Visibilité max",
      features: ["Annonces illimitées", "50 photos par annonce", "Top homepage", "Badge VIP doré", "Sticky inclus", "Support prioritaire"],
    },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="flex items-center gap-2 font-display text-3xl font-bold">
          <CreditCard className="h-7 w-7 text-primary" /> Mon abonnement
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Abonnement obligatoire pour publier. Paiement Mobile Money direct, activation par
          l'équipe Affinité après vérification.
          {trialConfig.enabled && !status.trialEndsAt && (
            <> Les nouvelles escortes profitent de <strong>{formatTrialDuration(trialConfig.days)} offert{formatTrialDuration(trialConfig.days).startsWith("1 ") ? "" : "s"}</strong>.</>
          )}
        </p>
      </header>

      {/* Déclaration en attente de validation admin */}
      {pendingPayment && (
        <Card className="border-sky-500/40 bg-sky-500/5">
          <CardContent className="flex items-start gap-3 p-6">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-sky-400" />
            <div>
              <p className="font-semibold">Déclaration en attente de validation</p>
              <p className="text-sm text-muted-foreground">
                Votre paiement de {pendingPayment.amount.toLocaleString("fr-FR")} FCFA a été déclaré le{" "}
                {pendingPayment.createdAt.toLocaleDateString("fr-FR")}. Un admin vérifie la réception et
                activera votre abonnement sous peu.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statut actuel */}
      {status.isTrial ? (
        <Card className="border-violet-500/40 bg-violet-500/10">
          <CardContent className="flex flex-col gap-3 p-6 md:flex-row md:items-center">
            <Gift className="h-10 w-10 text-violet-400" />
            <div className="flex-1">
              <p className="font-display text-lg font-bold">
                Essai gratuit <span className="gradient-text">{status.tier}</span> en cours
              </p>
              <p className="text-sm text-muted-foreground">
                Offert jusqu'au <strong>{status.until!.toLocaleDateString("fr-FR")}</strong>{" "}
                ({status.daysLeft} jour{status.daysLeft > 1 ? "s" : ""} restant{status.daysLeft > 1 ? "s" : ""}).
                Vous publiez normalement pendant toute la durée de l'essai.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Quotas : {status.caps.ads} annonce{status.caps.ads > 1 ? "s" : ""} active{status.caps.ads > 1 ? "s" : ""} · {status.caps.photos} photos / annonce
              </p>
              <p className="mt-2 text-sm font-medium text-violet-300">
                ⚠️ À la fin de l'essai, vos annonces seront mises en pause. Choisissez un abonnement
                ci-dessous pour rester en ligne — le temps payé s'ajoute à la fin de votre essai.
              </p>
            </div>
            <Badge variant="vip">ESSAI GRATUIT</Badge>
          </CardContent>
        </Card>
      ) : status.isActive ? (
        <Card className="border-emerald-500/40 bg-emerald-500/10">
          <CardContent className="flex flex-col gap-3 p-6 md:flex-row md:items-center">
            <Sparkles className="h-10 w-10 text-emerald-400" />
            <div className="flex-1">
              <p className="font-display text-lg font-bold">
                Abonnement <span className="gradient-text">{status.tier}</span> actif
              </p>
              <p className="text-sm text-muted-foreground">
                Valable jusqu'au{" "}
                <strong>{status.until!.toLocaleDateString("fr-FR")}</strong>
                {" "}({status.daysLeft} jour{status.daysLeft > 1 ? "s" : ""} restant
                {status.daysLeft > 1 ? "s" : ""})
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Quotas : {status.caps.ads} annonce{status.caps.ads > 1 ? "s" : ""} active{status.caps.ads > 1 ? "s" : ""} · {status.caps.photos} photos / annonce
              </p>
            </div>
            <Badge variant="success">ACTIF</Badge>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardContent className="flex items-start gap-3 p-6">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-400" />
            <div>
              <p className="font-semibold">
                {trialJustEnded ? "Votre essai gratuit est terminé" : "Aucun abonnement actif"}
              </p>
              <p className="text-sm text-muted-foreground">
                {trialJustEnded
                  ? `Votre période d'essai s'est achevée le ${status.trialEndsAt!.toLocaleDateString("fr-FR")} et vos annonces sont en pause. Choisissez un abonnement ci-dessous pour les remettre en ligne.`
                  : "Vous ne pouvez pas publier d'annonce. Souscrivez à l'un des plans ci-dessous pour activer votre compte escort sur Affinité."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3 tiers */}
      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const isCurrent = status.isActive && status.tier === plan.tier;
          return (
            <Card key={plan.tier} className={`relative ${plan.color} ${isCurrent ? "ring-2 ring-primary" : ""}`}>
              {plan.badge && !isCurrent && (
                <Badge variant="vip" className="absolute -top-3 left-1/2 -translate-x-1/2">
                  {plan.badge}
                </Badge>
              )}
              {isCurrent && (
                <Badge variant="success" className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Votre plan actuel
                </Badge>
              )}
              <CardContent className="space-y-4 p-6">
                <Icon className="h-10 w-10 text-primary" />
                <div>
                  <h3 className="font-display text-2xl font-bold">{plan.name}</h3>
                  <p className="text-3xl font-bold">
                    {plan.monthly.toLocaleString("fr-FR")}{" "}
                    <span className="text-sm font-normal text-muted-foreground">FCFA / {plan.days}j</span>
                  </p>
                </div>
                <ul className="space-y-2 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="h-4 w-4 shrink-0 text-emerald-400" /> {f}
                    </li>
                  ))}
                </ul>
                {pendingPayment ? (
                  <Badge variant="outline" className="w-full justify-center py-2">
                    Déclaration en attente
                  </Badge>
                ) : (
                  <SubscribeButtons
                    tier={plan.tier}
                    monthly={plan.monthly}
                    defaultPhone={user?.phone ?? undefined}
                    paymentInfo={manualPaymentInfo}
                  />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Paiement Mobile Money direct (MTN / Orange). Après envoi, déclarez votre transaction — un admin
        active votre abonnement après vérification. Renouvellement manuel — vous serez prévenu(e) 3 jours
        avant l'expiration.
      </p>
    </div>
  );
}
