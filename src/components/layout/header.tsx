import Link from "next/link";
import Image from "next/image";
import { Plus, Search, User, LayoutDashboard, Shield, Heart, MapPin, Flame } from "lucide-react";

import { auth } from "@/auth";
import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SITE_NAME } from "@/lib/utils";

export async function Header() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/icon.svg" alt={SITE_NAME} width={32} height={32} priority />
          <span className="font-display text-2xl font-bold gradient-text">{SITE_NAME}</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link href="/recherche" className="text-muted-foreground transition-colors hover:text-foreground">
            Rechercher
          </Link>
          <Link href="/ville/douala" className="text-muted-foreground transition-colors hover:text-foreground">
            Douala
          </Link>
          <Link href="/ville/yaounde" className="text-muted-foreground transition-colors hover:text-foreground">
            Yaoundé
          </Link>
          <Link href="/villes" className="text-muted-foreground transition-colors hover:text-foreground">
            Toutes les villes
          </Link>
          <Link href="/blog" className="text-muted-foreground transition-colors hover:text-foreground">
            Blog
          </Link>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Mobile : icônes raccourcis vers les annonces (CIBLE PRINCIPALE = clients) */}
          <Button asChild variant="ghost" size="icon" className="md:hidden">
            <Link href="/recherche" aria-label="Rechercher des annonces">
              <Search />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon" className="md:hidden">
            <Link href="/villes" aria-label="Toutes les villes">
              <MapPin />
            </Link>
          </Button>

          {/* CTA adaptés au rôle :
              - Visiteur          → "Voir les annonces" (accent) + "Devenir escort" (outline)
              - CLIENT connecté   → "Voir les annonces" (accent) + "Devenir escort" (outline)
              - ESCORT            → "Poster une annonce" (accent)
              - ADMIN / MODERATOR → rien */}
          {!user && (
            <>
              <Button asChild variant="outline" size="sm" className="hidden md:inline-flex">
                <Link href="/inscription?role=ESCORT">
                  <Plus className="mr-1" />
                  Devenir escort
                </Link>
              </Button>
              <Button asChild variant="accent" size="sm" className="hidden sm:inline-flex">
                <Link href="/recherche">
                  <Flame className="mr-1" />
                  Voir les annonces
                </Link>
              </Button>
            </>
          )}
          {user?.role === "CLIENT" && (
            <>
              <Button asChild variant="outline" size="sm" className="hidden md:inline-flex">
                <a
                  href={`${process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "https://dashboard.affinité.com"}/client/devenir-escort`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Plus className="mr-1" />
                  Devenir escort ↗
                </a>
              </Button>
              <Button asChild variant="accent" size="sm" className="hidden sm:inline-flex">
                <Link href="/recherche">
                  <Flame className="mr-1" />
                  Voir les annonces
                </Link>
              </Button>
            </>
          )}
          {user?.role === "ESCORT" && (
            <Button asChild variant="accent" size="sm" className="hidden sm:inline-flex">
              <Link href="/poster-une-annonce">
                <Plus className="mr-1" />
                Poster une annonce
              </Link>
            </Button>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="rounded-full outline-none ring-primary focus-visible:ring-2">
                  <Avatar className="h-9 w-9 border border-primary/40">
                    <AvatarImage src={user.image ?? undefined} alt={user.name ?? "Avatar"} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {user.name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              {/* Routing par rôle :
                  - ADMIN/MODERATOR → dashboard.affinité.com (back-office externe)
                  - ESCORT / CLIENT → /escort ou /client (interne affinité.com) */}
              {(() => {
                return (
                  <DropdownMenuContent align="end" className="w-60">
                    <DropdownMenuLabel>{user.name ?? user.email}</DropdownMenuLabel>
                    {user.role === "ESCORT" && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/escort/dashboard">
                            <LayoutDashboard className="h-4 w-4" /> Tableau de bord
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/escort/profil">
                            <User className="h-4 w-4" /> Mon profil
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    {user.role === "CLIENT" && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/client">
                            <LayoutDashboard className="h-4 w-4" /> Vue d'ensemble
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/client/favoris">
                            <Heart className="h-4 w-4" /> Mes favoris
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    {(user.role === "ADMIN" || user.role === "MODERATOR") && (
                      <DropdownMenuItem asChild>
                        <a
                          href={
                            process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "https://dashboard.affinité.com"
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Shield className="h-4 w-4" /> Back-office ↗
                        </a>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <LogoutButton />
                  </DropdownMenuContent>
                );
              })()}
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              {/* Espace escort discret — clients n'ont pas besoin de compte */}
              <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground">
                <Link href="/connexion">Espace escort</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
