-- Criando tabelas para o sistema de cardápio digital no Supabase
-- Execute este script no SQL Editor do Supabase ou via CLI

-- Tabela de categorias
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  image TEXT,
  visible BOOLEAN DEFAULT true,
  stock_control BOOLEAN DEFAULT false,
  stock_quantity INTEGER DEFAULT 0,
  per_kilo BOOLEAN DEFAULT false,
  extras JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  customer_name VARCHAR(255),
  customer_phone VARCHAR(20),
  items JSONB NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de transações de caixa
CREATE TABLE IF NOT EXISTS cash_transactions (
  id BIGSERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('entrada', 'saida', 'balance')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_visible ON products(visible);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cash_transactions_created_at ON cash_transactions(created_at DESC);

-- Inserir categorias padrão (apenas se não existirem)
INSERT INTO categories (name) 
SELECT 'Lanches' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Lanches');
INSERT INTO categories (name) 
SELECT 'Bebidas' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Bebidas');
INSERT INTO categories (name) 
SELECT 'Sobremesas' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Sobremesas');
INSERT INTO categories (name) 
SELECT 'Pratos Principais' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Pratos Principais');
INSERT INTO categories (name) 
SELECT 'Petiscos' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Petiscos');

-- Habilitar Row Level Security (RLS) - importante para segurança
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_transactions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: permitir acesso público para leitura (você pode ajustar conforme necessário)
-- IMPORTANTE: Essas políticas permitem acesso total. Ajuste para produção!

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
DROP POLICY IF EXISTS "Enable insert for all users" ON categories;
DROP POLICY IF EXISTS "Enable update for all users" ON categories;
DROP POLICY IF EXISTS "Enable delete for all users" ON categories;

DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable insert for all users" ON products;
DROP POLICY IF EXISTS "Enable update for all users" ON products;
DROP POLICY IF EXISTS "Enable delete for all users" ON products;

DROP POLICY IF EXISTS "Enable read access for all users" ON orders;
DROP POLICY IF EXISTS "Enable insert for all users" ON orders;
DROP POLICY IF EXISTS "Enable update for all users" ON orders;
DROP POLICY IF EXISTS "Enable delete for all users" ON orders;

DROP POLICY IF EXISTS "Enable read access for all users" ON cash_transactions;
DROP POLICY IF EXISTS "Enable insert for all users" ON cash_transactions;
DROP POLICY IF EXISTS "Enable update for all users" ON cash_transactions;
DROP POLICY IF EXISTS "Enable delete for all users" ON cash_transactions;

-- Categories: permitir leitura e escrita para todos
CREATE POLICY "Enable read access for all users" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON categories
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON categories
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON categories
  FOR DELETE USING (true);

-- Products: permitir leitura e escrita para todos
CREATE POLICY "Enable read access for all users" ON products
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON products
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON products
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON products
  FOR DELETE USING (true);

-- Orders: permitir leitura e escrita para todos
CREATE POLICY "Enable read access for all users" ON orders
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON orders
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON orders
  FOR DELETE USING (true);

-- Cash Transactions: permitir leitura e escrita para todos
CREATE POLICY "Enable read access for all users" ON cash_transactions
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON cash_transactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON cash_transactions
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON cash_transactions
  FOR DELETE USING (true);
