import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, User, BadgeCheck, MessageSquare, Sparkles, ShieldAlert } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "@/components/auth/logout-button";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { LiveRefresh } from "@/components/dashboard/live-refresh";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { SITE_NAME } from "@/lib/utils";
import { getEscortSubscriptionStatus } from "@/lib/escort-subscription";
import { SupportThread } from "@/components/support/support-thread";

export default async function EscortLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/connexion?callbackUrl=/escort/dashboard");
  if (session.user.role !== "ESCORT" && session.user.role !== "ADMIN") {
    redirect("/");
  }

  // Compte banni : seule fonctionnalité disponible = la messagerie support,
  // pour permettre à l'escorte de se justifier. Remplace tout le dashboard.
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isBanned: true, banReason: true },
  });
  if (me?.isBanned) {
    const ticket = await prisma.supportTicket.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    return (
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 p-4 sm:p-6">
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-6 text-center">
          <ShieldAlert className="mx-auto mb-3 h-10 w-10 text-destructive" />
          <h1 className="font-display text-2xl font-bold text-destructive">Votre compte a été bloqué</h1>
          {me.banReason && (
            <p className="mt-2 text-sm text-muted-foreground">Motif : {me.banReason}</p>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            Vous pouvez utiliser la messagerie ci-dessous pour vous justifier auprès de notre équipe.
          </p>
        </div>
        <SupportThread
          messages={ticket?.messages ?? []}
          currentUserName={session.user.name}
          currentUserImage={session.user.image}
        />
        <LogoutButton variant="button" />
      </div>
    );
  }

  const sub = await getEscortSubscriptionStatus(session.user.id);

  // Badge "réponse support non lue" : le statut passe à WAITING_USER quand
  // l'admin répond, et repasse à OPEN dès que l'escorte réécrit (cf. support.ts).
  const unreadSupportReply = await prisma.supportTicket.count({
    where: { userId: session.user.id, status: "WAITING_USER" },
  });

  const navContent = (
    <>
      {/* Bandeau statut abonnement */}
      <div className="border-b border-border/40 p-4">
        {sub.isActive ? (
          <Link href="/escort/abonnement" className="block rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 transition hover:border-emerald-500/60">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                <Sparkles className="h-3.5 w-3.5" /> {sub.tier}
              </span>
              <Badge variant="success" className="text-[10px]">{sub.daysLeft}j</Badge>
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Expire le {sub.until?.toLocaleDateString("fr-FR")}
            </p>
          </Link>
        ) : (
          <Link href="/escort/abonnement" className="block rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 transition hover:border-amber-500">
            <p className="text-xs font-bold text-amber-300">⚠️ Abonnement requis</p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Souscrivez pour publier vos annonces
            </p>
          </Link>
        )}
      </div>

      <div className="space-y-2 p-4">
        <p className="px-3 text-xs font-semibold uppercase text-muted-foreground">
          Espace Escort
        </p>
        <SidebarNav
          items={[
            { href: "/escort/dashboard", label: "Tableau de bord", icon: <LayoutDashboard className="h-4 w-4" /> },
            { href: "/escort/profil", label: "Mon profil", icon: <User className="h-4 w-4" /> },
            { href: "/escort/abonnement", label: "Mon abonnement", icon: <Sparkles className="h-4 w-4" /> },
            { href: "/escort/verification", label: "Vérification ID", icon: <BadgeCheck className="h-4 w-4" /> },
            { href: "/escort/support", label: "Service client", icon: <MessageSquare className="h-4 w-4" />, badge: unreadSupportReply },
          ]}
        />
        <Separator className="my-4" />
        <LogoutButton variant="button" />
      </div>
    </>
  );

  return (
    <div className="grid min-h-screen md:grid-cols-[260px_1fr]">
      <LiveRefresh />
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
