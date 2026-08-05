-- ============================================================
-- Migration v15 : Compte CLIENT allégé par pseudo
--
-- Les favoris, signalements et la messagerie support nécessitent un compte,
-- mais un CLIENT n'a pas besoin d'email ni de téléphone : juste un pseudo +
-- mot de passe (cf. clientQuickAuthAction).
-- ============================================================

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "username" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");

-- ============================================================
-- VÉRIFICATION
-- ============================================================
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'User' AND column_name = 'username';
