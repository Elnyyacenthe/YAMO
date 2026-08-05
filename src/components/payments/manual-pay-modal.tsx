"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Phone, CheckCircle2, Smartphone, Copy, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

export type DeclareResult = { ok: true; paymentId: string } | { ok: false; error: string };

interface Props {
  /** Bouton qui ouvre le modal */
  trigger: React.ReactNode;
  /** Titre affiché dans le modal */
  title: string;
  /** Description courte de ce que l'user va payer */
  description: string;
  /** Montant en FCFA */
  amount: number;
  /** Téléphone par défaut (pré-rempli si on a déjà celui du user) */
  defaultPhone?: string;
  /** Coordonnées Mobile Money de la plateforme (réglées dans /admin/reglages) */
  recipientName?: string;
  mtnNumber?: string;
  orangeNumber?: string;
  instructions?: string;
  /** Server action qui déclare le paiement manuel */
  declare: (input: { senderPhone: string; reference: string }) => Promise<DeclareResult>;
}

type Step = "form" | "submitted";

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-secondary/40 px-3 py-2">
      <div>
        <p className="text-[10px] uppercase text-muted-foreground">{label}</p>
        <p className="font-mono text-sm font-semibold">{value}</p>
      </div>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={async () => {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
}

export function ManualPayModal({
  trigger,
  title,
  description,
  amount,
  defaultPhone,
  recipientName,
  mtnNumber,
  orangeNumber,
  instructions,
  declare,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [senderPhone, setSenderPhone] = useState(defaultPhone ?? "");
  const [reference, setReference] = useState("");
  const [pending, startTransition] = useTransition();

  function reset() {
    setStep("form");
    setReference("");
  }

  function handleOpenChange(o: boolean) {
    setOpen(o);
    if (!o) setTimeout(reset, 300);
  }

  function submit() {
    if (!senderPhone.trim()) return toast.error("Saisissez le numéro utilisé pour l'envoi");
    if (!reference.trim()) return toast.error("Saisissez la référence de la transaction");
    startTransition(async () => {
      const res = await declare({ senderPhone, reference });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setStep("submitted");
      router.refresh();
    });
  }

  const hasNumbers = Boolean(mtnNumber || orangeNumber);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {step === "form" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-center">
              <p className="text-xs uppercase text-muted-foreground">Montant à envoyer</p>
              <p className="font-display text-3xl font-bold text-primary">
                {amount.toLocaleString("fr-FR")} <span className="text-lg">FCFA</span>
              </p>
            </div>

            {hasNumbers ? (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  1. Envoyez ce montant exact via Mobile Money{recipientName ? ` à ${recipientName}` : ""} :
                </p>
                {mtnNumber && <CopyField label="MTN Mobile Money" value={mtnNumber} />}
                {orangeNumber && <CopyField label="Orange Money" value={orangeNumber} />}
                {instructions && <p className="text-xs text-muted-foreground">{instructions}</p>}
              </div>
            ) : (
              <p className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-300">
                Les coordonnées de paiement n'ont pas encore été configurées. Contactez le support.
              </p>
            )}

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                2. Une fois l'envoi effectué, indiquez vos infos ci-dessous :
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="manual-phone">Numéro utilisé pour l'envoi</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="manual-phone"
                    type="tel"
                    inputMode="tel"
                    placeholder="6XX XXX XXX"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    className="pl-10"
                    disabled={pending}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="manual-ref">Référence de la transaction (reçue par SMS)</Label>
                <Input
                  id="manual-ref"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Ex : MP240612.1234.A56789"
                  disabled={pending}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={submit}
                disabled={pending || !senderPhone.trim() || !reference.trim()}
                className="w-full"
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Smartphone className="h-4 w-4" />}
                J'ai payé, envoyer ma déclaration
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "submitted" && (
          <div className="space-y-4 py-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <div>
              <p className="font-semibold text-emerald-500">Déclaration envoyée ✅</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Un admin vérifie la réception du paiement et active votre abonnement, généralement sous
                quelques heures. Vous recevrez une notification.
              </p>
            </div>
            <Button onClick={() => handleOpenChange(false)} className="w-full">
              Fermer
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
