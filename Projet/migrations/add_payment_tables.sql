-- Migration SQL pour ajouter les tables de paiement
-- À exécuter dans votre base de données PostgreSQL

-- Table pour les méthodes de paiement (cartes bancaires)
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_payment_method_id VARCHAR(255) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL,
  card_brand VARCHAR(50),
  card_last4 VARCHAR(4),
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS payment_methods_user_id_idx ON payment_methods(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS payment_methods_stripe_pm_idx ON payment_methods(stripe_payment_method_id);

-- Table pour les virements aux vendeurs
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'eur',
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  stripe_payout_id VARCHAR(255),
  stripe_transfer_id VARCHAR(255),
  arrival_date TIMESTAMP,
  failure_message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS payouts_seller_id_idx ON payouts(seller_id);
CREATE INDEX IF NOT EXISTS payouts_status_idx ON payouts(status);
CREATE INDEX IF NOT EXISTS payouts_created_at_idx ON payouts(created_at);

-- Commentaires pour documenter les tables
COMMENT ON TABLE payment_methods IS 'Méthodes de paiement enregistrées des utilisateurs (cartes bancaires)';
COMMENT ON TABLE payouts IS 'Historique des virements aux vendeurs';
COMMENT ON COLUMN payment_methods.stripe_payment_method_id IS 'ID de la méthode de paiement dans Stripe';
COMMENT ON COLUMN payment_methods.is_default IS 'Indique si c''est la méthode de paiement par défaut de l''utilisateur';
COMMENT ON COLUMN payouts.amount IS 'Montant en centimes';
COMMENT ON COLUMN payouts.status IS 'Statut du virement: pending, paid, failed, canceled';
