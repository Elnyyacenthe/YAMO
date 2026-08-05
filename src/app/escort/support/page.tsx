import { redirect } from "next/navigation";
import { MessageSquare } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SupportThread } from "@/components/support/support-thread";

export default async function EscortSupportPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion?callbackUrl=/escort/support");

  const ticket = await prisma.supportTicket.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="flex items-center gap-2 font-display text-3xl font-bold">
          <MessageSquare className="h-7 w-7 text-primary" /> Service client
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Une question sur votre abonnement, vos annonces ou votre compte ? Écrivez-nous ici.
        </p>
      </header>

      <SupportThread messages={ticket?.messages ?? []} />
    </div>
  );
}
