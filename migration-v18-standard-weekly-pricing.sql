-- ============================================================
-- Migration v18 : Tier Standard passe en période fixe hebdomadaire
--
-- Le tier Standard n'est plus mensuel/bon marché : il coûte désormais
-- 2 500 FCFA pour une période FIXE d'une semaine (pas de sélecteur de
-- durée, pas de remise). Premium et VIP restent inchangés (mensuel,
-- 1/3/12 mois avec remises).
--
-- `pricing.escortSubscription.standard.amount` existe déjà (v12, valeur
-- 2000) → mis à jour explicitement via DO UPDATE (écrase toute valeur
-- personnalisée, décision produit volontaire).
-- `pricing.escortSubscription.standard.days` est une nouvelle clé → 7
-- (Premium/VIP continuent d'utiliser le fallback JS 30j, pas de ligne
-- nécessaire ici sauf si vous voulez les rendre éditables aussi).
-- ============================================================

INSERT INTO "SiteSetting" ("key", "value", "category", "label", "updatedAt") VALUES
  ('pricing.escortSubscription.standard.amount', '2500', 'pricing', 'Prix Standard (par semaine)', NOW())
ON CONFLICT ("key") DO UPDATE SET
  "value" = EXCLUDED."value",
  "updatedAt" = NOW();

INSERT INTO "SiteSetting" ("key", "value", "category", "label", "updatedAt") VALUES
  ('pricing.escortSubscription.standard.days', '7', 'pricing', 'Durée Standard (jours)', NOW())
ON CONFLICT ("key") DO NOTHING;

-- ============================================================
-- VÉRIFICATION
-- ============================================================
-- SELECT * FROM "SiteSetting" WHERE "key" LIKE 'pricing.escortSubscription.standard%';
