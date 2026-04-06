-- Adiciona coluna payment_method na tabela cash_transactions
ALTER TABLE cash_transactions ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'dinheiro';
