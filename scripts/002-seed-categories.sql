-- Adicionando categorias padrão para o sistema
INSERT INTO categories (name) VALUES 
  ('Lanches'),
  ('Bebidas'),
  ('Sobremesas'),
  ('Pratos Principais'),
  ('Petiscos')
ON CONFLICT (name) DO NOTHING;
