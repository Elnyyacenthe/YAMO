"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Flag, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ClientAuthModal } from "@/components/auth/client-auth-modal";
import { submitAdReportAction } from "@/lib/actions/support";

interface Props {
  /** Titre de l'annonce, utilisé pour le message envoyé au support. */
  adTitle: string;
  adUrl: string;
  isLoggedIn?: boolean;
}

/**
 * "Signaler" ouvre directement une discussion avec le support (fil unique,
 * cf. lib/actions/support.ts) : le message identifiant l'annonce est envoyé
 * automatiquement, suivi d'une relance auto demandant des preuves.
 */
export function ReportButton({ adTitle, adUrl, isLoggedIn = true }: Props) {
  const router = useRouter();
  const [authOpen, setAuthOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function submitReport() {
    startTransition(async () => {
      const res = await submitAdReportAction({ adTitle, adUrl });
      if (res.ok) {
        router.push("/client/support");
      } else {
        toast.error(res.error);
      }
    });
  }

  function handleClick() {
    if (!isLoggedIn) {
      setAuthOpen(true);
      return;
    }
    submitReport();
  }

  return (
    <>
      <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleClick} disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flag className="h-4 w-4" />}
        Signaler
      </Button>
      <ClientAuthModal open={authOpen} onOpenChange={setAuthOpen} onSuccess={submitReport} />
    </>
  );
}
