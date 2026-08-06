import { redirect } from "next/navigation";
import { BadgeCheck, ShieldAlert, Send, Clock } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSettingNumber, getSettingString } from "@/lib/settings";
import { PayVerificationButton, RetryVerificationButton } from "./_verification-actions";

/**
 * Construit le lien Telegram vers le contact de vérification. Le réglage
 * admin peut être un lien complet (https://t.me/...), un @pseudo, ou un
 * numéro de téléphone (le contact réservé est identifié par son numéro,
 * pas un pseudo public) — auto-détecté et normalisé en +237 si le numéro
 * est saisi au format local (9 chiffres, sans indicatif).
 */
function buildTelegramUrl(raw: string, message: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let base: string;
  const digitsOnly = trimmed.replace(/[\s.-]/g, "");

  if (/^\+\d{8,15}$/.test(digitsOnly)) {
    // Déjà au format international (+237...)
    base = `https://t.me/${digitsOnly}`;
  } else if (/^\d{9}$/.test(digitsOnly)) {
    // Numéro local Cameroun sans indicatif → +237
    base = `https://t.me/+237${digitsOnly}`;
  } else if (trimmed.startsWith("@")) {
    base = `https://t.me/${trimmed.slice(1)}`;
  } else if (trimmed.startsWith("t.me/")) {
    base = `https://${trimmed}`;
  } else if (trimmed.startsWith("http")) {
    base = trimmed;
  } else {
    base = `https://t.me/${trimmed}`;
  }

  try {
    const url = new URL(base);
    url.searchParams.set("text", message);
    return url.toString();
  } catch {
    return null;
  }
}

export default async function VerificationPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");

  const [latest, user, verificationPrice, recipientName, mtnNumber, orangeNumber, instructions, telegramLink] =
    await Promise.all([
      prisma.idVerification.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { phone: true, email: true },
      }),
      getSettingNumber("pricing.verification.amount", 3000),
      getSettingString("payment.manual.recipientName", ""),
      getSettingString("payment.manual.mtnNumber", "678876470"),
      getSettingString("payment.manual.orangeNumber", "640528712"),
      getSettingString("payment.manual.instructions", ""),
      getSettingString("verification.telegramLink", ""),
    ]);

  const paymentInfo = { recipientName, mtnNumber, orangeNumber, instructions };

  const contact = user?.email ?? user?.phone ?? "mon compte";
  const message = `Bonjour, je viens de payer les frais de vérification d'identité sur Affinité (compte : ${contact}). Je vous envoie mes documents (CNI/passeport recto-verso + selfie) pour validation.`;
  const telegramUrl = buildTelegramUrl(telegramLink, message);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">
          <BadgeCheck className="mr-2 inline h-7 w-7 text-sky-400" /> Vérification d'identité
        </h1>
        <p className="text-muted-foreground">
          Obtenez le badge <strong>Vérifiée</strong> sur toutes vos annonces. Confiance accrue → +50% de contacts.
        </p>
      </div>

      {latest?.status === "VERIFIED" && (
        <Card className="border-emerald-500/40 bg-emerald-500/10">
          <CardContent className="flex items-center gap-3 p-6">
            <BadgeCheck className="h-8 w-8 text-emerald-400" />
            <div>
              <p className="font-semibold">Profil vérifié ✅</p>
              <p className="text-sm text-muted-foreground">
                Le badge "Vérifiée" est visible sur toutes vos annonces.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {latest?.status === "PENDING" && (
        <>
          <Card className="border-amber-500/40 bg-amber-500/10">
            <CardContent className="p-6">
              <Badge variant="outline">En cours d'examen</Badge>
              <p className="mt-2 text-sm text-muted-foreground">
                Votre paiement a été déclaré — un admin le valide sous peu. Envoyez dès maintenant vos
                documents sur Telegram pour ne pas perdre de temps, l'équipe les examinera dès que possible.
              </p>
            </CardContent>
          </Card>

          <Card className="border-sky-500/30 bg-sky-500/5">
            <CardContent className="space-y-3 p-6">
              <h2 className="flex items-center gap-2 font-display text-xl font-bold">
                <Send className="h-5 w-5 text-sky-400" /> Envoyez vos documents sur Telegram
              </h2>
              <ul className="ml-5 list-disc space-y-1 text-sm text-muted-foreground">
                <li>Photo nette du <strong>recto</strong> de votre CNI ou passeport</li>
                <li>Photo nette du <strong>verso</strong> (si CNI)</li>
                <li>
                  <strong>Selfie</strong> en train de tenir votre pièce d'identité, avec une feuille datée
                  d'aujourd'hui où vous avez écrit "Affinité" + la date
                </li>
              </ul>
              {telegramUrl ? (
                <Button asChild size="lg" className="w-full">
                  <a href={telegramUrl} target="_blank" rel="noopener noreferrer">
                    <Send className="h-4 w-4" /> Ouvrir la conversation Telegram
                  </a>
                </Button>
              ) : (
                <p className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-300">
                  Le lien Telegram n'a pas encore été configuré côté admin. Contactez le service client.
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {latest?.status === "REJECTED" && (
        <>
          <Card className="border-destructive/40 bg-destructive/10">
            <CardContent className="p-6">
              <p className="font-semibold text-destructive">Vérification refusée</p>
              <p className="mt-1 text-sm">Motif : {latest.rejectionReason}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Vous pouvez relancer une demande gratuitement — pas de nouveau paiement requis.
              </p>
            </CardContent>
          </Card>
          <RetryVerificationButton />
        </>
      )}

      {!latest && (
        <>
          <Card className="border-sky-500/30 bg-sky-500/5">
            <CardContent className="space-y-2 p-6">
              <h2 className="flex items-center gap-2 font-display text-xl font-bold">
                <ShieldAlert className="h-5 w-5 text-sky-400" /> Comment procéder
              </h2>
              <ul className="ml-5 list-disc space-y-1 text-sm text-muted-foreground">
                <li>
                  <Clock className="mr-1 inline h-3.5 w-3.5" />
                  Payez les frais de vérification via Mobile Money ci-dessous
                </li>
                <li>
                  Envoyez ensuite vos documents (recto/verso CNI ou passeport + selfie) directement sur
                  Telegram — le lien s'affiche juste après votre déclaration de paiement
                </li>
                <li>Vos données sont chiffrées et ne sont visibles que par l'équipe de modération</li>
              </ul>
            </CardContent>
          </Card>

          <PayVerificationButton
            price={verificationPrice}
            defaultPhone={user?.phone ?? undefined}
            paymentInfo={paymentInfo}
          />
        </>
      )}
    </div>
  );
}
