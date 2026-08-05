import type { Metadata } from "next";
import { Mail, ShieldAlert, MessageCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { SITE_NAME } from "@/lib/utils";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-4xl font-bold">
          Nous <span className="gradient-text">contacter</span>
        </h1>
        <p className="mt-2 text-muted-foreground">L'équipe {SITE_NAME} vous répond sous 24h.</p>

        <div className="mt-8 grid gap-4">
          <Card>
            <CardContent className="flex items-start gap-4 p-6">
              <Mail className="mt-1 h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold">Contact général</h3>
                <p className="text-sm text-muted-foreground">
                  Questions, partenariats, demandes commerciales
                </p>
                <a href={`mailto:contact@${SITE_NAME.toLowerCase()}.com`} className="text-primary hover:underline">
                  contact@{SITE_NAME.toLowerCase()}.com
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-500/30">
            <CardContent className="flex items-start gap-4 p-6">
              <ShieldAlert className="mt-1 h-5 w-5 text-amber-400" />
              <div>
                <h3 className="font-semibold">Signaler une annonce</h3>
                <p className="text-sm text-muted-foreground">
                  Contenu illégal, mineur suspecté, arnaque
                </p>
                <a href={`mailto:abuse@${SITE_NAME.toLowerCase()}.com`} className="text-primary hover:underline">
                  abuse@{SITE_NAME.toLowerCase()}.com
                </a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-start gap-4 p-6">
              <MessageCircle className="mt-1 h-5 w-5 text-emerald-400" />
              <div>
                <h3 className="font-semibold">Support escorts (Premium / VIP)</h3>
                <p className="text-sm text-muted-foreground">Activation de boost, paiements</p>
                <a href={`mailto:support@${SITE_NAME.toLowerCase()}.com`} className="text-primary hover:underline">
                  support@{SITE_NAME.toLowerCase()}.com
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
