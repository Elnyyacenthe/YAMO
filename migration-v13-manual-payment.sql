-- ============================================================
-- Migration v13 : Paiement manuel — Abonnement escorte
--
-- K-Pay indisponible : l'abonnement escorte passe en paiement Mobile Money
-- direct + déclaration escorte + validation admin (voir
-- declareManualSubscriptionPaymentAction / markPaymentPaidAction).
--
-- Seed des coordonnées de réception affichées à l'escorte dans le modal
-- de paiement. Ne modifie AUCUNE table/colonne — SiteSetting existe déjà.
--
-- ON CONFLICT DO NOTHING : si l'admin a déjà modifié ces clés via le
-- dashboard, la migration ne les écrase pas.
-- ============================================================

INSERT INTO "SiteSetting" ("key", "value", "category", "label", "updatedAt") VALUES
  ('payment.manual.orangeNumber', '640528712', 'manual_payment', 'Numéro Orange Money', NOW()),
  ('payment.manual.mtnNumber', '678876470', 'manual_payment', 'Numéro MTN Mobile Money', NOW())
ON CONFLICT ("key") DO NOTHING;

-- ============================================================
-- VÉRIFICATION
-- ============================================================
-- SELECT * FROM "SiteSetting" WHERE "category" = 'manual_payment';
