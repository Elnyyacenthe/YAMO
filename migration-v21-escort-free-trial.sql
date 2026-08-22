-- ============================================================
-- Migration v21 : Essai gratuit — nouvelles escortes
--
-- Toute NOUVELLE escorte (inscription directe ou conversion d'un compte
-- client) reçoit automatiquement un abonnement offert d'un mois. À la fin
-- de l'essai, le cron `escort-subscriptions` remet le tier à NONE et met
-- les annonces en PAUSED : le 2e mois redevient payant, comme avant.
--
-- L'essai n'est accordé qu'UNE SEULE FOIS par compte : `escortTrialEndsAt`
-- non nul = essai déjà consommé (même expiré) → jamais réattribué.
--
-- Entièrement désactivable depuis le dashboard admin (/admin/reglages),
-- via la clé `escortSubscription.freeTrial.enabled`.
--
-- ⚠️ À exécuter AVANT de déployer le code v21 : sans ces colonnes, les
-- requêtes Prisma sur User échouent. Le code lit `freeTrial.enabled` avec
-- un fallback à `false` — si la ligne SiteSetting manque, l'essai est OFF.
-- ============================================================

-- 1. Colonnes de suivi de l'essai sur User
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "escortTrialStartedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "escortTrialEndsAt"    TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "User_escortTrialEndsAt_idx"
  ON "User" ("escortTrialEndsAt");

-- 2. Réglages pilotables depuis /admin/reglages
INSERT INTO "SiteSetting" ("key", "value", "category", "label", "updatedAt") VALUES
  ('escortSubscription.freeTrial.enabled', 'true',     'free_trial', 'Essai gratuit nouvelles escortes (activé)', NOW()),
  ('escortSubscription.freeTrial.days',    '30',       'free_trial', 'Durée de l''essai gratuit (jours)',         NOW()),
  ('escortSubscription.freeTrial.tier',    'PREMIUM',  'free_trial', 'Tier offert pendant l''essai',              NOW())
ON CONFLICT ("key") DO NOTHING;

-- ============================================================
-- VÉRIFICATION
-- ============================================================
-- SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'User' AND column_name LIKE 'escortTrial%';
-- SELECT * FROM "SiteSetting" WHERE "category" = 'free_trial';
--
-- ROLLBACK (si besoin) :
-- UPDATE "SiteSetting" SET "value" = 'false'
--   WHERE "key" = 'escortSubscription.freeTrial.enabled';
