import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/utils";

export const metadata: Metadata = { title: "Mentions légales" };

export default function LegalPage() {
  return (
    <div className="container py-12">
      <article className="prose prose-invert mx-auto max-w-3xl">
        <h1 className="font-display text-4xl font-bold">Mentions légales</h1>

        <h2>1. Éditeur du site</h2>
        <p>
          Le site <strong>{SITE_NAME}</strong> est actuellement exploité en phase de lancement, en amont de
          son immatriculation formelle (RCCM) au Cameroun. Les informations légales complètes de la société
          éditrice (raison sociale, forme juridique, capital social, numéro RCCM, siège social, directeur de
          la publication) seront publiées sur cette page dès l'immatriculation finalisée.
        </p>
        <p>
          Jusque-là, toute question relative à l'identité de l'exploitant peut être adressée au contact
          ci-dessous.
        </p>
        <p>Email : contact@{SITE_NAME.toLowerCase()}.com</p>

        <h2>2. Hébergement</h2>
        <p>Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA.</p>

        <h2>3. Public visé — Restriction d'âge</h2>
        <p>
          <strong>{SITE_NAME} est strictement réservé aux personnes majeures (18 ans et plus).</strong> Toute
          consultation par un mineur est interdite et constitue une infraction. Le site met en œuvre un mur d'âge
          (age-gate) et invite chaque visiteur à confirmer sa majorité avant accès.
        </p>

        <h2>4. Nature des annonces</h2>
        <p>
          {SITE_NAME} est une plateforme de mise en relation entre adultes consentants. Les annonceurs sont seuls
          responsables du contenu de leurs annonces et certifient sur l'honneur être majeurs et consentants.
          {SITE_NAME} agit en qualité d'hébergeur technique au sens de la loi camerounaise n°2010/012 du 21
          décembre 2010 relative à la cybersécurité et à la cybercriminalité (voir aussi{" "}
          <Link href="/cgu#hebergeur" className="text-primary hover:underline">CGU, article 5</Link>).
        </p>

        <h2>5. Modération et signalement</h2>
        <p>
          Toute annonce signalée pour contenu illégal, traite des personnes, mineur ou contrainte est immédiatement
          examinée et, si fondée, supprimée. Les autorités compétentes sont saisies en cas d'infraction.
        </p>

        <h2>6. Propriété intellectuelle</h2>
        <p>
          L'ensemble du site, sa structure, son design, ses textes sont la propriété exclusive de {SITE_NAME}. Toute
          reproduction est interdite sans autorisation préalable écrite.
        </p>

        <h2>7. Contact</h2>
        <p>Pour toute question : contact@{SITE_NAME.toLowerCase()}.com</p>
      </article>
    </div>
  );
}
