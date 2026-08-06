"use client";

import { useState } from "react";
import { MessageCircle, Send, Phone, ShieldAlert, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trackWhatsAppClick } from "@/lib/actions/ads";
import { normalizeCameroonPhone } from "@/lib/phone";

interface Props {
  adId: string;
  /** Numéro de contact (celui du compte escort — WhatsApp et/ou Telegram). */
  whatsappPhone: string;
  whatsappEnabled: boolean;
  telegramEnabled: boolean;
  /** Numéro d'appel (optionnel). */
  callPhone?: string | null;
  adTitle: string;
}

export function ContactCard({
  adId,
  whatsappPhone,
  whatsappEnabled,
  telegramEnabled,
  callPhone,
  adTitle,
}: Props) {
  const [opening, setOpening] = useState(false);
  const cleanPhone = normalizeCameroonPhone(whatsappPhone);

  function openWhatsApp() {
    setOpening(true);
    // Track non-bloquant (fire & forget)
    trackWhatsAppClick(adId).catch(() => null);

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
      `Bonjour, je vous écris au sujet de votre annonce "${adTitle}" sur Affinité.`,
    )}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
    setTimeout(() => setOpening(false), 800);
  }

  function openTelegram() {
    window.open(`https://t.me/+${cleanPhone}`, "_blank", "noopener,noreferrer");
  }

  return (
    <Card className="border-primary/30">
      <CardContent className="space-y-4 p-6">
        <div>
          <p className="mb-1 text-xs uppercase text-muted-foreground">Contact</p>
          <p className="select-all font-mono text-lg">{whatsappPhone}</p>
        </div>

        {whatsappEnabled && (
          <Button
            onClick={openWhatsApp}
            disabled={opening}
            size="lg"
            className="w-full bg-emerald-500 text-white hover:bg-emerald-600"
          >
            {opening ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <MessageCircle className="h-5 w-5" />
            )}
            Contacter sur WhatsApp
          </Button>
        )}

        {telegramEnabled && (
          <Button
            onClick={openTelegram}
            size="lg"
            className="w-full bg-sky-500 text-white hover:bg-sky-600"
          >
            <Send className="h-5 w-5" />
            Contacter sur Telegram
          </Button>
        )}

        {callPhone && (
          <Button asChild variant="outline" size="lg" className="w-full">
            <a href={`tel:${callPhone}`}>
              <Phone className="h-5 w-5" /> Appeler
            </a>
          </Button>
        )}

        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
          <p className="flex items-start gap-2 font-semibold">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            Sécurité : ne payez jamais d'avance avant de rencontrer la personne. Signalez tout comportement suspect.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
