import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Configuração da API FocusNFe
const FOCUSNFE_BASE_URL = process.env.FOCUSNFE_AMBIENTE === "producao" 
  ? "https://api.focusnfe.com.br" 
  : "https://homologacao.focusnfe.com.br"

async function getFocusNFeAuth() {
  const token = process.env.FOCUSNFE_TOKEN
  if (!token) {
    throw new Error("FOCUSNFE_TOKEN não configurado")
  }
  return Buffer.from(`${token}:`).toString("base64")
}

async function getFiscalConfig() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("fiscal_config")
    .select("*")
    .single()

  if (error || !data) {
    throw new Error("Configuração fiscal não encontrada. Configure os dados da empresa primeiro.")
  }

  return data
}

async function getNextNFCeNumber() {
  const supabase = await createClient()
  const { data: config } = await supabase
    .from("fiscal_config")
    .select("proximo_numero_nfce, serie_nfce")
    .single()

  if (!config) {
    return { numero: 1, serie: 1 }
  }

  // Incrementa o próximo número
  await supabase
    .from("fiscal_config")
    .update({ proximo_numero_nfce: (config.proximo_numero_nfce || 1) + 1 })
    .eq("id", 1)

  return { 
    numero: config.proximo_numero_nfce || 1, 
    serie: config.serie_nfce || 1 
  }
}

