-- ============================================================
-- Migration v20 : normalisation du format User.phone en production
--
-- Contexte : avant le correctif du 2026-08-06, trois points d'écriture
-- (inscription, devenir-escort, onboarding admin) normalisaient le
-- numéro de façon incohérente selon le format saisi. Résultat : la
-- contrainte UNIQUE sur User.phone ne détectait pas deux comptes avec
-- le même numéro réel stocké sous des formats différents.
--
-- Ciblé par ID sur les 4 comptes identifiés via check-phone-duplicates.sql
-- (requête 2 — formats non canoniques). Aucun doublon actif entre eux
-- (numéros réels tous différents), donc ces UPDATE ne peuvent pas
-- entrer en collision avec un autre compte existant.
-- ============================================================

UPDATE "User" SET phone = '+237658553399' WHERE id = 'cmpqp2td00000vkh45cy83w57' AND phone = '658553399';
UPDATE "User" SET phone = '+237677888999' WHERE id = 'usr_bafoussam_demo'        AND phone = '237677888999';
UPDATE "User" SET phone = '+237658335599' WHERE id = 'cmqrt61u20000vk4ctg18bnm1' AND phone = '658335599';
UPDATE "User" SET phone = '+237687035235' WHERE id = 'cmqxj0rib0018kzie3c6af59l' AND phone = '687035235';

-- ============================================================
-- VÉRIFICATION
-- ============================================================
-- Re-exécuter check-phone-duplicates.sql (requêtes 1 et 2) après
-- application — les deux doivent maintenant retourner 0 ligne.
