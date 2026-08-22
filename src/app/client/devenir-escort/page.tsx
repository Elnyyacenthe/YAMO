import { redirect } from "next/navigation";
import Link from "next/link";
import { Sparkles, Star, BadgeCheck, BarChart3, Gift } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { BecomeEscortForm } from "./_form";
import { getFreeTrialConfig, formatTrialDuration } from "@/lib/escort-subscription";

const PERKS = [
  { icon: Sparkles, title: "Publier des annonces", text: "Atteignez des milliers de clients dans votre ville." },
  { icon: BarChart3, title: "Dashboard & stats", text: "Vues, clics WhatsApp, taux de conversion en temps réel." },
  { icon: Star, title: "Boost Premium / VIP", text: "Mise en avant ville, badge doré, photos illimitées." },
  { icon: BadgeCheck, title: "Badge Vérifiée", text: "Renforcez la confiance des clients avec une vérification ID." },
];

export default async function BecomeEscortPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion?callbackUrl=/client/devenir-escort");

  // Si déjà escort, on l'envoie sur son dashboard
  if (session.user.role === "ESCORT") redirect("/escort/dashboard");
  // ADMIN/MODERATOR : renvoyés vers l'interface admin externe (affinité.com/admin)
  if (session.user.role === "ADMIN" || session.user.role === "MODERATOR") {
    const url =
      process.env.NEXT_PUBLIC_AFFINITE_ADMIN_URL ??
      `${process.env.NEXT_PUBLIC_AFFINITE_URL ?? "https://affinité.com"}/admin`;
    redirect(url);
  }

  const [user, trial] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { phone: true, escortTrialEndsAt: true },
    }),
    getFreeTrialConfig(),
  ]);

  // L'essai n'est offert qu'une fois : inutile de le promettre à un compte
  // qui l'a déjà consommé (ex. ancienne escorte repassée cliente).
  const showTrialOffer = trial.enabled && !user?.escortTrialEndsAt;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          Passez côté Escort
        </div>
        <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">
          Devenez <span className="gradient-text">Escort</span> sur Affinité
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Votre compte client va être converti en compte escort. Vous gardez vos favoris et votre
          historique. Vous accédez en plus à toutes les fonctionnalités escort.
        </p>
      </header>

      {showTrialOffer && (
        <Card className="border-violet-500/40 bg-violet-500/10">
          <CardContent className="flex items-start gap-3 p-5">
            <Gift className="mt-0.5 h-6 w-6 shrink-0 text-violet-400" />
            <div>
              <p className="font-display text-lg font-bold">
                {formatTrialDuration(trial.days)} d&apos;abonnement {trial.tier} offert
              </p>
              <p className="text-sm text-muted-foreground">
                Votre abonnement est activé automatiquement dès la conversion : vous publiez tout de
                suite, sans rien payer. À la fin de l&apos;essai, vos annonces sont mises en pause
                jusqu&apos;à la souscription d&apos;un abonnement.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Avantages */}
      <div className="grid gap-3 md:grid-cols-2">
        {PERKS.map(({ icon: Icon, title, text }) => (
          <Card key={title} className="border-border/60">
            <CardContent className="flex gap-3 p-4">
              <div className="rounded-lg bg-primary/15 p-2">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{title}</p>
                <p className="text-xs text-muted-foreground">{text}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Formulaire d'engagement */}
      <BecomeEscortForm currentPhone={user?.phone ?? null} />

      <p className="text-center text-xs text-muted-foreground">
        En cas de problème, contactez{" "}
        <Link href="/contact" className="text-primary hover:underline">
          le support
        </Link>
        .
      </p>
    </div>
  );
}
