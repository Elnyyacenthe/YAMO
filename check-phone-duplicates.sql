-- ============================================================
-- Diagnostic : doublons / formats incohérents sur User.phone
--
-- LECTURE SEULE — ne modifie rien. À exécuter sur la prod pour vérifier
-- si le bug de normalisation de téléphone (corrigé côté code le
-- 2026-08-06) a laissé des comptes avec le même numéro réel stocké
-- sous des formats différents (ex: "678876470" vs "+237678876470"),
-- ce qui contournait silencieusement la contrainte unique.
-- ============================================================

-- 1. Vrais doublons : même numéro réel (9 derniers chiffres), peu importe
--    le format stocké. Si cette requête retourne des lignes, il y a un
--    problème à résoudre (fusionner ou supprimer un des comptes).
WITH normalized AS (
  SELECT
    id,
    email,
    name,
    role,
    phone,
    "createdAt",
    '+237' || RIGHT(REGEXP_REPLACE(phone, '\D', '', 'g'), 9) AS canonical
  FROM "User"
  WHERE phone IS NOT NULL
    AND LENGTH(REGEXP_REPLACE(phone, '\D', '', 'g')) >= 9
)
SELECT
  canonical,
  COUNT(*) AS nb_comptes,
  ARRAY_AGG(email ORDER BY "createdAt") AS emails,
  ARRAY_AGG(phone ORDER BY "createdAt") AS numeros_bruts,
  ARRAY_AGG(role::text ORDER BY "createdAt") AS roles,
  ARRAY_AGG(id ORDER BY "createdAt") AS ids
FROM normalized
GROUP BY canonical
HAVING COUNT(*) > 1
ORDER BY nb_comptes DESC;

-- 2. Numéros stockés dans un format NON canonique (pas "+237XXXXXXXXX"),
--    même sans doublon actif pour l'instant — à normaliser pour éviter
--    qu'un futur compte avec le même numéro passe inaperçu.
SELECT
  id,
  email,
  role,
  phone AS format_actuel,
  '+237' || RIGHT(REGEXP_REPLACE(phone, '\D', '', 'g'), 9) AS format_attendu,
  "createdAt"
FROM "User"
WHERE phone IS NOT NULL
  AND phone <> ('+237' || RIGHT(REGEXP_REPLACE(phone, '\D', '', 'g'), 9))
ORDER BY "createdAt";
