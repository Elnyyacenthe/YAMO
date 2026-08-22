import type { Metadata } from "next";
import Link from "next/link";
import { Crown, Star, Check, Gift } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatXAF } from "@/lib/utils";
import { getEscortSubscriptionPricing, getFreeTrialConfig, formatTrialDuration } from "@/lib/escort-subscription";

export const metadata: Metadata = { title: "Tarifs Premium" };

export default async function PricingPage() {
  const [stdPricing, premPricing, vipPricing, trial] = await Promise.all([
    getEscortSubscriptionPricing("STANDARD"),
    getEscortSubscriptionPricing("PREMIUM"),
    getEscortSubscriptionPricing("VIP"),
    getFreeTrialConfig(),
  ]);

  const PLANS = [
    {
      tier: "STANDARD",
      name: "Standard",
      price: stdPricing.amount,
      days: stdPricing.days,
      icon: Check,
      features: [`Annonce active ${stdPricing.days} jours`, "3 photos", "Visible dans les recherches"],
    },
    {
      tier: "PREMIUM",
      name: "Premium",
      price: premPricing.amount,
      days: premPricing.days,
      icon: Star,
      badge: "Recommandé",
      features: [
        "Tout du Standard",
        "Badge Premium visible",
        "Mise en avant sur la ville",
        "10 photos",
        `${premPricing.days} jours boost`,
        "+300% de vues en moyenne",
      ],
    },
    {
      tier: "VIP",
      name: "VIP",
      price: vipPricing.amount,
      days: vipPricing.days,
      icon: Crown,
      badge: "Visibilité max",
      features: [
        "Tout du Premium",
        "Badge VIP doré",
        "Top page d'accueil",
        "Photos illimitées",
        `Boost prioritaire ${vipPricing.days}j`,
        "Support dédié",
        "+700% de vues",
      ],
    },
  ];

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-5xl font-bold">
          Boostez vos <span className="gradient-text">revenus</span>
        </h1>
        <p className="mt-4 text-muted-foreground">
          Choisissez l'offre qui vous correspond. Aucun engagement, payez uniquement pour la période choisie.
        </p>

        {/* v21 — l'offre d'essai est pilotée depuis le dashboard admin : si elle est
            désactivée, ce bandeau disparaît automatiquement du site. */}
        {trial.enabled && (
          <div className="mt-6 rounded-2xl border border-violet-500/40 bg-violet-500/10 p-5 text-left sm:text-center">
            <p className="flex items-center justify-center gap-2 font-display text-xl font-bold">
              <Gift className="h-5 w-5 text-violet-400" />
              Nouvelle escorte ? {formatTrialDuration(trial.days)} offert
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              À l'inscription, votre abonnement <strong>{trial.tier}</strong> est activé{" "}
              <strong>gratuitement pendant {formatTrialDuration(trial.days)}</strong> — vous publiez
              immédiatement, sans rien payer. Ensuite seulement, vous choisissez l'offre qui vous
              convient parmi celles ci-dessous.
            </p>
            <Button asChild className="mt-4">
              <Link href="/inscription?role=ESCORT">
                <Gift className="h-4 w-4" /> Profiter de {formatTrialDuration(trial.days)} offert
              </Link>
            </Button>
          </div>
        )}
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          return (
            <Card key={plan.tier} className={plan.tier === "VIP" ? "border-amber-500/50" : ""}>
              {trial.enabled && plan.tier === trial.tier ? (
                <Badge variant="vip" className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  🎁 {formatTrialDuration(trial.days)} offert
                </Badge>
              ) : (
                plan.badge && (
                  <Badge variant="vip" className="absolute -top-3 left-1/2 -translate-x-1/2">
                    {plan.badge}
                  </Badge>
                )
              )}
              <CardContent className="space-y-4 p-8">
                <Icon className="h-10 w-10 text-primary" />
                <h2 className="font-display text-2xl font-bold">{plan.name}</h2>
                <p className="text-4xl font-bold">{formatXAF(plan.price)}</p>
                <p className="text-xs text-muted-foreground">/ {plan.days} jours</p>
                <ul className="space-y-2 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full" variant={plan.tier === "VIP" ? "accent" : "default"}>
                  <Link href={plan.tier === "STANDARD" ? "/poster-une-annonce" : "/escort/premium"}>
                    Choisir {plan.name}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="mx-auto mt-8 max-w-xl text-center text-sm text-muted-foreground">
        Paiement par MTN Mobile Money ou Orange Money. Activation manuelle sous 1h ouvrée. Aucun remboursement en cas
        de violation des CGU.
      </p>
    </div>
  );
}
