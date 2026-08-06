import Link from "next/link";
import { Crown, Star, BadgeCheck, Check, Gem } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatXAF } from "@/lib/utils";
import { getSettingNumber } from "@/lib/settings";
import { getEscortSubscriptionPricing } from "@/lib/escort-subscription";

export default async function PremiumPage() {
  const [stdPricing, premiumPrice, vipPrice, diamondPrice, premiumDays, vipDays, diamondDays] = await Promise.all([
    getEscortSubscriptionPricing("STANDARD"),
    getSettingNumber("pricing.premium.amount", 5000),
    getSettingNumber("pricing.vip.amount", 15000),
    getSettingNumber("pricing.diamond.amount", 50000),
    getSettingNumber("pricing.premium.days", 30),
    getSettingNumber("pricing.vip.days", 30),
    getSettingNumber("pricing.diamond.days", 30),
  ]);

  const PLANS = [
    {
      tier: "STANDARD",
      name: "Standard",
      price: stdPricing.amount,
      days: stdPricing.days,
      icon: Check,
      color: "border-border",
      features: ["Abonnement requis pour publier", "Modération sous 24h", "Contact WhatsApp masqué", "3 photos max"],
    },
    {
      tier: "PREMIUM",
      name: "Premium",
      price: premiumPrice,
      days: premiumDays,
      icon: Star,
      color: "border-primary/50",
      badge: "Le plus choisi",
      features: ["Mise en avant sur ville", "Badge Premium visible", "5 photos max", `${premiumDays} jours de boost`],
    },
    {
      tier: "VIP",
      name: "VIP",
      price: vipPrice,
      days: vipDays,
      icon: Crown,
      color: "border-amber-500/50",
      badge: "Visibilité max",
      features: ["Top de la page d'accueil", "Badge VIP doré", "15 photos max", `Boost prioritaire ${vipDays}j`, "Support dédié"],
    },
    {
      tier: "DIAMOND",
      name: "Diamond",
      price: diamondPrice,
      days: diamondDays,
      icon: Gem,
      color: "border-cyan-400/60",
      badge: "💎 1 SLOT / VILLE",
      features: ["SEULE annonce Diamond de la ville", "Badge Diamond brillant", "Photos illimitées", "Apparition exclusive en home", `${diamondDays}j d'exclusivité`],
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">
          Boostez votre <span className="gradient-text">visibilité</span>
        </h1>
        <p className="text-muted-foreground">
          Passez en Premium, VIP ou Diamond pour décupler le nombre de contacts.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          💡 Tarifs ci-dessous. Pour passer une annonce en supérieur :{" "}
          <Link href="/escort/annonces" className="text-primary hover:underline">
            allez sur vos annonces
          </Link>{" "}
          et utilisez les boutons d'upgrade. Paiement MoMo/Orange direct.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          return (
            <Card key={plan.tier} className={`relative ${plan.color}`}>
              {plan.badge && (
                <Badge variant="vip" className="absolute -top-3 left-1/2 -translate-x-1/2">
                  {plan.badge}
                </Badge>
              )}
              <CardContent className="space-y-4 p-6">
                <Icon className="h-10 w-10 text-primary" />
                <div>
                  <h3 className="font-display text-2xl font-bold">{plan.name}</h3>
                  <p className="text-3xl font-bold">
                    {formatXAF(plan.price)}
                    <span className="text-sm text-muted-foreground"> / {plan.days}j</span>
                  </p>
                </div>
                <ul className="space-y-2 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-sky-500/30 bg-sky-500/5">
        <CardContent className="space-y-3 p-6">
          <div className="flex items-center gap-3">
            <BadgeCheck className="h-6 w-6 text-sky-400" />
            <h3 className="font-display text-xl font-bold">Vérification d'identité</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Soumettez une pièce d'identité + selfie. Vérifiée → badge <strong>Vérifiée</strong> sur vos annonces (boost confiance).
          </p>
          <Button asChild variant="outline">
            <Link href="/escort/verification">Soumettre une vérification</Link>
          </Button>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Paiement par MTN Mobile Money ou Orange Money via K-Pay, à chaque achat.
        Aucun remboursement en cas de violation des{" "}
        <Link href="/cgu" target="_blank" className="text-primary hover:underline">
          CGU
        </Link>.
      </p>
    </div>
  );
}
