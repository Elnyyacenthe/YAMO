import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/utils";

/**
 * Page Mon Compte — identité et sécurité, partagée entre /client/compte et
 * /escort/compte. Les statistiques d'activité (annonces, favoris) vivent sur
 * le tableau de bord respectif, pas ici, pour éviter la redondance.
 */
export default async function AccountPage({ backUrl = "/compte" }: { backUrl?: string }) {
  const session = await auth();
  if (!session?.user) redirect(`/connexion?callbackUrl=${backUrl}`);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true, username: true, role: true, createdAt: true },
  });
  if (!user) redirect("/connexion");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-3xl font-bold">Mon compte</h1>

      <Card>
        <CardContent className="space-y-3 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{user.name ?? user.username ?? "Sans nom"}</h2>
            <Badge variant="outline">{user.role}</Badge>
          </div>
          {user.email && <p className="text-sm text-muted-foreground">{user.email}</p>}
          {user.phone && <p className="text-sm text-muted-foreground">{user.phone}</p>}
          {user.username && (
            <p className="text-sm text-muted-foreground">Pseudo : {user.username}</p>
          )}
          <p className="text-xs text-muted-foreground">Inscrit {timeAgo(user.createdAt)}</p>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardContent className="space-y-2 p-6">
          <h3 className="font-semibold text-destructive">Zone dangereuse</h3>
          <p className="text-xs text-muted-foreground">
            Pour modifier votre email, téléphone ou supprimer votre compte, contactez le support à
            support@affinité.com.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
