-- Remove a constraint que limita o número de mesas
ALTER TABLE table_tabs DROP CONSTRAINT IF EXISTS table_tabs_table_number_check;

-- Adiciona nova constraint para permitir até 40 mesas
ALTER TABLE table_tabs ADD CONSTRAINT table_tabs_table_number_check CHECK (table_number >= 1 AND table_number <= 40);

-- Limpa as mesas existentes e adiciona 40 mesas
DELETE FROM table_tabs;

-- Insere 40 mesas disponíveis
INSERT INTO table_tabs (table_number, status, items, total) VALUES
(1, 'available', '[]', 0),
(2, 'available', '[]', 0),
(3, 'available', '[]', 0),
(4, 'available', '[]', 0),
(5, 'available', '[]', 0),
(6, 'available', '[]', 0),
(7, 'available', '[]', 0),
(8, 'available', '[]', 0),
(9, 'available', '[]', 0),
(10, 'available', '[]', 0),
(11, 'available', '[]', 0),
(12, 'available', '[]', 0),
(13, 'available', '[]', 0),
(14, 'available', '[]', 0),
(15, 'available', '[]', 0),
(16, 'available', '[]', 0),
(17, 'available', '[]', 0),
(18, 'available', '[]', 0),
(19, 'available', '[]', 0),
(20, 'available', '[]', 0),
(21, 'available', '[]', 0),
(22, 'available', '[]', 0),
(23, 'available', '[]', 0),
(24, 'available', '[]', 0),
(25, 'available', '[]', 0),
(26, 'available', '[]', 0),
(27, 'available', '[]', 0),
(28, 'available', '[]', 0),
(29, 'available', '[]', 0),
(30, 'available', '[]', 0),
(31, 'available', '[]', 0),
(32, 'available', '[]', 0),
(33, 'available', '[]', 0),
(34, 'available', '[]', 0),
(35, 'available', '[]', 0),
(36, 'available', '[]', 0),
(37, 'available', '[]', 0),
(38, 'available', '[]', 0),
(39, 'available', '[]', 0),
(40, 'available', '[]', 0);
