"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  FileText,
  Settings,
  Receipt,
  Download,
  Eye,
  XCircle,
  RefreshCw,
  Building2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Ban,
  Send,
  Loader2,
  Info,
  ExternalLink,
} from "lucide-react"
import { 
  type FiscalConfig, 
  type Invoice, 
  INVOICE_STATUS, 
  REGIMES_TRIBUTARIOS, 
  UFS_BRASIL 
} from "@/lib/fiscal-types"

interface FiscalTabProps {
  onEmitirNota?: (orderId?: number, tableTabId?: number) => void
}

export function FiscalTab({ onEmitirNota }: FiscalTabProps) {
  const [activeSubTab, setActiveSubTab] = useState("notas")
  const [config, setConfig] = useState<FiscalConfig | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [stats, setStats] = useState({
    total_notas: 0,
    nfe_emitidas: 0,
    nfce_emitidas: 0,
    valor_total: 0,
    notas_canceladas: 0,
    notas_rejeitadas: 0,
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelJustificativa, setCancelJustificativa] = useState("")
  const [filterTipo, setFilterTipo] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  // Form state para configuração
  const [formConfig, setFormConfig] = useState<Partial<FiscalConfig>>({
    razao_social: "",
    nome_fantasia: "",
    cnpj: "",
    inscricao_estadual: "",
    inscricao_municipal: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    codigo_ibge: "",
    regime_tributario: "simples_nacional",
    ambiente: "homologacao",
    serie_nfe: 1,
    serie_nfce: 1,
    proximo_numero_nfe: 1,
    proximo_numero_nfce: 1,
    api_provider: "focus_nfe",
    api_token: "",
    csc_id: "",
    csc_token: "",
  })

  // Carregar dados iniciais
  useEffect(() => {
    loadConfig()
    loadInvoices()
    loadStats()
  }, [])

  // Recarregar notas quando filtros mudam
  useEffect(() => {
    loadInvoices()
  }, [filterTipo, filterStatus])

  async function loadConfig() {
    try {
      const res = await fetch("/api/fiscal/config")
      const data = await res.json()
      if (data && data.id) {
        setConfig(data)
        setFormConfig(data)
      }
    } catch (error) {
      console.error("Erro ao carregar config:", error)
    }
  }

  async function loadInvoices() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterTipo !== "all") params.set("tipo", filterTipo)
      if (filterStatus !== "all") params.set("status", filterStatus)
      params.set("limit", "50")
      
      const res = await fetch(`/api/fiscal/invoices?${params}`)
      const data = await res.json()
      setInvoices(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Erro ao carregar notas:", error)
    } finally {
      setLoading(false)
    }
  }

  async function loadStats() {
    try {
      const res = await fetch("/api/fiscal/stats")
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error("Erro ao carregar stats:", error)
    }
  }

  async function handleSaveConfig() {
    setSaving(true)
    try {
      const res = await fetch("/api/fiscal/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formConfig),
      })
      const data = await res.json()
      if (data.id) {
        setConfig(data)
        alert("Configuração salva com sucesso!")
      } else {
        alert("Erro ao salvar: " + (data.error || "Erro desconhecido"))
      }
    } catch (error) {
      console.error("Erro ao salvar config:", error)
      alert("Erro ao salvar configuração")
    } finally {
      setSaving(false)
    }
  }

  async function handleCancelInvoice() {
    if (!selectedInvoice || cancelJustificativa.length < 15) return
    
    try {
      const res = await fetch(`/api/fiscal/invoices/${selectedInvoice.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ justificativa: cancelJustificativa }),
      })
      const data = await res.json()
      if (data.status === "cancelada") {
        loadInvoices()
        loadStats()
        setCancelDialogOpen(false)
        setCancelJustificativa("")
        setSelectedInvoice(null)
        alert("Nota cancelada com sucesso!")
      } else {
        alert("Erro ao cancelar: " + (data.error || "Erro desconhecido"))
      }
    } catch (error) {
      console.error("Erro ao cancelar nota:", error)
      alert("Erro ao cancelar nota")
    }
  }

  async function handleRefreshStatus(invoice: Invoice) {
    try {
      const res = await fetch(`/api/fiscal/invoices/${invoice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "refresh_status" }),
      })
      const data = await res.json()
      if (data.id) {
        loadInvoices()
        loadStats()
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
    }
  }

  async function handleDownloadXML(invoice: Invoice) {
    try {
      const res = await fetch(`/api/fiscal/invoices/${invoice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "download_xml" }),
      })
      
      if (res.headers.get("content-type")?.includes("xml")) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `nota-${invoice.chave_acesso || invoice.id}.xml`
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        const data = await res.json()
        alert("Erro ao baixar XML: " + (data.error || "Erro desconhecido"))
      }
    } catch (error) {
      console.error("Erro ao baixar XML:", error)
      alert("Erro ao baixar XML")
    }
  }

  function formatCNPJ(value: string) {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .slice(0, 18)
  }

  function formatCEP(value: string) {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{5})(\d)/, "$1-$2")
      .slice(0, 9)
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "autorizada":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case "processando":
        return <Clock className="w-4 h-4 text-blue-600" />
      case "pendente":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "rejeitada":
      case "erro":
        return <AlertCircle className="w-4 h-4 text-red-600" />
      case "cancelada":
        return <Ban className="w-4 h-4 text-gray-600" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_notas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">NF-e Emitidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.nfe_emitidas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">NFC-e Emitidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.nfce_emitidas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.valor_total.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Canceladas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.notas_canceladas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejeitadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.notas_rejeitadas}</div>
          </CardContent>
        </Card>
      </div>

      {/* Sub-tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList>
          <TabsTrigger value="notas" className="gap-2">
            <Receipt className="w-4 h-4" />
            Notas Fiscais
          </TabsTrigger>
          <TabsTrigger value="config" className="gap-2">
            <Settings className="w-4 h-4" />
            Configurações
          </TabsTrigger>
          <TabsTrigger value="ajuda" className="gap-2">
            <Info className="w-4 h-4" />
            Ajuda
          </TabsTrigger>
        </TabsList>

        {/* Lista de Notas */}
        <TabsContent value="notas" className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Label>Tipo:</Label>
              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="nfe">NF-e</SelectItem>
                  <SelectItem value="nfce">NFC-e</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label>Status:</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="autorizada">Autorizada</SelectItem>
                  <SelectItem value="processando">Processando</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="rejeitada">Rejeitada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" onClick={loadInvoices}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>

          {/* Tabela de notas */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Número</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Destinatário</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {loading ? "Carregando..." : "Nenhuma nota fiscal encontrada"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <Badge variant={invoice.tipo === "nfe" ? "default" : "secondary"}>
                            {invoice.tipo.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono">
                          {invoice.numero}/{invoice.serie}
                        </TableCell>
                        <TableCell>
                          {invoice.data_emissao
                            ? new Date(invoice.data_emissao).toLocaleDateString("pt-BR")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {invoice.destinatario_nome || invoice.destinatario_cpf_cnpj || "Consumidor"}
                        </TableCell>
                        <TableCell>R$ {invoice.valor_total.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(invoice.status)}
                            <Badge className={INVOICE_STATUS[invoice.status as keyof typeof INVOICE_STATUS]?.color || ""}>
                              {INVOICE_STATUS[invoice.status as keyof typeof INVOICE_STATUS]?.label || invoice.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {/* Ver detalhes */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => setSelectedInvoice(invoice)}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>
                                    {invoice.tipo.toUpperCase()} #{invoice.numero}/{invoice.serie}
                                  </DialogTitle>
                                  <DialogDescription>
                                    Detalhes da nota fiscal
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-muted-foreground">Chave de Acesso</Label>
                                      <p className="font-mono text-xs break-all">{invoice.chave_acesso || "-"}</p>
                                    </div>
                                    <div>
                                      <Label className="text-muted-foreground">Protocolo</Label>
                                      <p>{invoice.protocolo_autorizacao || "-"}</p>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-muted-foreground">Destinatário</Label>
                                      <p>{invoice.destinatario_nome || "Consumidor Final"}</p>
                                      <p className="text-sm text-muted-foreground">{invoice.destinatario_cpf_cnpj || "-"}</p>
                                    </div>
                                    <div>
                                      <Label className="text-muted-foreground">Valor Total</Label>
                                      <p className="text-xl font-bold">R$ {invoice.valor_total.toFixed(2)}</p>
                                    </div>
                                  </div>
                                  {invoice.mensagem_erro && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                      <Label className="text-red-600">Erro</Label>
                                      <p className="text-sm text-red-700">{invoice.mensagem_erro}</p>
                                    </div>
                                  )}
                                  <div>
                                    <Label className="text-muted-foreground">Itens</Label>
                                    <div className="mt-2 border rounded-lg overflow-hidden">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Produto</TableHead>
                                            <TableHead className="text-right">Qtd</TableHead>
                                            <TableHead className="text-right">Valor</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {(invoice.itens || []).map((item: any, idx: number) => (
                                            <TableRow key={idx}>
                                              <TableCell>{item.nome}</TableCell>
                                              <TableCell className="text-right">{item.quantidade}</TableCell>
                                              <TableCell className="text-right">
                                                R$ {(item.valor_total || item.quantidade * item.valor_unitario).toFixed(2)}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            {/* Download XML */}
                            {invoice.status === "autorizada" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDownloadXML(invoice)}
                                title="Baixar XML"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            )}

                            {/* Link DANFE */}
                            {invoice.danfe_url && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => window.open(invoice.danfe_url, "_blank")}
                                title="Ver DANFE"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            )}

                            {/* Atualizar status */}
                            {invoice.status === "processando" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRefreshStatus(invoice)}
                                title="Atualizar Status"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </Button>
                            )}

                            {/* Cancelar */}
                            {invoice.status === "autorizada" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => {
                                  setSelectedInvoice(invoice)
                                  setCancelDialogOpen(true)
                                }}
                                title="Cancelar Nota"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações */}
        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Dados da Empresa
              </CardTitle>
              <CardDescription>
                Informações do emitente para emissão de notas fiscais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="razao_social">Razão Social *</Label>
                  <Input
                    id="razao_social"
                    value={formConfig.razao_social || ""}
                    onChange={(e) => setFormConfig({ ...formConfig, razao_social: e.target.value })}
                    placeholder="Razão Social da Empresa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
                  <Input
                    id="nome_fantasia"
                    value={formConfig.nome_fantasia || ""}
                    onChange={(e) => setFormConfig({ ...formConfig, nome_fantasia: e.target.value })}
                    placeholder="Nome Fantasia"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ *</Label>
                  <Input
                    id="cnpj"
                    value={formConfig.cnpj || ""}
                    onChange={(e) => setFormConfig({ ...formConfig, cnpj: formatCNPJ(e.target.value) })}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inscricao_estadual">Inscrição Estadual</Label>
                  <Input
                    id="inscricao_estadual"
                    value={formConfig.inscricao_estadual || ""}
                    onChange={(e) => setFormConfig({ ...formConfig, inscricao_estadual: e.target.value })}
                    placeholder="Inscrição Estadual"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inscricao_municipal">Inscrição Municipal</Label>
                  <Input
                    id="inscricao_municipal"
                    value={formConfig.inscricao_municipal || ""}
                    onChange={(e) => setFormConfig({ ...formConfig, inscricao_municipal: e.target.value })}
                    placeholder="Inscrição Municipal"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Endereço</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={formConfig.cep || ""}
                    onChange={(e) => setFormConfig({ ...formConfig, cep: formatCEP(e.target.value) })}
                    placeholder="00000-000"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="logradouro">Logradouro</Label>
                  <Input
                    id="logradouro"
                    value={formConfig.logradouro || ""}
                    onChange={(e) => setFormConfig({ ...formConfig, logradouro: e.target.value })}
                    placeholder="Rua, Avenida, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    value={formConfig.numero || ""}
                    onChange={(e) => setFormConfig({ ...formConfig, numero: e.target.value })}
                    placeholder="Nº"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input
                    id="complemento"
                    value={formConfig.complemento || ""}
                    onChange={(e) => setFormConfig({ ...formConfig, complemento: e.target.value })}
                    placeholder="Apto, Sala, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    value={formConfig.bairro || ""}
                    onChange={(e) => setFormConfig({ ...formConfig, bairro: e.target.value })}
                    placeholder="Bairro"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formConfig.cidade || ""}
                    onChange={(e) => setFormConfig({ ...formConfig, cidade: e.target.value })}
                    placeholder="Cidade"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="uf">UF</Label>
                  <Select
                    value={formConfig.uf || ""}
                    onValueChange={(value) => setFormConfig({ ...formConfig, uf: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                      {UFS_BRASIL.map((uf) => (
                        <SelectItem key={uf} value={uf}>
                          {uf}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codigo_ibge">Código IBGE</Label>
                  <Input
                    id="codigo_ibge"
                    value={formConfig.codigo_ibge || ""}
                    onChange={(e) => setFormConfig({ ...formConfig, codigo_ibge: e.target.value })}
                    placeholder="Código IBGE do município"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configurações Fiscais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="regime_tributario">Regime Tributário</Label>
                  <Select
                    value={formConfig.regime_tributario || "simples_nacional"}
                    onValueChange={(value: any) => setFormConfig({ ...formConfig, regime_tributario: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIMES_TRIBUTARIOS.map((regime) => (
                        <SelectItem key={regime.value} value={regime.value}>
                          {regime.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ambiente">Ambiente</Label>
                  <Select
                    value={formConfig.ambiente || "homologacao"}
                    onValueChange={(value: any) => setFormConfig({ ...formConfig, ambiente: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="homologacao">Homologação (Testes)</SelectItem>
                      <SelectItem value="producao">Produção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serie_nfe">Série NF-e</Label>
                  <Input
                    id="serie_nfe"
                    type="number"
                    min="1"
                    value={formConfig.serie_nfe || 1}
                    onChange={(e) => setFormConfig({ ...formConfig, serie_nfe: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proximo_numero_nfe">Próx. Número NF-e</Label>
                  <Input
                    id="proximo_numero_nfe"
                    type="number"
                    min="1"
                    value={formConfig.proximo_numero_nfe || 1}
                    onChange={(e) => setFormConfig({ ...formConfig, proximo_numero_nfe: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serie_nfce">Série NFC-e</Label>
                  <Input
                    id="serie_nfce"
                    type="number"
                    min="1"
                    value={formConfig.serie_nfce || 1}
                    onChange={(e) => setFormConfig({ ...formConfig, serie_nfce: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proximo_numero_nfce">Próx. Número NFC-e</Label>
                  <Input
                    id="proximo_numero_nfce"
                    type="number"
                    min="1"
                    value={formConfig.proximo_numero_nfce || 1}
                    onChange={(e) => setFormConfig({ ...formConfig, proximo_numero_nfce: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Credenciais da API</CardTitle>
              <CardDescription>
                Configure as credenciais da API de emissão de notas fiscais (Focus NFe)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Importante</p>
                    <p className="text-sm text-amber-700">
                      Para emitir notas fiscais, você precisa contratar um serviço de emissão como a{" "}
                      <a href="https://focusnfe.com.br" target="_blank" rel="noopener noreferrer" className="underline">
                        Focus NFe
                      </a>
                      . Após contratar, você receberá o token de API para configurar aqui.
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="api_provider">Provedor da API</Label>
                  <Select
                    value={formConfig.api_provider || "focus_nfe"}
                    onValueChange={(value: any) => setFormConfig({ ...formConfig, api_provider: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="focus_nfe">Focus NFe</SelectItem>
                      <SelectItem value="nfe_io">NFe.io</SelectItem>
                      <SelectItem value="webmania">WebMania</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api_token">Token da API</Label>
                  <Input
                    id="api_token"
                    type="password"
                    value={formConfig.api_token || ""}
                    onChange={(e) => setFormConfig({ ...formConfig, api_token: e.target.value })}
                    placeholder="Token de autenticação da API"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="csc_id">CSC ID (NFC-e)</Label>
                  <Input
                    id="csc_id"
                    value={formConfig.csc_id || ""}
                    onChange={(e) => setFormConfig({ ...formConfig, csc_id: e.target.value })}
                    placeholder="ID do CSC"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="csc_token">CSC Token (NFC-e)</Label>
                  <Input
                    id="csc_token"
                    type="password"
                    value={formConfig.csc_token || ""}
                    onChange={(e) => setFormConfig({ ...formConfig, csc_token: e.target.value })}
                    placeholder="Token do CSC"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveConfig} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        {/* Ajuda */}
        <TabsContent value="ajuda" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Como Configurar a Emissão de Notas Fiscais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-orange-600">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Obtenha um Certificado Digital A1</h4>
                    <p className="text-sm text-muted-foreground">
                      O certificado digital é obrigatório para emissão de notas fiscais. Você pode adquirir em certificadoras como Serasa, Certisign, ou outras autorizadas pela ICP-Brasil.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-orange-600">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Faça o Credenciamento na SEFAZ</h4>
                    <p className="text-sm text-muted-foreground">
                      Acesse o site da SEFAZ do seu estado e solicite o credenciamento para emissão de NF-e e/ou NFC-e. Cada estado tem seu processo específico.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-orange-600">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Contrate uma API de Emissão</h4>
                    <p className="text-sm text-muted-foreground">
                      Recomendamos a <a href="https://focusnfe.com.br" target="_blank" rel="noopener noreferrer" className="text-orange-600 underline">Focus NFe</a> pela facilidade de integração. Após contratar, você receberá o token de API.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-orange-600">4</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Configure os Dados no Sistema</h4>
                    <p className="text-sm text-muted-foreground">
                      Preencha todos os dados da empresa na aba Configurações, incluindo o token da API. Comece em ambiente de homologação para testes.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-orange-600">5</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Obtenha o CSC (apenas NFC-e)</h4>
                    <p className="text-sm text-muted-foreground">
                      O CSC (Código de Segurança do Contribuinte) é necessário apenas para NFC-e. Solicite na SEFAZ do seu estado.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tipos de Nota Fiscal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge>NFC-e</Badge>
                    <span className="font-medium">Nota Fiscal de Consumidor</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Utilizada para vendas ao consumidor final no varejo. Substitui o cupom fiscal. Ideal para restaurantes, lanchonetes e bares.
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    <li>Não exige dados do consumidor</li>
                    <li>Emissão rápida e simplificada</li>
                    <li>Gera QR Code para consulta</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">NF-e</Badge>
                    <span className="font-medium">Nota Fiscal Eletrônica</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Utilizada para vendas entre empresas (B2B) ou quando o cliente solicita nota fiscal completa.
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    <li>Exige dados completos do destinatário</li>
                    <li>Necessária para vendas a pessoas jurídicas</li>
                    <li>Permite operações interestaduais</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de cancelamento */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Nota Fiscal</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. A nota será cancelada na SEFAZ.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Nota:</strong> {selectedInvoice?.tipo.toUpperCase()} #{selectedInvoice?.numero}/{selectedInvoice?.serie}
              </p>
              <p className="text-sm text-amber-800">
                <strong>Valor:</strong> R$ {selectedInvoice?.valor_total.toFixed(2)}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="justificativa">Justificativa do Cancelamento *</Label>
              <Textarea
                id="justificativa"
                value={cancelJustificativa}
                onChange={(e) => setCancelJustificativa(e.target.value)}
                placeholder="Informe o motivo do cancelamento (mínimo 15 caracteres)"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                {cancelJustificativa.length}/15 caracteres mínimos
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Voltar
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelInvoice}
              disabled={cancelJustificativa.length < 15}
            >
              Confirmar Cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
