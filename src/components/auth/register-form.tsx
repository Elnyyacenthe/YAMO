"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, Sparkles, Heart, Gift } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { registerAction, clientQuickAuthAction, type AuthState } from "@/lib/actions/auth";

/** Offre d'essai gratuit affichée aux futures escortes (réglée dans /admin/reglages). */
export interface TrialOffer {
  enabled: boolean;
  tier: string;
  /** Durée lisible : « 1 mois », « 15 jours »… */
  label: string;
}

/** Inscription CLIENT — juste un pseudo + mot de passe, aucune donnée personnelle. */
function ClientRegisterForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const res = await clientQuickAuthAction({ mode: "signup", username, password, confirmPassword });
      if (res.ok) {
        toast.success("Compte créé 🎉");
        window.location.assign(res.redirectTo ?? "/client");
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-2xl">
          <Heart className="h-6 w-6 text-primary" /> Créer mon compte
        </CardTitle>
        <CardDescription>
          Nécessaire pour ajouter des favoris, signaler une annonce et contacter le service client.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="c-username">Pseudo</Label>
          <Input id="c-username" value={username} onChange={(e) => setUsername(e.target.value)} required minLength={2} disabled={pending} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="c-password">Mot de passe</Label>
            <Input id="c-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} disabled={pending} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-confirm">Confirmer</Label>
            <Input id="c-confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} disabled={pending} />
          </div>
        </div>

        <Button
          onClick={submit}
          disabled={pending || !username.trim() || !password || !confirmPassword}
          className="w-full"
          size="lg"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Créer mon compte
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Déjà un compte ?{" "}
          <Link href="/connexion" className="text-primary hover:underline">
            Se connecter
          </Link>
        </p>
        <p className="text-center text-xs text-muted-foreground">
          <strong>Escort</strong> ?{" "}
          <Link href="/inscription" className="text-primary hover:underline">
            Créez votre compte escort ici
          </Link>.
        </p>
      </CardContent>
    </Card>
  );
}

/** Inscription ESCORT — flux complet (email, téléphone, abonnement). */
function EscortRegisterForm({ trial }: { trial: TrialOffer }) {
  const [state, formAction, pending] = useActionState<AuthState | null, FormData>(
    registerAction,
    null,
  );
  // Champs contrôlés : en cas d'erreur (ex: numéro déjà utilisé), la saisie
  // reste affichée — pas besoin de tout retaper depuis le début.
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (state?.ok) {
      toast.success(
        state.freeTrial
          ? `Compte créé 🎉 — ${state.freeTrial.label} d'abonnement ${state.freeTrial.tier} offert, publiez dès maintenant !`
          : "Compte créé 🎉 — souscrivez maintenant à un plan pour publier vos annonces",
      );
      window.location.assign(state.redirectTo ?? "/escort/abonnement");
    } else if (state && !state.ok) {
      toast.error(state.error);
    }
  }, [state]);

  function fieldError(field: string) {
    const msg = state && !state.ok ? state.fieldErrors?.[field]?.[0] : undefined;
    return msg ? <p className="text-xs text-destructive">{msg}</p> : null;
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-2xl">
          <Sparkles className="h-6 w-6 text-primary" />
          Devenir escort sur Affinité
        </CardTitle>
        <CardDescription>
          Publiez vos annonces auprès de milliers de clients camerounais.{" "}
          {trial.enabled ? (
            <>
              Inscription gratuite et <strong>{trial.label} d&apos;abonnement {trial.tier} offert</strong> —
              aucun paiement demandé pour démarrer.
            </>
          ) : (
            <>
              Inscription gratuite, abonnement à partir de <strong>2 500 FCFA / semaine</strong>.
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="role" value="ESCORT" />
          <input type="hidden" name="tier" value="STANDARD" />

          <div className="space-y-2">
            <Label htmlFor="name">Pseudo / Nom</Label>
            <Input id="name" name="name" placeholder="Sandra" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} />
            {fieldError("name")}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="vous@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            {fieldError("email")}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone Cameroun</Label>
            <Input id="phone" name="phone" type="tel" placeholder="+237 6XX XX XX XX" required value={phone} onChange={(e) => setPhone(e.target.value)} />
            {fieldError("phone")}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" name="password" type="password" required minLength={8} />
              {fieldError("password")}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} />
              {fieldError("confirmPassword")}
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-border/60 bg-secondary/30 p-3">
            <div className="flex items-start gap-2">
              <Checkbox id="acceptAdult" name="acceptAdult" required />
              <Label htmlFor="acceptAdult" className="text-xs leading-tight">
                Je certifie avoir <strong>18 ans ou plus</strong> et accepter les contenus pour adultes.
              </Label>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox id="acceptTerms" name="acceptTerms" required />
              <Label htmlFor="acceptTerms" className="text-xs leading-tight">
                J'accepte les{" "}
                <a href="/cgu" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  CGU ↗
                </a>{" "}
                et la{" "}
                <a href="/confidentialite" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  politique de confidentialité ↗
                </a>.
              </Label>
            </div>
          </div>

          {trial.enabled ? (
            <div className="flex items-start gap-2 rounded border border-violet-500/40 bg-violet-500/10 p-3 text-xs text-violet-200">
              <Gift className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <strong>{trial.label} offert</strong> : votre abonnement {trial.tier} est activé
                automatiquement dès la création du compte. Vous pouvez publier immédiatement, sans
                rien payer. À la fin de l&apos;essai, choisissez un abonnement pour rester en ligne.
              </span>
            </div>
          ) : (
            <p className="rounded bg-primary/10 p-3 text-xs text-primary">
              💡 Après l&apos;inscription, vous serez redirigée vers la page d&apos;abonnement pour
              activer votre compte (Standard, Premium ou VIP).
            </p>
          )}

          <Button type="submit" disabled={pending} className="w-full" size="lg">
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Créer mon compte escort
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Déjà inscrite ?{" "}
            <Link href="/connexion" className="text-primary hover:underline">
              Se connecter
            </Link>
          </p>
          <p className="text-center text-xs text-muted-foreground">
            <strong>Client</strong> ? Vous n'avez pas besoin de compte pour parcourir les annonces —{" "}
            <Link href="/recherche" className="text-primary hover:underline">
              cherchez directement
            </Link>{" "}
            (un compte léger est proposé si vous voulez des favoris ou contacter le support).
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

export function RegisterForm({ trial }: { trial?: TrialOffer }) {
  const searchParams = useSearchParams();
  const isClient = searchParams.get("role") === "CLIENT";
  return isClient ? (
    <ClientRegisterForm />
  ) : (
    <EscortRegisterForm trial={trial ?? { enabled: false, tier: "STANDARD", label: "1 mois" }} />
  );
}
