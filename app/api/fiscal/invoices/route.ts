import { type NextRequest, NextResponse } from "next/server"
import { getInvoices, getInvoiceById, createInvoice, updateInvoice, getNextInvoiceNumber, incrementInvoiceNumber, getFiscalConfig } from "@/lib/fiscal-database"
import { emitirNFe, emitirNFCe, consultarNota, cancelarNota } from "@/lib/focus-nfe-service"
import type { EmitirNotaRequest, Invoice } from "@/lib/fiscal-types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    
    if (id) {
      const invoice = await getInvoiceById(Number(id))
      return NextResponse.json(invoice)
    }
    
    const filters = {
      tipo: searchParams.get("tipo") as 'nfe' | 'nfce' | undefined,
      status: searchParams.get("status") || undefined,
      data_inicio: searchParams.get("data_inicio") || undefined,
      data_fim: searchParams.get("data_fim") || undefined,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
    }
    
    const invoices = await getInvoices(filters)
    return NextResponse.json(invoices)
  } catch (error) {
    console.error("Error fetching invoices:", error)
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: EmitirNotaRequest = await request.json()
    
    // Obter configuração fiscal
    const config = await getFiscalConfig()
    if (!config) {
      return NextResponse.json({ 
        error: "Configuração fiscal não encontrada. Configure os dados da empresa primeiro." 
      }, { status: 400 })
    }
    
    // Validar se tem token da API
    if (!config.api_token) {
      return NextResponse.json({ 
        error: "Token da API não configurado. Configure as credenciais da API fiscal." 
      }, { status: 400 })
    }
    
    // Obter próximo número
    const { numero, serie } = await getNextInvoiceNumber(body.tipo)
    
    // Calcular valores
    const valor_produtos = body.itens.reduce((acc, item) => acc + (item.quantidade * item.valor_unitario), 0)
    const valor_total = valor_produtos - (body.valor_desconto || 0) + (body.valor_frete || 0)
    
    // Criar registro da nota como pendente
    const invoice = await createInvoice({
      order_id: body.order_id || null,
      table_tab_id: body.table_tab_id || null,
      tipo: body.tipo,
      numero,
      serie,
      destinatario_nome: body.destinatario?.nome,
      destinatario_cpf_cnpj: body.destinatario?.cpf_cnpj,
      destinatario_email: body.destinatario?.email,
      destinatario_telefone: body.destinatario?.telefone,
      destinatario_endereco: body.destinatario?.endereco,
      valor_produtos,
      valor_desconto: body.valor_desconto || 0,
      valor_frete: body.valor_frete || 0,
      valor_total,
      itens: body.itens.map(item => ({
        produto_id: item.produto_id,
        nome: item.nome,
        ncm: item.ncm,
        cfop: item.cfop,
        quantidade: item.quantidade,
        valor_unitario: item.valor_unitario,
        valor_total: item.quantidade * item.valor_unitario,
        unidade: 'UN',
      })),
      status: 'processando',
      data_emissao: new Date().toISOString(),
    })
    
    try {
      // Emitir nota na API
      const response = body.tipo === 'nfce' 
        ? await emitirNFCe(config, body, numero, serie)
        : await emitirNFe(config, body, numero, serie)
      
      // Atualizar nota com resposta da API
      const updatedInvoice = await updateInvoice(invoice.id!, {
        ref_api: response.ref,
        resposta_api: response,
        status: response.status_sefaz === '100' ? 'autorizada' : 
                response.erros ? 'rejeitada' : 'processando',
        chave_acesso: response.chave_nfe,
        protocolo_autorizacao: response.status_sefaz,
        data_autorizacao: response.status_sefaz === '100' ? new Date().toISOString() : undefined,
        danfe_url: response.caminho_danfe,
        qrcode_url: response.qrcode_url,
        mensagem_erro: response.erros ? response.erros.map(e => e.mensagem).join('; ') : undefined,
      })
      
      // Incrementar número se autorizada
      if (response.status_sefaz === '100') {
        await incrementInvoiceNumber(body.tipo)
      }
      
      return NextResponse.json(updatedInvoice)
    } catch (apiError) {
      // Atualizar nota com erro
      await updateInvoice(invoice.id!, {
        status: 'erro',
        mensagem_erro: String(apiError),
      })
      
      return NextResponse.json({ 
        error: "Erro ao emitir nota na SEFAZ", 
        details: String(apiError),
        invoice_id: invoice.id
      }, { status: 500 })
    }
  } catch (error) {
    console.error("Error creating invoice:", error)
    return NextResponse.json({ error: "Failed to create invoice", details: String(error) }, { status: 500 })
  }
}
