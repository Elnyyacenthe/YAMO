import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Eye,
  MessageCircle,
  BadgeCheck,
  Sparkles,
  AlertTriangle,
  Edit,
  Pause,
  Play,
  Trash2,
  Crown,
  Lock,
} from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getEscortSubscriptionStatus } from "@/lib/escort-subscription";
import { ToggleAdButton, DeleteAdButton } from "../annonces/_components/ad-actions";
import { formatXAF, timeAgo } from "@/lib/utils";

const STATUS_LABEL: Record<string, { label: string; variant: "secondary" | "success" | "destructive" | "outline" }> = {
  DRAFT: { label: "Brouillon", variant: "outline" },
  PENDING: { label: "En modération", variant: "outline" },
  ACTIVE: { label: "Publiée", variant: "success" },
  PAUSED: { label: "En pause", variant: "secondary" },
  REJECTED: { label: "Refusée", variant: "destructive" },
  EXPIRED: { label: "Expirée", variant: "secondary" },
  BANNED: { label: "Bannie", variant: "destructive" },
};

export default async function EscortProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion?callbackUrl=/escort/dashboard");

  const userId = session.user.id;
  const [user, profile, ads, sub, latestVerif] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true, image: true, createdAt: true },
    }),
    prisma.escortProfile.findUnique({
      where: { userId },
      select: { id: true, displayName: true, bio: true, age: true, isVerified: true },
    }),
    prisma.ad.findMany({
      where: { ownerId: userId },
      include: {
        city: { select: { name: true } },
        media: { take: 1, orderBy: { position: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    }),
    getEscortSubscriptionStatus(userId),
    prisma.idVerification.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { status: true },
    }),
  ]);

  if (!user) redirect("/connexion");

  const totalViews = ads.reduce((s, a) => s + a.views, 0);
  const totalClicks = ads.reduce((s, a) => s + a.whatsappClicks, 0);
  const activeCount = ads.filter((a) => a.status === "ACTIVE" || a.status === "PENDING").length;
  const canPublishMore = sub.isActive && activeCount < sub.caps.ads;

  return (
    <div className="space-y-6">
      {/* ─── EN-TÊTE PROFIL ───────────────────────────────────────────── */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-card to-accent/10">
        <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-primary/40 bg-secondary">
            {user.image ? (
              <Image src={user.image} alt={user.name ?? "Profil"} fill sizes="96px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-display text-3xl font-bold text-primary">
                {(user.name ?? "?")[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl font-bold">{user.name ?? "Mon profil"}</h1>
              {profile?.isVerified && (
                <Badge variant="success" className="gap-1">
                  <BadgeCheck className="h-3 w-3" /> Vérifiée
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {user.email} · {user.phone}
            </p>
            {profile?.bio && (
              <p className="mt-2 line-clamp-2 max-w-xl text-sm text-muted-foreground">{profile.bio}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ─── STATUT ABONNEMENT ───────────────────────────────────────── */}
      {sub.isActive ? (
        <Card className="border-emerald-500/40 bg-emerald-500/5">
          <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center">
            <Sparkles className="h-8 w-8 text-emerald-400" />
            <div className="flex-1">
              <p className="font-semibold">
                Abonnement <span className="gradient-text">{sub.tier}</span> actif
              </p>
              <p className="text-xs text-muted-foreground">
                Expire dans <strong>{sub.daysLeft}j</strong> · Quotas : {sub.caps.ads} annonce
                {sub.caps.ads > 1 ? "s" : ""} max · {sub.caps.photos} photos / annonce
              </p>
            </div>
            <Badge variant="outline">
              {activeCount}/{sub.caps.ads} annonces utilisées
            </Badge>
            <Button asChild variant="outline" size="sm">
              <Link href="/escort/abonnement">Gérer</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-amber-500/40 bg-amber-500/10">
          <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center">
            <AlertTriangle className="h-8 w-8 text-amber-400" />
            <div className="flex-1">
              <p className="font-semibold text-amber-200">Abonnement requis pour publier</p>
              <p className="text-xs text-muted-foreground">
                Souscrivez à un plan (Standard, Premium ou VIP) pour activer la publication d'annonces.
              </p>
            </div>
            <Button asChild>
              <Link href="/escort/abonnement">Choisir un plan</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ─── VÉRIFICATION ID ───────────────────────────────────────── */}
      {!profile?.isVerified && (
        <Card className="border-sky-500/30 bg-sky-500/5">
          <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center">
            <BadgeCheck className="h-7 w-7 text-sky-400" />
            <div className="flex-1">
              <p className="font-semibold">
                {latestVerif?.status === "PENDING"
                  ? "Vérification en cours d'examen…"
                  : "Faites-vous vérifier (+50% de contacts)"}
              </p>
              <p className="text-xs text-muted-foreground">
                Soumettez votre pièce d'identité + selfie pour obtenir le badge "Vérifiée" et booster la confiance.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/escort/verification">
                {latestVerif?.status === "PENDING" ? "Voir l'état" : "Soumettre"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ─── PUBLICATIONS ────────────────────────────────────────── */}
      <div>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">Mes publications</h2>
            <p className="text-xs text-muted-foreground">
              {ads.length} annonce{ads.length > 1 ? "s" : ""} · {totalViews.toLocaleString("fr-FR")} vues totales · {totalClicks.toLocaleString("fr-FR")} clics WhatsApp
            </p>
          </div>
          {canPublishMore ? (
            <Button asChild>
              <Link href="/poster-une-annonce">
                <Plus /> Publier une annonce
              </Link>
            </Button>
          ) : (
            <Button disabled>
              <Lock className="h-4 w-4" />
              {!sub.isActive ? "Abonnement requis" : `Quota ${sub.caps.ads} atteint`}
            </Button>
          )}
        </div>

        {ads.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <p className="text-sm text-muted-foreground">
                Vous n'avez pas encore publié d'annonce.
              </p>
              {sub.isActive ? (
                <Button asChild className="mt-4">
                  <Link href="/poster-une-annonce">Créer ma première annonce</Link>
                </Button>
              ) : (
                <Button asChild className="mt-4">
                  <Link href="/escort/abonnement">Souscrire d'abord</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {ads.map((ad) => {
              const status = STATUS_LABEL[ad.status];
              return (
                <Card key={ad.id} className="overflow-hidden">
                  <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center">
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-secondary">
                      {ad.media[0] && (
                        <Image src={ad.media[0].url} alt={ad.title} fill sizes="96px" className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {ad.tier !== "STANDARD" && (
                          <Badge variant={ad.tier === "VIP" ? "vip" : "premium"} className="gap-1">
                            <Crown className="h-3 w-3" /> {ad.tier}
                          </Badge>
                        )}
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <h3 className="font-semibold">{ad.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {ad.city.name} · {formatXAF(ad.price)} · {timeAgo(ad.createdAt)}
                      </p>
                      {ad.rejectionReason && (
                        <p className="text-xs text-destructive">Motif refus : {ad.rejectionReason}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" /> {ad.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" /> {ad.whatsappClicks}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ad.status === "ACTIVE" && (
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/annonce/${ad.slug}`} target="_blank">
                            <Eye className="h-4 w-4" /> Voir
                          </Link>
                        </Button>
                      )}
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/escort/annonces/${ad.id}`}>
                          <Edit className="h-4 w-4" /> Modifier
                        </Link>
                      </Button>
                      {(ad.status === "ACTIVE" || ad.status === "PAUSED") && (
                        <ToggleAdButton adId={ad.id} isActive={ad.status === "ACTIVE"} />
                      )}
                      <DeleteAdButton adId={ad.id} />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── COMPTE ───────────────────────────────────────────────── */}
      <Card>
        <CardContent className="space-y-2 p-5 text-xs text-muted-foreground">
          <p>Inscrite {timeAgo(user.createdAt)}</p>
          <p>
            Pour modifier votre email, téléphone ou supprimer votre compte, contactez le{" "}
            <Link href="/escort/support" className="text-primary hover:underline">service client</Link>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
