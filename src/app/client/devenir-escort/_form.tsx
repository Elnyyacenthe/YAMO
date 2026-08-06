"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  becomeEscortAction,
  type BecomeEscortState,
} from "@/lib/actions/become-escort";

export function BecomeEscortForm({ currentPhone }: { currentPhone: string | null }) {
  const [state, formAction, pending] = useActionState<BecomeEscortState | null, FormData>(
    becomeEscortAction,
    null,
  );
  // Champ contrôlé : en cas d'erreur (ex: numéro déjà utilisé), la saisie
  // reste affichée — pas besoin de tout retaper depuis le début.
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (state?.ok) {
      toast.success("Vous êtes maintenant escort 🎉");
      // Hard navigation pour rafraîchir la session avec le nouveau rôle
      window.location.assign("/escort/dashboard");
    } else if (state && !state.ok) {
      toast.error(state.error);
    }
  }, [state]);

  const redirecting = state?.ok === true;

  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <h2 className="font-display text-xl font-bold">Confirmations obligatoires</h2>
            <p className="text-sm text-muted-foreground">
              En passant côté escort, vous vous engagez juridiquement. Lisez et cochez chaque case.
            </p>
          </div>
        </div>

        <form action={formAction} className="space-y-3">
          <label className="flex items-start gap-3 rounded-lg border border-border/60 bg-card p-3">
            <Checkbox name="acceptAdult" required />
            <span className="text-sm">
              Je certifie sur l'honneur être <strong>majeur(e) (18 ans révolus)</strong> et le rester
              pendant toute la durée d'utilisation de mon compte escort.
            </span>
          </label>

          <label className="flex items-start gap-3 rounded-lg border border-border/60 bg-card p-3">
            <Checkbox name="acceptConditions" required />
            <span className="text-sm">
              Je certifie agir <strong>de mon plein gré, sans contrainte ni pression</strong>, être
              seul(e) bénéficiaire des paiements, ne pas être sous l'influence d'un proxénète ou
              d'un réseau, et ne représenter aucun mineur dans mes annonces.
            </span>
          </label>

          {!currentPhone && (
            <div className="space-y-2 rounded-lg border border-border/60 bg-card p-3">
              <Label htmlFor="phone">Numéro de téléphone</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="+237 6XX XX XX XX"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              {state && !state.ok && (
                <p className="text-xs text-destructive">{state.error}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Votre compte n'a pas encore de numéro. Celui-ci deviendra le contact fixe
                (WhatsApp/Telegram) de vos futures annonces — chaque escorte doit en avoir un, et il
                ne peut pas être partagé avec un autre compte.
              </p>
            </div>
          )}

          <label className="flex items-start gap-3 rounded-lg border border-border/60 bg-card p-3">
            <Checkbox name="acceptTerms" required />
            <span className="text-sm">
              J'accepte les{" "}
              <a
                href="/cgu"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                CGU ↗
              </a>{" "}
              spécifiques aux annonceurs (articles 6 à 11), notamment l'engagement de modération et le
              risque de <strong>bannissement définitif d'identité</strong> en cas d'infraction grave.
            </span>
          </label>

          <Button
            type="submit"
            disabled={pending || redirecting}
            size="lg"
            className="w-full"
          >
            {(pending || redirecting) && <Loader2 className="h-4 w-4 animate-spin" />}
            {redirecting
              ? "Redirection…"
              : pending
                ? "Conversion en cours…"
                : "Je certifie et deviens escort"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Cette action est irréversible côté self-service. Pour revenir client, contactez le support.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
