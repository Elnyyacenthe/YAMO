-- ============================================================
-- Migration v17 : Un compte ESCORT doit toujours avoir un numéro
--
-- Défense en profondeur en base, en plus des gardes applicatives
-- (becomeEscortAction, createAdAction, admin-escort-onboarding) : la
-- contrainte interdit tout état ESCORT + phone NULL, quel que soit le
-- chemin de code qui écrirait la ligne.
-- ============================================================

DO $$ BEGIN
  ALTER TABLE "User"
    ADD CONSTRAINT "User_escort_requires_phone"
    CHECK (role != 'ESCORT' OR phone IS NOT NULL);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- VÉRIFICATION
-- ============================================================
-- SELECT conname FROM pg_constraint WHERE conname = 'User_escort_requires_phone';
-- Comptes existants en violation potentielle (à corriger AVANT d'appliquer si non vide) :
-- SELECT id, email, username FROM "User" WHERE role = 'ESCORT' AND phone IS NULL;
