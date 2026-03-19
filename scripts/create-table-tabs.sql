-- Create table_tabs table for restaurant table management (comandas)
CREATE TABLE IF NOT EXISTS table_tabs (
  id SERIAL PRIMARY KEY,
  table_number INTEGER NOT NULL CHECK (table_number >= 1 AND table_number <= 8),
  status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'pending_payment')),
  items JSONB DEFAULT '[]',
  total NUMERIC(10,2) DEFAULT 0,
  customer_name VARCHAR(255),
  opened_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_table_tabs_table_number ON table_tabs(table_number);
CREATE INDEX IF NOT EXISTS idx_table_tabs_status ON table_tabs(status);

-- Enable RLS
ALTER TABLE table_tabs ENABLE ROW LEVEL SECURITY;

-- Create policy for full access
CREATE POLICY "Allow all access to table_tabs" ON table_tabs FOR ALL USING (true) WITH CHECK (true);

-- Insert initial records for 8 tables (all available)
INSERT INTO table_tabs (table_number, status, items, total)
SELECT generate_series(1, 8), 'available', '[]'::jsonb, 0
ON CONFLICT DO NOTHING;
