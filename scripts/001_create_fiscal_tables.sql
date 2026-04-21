-- Migração: Criar tabelas para área fiscal
-- Data: 2026-04-21

-- ============================================
-- Tabela: fiscal_config
-- Configurações fiscais do estabelecimento
-- ============================================
CREATE TABLE IF NOT EXISTS fiscal_config (
  id SERIAL PRIMARY KEY,
  razao_social VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255),
  cnpj VARCHAR(18) NOT NULL,
  inscricao_estadual VARCHAR(20),
  inscricao_municipal VARCHAR(20),
  
  -- Endereço
  cep VARCHAR(10),
  logradouro VARCHAR(255),
  numero VARCHAR(20),
  complemento VARCHAR(100),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  uf VARCHAR(2),
  codigo_ibge VARCHAR(10),
  
  -- Configurações fiscais
  regime_tributario VARCHAR(50) DEFAULT 'simples_nacional', -- 'simples_nacional', 'lucro_presumido', 'lucro_real'
  ambiente VARCHAR(20) DEFAULT 'homologacao', -- 'homologacao' ou 'producao'
  serie_nfe INTEGER DEFAULT 1,
  serie_nfce INTEGER DEFAULT 1,
  proximo_numero_nfe INTEGER DEFAULT 1,
  proximo_numero_nfce INTEGER DEFAULT 1,
  
  -- Credenciais API
  api_provider VARCHAR(50) DEFAULT 'focus_nfe', -- 'focus_nfe', 'nfe_io', 'webmania'
  api_token TEXT,
  csc_id VARCHAR(10), -- ID do CSC para NFC-e
  csc_token VARCHAR(100), -- Token CSC para NFC-e
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para fiscal_config
ALTER TABLE fiscal_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to fiscal_config" ON fiscal_config FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Tabela: invoices
-- Notas fiscais emitidas
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  table_tab_id INTEGER REFERENCES table_tabs(id) ON DELETE SET NULL,
  
  -- Tipo e numeração
  tipo VARCHAR(10) NOT NULL, -- 'nfe' ou 'nfce'
  numero INTEGER NOT NULL,
  serie INTEGER NOT NULL,
  
  -- Dados do destinatário (opcional para NFC-e)
  destinatario_nome VARCHAR(255),
  destinatario_cpf_cnpj VARCHAR(18),
  destinatario_email VARCHAR(255),
  destinatario_telefone VARCHAR(20),
  destinatario_endereco JSONB,
  
  -- Valores
  valor_produtos NUMERIC(10,2) NOT NULL,
  valor_desconto NUMERIC(10,2) DEFAULT 0,
  valor_frete NUMERIC(10,2) DEFAULT 0,
  valor_total NUMERIC(10,2) NOT NULL,
  
  -- Impostos (calculados pela API)
  impostos JSONB,
  
  -- Itens da nota
  itens JSONB NOT NULL,
  
  -- Dados da emissão
  status VARCHAR(50) NOT NULL DEFAULT 'pendente', -- 'pendente', 'processando', 'autorizada', 'cancelada', 'rejeitada'
  chave_acesso VARCHAR(44),
  protocolo_autorizacao VARCHAR(50),
  data_emissao TIMESTAMP WITH TIME ZONE,
  data_autorizacao TIMESTAMP WITH TIME ZONE,
  
  -- Arquivos
  xml_nota TEXT,
  xml_cancelamento TEXT,
  danfe_url TEXT,
  qrcode_url TEXT,
  
  -- Erros
  mensagem_erro TEXT,
  codigo_erro VARCHAR(20),
  
  -- Metadados
  ref_api VARCHAR(100), -- ID de referência na API
  resposta_api JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para invoices
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_table_tab_id ON invoices(table_tab_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_chave_acesso ON invoices(chave_acesso);
CREATE INDEX IF NOT EXISTS idx_invoices_tipo ON invoices(tipo);
CREATE INDEX IF NOT EXISTS idx_invoices_data_emissao ON invoices(data_emissao);

-- RLS para invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to invoices" ON invoices FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Adicionar campos fiscais na tabela products
-- ============================================
ALTER TABLE products ADD COLUMN IF NOT EXISTS ncm VARCHAR(10);
ALTER TABLE products ADD COLUMN IF NOT EXISTS cfop VARCHAR(4) DEFAULT '5102';
ALTER TABLE products ADD COLUMN IF NOT EXISTS cest VARCHAR(10);
ALTER TABLE products ADD COLUMN IF NOT EXISTS origem INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS unidade_comercial VARCHAR(10) DEFAULT 'UN';

-- ============================================
-- Trigger para atualizar updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para fiscal_config
DROP TRIGGER IF EXISTS update_fiscal_config_updated_at ON fiscal_config;
CREATE TRIGGER update_fiscal_config_updated_at
  BEFORE UPDATE ON fiscal_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para invoices
DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
