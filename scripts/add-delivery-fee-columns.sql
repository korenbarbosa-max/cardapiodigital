-- Adiciona colunas subtotal e delivery_fee à tabela orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal numeric DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_fee numeric DEFAULT 0;
