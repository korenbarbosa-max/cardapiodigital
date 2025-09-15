-- Criando tabelas para o sistema de cardápio digital
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  image TEXT,
  visible BOOLEAN DEFAULT true,
  stock_control BOOLEAN DEFAULT false,
  stock_quantity INTEGER DEFAULT 0,
  per_kilo BOOLEAN DEFAULT false,
  extras JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(255),
  customer_phone VARCHAR(20),
  items JSONB NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cash_transactions (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL, -- 'entrada', 'saida', 'balance'
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir categorias padrão
INSERT INTO categories (name) VALUES 
  ('Lanches'),
  ('Bebidas'),
  ('Sobremesas'),
  ('Pratos Principais')
ON CONFLICT DO NOTHING;