// POST - Emitir NFC-e
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { order_id, table_tab_id, cpf_destinatario, nome_destinatario } = body

    const supabase = await createClient()
    const config = await getFiscalConfig()

    // Busca os dados do pedido ou comanda
    let orderData: any = null
    let items: any[] = []
    let total = 0
    let paymentMethod = "dinheiro"
    let customerName = ""
    let customerPhone = ""

    if (order_id) {
      const { data: order, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", order_id)
        .single()

      if (error || !order) {
        return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })
      }
      orderData = order
      items = order.items || []
      total = order.total
      paymentMethod = order.payment_method || "dinheiro"
      customerName = order.customer_name || ""
      customerPhone = order.customer_phone || ""
    } else if (table_tab_id) {
      const { data: tab, error } = await supabase
        .from("table_tabs")
        .select("*")
        .eq("id", table_tab_id)
        .single()

      if (error || !tab) {
        return NextResponse.json({ error: "Comanda não encontrada" }, { status: 404 })
      }
      orderData = tab
      items = tab.items || []
      total = tab.total
      paymentMethod = tab.payment_method || "dinheiro"
      customerName = tab.customer_name || ""
    }

    // Busca produtos para obter NCM, CFOP, etc.
    const productIds = items.map((item: any) => item.id)
    const { data: products } = await supabase
      .from("products")
      .select("id, name, ncm, cfop, unidade_comercial, cest, origem")
      .in("id", productIds)

    const productMap = new Map(products?.map(p => [p.id, p]) || [])

    // Gera referência única
    const ref = `nfce-${order_id || table_tab_id}-${Date.now()}`
    const { numero, serie } = await getNextNFCeNumber()

    // Monta os itens da NFC-e
    const nfceItems = items.map((item: any, index: number) => {
      const product = productMap.get(item.id) || {}
      const extrasTotal = item.extras?.reduce((sum: number, e: any) => sum + (e.price || 0), 0) || 0
      const valorUnitario = item.price + extrasTotal
      const valorTotal = valorUnitario * item.quantity

      return {
        numero_item: String(index + 1),
        codigo_produto: String(item.id),
        descricao: item.name + (item.extras?.length ? ` (${item.extras.map((e: any) => e.name).join(", ")})` : ""),
        cfop: product.cfop || "5102",
        unidade_comercial: product.unidade_comercial || "UN",
        quantidade_comercial: String(item.quantity),
        valor_unitario_comercial: valorUnitario.toFixed(2),
        valor_bruto: valorTotal.toFixed(2),
        unidade_tributavel: product.unidade_comercial || "UN",
        quantidade_tributavel: String(item.quantity),
        valor_unitario_tributavel: valorUnitario.toFixed(2),
        ncm: product.ncm || "21069090",
        cest: product.cest || undefined,
        origem: String(product.origem || 0),
        icms_situacao_tributaria: "102",
        icms_aliquota: "0",
        icms_base_calculo: "0",
        icms_modalidade_base_calculo: "0",
        pis_situacao_tributaria: "49",
        cofins_situacao_tributaria: "49",
      }
    })

    // Mapeia forma de pagamento
    const formasPagamentoMap: { [key: string]: string } = {
      dinheiro: "01",
      cartao_credito: "03",
      cartao_debito: "04",
      pix: "17",
      credito: "03",
      debito: "04",
    }

    const formaPagamento = formasPagamentoMap[paymentMethod.toLowerCase().replace(/\s/g, "_")] || "01"

    // Monta o payload da NFC-e
    const nfcePayload = {
      cnpj_emitente: config.cnpj?.replace(/\D/g, ""),
      data_emissao: new Date().toISOString(),
      natureza_operacao: "VENDA AO CONSUMIDOR",
      tipo_documento: "1",
      presenca_comprador: orderData.customer_address ? "4" : "1", // 4 = delivery, 1 = presencial
      local_destino: "1",
      modalidade_frete: "9", // Sem frete
      items: nfceItems,
      formas_pagamento: [
        {
          forma_pagamento: formaPagamento,
          valor_pagamento: total.toFixed(2),
        }
      ],
      valor_produtos: total.toFixed(2),
      valor_total: total.toFixed(2),
      ...(cpf_destinatario && { cpf_destinatario: cpf_destinatario.replace(/\D/g, "") }),
      ...(nome_destinatario && { nome_destinatario }),
    }

    // Envia para a API FocusNFe
    const auth = await getFocusNFeAuth()
    const response = await fetch(`${FOCUSNFE_BASE_URL}/v2/nfce?ref=${ref}&completa=1`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${auth}`,
      },
      body: JSON.stringify(nfcePayload),
    })

    const responseData = await response.json()

    // Salva a nota fiscal no banco
    const invoiceData = {
      order_id: order_id || null,
      table_tab_id: table_tab_id || null,
      tipo: "nfce",
      ref_api: ref,
      numero,
      serie,
      status: responseData.status || "processando",
      chave_acesso: responseData.chave_nfe || null,
      protocolo_autorizacao: responseData.protocolo || null,
      data_emissao: new Date().toISOString(),
      data_autorizacao: responseData.status === "autorizado" ? new Date().toISOString() : null,
      destinatario_nome: nome_destinatario || customerName || null,
      destinatario_cpf_cnpj: cpf_destinatario || null,
      destinatario_telefone: customerPhone || null,
      valor_produtos: total,
      valor_total: total,
      itens: items,
      danfe_url: responseData.caminho_danfe || null,
      qrcode_url: responseData.caminho_xml_nota_fiscal || null,
      xml_nota: responseData.requisicao_nota_fiscal || null,
      resposta_api: responseData,
      codigo_erro: responseData.codigo || null,
      mensagem_erro: responseData.mensagem || null,
    }

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert(invoiceData)
      .select()
      .single()

    if (invoiceError) {
      console.error("Erro ao salvar nota fiscal:", invoiceError)
    }

    return NextResponse.json({
      success: responseData.status === "autorizado",
      invoice,
      focusnfe_response: responseData,
    })
  } catch (error) {
    console.error("Erro ao emitir NFC-e:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao emitir NFC-e" },
      { status: 500 }
    )
  }
}

// GET - Consultar NFC-e
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ref = searchParams.get("ref")
    const invoice_id = searchParams.get("invoice_id")

    const supabase = await createClient()

    if (ref) {
      // Consulta na API FocusNFe
      const auth = await getFocusNFeAuth()
      const response = await fetch(`${FOCUSNFE_BASE_URL}/v2/nfce/${ref}?completa=1`, {
        headers: {
          "Authorization": `Basic ${auth}`,
        },
      })

      const responseData = await response.json()

      // Atualiza o status no banco
      if (responseData.status) {
        await supabase
          .from("invoices")
          .update({
            status: responseData.status,
            chave_acesso: responseData.chave_nfe || null,
            protocolo_autorizacao: responseData.protocolo || null,
            danfe_url: responseData.caminho_danfe || null,
            data_autorizacao: responseData.status === "autorizado" ? new Date().toISOString() : null,
            resposta_api: responseData,
          })
          .eq("ref_api", ref)
      }

      return NextResponse.json(responseData)
    }

    if (invoice_id) {
      const { data: invoice, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", invoice_id)
        .single()

      if (error) {
        return NextResponse.json({ error: "Nota fiscal não encontrada" }, { status: 404 })
      }

      return NextResponse.json(invoice)
    }

    // Lista todas as notas fiscais
    const { data: invoices, error } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(invoices)
  } catch (error) {
    console.error("Erro ao consultar NFC-e:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao consultar NFC-e" },
      { status: 500 }
    )
  }
}

// DELETE - Cancelar NFC-e
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ref = searchParams.get("ref")
    const justificativa = searchParams.get("justificativa")

    if (!ref) {
      return NextResponse.json({ error: "Referência da nota é obrigatória" }, { status: 400 })
    }

    if (!justificativa || justificativa.length < 15) {
      return NextResponse.json(
        { error: "Justificativa deve ter no mínimo 15 caracteres" },
        { status: 400 }
      )
    }

    const auth = await getFocusNFeAuth()
    const response = await fetch(`${FOCUSNFE_BASE_URL}/v2/nfce/${ref}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${auth}`,
      },
      body: JSON.stringify({ justificativa }),
    })

    const responseData = await response.json()

    // Atualiza o status no banco
    const supabase = await createClient()
    await supabase
      .from("invoices")
      .update({
        status: "cancelado",
        resposta_api: responseData,
      })
      .eq("ref_api", ref)

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Erro ao cancelar NFC-e:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao cancelar NFC-e" },
      { status: 500 }
    )
  }
}
