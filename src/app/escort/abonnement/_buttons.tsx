"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ManualPayModal } from "@/components/payments/manual-pay-modal";
import { declareManualSubscriptionPaymentAction } from "@/lib/actions/manual-payment";

const DURATIONS = [
  { months: 1 as const, label: "1 mois", discount: 0 },
  { months: 3 as const, label: "3 mois", discount: 5 },
  { months: 12 as const, label: "1 an", discount: 15 },
];

interface PaymentInfo {
  recipientName: string;
  mtnNumber: string;
  orangeNumber: string;
  instructions: string;
}

export function SubscribeButtons({
  tier,
  monthly,
  defaultPhone,
  paymentInfo,
}: {
  tier: "STANDARD" | "PREMIUM" | "VIP";
  monthly: number;
  defaultPhone?: string;
  paymentInfo: PaymentInfo;
}) {
  const [months, setMonths] = useState<1 | 3 | 12>(1);
  const baseTotal = monthly * months;
  const selected = DURATIONS.find((d) => d.months === months)!;
  const total = Math.round(baseTotal * (1 - selected.discount / 100));
  const saved = baseTotal - total;

  // Standard : période fixe unique (1 semaine), pas de sélecteur ni de remise.
  if (tier === "STANDARD") {
    return (
      <div className="space-y-2 pt-2">
        <ManualPayModal
          trigger={
            <Button className="w-full" size="sm">
              Souscrire — {monthly.toLocaleString("fr-FR")} FCFA
            </Button>
          }
          title="Abonnement STANDARD — 1 semaine"
          description="Période fixe d'une semaine, sans engagement. Activation après vérification admin."
          amount={monthly}
          defaultPhone={defaultPhone}
          recipientName={paymentInfo.recipientName}
          mtnNumber={paymentInfo.mtnNumber}
          orangeNumber={paymentInfo.orangeNumber}
          instructions={paymentInfo.instructions}
          declare={({ senderPhone, reference }) =>
            declareManualSubscriptionPaymentAction({ tier, months: 1, senderPhone, reference })
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-2 pt-2">
      <div className="grid grid-cols-3 gap-1">
        {DURATIONS.map((d) => (
          <button
            key={d.months}
            type="button"
            onClick={() => setMonths(d.months)}
            className={`rounded-md border p-1.5 text-[10px] transition ${
              months === d.months
                ? "border-primary bg-primary/15"
                : "border-border hover:border-primary/40"
            }`}
          >
            <p className="font-bold">{d.label}</p>
            {d.discount > 0 && (
              <p className="text-[9px] font-bold text-emerald-400">−{d.discount}%</p>
            )}
          </button>
        ))}
      </div>

      {selected.discount > 0 && (
        <p className="rounded bg-emerald-500/10 p-1.5 text-center text-[10px] text-emerald-300">
          ✨ Économisez {saved.toLocaleString("fr-FR")} FCFA avec l'engagement {selected.label}
        </p>
      )}

      <ManualPayModal
        trigger={
          <Button className="w-full" size="sm">
            {selected.discount > 0 ? (
              <span className="flex items-baseline gap-1.5">
                <span className="text-muted-foreground line-through opacity-70 text-xs">
                  {baseTotal.toLocaleString("fr-FR")}
                </span>
                <span>Souscrire — {total.toLocaleString("fr-FR")} FCFA</span>
              </span>
            ) : (
              <span>Souscrire — {total.toLocaleString("fr-FR")} FCFA</span>
            )}
          </Button>
        }
        title={`Abonnement ${tier} ${months} mois`}
        description={
          selected.discount > 0
            ? `Réduction ${selected.discount}% appliquée (${saved.toLocaleString("fr-FR")} FCFA économisés). Activation après vérification admin.`
            : `Activation après vérification admin.`
        }
        amount={total}
        defaultPhone={defaultPhone}
        recipientName={paymentInfo.recipientName}
        mtnNumber={paymentInfo.mtnNumber}
        orangeNumber={paymentInfo.orangeNumber}
        instructions={paymentInfo.instructions}
        declare={({ senderPhone, reference }) =>
          declareManualSubscriptionPaymentAction({ tier, months, senderPhone, reference })
        }
      />
    </div>
  );
}
