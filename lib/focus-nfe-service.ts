/**
 * Serviço de integração com a Focus NFe API
 * Documentação: https://focusnfe.com.br/doc/
 */

import type { FiscalConfig, Invoice, EmitirNotaRequest, InvoiceItem } from "./fiscal-types"

const FOCUS_NFE_BASE_URL_HOMOLOGACAO = "https://homologacao.focusnfe.com.br"
const FOCUS_NFE_BASE_URL_PRODUCAO = "https://api.focusnfe.com.br"

interface FocusNFeResponse {
  status?: string
  status_sefaz?: string
  mensagem_sefaz?: string
  chave_nfe?: string
  numero?: string
  serie?: string
  cnpj_emitente?: string
  ref?: string
  caminho_xml_nota_fiscal?: string
  caminho_danfe?: string
  url_notificacao?: string
  qrcode_url?: string
  erros?: Array<{ codigo: string; mensagem: string; campo?: string }>
}

function getBaseUrl(ambiente: 'homologacao' | 'producao'): string {
  return ambiente === 'producao' ? FOCUS_NFE_BASE_URL_PRODUCAO : FOCUS_NFE_BASE_URL_HOMOLOGACAO
}

function getAuthHeader(apiToken: string): string {
  return `Basic ${Buffer.from(`${apiToken}:`).toString('base64')}`
}

/**
 * Emitir NFC-e (Nota Fiscal de Consumidor Eletrônica)
 */
