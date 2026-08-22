import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Shield, Gift } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { AdForm } from "@/components/ads/ad-form";
import { getFreeTrialConfig, formatTrialDuration } from "@/lib/escort-subscription";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Poster une annonce",
  description: "Publiez votre annonce escort au Cameroun, dès 2 500 FCFA / semaine.",
};

export default async function PostAdPage() {
  const session = await auth();
  const [cities, trial] = await Promise.all([
    prisma.city.findMany({
      select: { id: true, name: true },
      orderBy: [{ isPopular: "desc" }, { name: "asc" }],
    }),
    getFreeTrialConfig(),
  ]);

  if (!session?.user) {
    return (
      <div className="container py-12">
        <Card className="mx-auto max-w-md">
          <CardContent className="space-y-4 p-8 text-center">
            <h1 className="font-display text-2xl font-bold">Connectez-vous pour publier</h1>
            <p className="text-sm text-muted-foreground">
              Vous devez avoir un compte pour publier une annonce.
            </p>
            {trial.enabled && (
              <p className="flex items-center justify-center gap-2 rounded-lg border border-violet-500/40 bg-violet-500/10 p-3 text-sm font-medium text-violet-200">
                <Gift className="h-4 w-4 shrink-0" />
                Nouvelle escorte : {formatTrialDuration(trial.days)} d&apos;abonnement {trial.tier} offert
              </p>
            )}
            <div className="flex flex-col gap-2">
              <Button asChild>
                <Link href="/connexion">Se connecter</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/inscription?role=ESCORT">Créer un compte</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Blocage des rôles admin/moderator
  if (session.user.role === "ADMIN" || session.user.role === "MODERATOR") {
    return (
      <div className="container py-12">
        <Card className="mx-auto max-w-md border-amber-500/30 bg-amber-500/5">
          <CardContent className="space-y-4 p-8 text-center">
            <Shield className="mx-auto h-10 w-10 text-amber-400" />
            <h1 className="font-display text-2xl font-bold">Accès limité</h1>
            <p className="text-sm text-muted-foreground">
              Les comptes <strong>administrateur</strong> ne peuvent pas publier d'annonces.
            </p>
            <Button asChild>
              <Link href="/admin">Retour à l'administration</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Blocage des CLIENT — redirection vers /client/devenir-escort
  if (session.user.role === "CLIENT") {
    return (
      <div className="container py-12">
        <Card className="mx-auto max-w-lg border-primary/30 bg-primary/5">
          <CardContent className="space-y-4 p-8 text-center">
            <Sparkles className="mx-auto h-10 w-10 text-primary" />
            <h1 className="font-display text-2xl font-bold">
              Passez côté <span className="gradient-text">Escort</span> pour publier
            </h1>
            <p className="text-sm text-muted-foreground">
              Seuls les comptes <strong>Escort</strong> peuvent publier des annonces. Convertissez
              votre compte client en quelques clics — vous gardez vos favoris et votre historique.
            </p>
            {trial.enabled && (
              <p className="flex items-center justify-center gap-2 rounded-lg border border-violet-500/40 bg-violet-500/10 p-3 text-sm font-medium text-violet-200">
                <Gift className="h-4 w-4 shrink-0" />
                {formatTrialDuration(trial.days)} d&apos;abonnement {trial.tier} offert dès la conversion
              </p>
            )}
            <div className="flex flex-col gap-2">
              <Button asChild size="lg">
                <Link href="/client/devenir-escort">
                  <Sparkles className="h-4 w-4" /> Devenir escort
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/client">Retour à mon espace</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Ici → ESCORT uniquement
  const owner = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { phone: true },
  });

  if (!owner?.phone) {
    return (
      <div className="container py-12">
        <Card className="mx-auto max-w-lg border-amber-500/30 bg-amber-500/5">
          <CardContent className="space-y-4 p-8 text-center">
            <Shield className="mx-auto h-10 w-10 text-amber-400" />
            <h1 className="font-display text-2xl font-bold">Numéro de téléphone requis</h1>
            <p className="text-sm text-muted-foreground">
              Votre compte n'a pas de numéro enregistré. C'est ce numéro qui sert de contact
              WhatsApp/Telegram sur vos annonces — contactez le support pour en ajouter un.
            </p>
            <Button asChild size="lg">
              <Link href="/escort/support">Contacter le support</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-4xl font-bold">
          Poster une <span className="gradient-text">annonce</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Votre annonce sera examinée par notre équipe sous 24h avant publication.
        </p>
        <div className="mt-8">
          <AdForm cities={cities} accountPhone={owner.phone} />
        </div>
      </div>
    </div>
  );
}
