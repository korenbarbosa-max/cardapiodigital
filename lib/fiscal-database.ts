import { createClient } from "@/lib/supabase/server"
import type { FiscalConfig, Invoice, EmitirNotaRequest } from "./fiscal-types"

// ============================================
// Funções para Configurações Fiscais
// ============================================

export async function getFiscalConfig(): Promise<FiscalConfig | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("fiscal_config")
    .select("*")
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as FiscalConfig | null
}

export async function saveFiscalConfig(config: Partial<FiscalConfig>): Promise<FiscalConfig> {
  const supabase = await createClient()
  
  // Verificar se já existe configuração
  const existing = await getFiscalConfig()
  
  if (existing) {
    // Atualizar
    const { data, error } = await supabase
      .from("fiscal_config")
      .update({
        ...config,
        updated_at: new Date().toISOString()
      })
      .eq("id", existing.id)
      .select()
      .single()
    
    if (error) throw error
    return data as FiscalConfig
  } else {
    // Inserir
    const { data, error } = await supabase
      .from("fiscal_config")
      .insert(config)
      .select()
      .single()
    
    if (error) throw error
    return data as FiscalConfig
  }
}

// ============================================
// Funções para Notas Fiscais
// ============================================

export async function getInvoices(filters?: {
  tipo?: 'nfe' | 'nfce'
  status?: string
  data_inicio?: string
  data_fim?: string
  limit?: number
}): Promise<Invoice[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from("invoices")
    .select("*")
    .order("created_at", { ascending: false })
  
  if (filters?.tipo) {
    query = query.eq("tipo", filters.tipo)
  }
  if (filters?.status) {
    query = query.eq("status", filters.status)
  }
  if (filters?.data_inicio) {
    query = query.gte("created_at", filters.data_inicio)
  }
  if (filters?.data_fim) {
    query = query.lte("created_at", filters.data_fim)
  }
  if (filters?.limit) {
    query = query.limit(filters.limit)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data as Invoice[]
}

export async function getInvoiceById(id: number): Promise<Invoice | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as Invoice | null
}

export async function getInvoiceByChaveAcesso(chaveAcesso: string): Promise<Invoice | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("chave_acesso", chaveAcesso)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as Invoice | null
}

export async function createInvoice(invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>): Promise<Invoice> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("invoices")
    .insert(invoice)
    .select()
    .single()

  if (error) throw error
  return data as Invoice
}

export async function updateInvoice(id: number, updates: Partial<Invoice>): Promise<Invoice> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("invoices")
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data as Invoice
}

export async function getNextInvoiceNumber(tipo: 'nfe' | 'nfce'): Promise<{ numero: number; serie: number }> {
  const config = await getFiscalConfig()
  
  if (!config) {
    throw new Error("Configuração fiscal não encontrada. Configure os dados da empresa primeiro.")
  }
  
  const numero = tipo === 'nfe' ? config.proximo_numero_nfe : config.proximo_numero_nfce
  const serie = tipo === 'nfe' ? config.serie_nfe : config.serie_nfce
  
  return { numero, serie }
}

export async function incrementInvoiceNumber(tipo: 'nfe' | 'nfce'): Promise<void> {
  const supabase = await createClient()
  const config = await getFiscalConfig()
  
  if (!config) return
  
  const field = tipo === 'nfe' ? 'proximo_numero_nfe' : 'proximo_numero_nfce'
  const currentValue = tipo === 'nfe' ? config.proximo_numero_nfe : config.proximo_numero_nfce
  
  await supabase
    .from("fiscal_config")
    .update({ [field]: currentValue + 1 })
    .eq("id", config.id)
}

// ============================================
// Funções para Produtos (campos fiscais)
// ============================================

export async function updateProductFiscalData(
  productId: number, 
  fiscalData: {
    ncm?: string
    cfop?: string
    cest?: string
    origem?: number
    unidade_comercial?: string
  }
): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("products")
    .update(fiscalData)
    .eq("id", productId)

  if (error) throw error
}

export async function getProductsWithFiscalData(): Promise<any[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, ncm, cfop, cest, origem, unidade_comercial")
    .order("name")

  if (error) throw error
  return data
}

// ============================================
// Estatísticas Fiscais
// ============================================

export async function getFiscalStats(periodo?: { inicio: string; fim: string }) {
  const supabase = await createClient()
  
  let query = supabase.from("invoices").select("*")
  
  if (periodo) {
    query = query.gte("created_at", periodo.inicio).lte("created_at", periodo.fim)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  
  const invoices = data as Invoice[]
  
  const stats = {
    total_notas: invoices.length,
    nfe_emitidas: invoices.filter(i => i.tipo === 'nfe' && i.status === 'autorizada').length,
    nfce_emitidas: invoices.filter(i => i.tipo === 'nfce' && i.status === 'autorizada').length,
    valor_total: invoices
      .filter(i => i.status === 'autorizada')
      .reduce((acc, i) => acc + Number(i.valor_total), 0),
    notas_canceladas: invoices.filter(i => i.status === 'cancelada').length,
    notas_rejeitadas: invoices.filter(i => i.status === 'rejeitada').length,
  }
  
  return stats
}
