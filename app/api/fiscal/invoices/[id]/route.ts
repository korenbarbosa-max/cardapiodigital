import { type NextRequest, NextResponse } from "next/server"
import { getInvoiceById, updateInvoice, getFiscalConfig } from "@/lib/fiscal-database"
import { consultarNota, cancelarNota, baixarXML, reenviarEmail } from "@/lib/focus-nfe-service"

// GET - Consultar status atualizado de uma nota
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const invoice = await getInvoiceById(Number(id))
    
    if (!invoice) {
      return NextResponse.json({ error: "Nota não encontrada" }, { status: 404 })
    }
    
    // Se tem ref_api, consultar status atualizado
    if (invoice.ref_api && invoice.status === 'processando') {
      const config = await getFiscalConfig()
      if (config?.api_token) {
        try {
          const response = await consultarNota(config, invoice.ref_api, invoice.tipo)
          
          // Atualizar se houver mudança
          if (response.status_sefaz === '100' && invoice.status !== 'autorizada') {
            const updated = await updateInvoice(invoice.id!, {
              status: 'autorizada',
              chave_acesso: response.chave_nfe,
              protocolo_autorizacao: response.status_sefaz,
              data_autorizacao: new Date().toISOString(),
              danfe_url: response.caminho_danfe,
              resposta_api: response,
            })
            return NextResponse.json(updated)
          }
        } catch (err) {
          console.error("Erro ao consultar nota na API:", err)
        }
      }
    }
    
    return NextResponse.json(invoice)
  } catch (error) {
    console.error("Error fetching invoice:", error)
    return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 })
  }
}

// DELETE - Cancelar nota
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { justificativa } = await request.json()
    
    if (!justificativa || justificativa.length < 15) {
      return NextResponse.json({ 
        error: "Justificativa é obrigatória e deve ter pelo menos 15 caracteres" 
      }, { status: 400 })
    }
    
    const invoice = await getInvoiceById(Number(id))
    
    if (!invoice) {
      return NextResponse.json({ error: "Nota não encontrada" }, { status: 404 })
    }
    
    if (invoice.status !== 'autorizada') {
      return NextResponse.json({ 
        error: "Apenas notas autorizadas podem ser canceladas" 
      }, { status: 400 })
    }
    
    if (!invoice.ref_api) {
      return NextResponse.json({ 
        error: "Nota não possui referência da API" 
      }, { status: 400 })
    }
    
    const config = await getFiscalConfig()
    if (!config?.api_token) {
      return NextResponse.json({ 
        error: "Configuração fiscal não encontrada" 
      }, { status: 400 })
    }
    
    // Cancelar na API
    const response = await cancelarNota(config, invoice.ref_api, invoice.tipo, justificativa)
    
    // Atualizar nota
    const updated = await updateInvoice(invoice.id!, {
      status: 'cancelada',
      resposta_api: { ...invoice.resposta_api, cancelamento: response },
    })
    
    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error canceling invoice:", error)
    return NextResponse.json({ error: "Failed to cancel invoice", details: String(error) }, { status: 500 })
  }
}

// PATCH - Ações adicionais (reenviar email, baixar XML)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { action, emails } = await request.json()
    
    const invoice = await getInvoiceById(Number(id))
    
    if (!invoice) {
      return NextResponse.json({ error: "Nota não encontrada" }, { status: 404 })
    }
    
    if (!invoice.ref_api) {
      return NextResponse.json({ 
        error: "Nota não possui referência da API" 
      }, { status: 400 })
    }
    
    const config = await getFiscalConfig()
    if (!config?.api_token) {
      return NextResponse.json({ 
        error: "Configuração fiscal não encontrada" 
      }, { status: 400 })
    }
    
    switch (action) {
      case 'download_xml': {
        const xml = await baixarXML(config, invoice.ref_api, invoice.tipo)
        return new NextResponse(xml, {
          headers: {
            'Content-Type': 'application/xml',
            'Content-Disposition': `attachment; filename="nota-${invoice.chave_acesso || invoice.id}.xml"`,
          },
        })
      }
      
      case 'resend_email': {
        if (!emails || !Array.isArray(emails) || emails.length === 0) {
          return NextResponse.json({ error: "Emails não informados" }, { status: 400 })
        }
        const response = await reenviarEmail(config, invoice.ref_api, invoice.tipo, emails)
        return NextResponse.json(response)
      }
      
      case 'refresh_status': {
        const response = await consultarNota(config, invoice.ref_api, invoice.tipo)
        
        const updated = await updateInvoice(invoice.id!, {
          status: response.status_sefaz === '100' ? 'autorizada' : 
                  response.erros ? 'rejeitada' : invoice.status,
          chave_acesso: response.chave_nfe || invoice.chave_acesso,
          protocolo_autorizacao: response.status_sefaz || invoice.protocolo_autorizacao,
          danfe_url: response.caminho_danfe || invoice.danfe_url,
          resposta_api: response,
        })
        
        return NextResponse.json(updated)
      }
      
      default:
        return NextResponse.json({ error: "Ação não reconhecida" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error processing invoice action:", error)
    return NextResponse.json({ error: "Failed to process action", details: String(error) }, { status: 500 })
  }
}
