-- Criando tabela de sessões de caixa (abertura/fechamento)
CREATE TABLE IF NOT EXISTS cash_sessions (
  id BIGSERIAL PRIMARY KEY,
  status VARCHAR(20) NOT NULL CHECK (status IN ('aberto', 'fechado')),
  opening_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  closing_amount DECIMAL(10,2),
  expected_amount DECIMAL(10,2),
  difference DECIMAL(10,2),
  opened_by VARCHAR(255),
  closed_by VARCHAR(255),
  opening_notes TEXT,
  closing_notes TEXT,
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_cash_sessions_status ON cash_sessions(status);
CREATE INDEX IF NOT EXISTS idx_cash_sessions_opened_at ON cash_sessions(opened_at DESC);

-- Habilitar Row Level Security (RLS)
ALTER TABLE cash_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: permitir acesso público completo
CREATE POLICY "Enable read access for all users" ON cash_sessions FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON cash_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON cash_sessions FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON cash_sessions FOR DELETE USING (true);

-- Adicionar campo session_id na tabela de transações
ALTER TABLE cash_transactions ADD COLUMN IF NOT EXISTS session_id BIGINT REFERENCES cash_sessions(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_cash_transactions_session_id ON cash_transactions(session_id);

-- Recarregar o schema cache
NOTIFY pgrst, 'reload schema';
