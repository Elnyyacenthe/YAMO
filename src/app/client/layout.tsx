import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, Heart, User, Search, MapPin, MessageSquare } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "@/components/auth/logout-button";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { Separator } from "@/components/ui/separator";
import { SITE_NAME } from "@/lib/utils";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/connexion?callbackUrl=/client");

  // Compteur de favoris pour le badge sidebar
  const favCount = await prisma.favorite.count({
    where: { userId: session.user.id },
  });

  // Badge "réponse support non lue" (cf. escort/layout.tsx pour la même logique)
  const unreadSupportReply = await prisma.supportTicket.count({
    where: { userId: session.user.id, status: "WAITING_USER" },
  });

  const navContent = (
    <div className="space-y-2 p-4">
      <p className="px-3 text-xs font-semibold uppercase text-muted-foreground">
        Mon espace
      </p>
      <SidebarNav
        items={[
          { href: "/client", label: "Vue d'ensemble", icon: <LayoutDashboard className="h-4 w-4" /> },
          { href: "/client/favoris", label: "Mes favoris", icon: <Heart className="h-4 w-4" />, badge: favCount },
          { href: "/client/support", label: "Service client", icon: <MessageSquare className="h-4 w-4" />, badge: unreadSupportReply },
          { href: "/client/compte", label: "Mon compte", icon: <User className="h-4 w-4" /> },
        ]}
      />
      <Separator className="my-4" />
      <p className="px-3 text-xs font-semibold uppercase text-muted-foreground">
        Explorer
      </p>
      <SidebarNav
        items={[
          { href: "/recherche", label: "Rechercher", icon: <Search className="h-4 w-4" /> },
          { href: "/villes", label: "Toutes les villes", icon: <MapPin className="h-4 w-4" /> },
        ]}
      />
      <Separator className="my-4" />
      <LogoutButton variant="button" />
    </div>
  );

  return (
    <div className="grid min-h-screen md:grid-cols-[260px_1fr]">
      <MobileSidebar siteName={SITE_NAME}>{navContent}</MobileSidebar>

      <aside className="hidden border-b border-border/60 bg-card/40 backdrop-blur md:block md:border-b-0 md:border-r">
        <div className="flex h-16 items-center px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/icon.svg" alt={SITE_NAME} width={28} height={28} />
            <span className="font-display text-xl font-bold gradient-text">{SITE_NAME}</span>
          </Link>
        </div>
        <Separator />
        {navContent}
      </aside>
      <main className="p-4 sm:p-6 md:p-10">{children}</main>
    </div>
  );
}
