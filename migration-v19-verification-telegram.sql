-- ============================================================
-- Migration v19 : Vérification d'identité via Telegram
--
-- La vérification n'utilise plus K-Pay (indisponible) ni l'upload de
-- documents sur le site : l'escorte paie via Mobile Money direct (comme
-- l'abonnement, cf. declareManualVerificationPaymentAction), puis envoie
-- ses documents directement dans une conversation Telegram dédiée
-- (lien configurable dans /admin/reglages → SiteSetting
-- "verification.telegramLink").
--
-- Les documents ne sont donc plus stockés en base — colonnes rendues
-- nullable. Les enregistrements existants (ancien flow avec upload)
-- gardent leurs valeurs, rien n'est écrasé.
-- ============================================================

ALTER TABLE "IdVerification"
  ALTER COLUMN "documentType" DROP NOT NULL,
  ALTER COLUMN "documentNumber" DROP NOT NULL,
  ALTER COLUMN "documentFrontUrl" DROP NOT NULL,
  ALTER COLUMN "selfieUrl" DROP NOT NULL;

-- Compte Telegram dédié à la vérification, identifié par le numéro MTN
-- réservé (678876470). Éditable ensuite dans /admin/reglages.
INSERT INTO "SiteSetting" ("key", "value", "category", "label", "updatedAt") VALUES
  ('verification.telegramLink', '678876470', 'verification', 'Lien Telegram — vérification d''identité', NOW())
ON CONFLICT ("key") DO NOTHING;

-- ============================================================
-- VÉRIFICATION
-- ============================================================
-- SELECT column_name, is_nullable FROM information_schema.columns
-- WHERE table_name = 'IdVerification'
--   AND column_name IN ('documentType','documentNumber','documentFrontUrl','selfieUrl');
--
-- SELECT * FROM "SiteSetting" WHERE "key" = 'verification.telegramLink';
