"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Receipt, FileText, CheckCircle2, AlertCircle } from "lucide-react"
import type { EmitirNotaRequest, Invoice } from "@/lib/fiscal-types"

interface OrderItem {
  id: number
  name: string
  price: number
  quantity: number
  extras?: Array<{ name: string; price: number }>
}

interface EmitirNotaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // Pode receber dados de um pedido ou comanda
  orderId?: number
  tableTabId?: number
  items: OrderItem[]
  total: number
  customerName?: string
  customerPhone?: string
  onSuccess?: (invoice: Invoice) => void
}

export function EmitirNotaModal({
  open,
  onOpenChange,
  orderId,
  tableTabId,
  items,
  total,
  customerName,
  customerPhone,
  onSuccess,
}: EmitirNotaModalProps) {
  const [tipoNota, setTipoNota] = useState<"nfce" | "nfe">("nfce")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; invoice?: Invoice; error?: string } | null>(null)
  
  // Dados do destinatário (apenas para NF-e)
  const [destinatario, setDestinatario] = useState({
    nome: customerName || "",
    cpf_cnpj: "",
    email: "",
    telefone: customerPhone || "",
    logradouro: "",
    numero: "",
    bairro: "",
    cidade: "",
    uf: "",
    cep: "",
  })

  const resetState = () => {
    setResult(null)
    setTipoNota("nfce")
    setDestinatario({
      nome: customerName || "",
      cpf_cnpj: "",
      email: "",
      telefone: customerPhone || "",
      logradouro: "",
      numero: "",
      bairro: "",
      cidade: "",
      uf: "",
      cep: "",
    })
  }

  const handleClose = () => {
    resetState()
    onOpenChange(false)
  }

  const handleEmitir = async () => {
    setLoading(true)
    setResult(null)

    try {
      // Montar payload
      const payload: EmitirNotaRequest = {
        tipo: tipoNota,
        order_id: orderId,
        table_tab_id: tableTabId,
        itens: items.map(item => {
          // Calcular valor total do item incluindo extras
          let valorUnitario = item.price
          if (item.extras && item.extras.length > 0) {
            valorUnitario += item.extras.reduce((acc, extra) => acc + extra.price, 0)
          }
          
          return {
            produto_id: item.id,
            nome: item.extras && item.extras.length > 0 
              ? `${item.name} (${item.extras.map(e => e.name).join(", ")})`
              : item.name,
            quantidade: item.quantity,
            valor_unitario: valorUnitario,
          }
        }),
      }

      // Adicionar destinatário se for NF-e ou se tiver CPF preenchido
      if (tipoNota === "nfe" || destinatario.cpf_cnpj) {
        payload.destinatario = {
          nome: destinatario.nome || undefined,
          cpf_cnpj: destinatario.cpf_cnpj || undefined,
          email: destinatario.email || undefined,
          telefone: destinatario.telefone || undefined,
          endereco: tipoNota === "nfe" ? {
            logradouro: destinatario.logradouro || undefined,
            numero: destinatario.numero || undefined,
            bairro: destinatario.bairro || undefined,
            cidade: destinatario.cidade || undefined,
            uf: destinatario.uf || undefined,
            cep: destinatario.cep || undefined,
          } : undefined,
        }
      }

      const res = await fetch("/api/fiscal/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (data.id) {
        setResult({ success: true, invoice: data })
        if (onSuccess) {
          onSuccess(data)
        }
      } else {
        setResult({ success: false, error: data.error || "Erro ao emitir nota" })
      }
    } catch (error) {
      console.error("Erro ao emitir nota:", error)
      setResult({ success: false, error: "Erro de conexão. Tente novamente." })
    } finally {
      setLoading(false)
    }
  }

  function formatCPFCNPJ(value: string) {
    const digits = value.replace(/\D/g, "")
    if (digits.length <= 11) {
      // CPF
      return digits
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
        .slice(0, 14)
    } else {
      // CNPJ
      return digits
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2")
        .slice(0, 18)
    }
  }

  function formatCEP(value: string) {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{5})(\d)/, "$1-$2")
      .slice(0, 9)
  }

  // Calcular valor total dos itens
  const valorItens = items.reduce((acc, item) => {
    let valorUnitario = item.price
    if (item.extras && item.extras.length > 0) {
      valorUnitario += item.extras.reduce((sum, extra) => sum + extra.price, 0)
    }
    return acc + valorUnitario * item.quantity
  }, 0)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Emitir Nota Fiscal
          </DialogTitle>
          <DialogDescription>
            {orderId ? `Pedido #${orderId}` : tableTabId ? `Comanda #${tableTabId}` : "Emissão de nota fiscal"}
          </DialogDescription>
        </DialogHeader>

        {/* Resultado da emissão */}
        {result && (
          <div className={`p-4 rounded-lg ${result.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              )}
              <div>
                <p className={`font-medium ${result.success ? "text-green-800" : "text-red-800"}`}>
                  {result.success ? "Nota emitida com sucesso!" : "Erro ao emitir nota"}
                </p>
                {result.success && result.invoice && (
                  <div className="mt-2 text-sm text-green-700">
                    <p>Tipo: {result.invoice.tipo.toUpperCase()}</p>
                    <p>Número: {result.invoice.numero}/{result.invoice.serie}</p>
                    <p>Status: {result.invoice.status}</p>
                    {result.invoice.chave_acesso && (
                      <p className="font-mono text-xs mt-1 break-all">Chave: {result.invoice.chave_acesso}</p>
                    )}
                  </div>
                )}
                {!result.success && (
                  <p className="text-sm text-red-700 mt-1">{result.error}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {!result?.success && (
          <>
            {/* Tipo de nota */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Tipo de Nota Fiscal</Label>
              <RadioGroup value={tipoNota} onValueChange={(v: "nfce" | "nfe") => setTipoNota(v)} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nfce" id="nfce" />
                  <Label htmlFor="nfce" className="cursor-pointer">
                    <Badge variant="secondary" className="mr-2">NFC-e</Badge>
                    Consumidor Final
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nfe" id="nfe" />
                  <Label htmlFor="nfe" className="cursor-pointer">
                    <Badge variant="outline" className="mr-2">NF-e</Badge>
                    Nota Completa
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Itens da nota */}
            <div className="space-y-2">
              <Label className="text-base font-medium">Itens</Label>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-center">Qtd</TableHead>
                      <TableHead className="text-right">Valor Unit.</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, idx) => {
                      let valorUnitario = item.price
                      if (item.extras && item.extras.length > 0) {
                        valorUnitario += item.extras.reduce((acc, extra) => acc + extra.price, 0)
                      }
                      return (
                        <TableRow key={idx}>
                          <TableCell>
                            {item.name}
                            {item.extras && item.extras.length > 0 && (
                              <span className="text-xs text-muted-foreground block">
                                + {item.extras.map(e => e.name).join(", ")}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right">R$ {valorUnitario.toFixed(2)}</TableCell>
                          <TableCell className="text-right font-medium">R$ {(valorUnitario * item.quantity).toFixed(2)}</TableCell>
                        </TableRow>
                      )
                    })}
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-medium">Total:</TableCell>
                      <TableCell className="text-right font-bold text-lg">R$ {valorItens.toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Dados do destinatário */}
            <div className="space-y-4">
              <Label className="text-base font-medium">
                Dados do Destinatário
                {tipoNota === "nfce" && <span className="text-sm font-normal text-muted-foreground ml-2">(opcional para NFC-e)</span>}
              </Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dest_nome">Nome {tipoNota === "nfe" && "*"}</Label>
                  <Input
                    id="dest_nome"
                    value={destinatario.nome}
                    onChange={(e) => setDestinatario({ ...destinatario, nome: e.target.value })}
                    placeholder="Nome do cliente"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dest_cpf_cnpj">CPF/CNPJ {tipoNota === "nfe" && "*"}</Label>
                  <Input
                    id="dest_cpf_cnpj"
                    value={destinatario.cpf_cnpj}
                    onChange={(e) => setDestinatario({ ...destinatario, cpf_cnpj: formatCPFCNPJ(e.target.value) })}
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dest_email">E-mail</Label>
                  <Input
                    id="dest_email"
                    type="email"
                    value={destinatario.email}
                    onChange={(e) => setDestinatario({ ...destinatario, email: e.target.value })}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dest_telefone">Telefone</Label>
                  <Input
                    id="dest_telefone"
                    value={destinatario.telefone}
                    onChange={(e) => setDestinatario({ ...destinatario, telefone: e.target.value })}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              {/* Endereço completo apenas para NF-e */}
              {tipoNota === "nfe" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dest_cep">CEP *</Label>
                      <Input
                        id="dest_cep"
                        value={destinatario.cep}
                        onChange={(e) => setDestinatario({ ...destinatario, cep: formatCEP(e.target.value) })}
                        placeholder="00000-000"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="dest_logradouro">Logradouro *</Label>
                      <Input
                        id="dest_logradouro"
                        value={destinatario.logradouro}
                        onChange={(e) => setDestinatario({ ...destinatario, logradouro: e.target.value })}
                        placeholder="Rua, Avenida, etc."
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dest_numero">Número *</Label>
                      <Input
                        id="dest_numero"
                        value={destinatario.numero}
                        onChange={(e) => setDestinatario({ ...destinatario, numero: e.target.value })}
                        placeholder="Nº"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dest_bairro">Bairro *</Label>
                      <Input
                        id="dest_bairro"
                        value={destinatario.bairro}
                        onChange={(e) => setDestinatario({ ...destinatario, bairro: e.target.value })}
                        placeholder="Bairro"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dest_cidade">Cidade *</Label>
                      <Input
                        id="dest_cidade"
                        value={destinatario.cidade}
                        onChange={(e) => setDestinatario({ ...destinatario, cidade: e.target.value })}
                        placeholder="Cidade"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dest_uf">UF *</Label>
                      <Input
                        id="dest_uf"
                        value={destinatario.uf}
                        onChange={(e) => setDestinatario({ ...destinatario, uf: e.target.value.toUpperCase().slice(0, 2) })}
                        placeholder="UF"
                        maxLength={2}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}

        <DialogFooter>
          {result?.success ? (
            <Button onClick={handleClose}>Fechar</Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose} disabled={loading}>
                Cancelar
              </Button>
              <Button onClick={handleEmitir} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Emitindo...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Emitir {tipoNota.toUpperCase()}
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
