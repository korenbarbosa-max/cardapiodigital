-- Add payment_method column to table_tabs
ALTER TABLE table_tabs ADD COLUMN IF NOT EXISTS payment_method character varying;
