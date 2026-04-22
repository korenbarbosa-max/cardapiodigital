import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET - Buscar configuração fiscal
export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("fiscal_config")
      .select("*")
      .single()

    if (error && error.code !== "PGRST116") {
      throw error
    }

    return NextResponse.json(data || null)
  } catch (error) {
    console.error("Erro ao buscar configuração fiscal:", error)
    return NextResponse.json(
      { error: "Erro ao buscar configuração fiscal" },
      { status: 500 }
    )
  }
}

// POST - Criar ou atualizar configuração fiscal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = await createClient()

    // Verifica se já existe configuração
    const { data: existing } = await supabase
      .from("fiscal_config")
      .select("id")
      .single()

    const configData = {
      cnpj: body.cnpj,
      razao_social: body.razao_social,
      nome_fantasia: body.nome_fantasia,
      inscricao_estadual: body.inscricao_estadual,
      inscricao_municipal: body.inscricao_municipal,
      regime_tributario: body.regime_tributario,
      cep: body.cep,
      logradouro: body.logradouro,
      numero: body.numero,
      complemento: body.complemento,
      bairro: body.bairro,
      cidade: body.cidade,
      uf: body.uf,
      codigo_ibge: body.codigo_ibge,
      serie_nfce: body.serie_nfce || 1,
      proximo_numero_nfce: body.proximo_numero_nfce || 1,
      serie_nfe: body.serie_nfe || 1,
      proximo_numero_nfe: body.proximo_numero_nfe || 1,
      ambiente: body.ambiente || "homologacao",
      api_provider: body.api_provider || "focusnfe",
      api_token: body.api_token,
      csc_id: body.csc_id,
      csc_token: body.csc_token,
      updated_at: new Date().toISOString(),
    }

    let result
    if (existing) {
      // Atualiza
      const { data, error } = await supabase
        .from("fiscal_config")
        .update(configData)
        .eq("id", existing.id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Cria
      const { data, error } = await supabase
        .from("fiscal_config")
        .insert(configData)
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Erro ao salvar configuração fiscal:", error)
    return NextResponse.json(
      { error: "Erro ao salvar configuração fiscal" },
      { status: 500 }
    )
  }
}
