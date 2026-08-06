import type { Metadata } from "next";
import Link from "next/link";
import { Crown, Star, Check } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatXAF } from "@/lib/utils";
import { getEscortSubscriptionPricing } from "@/lib/escort-subscription";

export const metadata: Metadata = { title: "Tarifs Premium" };

export default async function PricingPage() {
  const [stdPricing, premPricing, vipPricing] = await Promise.all([
    getEscortSubscriptionPricing("STANDARD"),
    getEscortSubscriptionPricing("PREMIUM"),
    getEscortSubscriptionPricing("VIP"),
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
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          return (
            <Card key={plan.tier} className={plan.tier === "VIP" ? "border-amber-500/50" : ""}>
              {plan.badge && (
                <Badge variant="vip" className="absolute -top-3 left-1/2 -translate-x-1/2">
                  {plan.badge}
                </Badge>
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
