import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Crown, MapPin, Flame } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { AdGrid } from "@/components/ads/ad-grid";
import { CityCard } from "@/components/ads/city-card";

export const revalidate = 300; // 5 min ISR

export default async function HomePage() {
  const [vipAds, recentAds, cities, totalAds, totalVerified] = await Promise.all([
    prisma.ad.findMany({
      where: { status: "ACTIVE", tier: "VIP" },
      include: {
        city: { select: { name: true, slug: true } },
        media: { select: { url: true, isPrimary: true, type: true }, orderBy: { position: "asc" } },
        profile: { select: { isVerified: true, age: true } },
      },
      orderBy: [
        { stickyUntil: { sort: "desc", nulls: "last" } },
        { promotedUntil: "desc" },
        { lastBumpedAt: { sort: "desc", nulls: "last" } },
        { publishedAt: "desc" },
      ],
      take: 10,
    }),
    prisma.ad.findMany({
      where: { status: "ACTIVE" },
      include: {
        city: { select: { name: true, slug: true } },
        media: { select: { url: true, isPrimary: true, type: true }, orderBy: { position: "asc" } },
        profile: { select: { isVerified: true, age: true } },
      },
      orderBy: [
        { stickyUntil: { sort: "desc", nulls: "last" } },
        { tier: "desc" },
        { lastBumpedAt: { sort: "desc", nulls: "last" } },
        { publishedAt: "desc" },
      ],
      take: 20,
    }),
    prisma.city.findMany({
      where: { isPopular: true },
      orderBy: { order: "asc" },
      include: {
        _count: { select: { ads: { where: { status: "ACTIVE" } } } },
      },
    }),
    prisma.ad.count({ where: { status: "ACTIVE" } }),
    prisma.escortProfile.count({ where: { isVerified: true } }),
  ]);

  // 8 photos pour la mosaïque background du hero
  const heroPhotos = [...vipAds, ...recentAds]
    .map((ad) => ad.media.find((m) => m.type === "PHOTO")?.url)
    .filter((u): u is string => !!u)
    .slice(0, 8);

  return (
    <>
      {/* ======================= HERO ======================= */}
      <section className="relative overflow-hidden border-b border-border/30">
        {/* Mosaïque de photos en background (floutée + sombre) */}
        {heroPhotos.length > 0 && (
          <div className="absolute inset-0 grid grid-cols-4 opacity-50 md:grid-cols-8">
            {heroPhotos.map((url, i) => (
              <div key={i} className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src={url}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 25vw, 12.5vw"
                  className="object-cover scale-110 blur-sm"
                  priority={i < 4}
                  aria-hidden
                />
              </div>
            ))}
          </div>
        )}
        {/* Voile sombre + gradient rose/ambre par-dessus */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-accent/20" />

        <div className="container relative py-12 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary backdrop-blur md:px-4 md:py-1.5 md:text-xs">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              {totalAds}+ annonces en ligne maintenant
            </div>
            <h1 className="font-display text-3xl font-bold leading-tight drop-shadow-2xl sm:text-4xl md:text-6xl lg:text-7xl">
              Rencontres <span className="gradient-text">sexy</span>
              <br className="hidden sm:inline" /> à Douala, Yaoundé & + au Cameroun
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm text-foreground/90 drop-shadow md:mt-6 md:text-lg">
              Annonces 100% vérifiées · Contact WhatsApp direct · Discrétion garantie 24/7
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row md:mt-8">
              <Button asChild size="xl" className="w-full shadow-xl shadow-primary/40 sm:w-auto">
                <Link href="/recherche">
                  <Flame /> Explorer les annonces
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline" className="w-full backdrop-blur sm:w-auto">
                <Link href="/villes">
                  <MapPin /> Choisir ma ville
                </Link>
              </Button>
            </div>

            {/* Lien escort discret mais bien visible — pour qu'une escort qui visite le site
                trouve immédiatement où s'inscrire (sans voler la place du CTA client). */}
            <div className="mt-5 text-center text-sm text-foreground/80 drop-shadow md:mt-6">
              <span className="opacity-80">Vous êtes escort ? </span>
              <Link
                href="/inscription?role=ESCORT"
                className="font-semibold text-accent underline-offset-4 hover:underline"
              >
                Créer mon compte gratuit →
              </Link>
            </div>
          </div>
        </div>

        {/* Bandeau stats live */}
        <div className="relative border-t border-border/40 bg-background/60 backdrop-blur">
          <div className="container grid grid-cols-3 divide-x divide-border/40 py-4">
            <div className="px-2 text-center">
              <div className="text-xl font-bold text-primary md:text-3xl">{totalAds}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground md:text-xs">
                Annonces actives
              </div>
            </div>
            <div className="px-2 text-center">
              <div className="text-xl font-bold text-emerald-400 md:text-3xl">{totalVerified}</div>
              <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground md:text-xs">
                <ShieldCheck className="h-3 w-3" /> Vérifiées
              </div>
            </div>
            <div className="px-2 text-center">
              <div className="text-xl font-bold text-amber-400 md:text-3xl">{cities.length}+</div>
              <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground md:text-xs">
                <MapPin className="h-3 w-3" /> Villes
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================= VIP ======================= */}
      {vipAds.length > 0 && (
        <section className="container py-12">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold">
                <Crown className="mr-2 inline h-7 w-7 text-amber-400" />
                Annonces <span className="gradient-text">VIP</span>
              </h2>
              <p className="text-sm text-muted-foreground">Sélection premium mise en avant</p>
            </div>
          </div>
          <AdGrid ads={vipAds} priority={5} />
        </section>
      )}

      {/* ======================= VILLES ======================= */}
      <section className="container py-12">
        <div className="mb-6">
          <h2 className="font-display text-3xl font-bold">
            Explorer par <span className="gradient-text">ville</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Trouvez l'escort parfaite près de chez vous
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {cities.map((city, idx) => (
            <CityCard
              key={city.id}
              index={idx}
              city={{
                name: city.name,
                slug: city.slug,
                imageUrl: city.imageUrl,
                adCount: city._count.ads,
              }}
            />
          ))}
        </div>
      </section>

      {/* ======================= RÉCENTES ======================= */}
      <section className="container py-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold">Annonces récentes</h2>
            <p className="text-sm text-muted-foreground">Dernières publications validées</p>
          </div>
          <Button asChild variant="link">
            <Link href="/recherche">Tout voir →</Link>
          </Button>
        </div>
        <AdGrid ads={recentAds} />
      </section>

      {/* ======================= CTA ESCORT ======================= */}
      <section className="container py-16">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/20 via-card to-accent/10 p-8 md:p-16 text-center">
          <h2 className="font-display text-4xl font-bold md:text-5xl">
            Vous êtes escort ? <span className="gradient-text">Augmentez vos revenus</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Créez votre compte gratuitement, publiez votre annonce dès 2 500 FCFA / semaine, atteignez des milliers de clients sérieux, et boostez votre visibilité avec nos options Premium et VIP.
          </p>
          <Button asChild size="xl" className="mt-8">
            <Link href="/inscription?role=ESCORT">Créer mon compte gratuit</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
