-- Adicionando constraint UNIQUE na coluna name da tabela categories
ALTER TABLE categories ADD CONSTRAINT categories_name_unique UNIQUE (name);
