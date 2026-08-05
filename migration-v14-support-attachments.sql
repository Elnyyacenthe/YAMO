-- ============================================================
-- Migration v14 : Pièces jointes dans la messagerie support
--
-- Permet à l'utilisateur (escort/client) et à l'admin de partager une image
-- ou un document (ex: capture d'écran, reçu, pièce justificative) dans la
-- discussion support, pour faciliter la résolution des plaintes/litiges.
-- ============================================================

ALTER TABLE "SupportMessage"
  ADD COLUMN IF NOT EXISTS "attachmentUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "attachmentName" TEXT;

-- ============================================================
-- VÉRIFICATION
-- ============================================================
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'SupportMessage' AND column_name LIKE 'attachment%';
