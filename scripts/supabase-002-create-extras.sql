-- Criando tabela de acréscimos globais
CREATE TABLE IF NOT EXISTS extras (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_extras_active ON extras(active);

-- Habilitar Row Level Security (RLS)
ALTER TABLE extras ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: permitir acesso público completo
CREATE POLICY "Enable read access for all users" ON extras FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON extras FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON extras FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON extras FOR DELETE USING (true);

-- Inserir alguns acréscimos padrão
INSERT INTO extras (name, price, active) VALUES 
  ('Bacon', 3.50, true),
  ('Queijo Extra', 2.00, true),
  ('Ovo', 2.50, true),
  ('Cheddar', 3.00, true),
  ('Catupiry', 4.00, true)
ON CONFLICT DO NOTHING;
