import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Clock, Crown, BadgeCheck, Star, Eye, Users } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PhotoGallery } from "@/components/ads/photo-gallery";
import { ContactCard } from "@/components/ads/contact-card";
import { ReportButton } from "@/components/ads/report-button";
import { FavoriteButton } from "@/components/ads/favorite-button";
import { trackAdView } from "@/lib/actions/ads";
import { isFavoritedAction } from "@/lib/actions/favorites";
import { formatXAF, timeAgo, SITE_NAME, SITE_URL } from "@/lib/utils";

function trimToSentence(text: string, max: number): string {
  if (text.length <= max) return text;
  const truncated = text.slice(0, max);
  const lastPunct = Math.max(truncated.lastIndexOf("."), truncated.lastIndexOf("!"), truncated.lastIndexOf("?"));
  if (lastPunct > max * 0.6) return truncated.slice(0, lastPunct + 1);
  return truncated.replace(/\s+\S*$/, "") + "…";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ad = await prisma.ad.findUnique({
    where: { slug },
    include: { city: true, media: { take: 1 } },
  });
  if (!ad || ad.status !== "ACTIVE") return { title: "Annonce introuvable", robots: { index: false } };
  const desc = trimToSentence(ad.description.replace(/\s+/g, " "), 155);
  const enrichedDesc = `${desc} · ${ad.city.name}, ${formatXAF(ad.price)}/h. Profil vérifié sur ${SITE_NAME}.`;
  return {
    title: ad.title,
    description: enrichedDesc.slice(0, 200),
    keywords: [
      `escort ${ad.city.name.toLowerCase()}`,
      ad.neighborhood ? `escort ${ad.neighborhood.toLowerCase()}` : "",
      `annonce ${ad.city.name.toLowerCase()}`,
      "escort cameroun",
      "ndolo",
    ].filter(Boolean),
    alternates: { canonical: `/annonce/${ad.slug}` },
    openGraph: {
      title: `${ad.title} · ${SITE_NAME}`,
      description: enrichedDesc.slice(0, 200),
      images: ad.media[0]
        ? [{ url: ad.media[0].url, width: 800, height: 1000, alt: ad.title }]
        : [],
      type: "article",
      url: `${SITE_URL}/annonce/${ad.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: ad.title,
      description: enrichedDesc.slice(0, 200),
      images: ad.media[0] ? [ad.media[0].url] : [],
    },
  };
}

export default async function AdPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ad = await prisma.ad.findUnique({
    where: { slug },
    include: {
      city: true,
      media: { where: { isApproved: true }, orderBy: { position: "asc" } },
      profile: true,
    },
  });

  if (!ad || (ad.status !== "ACTIVE" && ad.status !== "PAUSED")) notFound();

  // Tracking de la vue (async, ne bloque pas)
  trackAdView(ad.id).catch(() => null);

  const session = await auth();
  const isLoggedIn = !!session?.user;
  const viewerRole = session?.user?.role;
  const isFav = isLoggedIn ? await isFavoritedAction(ad.id) : false;

  // JSON-LD Schema.org : Service + BreadcrumbList
  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: ad.title,
    description: ad.description.slice(0, 500),
    image: ad.media.slice(0, 5).map((m) => m.url),
    serviceType: ad.services.join(", ") || "Escort",
    provider: {
      "@type": "Person",
      name: ad.profile?.displayName ?? "Escort indépendante",
      address: {
        "@type": "PostalAddress",
        addressLocality: ad.city.name,
        addressRegion: ad.city.region ?? "Cameroun",
        addressCountry: "CM",
      },
    },
    areaServed: {
      "@type": "City",
      name: ad.city.name,
    },
    offers: {
      "@type": "Offer",
      price: ad.price,
      priceCurrency: "XAF",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/annonce/${ad.slug}`,
    },
    ...(ad.profile?.isVerified && {
      additionalProperty: {
        "@type": "PropertyValue",
        name: "Profil vérifié",
        value: "Oui",
      },
    }),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: ad.city.name, item: `${SITE_URL}/ville/${ad.city.slug}` },
      { "@type": "ListItem", position: 3, name: ad.title, item: `${SITE_URL}/annonce/${ad.slug}` },
    ],
  };

  return (
    <div className="container py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <nav className="mb-4 text-sm text-muted-foreground" aria-label="Fil d'Ariane">
        <Link href="/" className="hover:text-foreground">Accueil</Link>
        {" / "}
        <Link href={`/ville/${ad.city.slug}`} className="hover:text-foreground">
          {ad.city.name}
        </Link>
        {" / "}
        <span className="text-foreground">{ad.title}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <PhotoGallery media={ad.media} title={ad.title} />

          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              {ad.tier === "VIP" && (
                <Badge variant="vip" className="gap-1">
                  <Crown className="h-3 w-3" /> VIP
                </Badge>
              )}
              {ad.tier === "PREMIUM" && (
                <Badge variant="premium" className="gap-1">
                  <Star className="h-3 w-3" /> Premium
                </Badge>
              )}
              {ad.profile?.isVerified && (
                <Badge variant="verified" className="gap-1">
                  <BadgeCheck className="h-3 w-3" /> Profil vérifié
                </Badge>
              )}
            </div>

            <h1 className="font-display text-3xl font-bold md:text-4xl">{ad.title}</h1>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {ad.city.name}
                {ad.neighborhood ? `, ${ad.neighborhood}` : ""}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {ad.publishedAt ? timeAgo(ad.publishedAt) : "—"}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" /> {ad.views} vues
              </span>
              {ad.profile?.age && (
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" /> {ad.profile.age} ans
                </span>
              )}
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <h2 className="mb-3 text-lg font-semibold">Description</h2>
              <p className="whitespace-pre-wrap text-foreground/90">{ad.description}</p>
            </CardContent>
          </Card>

          {ad.services.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="mb-3 text-lg font-semibold">Services proposés</h2>
                <div className="flex flex-wrap gap-2">
                  {ad.services.map((s) => (
                    <Badge key={s} variant="secondary">{s}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-6">
              <h2 className="mb-3 text-lg font-semibold">Informations</h2>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Prix / heure</dt>
                  <dd className="font-semibold text-primary">{formatXAF(ad.price)}</dd>
                </div>
                {ad.priceNight && (
                  <div>
                    <dt className="text-muted-foreground">Prix / nuit</dt>
                    <dd className="font-semibold">{formatXAF(ad.priceNight)}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-muted-foreground">Reçoit</dt>
                  <dd>{ad.incall ? "Oui" : "Non"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Se déplace</dt>
                  <dd>{ad.outcall ? "Oui" : "Non"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {viewerRole !== "ESCORT" && (
            <>
              <Separator />
              <div className="flex items-center justify-between gap-2">
                <FavoriteButton adId={ad.id} initialFavorited={isFav} variant="default" isLoggedIn={isLoggedIn} />
                <ReportButton adTitle={ad.title} adUrl={`${SITE_URL}/annonce/${ad.slug}`} isLoggedIn={isLoggedIn} />
              </div>
            </>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <ContactCard
            adId={ad.id}
            whatsappPhone={ad.whatsappPhone}
            whatsappEnabled={ad.whatsappEnabled}
            telegramEnabled={ad.telegramEnabled}
            callPhone={ad.callPhone}
            adTitle={ad.title}
          />
        </aside>
      </div>
    </div>
  );
}
