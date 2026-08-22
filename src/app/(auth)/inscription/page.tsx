import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/register-form";
import { getFreeTrialConfig, formatTrialDuration } from "@/lib/escort-subscription";

export const metadata: Metadata = { title: "Inscription" };

// L'offre d'essai est lue en base à chaque affichage : activer/désactiver
// l'essai depuis le dashboard doit se refléter immédiatement, sans rebuild.
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  // v21 — l'offre « premier mois offert » est pilotée depuis le dashboard admin.
  const trial = await getFreeTrialConfig();

  return (
    <Suspense>
      <RegisterForm
        trial={{
          enabled: trial.enabled,
          tier: trial.tier,
          label: formatTrialDuration(trial.days),
        }}
      />
    </Suspense>
  );
}
