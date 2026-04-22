// Tipos para a área fiscal

export interface FiscalConfig {
  id?: number
  razao_social: string
  nome_fantasia?: string
  cnpj: string
  inscricao_estadual?: string
  inscricao_municipal?: string
  
  // Endereço
  cep?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  uf?: string
  codigo_ibge?: string
  
  // Configurações fiscais
  regime_tributario: 'simples_nacional' | 'lucro_presumido' | 'lucro_real'
  ambiente: 'homologacao' | 'producao'
  serie_nfe: number
  serie_nfce: number
  proximo_numero_nfe: number
  proximo_numero_nfce: number
  
  // Credenciais API
  api_provider: 'focus_nfe' | 'nfe_io' | 'webmania'
  api_token?: string
  csc_id?: string
  csc_token?: string
  
  created_at?: string
  updated_at?: string
}

export interface InvoiceItem {
  produto_id: number
  nome: string
  ncm?: string
  cfop?: string
  quantidade: number
  valor_unitario: number
  valor_total: number
  unidade: string
}

export interface InvoiceDestinatario {
  nome?: string
  cpf_cnpj?: string
  email?: string
  telefone?: string
  endereco?: {
    logradouro?: string
    numero?: string
    complemento?: string
    bairro?: string
    cidade?: string
    uf?: string
    cep?: string
  }
}

export interface Invoice {
  id?: number
  order_id?: number
  table_tab_id?: number
  
  // Tipo e numeração
  tipo: 'nfe' | 'nfce'
  numero: number
  serie: number
  
  // Dados do destinatário
  destinatario_nome?: string
  destinatario_cpf_cnpj?: string
  destinatario_email?: string
  destinatario_telefone?: string
  destinatario_endereco?: InvoiceDestinatario['endereco']
  
  // Valores
  valor_produtos: number
  valor_desconto: number
  valor_frete: number
  valor_total: number
  
  // Impostos
  impostos?: {
    icms?: number
    pis?: number
    cofins?: number
    ipi?: number
  }
  
  // Itens da nota
  itens: InvoiceItem[]
  
  // Dados da emissão
  status: 'pendente' | 'processando' | 'autorizada' | 'rejeitada' | 'cancelada' | 'erro'
  chave_acesso?: string
  protocolo_autorizacao?: string
  data_emissao?: string
  data_autorizacao?: string
  
  // Arquivos
  xml_nota?: string
  xml_cancelamento?: string
  danfe_url?: string
  qrcode_url?: string
  
  // Erros
  mensagem_erro?: string
  codigo_erro?: string
  
  // Metadados
  ref_api?: string
  resposta_api?: any
  
  created_at?: string
  updated_at?: string
}

export interface EmitirNotaRequest {
  tipo: 'nfe' | 'nfce'
  order_id?: number
  table_tab_id?: number
  destinatario?: InvoiceDestinatario
  itens: Array<{
    produto_id: number
    nome: string
    quantidade: number
    valor_unitario: number
    ncm?: string
    cfop?: string
  }>
  valor_desconto?: number
  valor_frete?: number
  informacoes_adicionais?: string
}

export interface ConsultarNotaResponse {
  status: string
  chave_acesso?: string
  protocolo?: string
  data_emissao?: string
  danfe_url?: string
  xml_url?: string
  mensagem?: string
}

export interface CancelarNotaRequest {
  invoice_id: number
  justificativa: string
}

// Status das notas com labels e cores
export const INVOICE_STATUS = {
  pendente: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  processando: { label: 'Processando', color: 'bg-blue-100 text-blue-800' },
  autorizada: { label: 'Autorizada', color: 'bg-green-100 text-green-800' },
  rejeitada: { label: 'Rejeitada', color: 'bg-red-100 text-red-800' },
  cancelada: { label: 'Cancelada', color: 'bg-gray-100 text-gray-800' },
  erro: { label: 'Erro', color: 'bg-red-100 text-red-800' },
} as const

// Regimes tributários
export const REGIMES_TRIBUTARIOS = [
  { value: 'simples_nacional', label: 'Simples Nacional' },
  { value: 'lucro_presumido', label: 'Lucro Presumido' },
  { value: 'lucro_real', label: 'Lucro Real' },
] as const

// UFs brasileiras
export const UFS_BRASIL = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
] as const

// Origens do produto
export const ORIGENS_PRODUTO = [
  { value: 0, label: '0 - Nacional' },
  { value: 1, label: '1 - Estrangeira (importação direta)' },
  { value: 2, label: '2 - Estrangeira (adquirida no mercado interno)' },
  { value: 3, label: '3 - Nacional com mais de 40% de conteúdo estrangeiro' },
  { value: 4, label: '4 - Nacional (produção conforme processos básicos)' },
  { value: 5, label: '5 - Nacional com menos de 40% de conteúdo estrangeiro' },
  { value: 6, label: '6 - Estrangeira (importação direta, sem similar)' },
  { value: 7, label: '7 - Estrangeira (mercado interno, sem similar)' },
  { value: 8, label: '8 - Nacional (conteúdo de importação superior a 70%)' },
] as const