export async function emitirNFCe(
  config: FiscalConfig,
  request: EmitirNotaRequest,
  numero: number,
  serie: number
): Promise<FocusNFeResponse> {
  if (!config.api_token) {
    throw new Error("Token da API não configurado")
  }

  const baseUrl = getBaseUrl(config.ambiente)
  const ref = `nfce-${Date.now()}`
  
  // Montar payload conforme documentação Focus NFe
  const payload = {
    natureza_operacao: "Venda de mercadoria",
    forma_pagamento: "0", // À vista
    data_emissao: new Date().toISOString(),
    tipo_documento: "1", // Saída
    local_destino: "1", // Operação interna
    finalidade_emissao: "1", // Normal
    consumidor_final: "1", // Consumidor final
    presenca_comprador: "1", // Presencial
    
    // Itens
    items: request.itens.map((item, index) => ({
      numero_item: index + 1,
      codigo_produto: item.produto_id.toString(),
      descricao: item.nome,
      cfop: item.cfop || "5102",
      ncm: item.ncm || "21069090", // NCM genérico para alimentos
      unidade_comercial: "UN",
      quantidade_comercial: item.quantidade,
      valor_unitario_comercial: item.valor_unitario,
      valor_bruto: item.quantidade * item.valor_unitario,
      unidade_tributavel: "UN",
      quantidade_tributavel: item.quantidade,
      valor_unitario_tributavel: item.valor_unitario,
      origem: "0", // Nacional
      icms_situacao_tributaria: "102", // ICMS Simples Nacional
      icms_modalidade_base_calculo: "0",
      pis_situacao_tributaria: "49", // Outras operações
      cofins_situacao_tributaria: "49", // Outras operações
    })),
    
    // Formas de pagamento
    formas_pagamento: [{
      forma_pagamento: "01", // Dinheiro
      valor_pagamento: request.itens.reduce((acc, item) => acc + (item.quantidade * item.valor_unitario), 0) - (request.valor_desconto || 0)
    }],
    
    // Informações adicionais
    informacoes_adicionais_contribuinte: request.informacoes_adicionais || "",
  }

  // Adicionar dados do destinatário se fornecidos
  if (request.destinatario?.cpf_cnpj) {
    Object.assign(payload, {
      cpf_destinatario: request.destinatario.cpf_cnpj.replace(/\D/g, '').length === 11 
        ? request.destinatario.cpf_cnpj.replace(/\D/g, '') 
        : undefined,
      cnpj_destinatario: request.destinatario.cpf_cnpj.replace(/\D/g, '').length === 14 
        ? request.destinatario.cpf_cnpj.replace(/\D/g, '') 
        : undefined,
      nome_destinatario: request.destinatario.nome,
    })
  }

  try {
    const response = await fetch(`${baseUrl}/v2/nfce?ref=${ref}`, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeader(config.api_token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()
    
    return {
      ...data,
      ref,
    }
  } catch (error) {
    console.error("Erro ao emitir NFC-e:", error)
    throw error
  }
}

/**
 * Emitir NF-e (Nota Fiscal Eletrônica)
 */
export async function emitirNFe(
  config: FiscalConfig,
  request: EmitirNotaRequest,
  numero: number,
  serie: number
): Promise<FocusNFeResponse> {
  if (!config.api_token) {
    throw new Error("Token da API não configurado")
  }

  const baseUrl = getBaseUrl(config.ambiente)
  const ref = `nfe-${Date.now()}`
  
  // Validar destinatário para NF-e
  if (!request.destinatario?.cpf_cnpj) {
    throw new Error("CPF/CNPJ do destinatário é obrigatório para NF-e")
  }

  const payload = {
    natureza_operacao: "Venda de mercadoria",
    forma_pagamento: "0",
    data_emissao: new Date().toISOString(),
    tipo_documento: "1",
    local_destino: "1",
    finalidade_emissao: "1",
    consumidor_final: "1",
    presenca_comprador: "1",
    
    // Destinatário
    cpf_destinatario: request.destinatario.cpf_cnpj.replace(/\D/g, '').length === 11 
      ? request.destinatario.cpf_cnpj.replace(/\D/g, '') 
      : undefined,
    cnpj_destinatario: request.destinatario.cpf_cnpj.replace(/\D/g, '').length === 14 
      ? request.destinatario.cpf_cnpj.replace(/\D/g, '') 
      : undefined,
    nome_destinatario: request.destinatario.nome,
    email_destinatario: request.destinatario.email,
    telefone_destinatario: request.destinatario.telefone?.replace(/\D/g, ''),
    
    // Endereço do destinatário
    logradouro_destinatario: request.destinatario.endereco?.logradouro,
    numero_destinatario: request.destinatario.endereco?.numero,
    complemento_destinatario: request.destinatario.endereco?.complemento,
    bairro_destinatario: request.destinatario.endereco?.bairro,
    municipio_destinatario: request.destinatario.endereco?.cidade,
    uf_destinatario: request.destinatario.endereco?.uf,
    cep_destinatario: request.destinatario.endereco?.cep?.replace(/\D/g, ''),
    
    // Itens
    items: request.itens.map((item, index) => ({
      numero_item: index + 1,
      codigo_produto: item.produto_id.toString(),
      descricao: item.nome,
      cfop: item.cfop || "5102",
      ncm: item.ncm || "21069090",
      unidade_comercial: "UN",
      quantidade_comercial: item.quantidade,
      valor_unitario_comercial: item.valor_unitario,
      valor_bruto: item.quantidade * item.valor_unitario,
      unidade_tributavel: "UN",
      quantidade_tributavel: item.quantidade,
      valor_unitario_tributavel: item.valor_unitario,
      origem: "0",
      icms_situacao_tributaria: "102",
      pis_situacao_tributaria: "49",
      cofins_situacao_tributaria: "49",
    })),
    
    formas_pagamento: [{
      forma_pagamento: "01",
      valor_pagamento: request.itens.reduce((acc, item) => acc + (item.quantidade * item.valor_unitario), 0) - (request.valor_desconto || 0)
    }],
    
    informacoes_adicionais_contribuinte: request.informacoes_adicionais || "",
  }

  try {
    const response = await fetch(`${baseUrl}/v2/nfe?ref=${ref}`, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeader(config.api_token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()
    
    return {
      ...data,
      ref,
    }
  } catch (error) {
    console.error("Erro ao emitir NF-e:", error)
    throw error
  }
}

/**
 * Consultar status de uma nota
 */
export async function consultarNota(
  config: FiscalConfig,
  ref: string,
  tipo: 'nfe' | 'nfce'
): Promise<FocusNFeResponse> {
  if (!config.api_token) {
    throw new Error("Token da API não configurado")
  }

  const baseUrl = getBaseUrl(config.ambiente)
  const endpoint = tipo === 'nfe' ? 'nfe' : 'nfce'

  try {
    const response = await fetch(`${baseUrl}/v2/${endpoint}/${ref}`, {
      method: 'GET',
      headers: {
        'Authorization': getAuthHeader(config.api_token),
      },
    })

    return await response.json()
  } catch (error) {
    console.error("Erro ao consultar nota:", error)
    throw error
  }
}

/**
 * Cancelar nota fiscal
 */
export async function cancelarNota(
  config: FiscalConfig,
  ref: string,
  tipo: 'nfe' | 'nfce',
  justificativa: string
): Promise<FocusNFeResponse> {
  if (!config.api_token) {
    throw new Error("Token da API não configurado")
  }

  if (justificativa.length < 15) {
    throw new Error("A justificativa deve ter pelo menos 15 caracteres")
  }

  const baseUrl = getBaseUrl(config.ambiente)
  const endpoint = tipo === 'nfe' ? 'nfe' : 'nfce'

  try {
    const response = await fetch(`${baseUrl}/v2/${endpoint}/${ref}`, {
      method: 'DELETE',
      headers: {
        'Authorization': getAuthHeader(config.api_token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ justificativa }),
    })

    return await response.json()
  } catch (error) {
    console.error("Erro ao cancelar nota:", error)
    throw error
  }
}

/**
 * Baixar XML da nota
 */
export async function baixarXML(
  config: FiscalConfig,
  ref: string,
  tipo: 'nfe' | 'nfce'
): Promise<string> {
  if (!config.api_token) {
    throw new Error("Token da API não configurado")
  }

  const baseUrl = getBaseUrl(config.ambiente)
  const endpoint = tipo === 'nfe' ? 'nfe' : 'nfce'

  try {
    const response = await fetch(`${baseUrl}/v2/${endpoint}/${ref}.xml`, {
      method: 'GET',
      headers: {
        'Authorization': getAuthHeader(config.api_token),
      },
    })

    return await response.text()
  } catch (error) {
    console.error("Erro ao baixar XML:", error)
    throw error
  }
}

/**
 * Reenviar email da nota
 */
export async function reenviarEmail(
  config: FiscalConfig,
  ref: string,
  tipo: 'nfe' | 'nfce',
  emails: string[]
): Promise<FocusNFeResponse> {
  if (!config.api_token) {
    throw new Error("Token da API não configurado")
  }

  const baseUrl = getBaseUrl(config.ambiente)
  const endpoint = tipo === 'nfe' ? 'nfe' : 'nfce'

  try {
    const response = await fetch(`${baseUrl}/v2/${endpoint}/${ref}/email`, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeader(config.api_token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ emails }),
    })

    return await response.json()
  } catch (error) {
    console.error("Erro ao reenviar email:", error)
    throw error
  }
}
