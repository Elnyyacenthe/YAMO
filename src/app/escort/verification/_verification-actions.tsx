"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ManualPayModal } from "@/components/payments/manual-pay-modal";
import { declareManualVerificationPaymentAction } from "@/lib/actions/manual-payment";
import { retryVerificationAction } from "@/lib/actions/verification";

interface PaymentInfo {
  recipientName: string;
  mtnNumber: string;
  orangeNumber: string;
  instructions: string;
}

export function PayVerificationButton({
  price,
  defaultPhone,
  paymentInfo,
}: {
  price: number;
  defaultPhone?: string;
  paymentInfo: PaymentInfo;
}) {
  return (
    <ManualPayModal
      trigger={
        <Button size="lg" className="w-full">
          💳 Payer la vérification ({price.toLocaleString("fr-FR")} FCFA)
        </Button>
      }
      title="Paiement de la vérification d'identité"
      description="Payez les frais de vérification, puis envoyez vos documents directement sur Telegram."
      amount={price}
      defaultPhone={defaultPhone}
      recipientName={paymentInfo.recipientName}
      mtnNumber={paymentInfo.mtnNumber}
      orangeNumber={paymentInfo.orangeNumber}
      instructions={paymentInfo.instructions}
      declare={({ senderPhone, reference }) =>
        declareManualVerificationPaymentAction({ senderPhone, reference })
      }
    />
  );
}

export function RetryVerificationButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function retry() {
    startTransition(async () => {
      const res = await retryVerificationAction();
      if (res.ok) {
        toast.success("Vous pouvez maintenant contacter l'équipe sur Telegram.");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <Button onClick={retry} disabled={pending} size="lg" className="w-full">
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
      Relancer ma demande (gratuit)
    </Button>
  );
}
