-- ============================================================
-- Migration v16 : WhatsApp/Telegram figés au numéro du compte
--
-- L'escorte ne saisit plus librement un numéro WhatsApp par annonce : le
-- contact (WhatsApp et/ou Telegram) est désormais TOUJOURS le numéro de
-- son compte (celui de l'inscription, non modifiable en self-service).
-- Ça empêche mécaniquement deux escortes différentes d'utiliser le même
-- numéro (contrainte @unique déjà existante sur User.phone).
-- ============================================================

ALTER TABLE "Ad"
  ADD COLUMN IF NOT EXISTS "whatsappEnabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "telegramEnabled" BOOLEAN NOT NULL DEFAULT false;

-- ============================================================
-- VÉRIFICATION
-- ============================================================
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'Ad' AND column_name IN ('whatsappEnabled', 'telegramEnabled');
