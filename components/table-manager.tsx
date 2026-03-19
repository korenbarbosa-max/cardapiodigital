"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Minus,
  X,
  Check,
  Printer,
  Clock,
  Users,
  DollarSign,
  UtensilsCrossed,
  Trash2,
} from "lucide-react"

interface TableTab {
  id: number
  table_number: number
  status: 'available' | 'occupied' | 'pending_payment'
  items: Array<{ 
    id: number
    name: string
    price: number
    quantity: number
    extras?: Array<{ name: string; price: number }> 
  }>
  total: number
  customer_name: string | null
  opened_at: string | null
  closed_at: string | null
}

interface Product {
  id: number
  name: string
  price: number
  category_id: number
  visible: boolean
  extras?: Array<{ name: string; price: number }>
}

interface Category {
  id: number
  name: string
}

export default function TableManager() {
  const [tableTabs, setTableTabs] = useState<TableTab[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedTable, setSelectedTable] = useState<number | null>(null)
  const [customerName, setCustomerName] = useState("")
  const [addingItem, setAddingItem] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [loading, setLoading] = useState(true)

  const loadTableTabs = async () => {
    try {
      const response = await fetch("/api/table-tabs")
      if (response.ok) {
        const data = await response.json()
        setTableTabs(data)
      }
    } catch (error) {
      console.error("Erro ao carregar comandas:", error)
    }
  }

  const loadProducts = async () => {
    try {
      const response = await fetch("/api/products")
      if (response.ok) {
        const data = await response.json()
        setProducts(data.filter((p: Product) => p.visible))
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("Erro ao carregar categorias:", error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([loadTableTabs(), loadProducts(), loadCategories()])
      setLoading(false)
    }
    loadData()
    
    // Poll for updates
    const interval = setInterval(loadTableTabs, 10000)
    return () => clearInterval(interval)
  }, [])

  const openTable = async (tableId: number) => {
    try {
      const response = await fetch("/api/table-tabs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: tableId,
          status: "occupied",
          customer_name: customerName || null,
          openTable: true,
        }),
      })
      if (response.ok) {
        await loadTableTabs()
        setCustomerName("")
      }
    } catch (error) {
      console.error("Erro ao abrir mesa:", error)
    }
  }

  const closeTable = async (tableId: number) => {
    if (!confirm("Tem certeza que deseja fechar esta comanda? Todos os itens serão removidos.")) return
    
    try {
      const response = await fetch("/api/table-tabs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: tableId,
          status: "available",
          closeTable: true,
        }),
      })
      if (response.ok) {
        await loadTableTabs()
        setSelectedTable(null)
      }
    } catch (error) {
      console.error("Erro ao fechar mesa:", error)
    }
  }

  const addItemToTable = async (tableId: number, product: Product) => {
    const table = tableTabs.find(t => t.id === tableId)
    if (!table) return

    const existingItem = table.items.find(item => item.id === product.id)
    let newItems: typeof table.items
    
    if (existingItem) {
      newItems = table.items.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    } else {
      newItems = [
        ...table.items,
        { id: product.id, name: product.name, price: product.price, quantity: 1 }
      ]
    }

    const newTotal = newItems.reduce((sum, item) => {
      const extrasTotal = item.extras?.reduce((eSum, e) => eSum + e.price, 0) || 0
      return sum + (item.price + extrasTotal) * item.quantity
    }, 0)

    try {
      const response = await fetch("/api/table-tabs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: tableId,
          items: newItems,
          total: newTotal,
        }),
      })
      if (response.ok) {
        await loadTableTabs()
      }
    } catch (error) {
      console.error("Erro ao adicionar item:", error)
    }
  }

  const removeItemFromTable = async (tableId: number, productId: number) => {
    const table = tableTabs.find(t => t.id === tableId)
    if (!table) return

    const existingItem = table.items.find(item => item.id === productId)
    if (!existingItem) return

    let newItems: typeof table.items
    
    if (existingItem.quantity > 1) {
      newItems = table.items.map(item =>
        item.id === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    } else {
      newItems = table.items.filter(item => item.id !== productId)
    }

    const newTotal = newItems.reduce((sum, item) => {
      const extrasTotal = item.extras?.reduce((eSum, e) => eSum + e.price, 0) || 0
      return sum + (item.price + extrasTotal) * item.quantity
    }, 0)

    try {
      const response = await fetch("/api/table-tabs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: tableId,
          items: newItems,
          total: newTotal,
        }),
      })
      if (response.ok) {
        await loadTableTabs()
      }
    } catch (error) {
      console.error("Erro ao remover item:", error)
    }
  }

  const requestPayment = async (tableId: number) => {
    try {
      const response = await fetch("/api/table-tabs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: tableId,
          status: "pending_payment",
        }),
      })
      if (response.ok) {
        await loadTableTabs()
      }
    } catch (error) {
      console.error("Erro ao solicitar pagamento:", error)
    }
  }

  const printTab = (tableId: number) => {
    const table = tableTabs.find(t => t.id === tableId)
    if (!table) return
    alert(`Imprimindo comanda da Mesa ${table.table_number}...\nTotal: R$ ${table.total.toFixed(2)}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 border-green-300 hover:bg-green-200'
      case 'occupied': return 'bg-orange-100 border-orange-300 hover:bg-orange-200'
      case 'pending_payment': return 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200'
      default: return 'bg-gray-100 border-gray-300'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Livre'
      case 'occupied': return 'Ocupada'
      case 'pending_payment': return 'Aguardando Pagamento'
      default: return status
    }
  }

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'available': return 'secondary'
      case 'occupied': return 'default'
      case 'pending_payment': return 'destructive'
      default: return 'outline'
    }
  }

  const selectedTableData = selectedTable ? tableTabs.find(t => t.id === selectedTable) : null

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category_id === parseInt(selectedCategory))
    : products

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando mesas...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Visão geral das mesas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5" />
            Comandas de Mesas
          </CardTitle>
          <CardDescription>
            Gerencie as comandas das 8 mesas do restaurante
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {tableTabs.map((table) => (
              <button
                key={table.id}
                onClick={() => setSelectedTable(table.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${getStatusColor(table.status)} ${
                  selectedTable === table.id ? 'ring-2 ring-orange-500 ring-offset-2' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-lg">Mesa {table.table_number}</span>
                  <Badge variant={getStatusBadgeVariant(table.status)} className="text-xs">
                    {getStatusLabel(table.status)}
                  </Badge>
                </div>
                {table.status !== 'available' && (
                  <>
                    {table.customer_name && (
                      <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                        <Users className="w-3 h-3" />
                        {table.customer_name}
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                      <UtensilsCrossed className="w-3 h-3" />
                      {table.items.length} {table.items.length === 1 ? 'item' : 'itens'}
                    </div>
                    <div className="flex items-center gap-1 font-semibold text-orange-600">
                      <DollarSign className="w-3 h-3" />
                      R$ {table.total.toFixed(2)}
                    </div>
                    {table.opened_at && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Clock className="w-3 h-3" />
                        Aberta: {new Date(table.opened_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detalhes da mesa selecionada */}
      {selectedTableData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mesa {selectedTableData.table_number}</CardTitle>
                <CardDescription>
                  <Badge variant={getStatusBadgeVariant(selectedTableData.status)}>
                    {getStatusLabel(selectedTableData.status)}
                  </Badge>
                  {selectedTableData.customer_name && (
                    <span className="ml-2">- {selectedTableData.customer_name}</span>
                  )}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedTable(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Abrir mesa */}
            {selectedTableData.status === 'available' && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="customerName">Nome do Cliente (opcional)</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nome do cliente"
                  />
                </div>
                <Button onClick={() => openTable(selectedTableData.id)} className="w-full">
                  <UtensilsCrossed className="w-4 h-4 mr-2" />
                  Abrir Mesa
                </Button>
              </div>
            )}

            {/* Mesa ocupada - mostrar itens e opções */}
            {(selectedTableData.status === 'occupied' || selectedTableData.status === 'pending_payment') && (
              <>
                {/* Lista de itens */}
                <div className="space-y-2">
                  <h4 className="font-semibold">Itens da Comanda</h4>
                  {selectedTableData.items.length === 0 ? (
                    <p className="text-gray-500 text-sm">Nenhum item adicionado</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedTableData.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex-1">
                            <span className="font-medium">{item.name}</span>
                            <span className="text-gray-500 ml-2">x{item.quantity}</span>
                            {item.extras && item.extras.length > 0 && (
                              <div className="text-xs text-orange-600">
                                {item.extras.map((e, i) => (
                                  <span key={i}>+ {e.name} (R$ {e.price.toFixed(2)})</span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              R$ {((item.price + (item.extras?.reduce((s, e) => s + e.price, 0) || 0)) * item.quantity).toFixed(2)}
                            </span>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => removeItemFromTable(selectedTableData.id, item.id)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => {
                                  const product = products.find(p => p.id === item.id)
                                  if (product) addItemToTable(selectedTableData.id, product)
                                }}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-orange-600">R$ {selectedTableData.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Adicionar itens */}
                {selectedTableData.status === 'occupied' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Adicionar Itens</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAddingItem(!addingItem)}
                      >
                        {addingItem ? 'Fechar' : 'Abrir Menu'}
                      </Button>
                    </div>
                    
                    {addingItem && (
                      <div className="border rounded-lg p-3 space-y-3">
                        <div>
                          <Label>Filtrar por Categoria</Label>
                          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger>
                              <SelectValue placeholder="Todas as categorias" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Todas</SelectItem>
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id.toString()}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                          {filteredProducts.map((product) => (
                            <button
                              key={product.id}
                              onClick={() => addItemToTable(selectedTableData.id, product)}
                              className="p-2 border rounded text-left hover:bg-orange-50 hover:border-orange-300 transition-colors"
                            >
                              <div className="font-medium text-sm">{product.name}</div>
                              <div className="text-orange-600 text-sm">R$ {product.price.toFixed(2)}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Ações */}
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => printTab(selectedTableData.id)}>
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimir
                  </Button>
                  {selectedTableData.status === 'occupied' && (
                    <Button 
                      variant="default"
                      onClick={() => requestPayment(selectedTableData.id)}
                      disabled={selectedTableData.items.length === 0}
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Solicitar Pagamento
                    </Button>
                  )}
                  {selectedTableData.status === 'pending_payment' && (
                    <Button 
                      variant="default"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => closeTable(selectedTableData.id)}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Confirmar Pagamento
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    onClick={() => closeTable(selectedTableData.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Fechar Mesa
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {tableTabs.filter(t => t.status === 'available').length}
              </div>
              <div className="text-sm text-gray-500">Mesas Livres</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {tableTabs.filter(t => t.status === 'occupied').length}
              </div>
              <div className="text-sm text-gray-500">Mesas Ocupadas</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {tableTabs.filter(t => t.status === 'pending_payment').length}
              </div>
              <div className="text-sm text-gray-500">Aguardando Pagamento</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                R$ {tableTabs.reduce((sum, t) => sum + t.total, 0).toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">Total em Aberto</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
