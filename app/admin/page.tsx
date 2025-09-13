"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Settings,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  ShoppingBag,
  Printer,
  Home,
  Receipt,
  Save,
  X,
  CreditCard,
  Banknote,
  Smartphone,
  TrendingUp,
  TrendingDown,
  Lock,
  LogOut,
  User,
  Key,
  Package,
  MessageCircle,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const DEFAULT_CREDENTIALS = {
  username: "admin",
  password: "123456",
}

// Mock data para demonstração
const mockOrders = [
  {
    id: 1,
    mesa: "Mesa 5",
    items: [
      { name: "Risotto de Camarão", quantity: 1, price: 45.9, id: 3 },
      { name: "Suco Natural", quantity: 2, price: 8.9, id: 6 },
    ],
    total: 63.7,
    status: "pendente",
    timestamp: "14:30",
  },
  {
    id: 2,
    mesa: "Mesa 2",
    items: [
      { name: "Filé Mignon Grelhado", quantity: 1, price: 52.9, id: 4 },
      { name: "Tiramisu", quantity: 1, price: 16.9, id: 8 },
    ],
    total: 69.8,
    status: "preparando",
    timestamp: "14:25",
  },
]

const initialMenuProducts = [
  {
    id: 1,
    name: "Bruschetta Italiana",
    description: "Pão italiano com tomate, manjericão e azeite",
    category: "Entradas",
    price: 18.9,
    image: "/bruschetta-italiana.jpg",
    status: "ativo",
    stock: 25,
    visibleInMenu: true,
  },
  {
    id: 2,
    name: "Carpaccio de Salmão",
    description: "Fatias finas de salmão com alcaparras e limão",
    category: "Entradas",
    price: 32.9,
    image: "/carpaccio-salm-o.jpg",
    status: "ativo",
    stock: 15,
    visibleInMenu: true,
  },
  {
    id: 3,
    name: "Risotto de Camarão",
    description: "Risotto cremoso com camarões frescos e ervas",
    category: "Pratos Principais",
    price: 45.9,
    image: "/risotto-camar-o.jpg",
    status: "ativo",
    stock: 20,
    visibleInMenu: true,
  },
  {
    id: 4,
    name: "Filé Mignon Grelhado",
    description: "Filé mignon com batatas rústicas e legumes",
    category: "Pratos Principais",
    price: 52.9,
    image: "/fil--mignon-grelhado.jpg",
    status: "ativo",
    stock: 12,
    visibleInMenu: true,
  },
  {
    id: 5,
    name: "Salmão Grelhado",
    description: "Salmão grelhado com quinoa e vegetais",
    category: "Pratos Principais",
    price: 48.9,
    image: "/salm-o-grelhado-quinoa.jpg",
    status: "ativo",
    stock: 18,
    visibleInMenu: true,
  },
  {
    id: 6,
    name: "Suco Natural de Laranja",
    description: "Suco fresco de laranja natural",
    category: "Bebidas",
    price: 8.9,
    image: "/suco-natural-laranja.jpg",
    status: "ativo",
    stock: 30,
    visibleInMenu: true,
  },
  {
    id: 7,
    name: "Refrigerante Coca-Cola",
    description: "Coca-Cola gelada 350ml",
    category: "Bebidas",
    price: 5.9,
    image: "/refrigerante-coca-cola.jpg",
    status: "ativo",
    stock: 50,
    visibleInMenu: true,
  },
  {
    id: 8,
    name: "Tiramisu Italiano",
    description: "Sobremesa italiana com café e mascarpone",
    category: "Sobremesas",
    price: 16.9,
    image: "/tiramisu-italiano.jpg",
    status: "ativo",
    stock: 10,
    visibleInMenu: true,
  },
]

const paymentMethods = [
  { value: "dinheiro", label: "Dinheiro", icon: Banknote },
  { value: "cartao_debito", label: "Cartão Débito", icon: CreditCard },
  { value: "cartao_credito", label: "Cartão Crédito", icon: CreditCard },
  { value: "pix", label: "PIX", icon: Smartphone },
]

const transactionTypes = [
  { value: "entrada", label: "Entrada", icon: TrendingUp, color: "text-green-600" },
  { value: "saida", label: "Saída", icon: TrendingDown, color: "text-red-600" },
]

const AdminPanel = () => {
  const [stockMovements, setStockMovements] = useState<any[]>([])
  const [stockAlert, setStockAlert] = useState(5) // Alerta quando estoque <= 5
  const [stockUnit, setStockUnit] = useState<"unidade" | "kilo">("unidade")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [credentials, setCredentials] = useState({
    username: localStorage.getItem("admin_username") || "admin",
    password: localStorage.getItem("admin_password") || "123456",
  })
  const [loginForm, setLoginForm] = useState({ username: "", password: "" })
  const [showChangeCredentials, setShowChangeCredentials] = useState(false)
  const [newCredentials, setNewCredentials] = useState({ username: "", password: "" })
  const [loginError, setLoginError] = useState("")
  const [credentialsError, setCredentialsError] = useState("")

  const [categories, setCategories] = useState(["Entradas", "Pratos Principais", "Bebidas", "Sobremesas"])
  const [newCategory, setNewCategory] = useState("")
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editCategoryName, setEditCategoryName] = useState("")

  const [activeTab, setActiveTab] = useState("dashboard")

  const [orders, setOrders] = useState(mockOrders)
  const [products, setProducts] = useState(initialMenuProducts)
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
    image: "",
    visibleInMenu: true,
  })
  const [editingProduct, setEditingProduct] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
    image: "",
    visibleInMenu: true,
  })

  const [cashTransactions, setCashTransactions] = useState([
    // Transações automáticas dos pedidos
    ...mockOrders.map((order) => ({
      id: `order-${order.id}`,
      type: "entrada",
      amount: order.total,
      paymentMethod: "cartao_credito", // Simulando método de pagamento
      description: `Pedido #${order.id} - ${order.mesa}`,
      timestamp: order.timestamp,
      date: "2024-01-15", // Adicionando campo de data para filtros
      isAutomatic: true,
    })),
  ])

  const [newTransaction, setNewTransaction] = useState({
    type: "entrada",
    amount: "",
    paymentMethod: "dinheiro",
    description: "",
  })

  const [reportFilters, setReportFilters] = useState({
    startDate: new Date().toISOString().split("T")[0], // Data atual
    endDate: new Date().toISOString().split("T")[0], // Data atual
    paymentMethod: "todos",
    transactionType: "todos",
  })

  const [whatsappConfig, setWhatsappConfig] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("whatsappConfig")
      return saved ? JSON.parse(saved) : { phone: "", message: "Olá! Gostaria de fazer o seguinte pedido:" }
    }
    return { phone: "", message: "Olá! Gostaria de fazer o seguinte pedido:" }
  })

  useEffect(() => {
    const savedAuth = localStorage.getItem("admin_authenticated")
    const savedCredentials = localStorage.getItem("admin_credentials")

    if (savedAuth === "true") {
      setIsAuthenticated(true)
    }

    if (savedCredentials) {
      setCredentials(JSON.parse(savedCredentials))
    }
  }, [])

  useEffect(() => {
    const loadOrdersFromStorage = () => {
      const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]")
      if (storedOrders.length > 0) {
        // Converter pedidos do localStorage para o formato do admin
        const convertedOrders = storedOrders.map((order: any) => {
          const orderDate = order.timestamp ? new Date(order.timestamp) : new Date()
          const isValidDate = !isNaN(orderDate.getTime())
          const finalDate = isValidDate ? orderDate : new Date()

          return {
            id: order.id,
            mesa: `Cliente: ${order.customer.name}`,
            items: order.items,
            total: order.total,
            status: order.status,
            timestamp: finalDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
            customer: order.customer,
          }
        })

        // Adicionar novos pedidos aos existentes
        setOrders((prevOrders) => {
          const existingIds = prevOrders.map((o) => o.id)
          const newOrders = convertedOrders.filter((order: any) => !existingIds.includes(order.id))
          return [...prevOrders, ...newOrders]
        })

        // Adicionar transações de caixa para os novos pedidos
        const newTransactions = convertedOrders.map((order: any) => {
          const orderDate = order.timestamp ? new Date(order.timestamp) : new Date()
          const isValidDate = !isNaN(orderDate.getTime())
          const finalDate = isValidDate ? orderDate : new Date()

          return {
            id: `order-${order.id}`,
            type: "entrada" as const,
            amount: order.total,
            paymentMethod: order.customer.paymentMethod.replace("-", "_"),
            description: `Pedido #${order.id} - ${order.customer.name}`,
            timestamp: finalDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
            date: finalDate.toISOString().split("T")[0],
            isAutomatic: true,
          }
        })

        setCashTransactions((prevTransactions) => {
          const existingOrderIds = prevTransactions.filter((t) => t.id.startsWith("order-")).map((t) => t.id)
          const newCashTransactions = newTransactions.filter((t) => !existingOrderIds.includes(t.id))
          return [...newCashTransactions, ...prevTransactions]
        })

        // Limpar pedidos do localStorage após processar
        localStorage.removeItem("orders")
      }
    }

    // Carregar pedidos na inicialização
    loadOrdersFromStorage()

    // Verificar novos pedidos a cada 5 segundos
    const interval = setInterval(loadOrdersFromStorage, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleLogin = () => {
    if (loginForm.username === credentials.username && loginForm.password === credentials.password) {
      setIsAuthenticated(true)
      localStorage.setItem("admin_authenticated", "true")
      setLoginError("")
      setLoginForm({ username: "", password: "" })
    } else {
      setLoginError("Usuário ou senha incorretos")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("admin_authenticated")
    setActiveTab("dashboard")
    window.location.href = "/"
  }

  const handleChangeCredentials = () => {
    if (!newCredentials.username || !newCredentials.password) {
      setCredentialsError("Preencha todos os campos")
      return
    }

    if (newCredentials.password !== newCredentials.confirmPassword) {
      setCredentialsError("As senhas não coincidem")
      return
    }

    if (newCredentials.password.length < 4) {
      setCredentialsError("A senha deve ter pelo menos 4 caracteres")
      return
    }

    const updatedCredentials = {
      username: newCredentials.username,
      password: newCredentials.password,
    }

    setCredentials(updatedCredentials)
    localStorage.setItem("admin_credentials", JSON.stringify(updatedCredentials))
    setNewCredentials({ username: "", password: "", confirmPassword: "" })
    setCredentialsError("")
    alert("Credenciais alteradas com sucesso!")
  }

  const updateOrderStatus = (orderId: number, newStatus: string) => {
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
  }

  const printOrder = (orderId: number) => {
    // Simular impressão
    alert(`Imprimindo pedido #${orderId}`)
  }

  const startEditProduct = (product: any) => {
    setEditingProduct(product.id)
    setEditForm({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      description: product.description,
      image: product.image,
      visibleInMenu: product.visibleInMenu,
    })
  }

  const saveEditProduct = () => {
    if (editingProduct) {
      setProducts((prev) =>
        prev.map((product) =>
          product.id === editingProduct
            ? {
                ...product,
                name: editForm.name,
                category: editForm.category,
                price: Number.parseFloat(editForm.price),
                description: editForm.description,
                image: editForm.image,
                visibleInMenu: editForm.visibleInMenu,
              }
            : product,
        ),
      )
      setEditingProduct(null)
      setEditForm({ name: "", category: "", price: "", description: "", image: "", visibleInMenu: true })
    }
  }

  const cancelEdit = () => {
    setEditingProduct(null)
    setEditForm({ name: "", category: "", price: "", description: "", image: "", visibleInMenu: true })
  }

  const addNewProduct = () => {
    if (newProduct.name && newProduct.category && newProduct.price) {
      const newId = Math.max(...products.map((p) => p.id)) + 1
      setProducts((prev) => [
        ...prev,
        {
          id: newId,
          name: newProduct.name,
          category: newProduct.category,
          price: Number.parseFloat(newProduct.price),
          description: newProduct.description,
          image: newProduct.image || "/placeholder.svg",
          status: "ativo",
          stock: 0,
          visibleInMenu: newProduct.visibleInMenu,
        },
      ])
      setNewProduct({ name: "", category: "", price: "", description: "", image: "", visibleInMenu: true })
    }
  }

  const toggleProductStatus = (productId: number) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId ? { ...product, status: product.status === "ativo" ? "inativo" : "ativo" } : product,
      ),
    )
  }

  const deleteProduct = (productId: number) => {
    if (confirm("Tem certeza que deseja deletar este produto?")) {
      setProducts((prev) => prev.filter((product) => product.id !== productId))
    }
  }

  const addManualTransaction = () => {
    if (newTransaction.amount && newTransaction.description) {
      const transaction = {
        id: `manual-${Date.now()}`,
        type: newTransaction.type,
        amount: Number.parseFloat(newTransaction.amount),
        paymentMethod: newTransaction.paymentMethod,
        description: newTransaction.description,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        date: new Date().toISOString().split("T")[0], // Adicionando data atual
        isAutomatic: false,
      }

      setCashTransactions((prev) => [transaction, ...prev])
      setNewTransaction({
        type: "entrada",
        amount: "",
        paymentMethod: "dinheiro",
        description: "",
      })
    }
  }

  const getFilteredTransactions = () => {
    return cashTransactions.filter((transaction) => {
      const transactionDate = transaction.date
      const isInDateRange = transactionDate >= reportFilters.startDate && transactionDate <= reportFilters.endDate
      const matchesPaymentMethod =
        reportFilters.paymentMethod === "todos" || transaction.paymentMethod === reportFilters.paymentMethod
      const matchesType =
        reportFilters.transactionType === "todos" || transaction.type === reportFilters.transactionType

      return isInDateRange && matchesPaymentMethod && matchesType
    })
  }

  const getFilteredCashSummary = () => {
    const filteredTransactions = getFilteredTransactions()
    const summary = {
      total: 0,
      entradas: 0,
      saidas: 0,
      byPaymentMethod: {},
      transactionCount: filteredTransactions.length,
      automaticCount: filteredTransactions.filter((t) => t.isAutomatic).length,
      manualCount: filteredTransactions.filter((t) => !t.isAutomatic).length,
    }

    filteredTransactions.forEach((transaction) => {
      const amount = transaction.type === "entrada" ? transaction.amount : -transaction.amount
      summary.total += amount

      if (transaction.type === "entrada") {
        summary.entradas += transaction.amount
      } else {
        summary.saidas += transaction.amount
      }

      if (!summary.byPaymentMethod[transaction.paymentMethod]) {
        summary.byPaymentMethod[transaction.paymentMethod] = 0
      }
      summary.byPaymentMethod[transaction.paymentMethod] += amount
    })

    return summary
  }

  const getCashSummary = () => {
    const summary = {
      total: 0,
      entradas: 0,
      saidas: 0,
      byPaymentMethod: {},
    }

    cashTransactions.forEach((transaction) => {
      const amount = transaction.type === "entrada" ? transaction.amount : -transaction.amount
      summary.total += amount

      if (transaction.type === "entrada") {
        summary.entradas += transaction.amount
      } else {
        summary.saidas += transaction.amount
      }

      if (!summary.byPaymentMethod[transaction.paymentMethod]) {
        summary.byPaymentMethod[transaction.paymentMethod] = 0
      }
      summary.byPaymentMethod[transaction.paymentMethod] += amount
    })

    return summary
  }

  const getProductSalesData = () => {
    const productSales: { [key: string]: number } = {}

    // Contar vendas de cada produto nos pedidos
    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (productSales[item.name]) {
          productSales[item.name] += item.quantity
        } else {
          productSales[item.name] = item.quantity
        }
      })
    })

    // Converter para array e ordenar por quantidade vendida
    return Object.entries(productSales)
      .map(([name, quantity]) => ({
        name: name.length > 15 ? name.substring(0, 15) + "..." : name,
        fullName: name,
        quantity,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 8) // Top 8 produtos
  }

  const stats = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
    pendingOrders: orders.filter((order) => order.status === "pendente").length,
  }

  const cashSummary = getCashSummary()
  const filteredCashSummary = getFilteredCashSummary()
  const productSalesData = getProductSalesData()

  const updateStock = (
    productId: number,
    quantity: number,
    type: "entrada" | "saida",
    reason: string,
    unit: "unidade" | "kilo" = "unidade",
  ) => {
    setProducts((prev) =>
      prev.map((product) => {
        if (product.id === productId) {
          const newStock = type === "entrada" ? product.stock + quantity : product.stock - quantity
          return { ...product, stock: Math.max(0, newStock) }
        }
        return product
      }),
    )

    // Registrar movimentação
    const movement = {
      id: Date.now(),
      productId,
      productName: products.find((p) => p.id === productId)?.name,
      type,
      quantity,
      unit,
      reason,
      date: new Date().toLocaleString("pt-BR"),
      user: "Admin",
    }
    setStockMovements((prev) => [movement, ...prev])
  }

  const processOrder = (order: any) => {
    order.items.forEach((item: any) => {
      updateStock(item.id, item.quantity, "saida", `Venda - Pedido #${order.id}`)
    })

    // Atualizar status do pedido para "processado"
    updateOrderStatus(order.id, "processado")
  }

  const handleSaveWhatsappConfig = () => {
    if (!whatsappConfig.phone) {
      alert("Por favor, insira o número do WhatsApp")
      return
    }
    localStorage.setItem("whatsappConfig", JSON.stringify(whatsappConfig))
    alert("Configuração do WhatsApp salva com sucesso!")
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Acesso Administrativo</CardTitle>
            <CardDescription>Entre com suas credenciais para acessar o painel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                type="text"
                placeholder="Digite seu usuário"
                value={loginForm.username}
                onChange={(e) => setLoginForm((prev) => ({ ...prev, username: e.target.value }))}
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                value={loginForm.password}
                onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{loginError}</p>
              </div>
            )}

            <Button className="w-full" onClick={handleLogin} disabled={!loginForm.username || !loginForm.password}>
              <Lock className="w-4 h-4 mr-2" />
              Entrar
            </Button>

            <Button variant="outline" className="w-full bg-transparent" onClick={() => (window.location.href = "/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Cardápio
            </Button>

            <div className="pt-4 border-t text-center">
              <p className="text-sm text-gray-600">
                <strong>Credenciais padrão:</strong>
                <br />
                Usuário: admin
                <br />
                Senha: 123456
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Painel Administrativo</h1>
                <p className="text-sm text-gray-600">Restaurante Delícia</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>

              <Link href="/">
                <Button variant="outline">
                  <Home className="w-4 h-4 mr-2" />
                  Voltar ao Cardápio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
            <TabsTrigger value="stock">Estoque</TabsTrigger>
            <TabsTrigger value="cash">Caixa</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pedidos Hoje</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalOrders}</div>
                  <p className="text-xs text-muted-foreground">{stats.pendingOrders} pendentes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ {stats.totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Hoje</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Produtos Ativos</CardTitle>
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{products.filter((p) => p.status === "ativo").length}</div>
                  <p className="text-xs text-muted-foreground">
                    {products.filter((p) => p.status === "inativo").length} inativos
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Produtos Mais Vendidos</CardTitle>
                  <CardDescription>Frequência de vendas por produto</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={productSalesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                      <YAxis />
                      <Tooltip formatter={(value, name, props) => [`${value} vendidos`, props.payload.fullName]} />
                      <Bar dataKey="quantity" fill="#f97316" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resumo de Vendas</CardTitle>
                  <CardDescription>Estatísticas dos produtos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {productSalesData.slice(0, 5).map((product, index) => (
                      <div key={product.fullName} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-orange-600">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium">{product.fullName}</p>
                            <p className="text-sm text-gray-500">{product.quantity} vendidos</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-orange-500 h-2 rounded-full"
                              style={{
                                width: `${(product.quantity / Math.max(...productSalesData.map((p) => p.quantity))) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Pedidos Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.slice(0, 3).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          Pedido #{order.id} - {order.mesa}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.items.length} itens • R$ {order.total.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={order.status === "pendente" ? "destructive" : "secondary"}>
                          {order.status}
                        </Badge>
                        <span className="text-sm text-gray-500">{order.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pedidos */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Pedidos</CardTitle>
                <CardDescription>Visualize e gerencie todos os pedidos em tempo real</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id}>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="text-lg">Pedido #{order.id}</CardTitle>
                            <CardDescription>
                              {order.mesa} • {order.timestamp}
                            </CardDescription>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={
                                order.status === "pendente"
                                  ? "destructive"
                                  : order.status === "preparando"
                                    ? "default"
                                    : "secondary"
                              }
                            >
                              {order.status}
                            </Badge>
                            <Button variant="outline" size="sm" onClick={() => printOrder(order.id)}>
                              <Printer className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 mb-4">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between">
                              <span>
                                {item.quantity}x {item.name}
                              </span>
                              <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                          <div className="border-t pt-2 font-bold flex justify-between">
                            <span>Total:</span>
                            <span>R$ {order.total.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, "preparando")}
                            disabled={order.status !== "pendente"}
                          >
                            Preparar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, "pronto")}
                            disabled={order.status !== "preparando"}
                          >
                            Pronto
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, "entregue")}
                            disabled={order.status !== "pronto"}
                          >
                            Entregar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Produtos */}
          <TabsContent value="products">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Adicionar Produto</CardTitle>
                  <CardDescription>Adicione novos itens ao cardápio</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome do Produto</Label>
                    <Input
                      id="name"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Risotto de Camarão"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <select
                      id="category"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct((prev) => ({ ...prev, category: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="price">Preço</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct((prev) => ({ ...prev, price: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição do produto..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="image">URL da Imagem</Label>
                    <Input
                      id="image"
                      value={newProduct.image}
                      onChange={(e) => setNewProduct((prev) => ({ ...prev, image: e.target.value }))}
                      placeholder="/caminho-da-imagem.jpg"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="visibleInMenu"
                      checked={newProduct.visibleInMenu}
                      onChange={(e) => setNewProduct((prev) => ({ ...prev, visibleInMenu: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <Label htmlFor="visibleInMenu" className="text-sm font-medium">
                      Visível no cardápio digital
                    </Label>
                  </div>
                  <button
                    className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-800"
                    style={{
                      backgroundColor: "#2563eb !important",
                      color: "#ffffff !important",
                      border: "none !important",
                    }}
                    onClick={addNewProduct}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Produto
                  </button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Produtos do Cardápio</CardTitle>
                  <CardDescription>Gerencie todos os itens do seu cardápio</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {products.map((product) => (
                      <div key={product.id}>
                        {editingProduct === product.id ? (
                          <Card className="p-4 border-2 border-blue-200">
                            <div className="space-y-3">
                              <div>
                                <Label>Nome</Label>
                                <Input
                                  value={editForm.name}
                                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label>Categoria</Label>
                                  <select
                                    value={editForm.category}
                                    onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))}
                                    className="w-full p-2 border rounded-md"
                                  >
                                    {categories.map((category) => (
                                      <option key={category} value={category}>
                                        {category}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <Label>Preço</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={editForm.price}
                                    onChange={(e) => setEditForm((prev) => ({ ...prev, price: e.target.value }))}
                                  />
                                </div>
                              </div>
                              <div>
                                <Label>Descrição</Label>
                                <Textarea
                                  value={editForm.description}
                                  onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                                  rows={2}
                                />
                              </div>
                              <div>
                                <Label>URL da Imagem</Label>
                                <Input
                                  value={editForm.image}
                                  onChange={(e) => setEditForm((prev) => ({ ...prev, image: e.target.value }))}
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id="editVisibleInMenu"
                                  checked={editForm.visibleInMenu}
                                  onChange={(e) =>
                                    setEditForm((prev) => ({ ...prev, visibleInMenu: e.target.checked }))
                                  }
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <Label htmlFor="editVisibleInMenu" className="text-sm font-medium">
                                  Visível no cardápio digital
                                </Label>
                              </div>
                              <div className="flex space-x-2">
                                <Button size="sm" onClick={saveEditProduct}>
                                  <Save className="w-4 h-4 mr-1" />
                                  Salvar
                                </Button>
                                <Button variant="outline" size="sm" onClick={cancelEdit}>
                                  <X className="w-4 h-4 mr-1" />
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ) : (
                          <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50">
                            <div className="flex space-x-3">
                              <img
                                src={product.image || "/placeholder.svg"}
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                              <div>
                                <p className="font-medium text-lg">{product.name}</p>
                                <p className="text-sm text-gray-600 mb-1">{product.description}</p>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline" className="text-xs">
                                    {product.category}
                                  </Badge>
                                  <span className="text-sm font-bold text-green-600">
                                    R$ {product.price.toFixed(2)}
                                  </span>
                                  <Badge variant={product.visibleInMenu ? "default" : "secondary"} className="text-xs">
                                    {product.visibleInMenu ? "Visível" : "Oculto"}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant={product.status === "ativo" ? "default" : "secondary"}
                                className="cursor-pointer"
                                onClick={() => toggleProductStatus(product.id)}
                              >
                                {product.status}
                              </Badge>
                              <Button variant="outline" size="sm" onClick={() => startEditProduct(product)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => deleteProduct(product.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gerenciar Categorias</h2>
            </div>

            {/* Adicionar nova categoria */}
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Nova Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nome da categoria"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                  <button
                    onClick={() => {
                      if (newCategory.trim() && !categories.includes(newCategory.trim())) {
                        setCategories([...categories, newCategory.trim()])
                        setNewCategory("")
                      }
                    }}
                    style={{
                      backgroundColor: "#2563eb !important",
                      color: "white !important",
                    }}
                    className="px-4 py-2 rounded-md hover:opacity-90"
                  >
                    Adicionar
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Lista de categorias */}
            <Card>
              <CardHeader>
                <CardTitle>Categorias Existentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      {editingCategory === category ? (
                        <div className="flex gap-2 flex-1">
                          <Input value={editCategoryName} onChange={(e) => setEditCategoryName(e.target.value)} />
                          <Button
                            size="sm"
                            onClick={() => {
                              if (editCategoryName.trim()) {
                                const updatedCategories = categories.map((cat) =>
                                  cat === category ? editCategoryName.trim() : cat,
                                )
                                setCategories(updatedCategories)

                                // Atualizar produtos que usam essa categoria
                                setProducts(
                                  products.map((product) =>
                                    product.category === category
                                      ? { ...product, category: editCategoryName.trim() }
                                      : product,
                                  ),
                                )

                                setEditingCategory(null)
                                setEditCategoryName("")
                              }
                            }}
                          >
                            Salvar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingCategory(null)
                              setEditCategoryName("")
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className="font-medium">{category}</span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingCategory(category)
                                setEditCategoryName(category)
                              }}
                            >
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                const hasProducts = products.some((product) => product.category === category)
                                if (hasProducts) {
                                  alert(
                                    "Não é possível excluir uma categoria que possui produtos. Mova os produtos para outra categoria primeiro.",
                                  )
                                } else {
                                  setCategories(categories.filter((cat) => cat !== category))
                                }
                              }}
                            >
                              Excluir
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Caixa */}
          <TabsContent value="cash">
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Relatório por Período</CardTitle>
                  <CardDescription>Filtre as transações por data e gere relatórios detalhados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div>
                      <Label>Data Inicial</Label>
                      <Input
                        type="date"
                        value={reportFilters.startDate}
                        onChange={(e) => setReportFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Data Final</Label>
                      <Input
                        type="date"
                        value={reportFilters.endDate}
                        onChange={(e) => setReportFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Forma de Pagamento</Label>
                      <Select
                        value={reportFilters.paymentMethod}
                        onValueChange={(value) => setReportFilters((prev) => ({ ...prev, paymentMethod: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          {paymentMethods.map((method) => (
                            <SelectItem key={method.value} value={method.value}>
                              {method.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Tipo de Transação</Label>
                      <Select
                        value={reportFilters.transactionType}
                        onValueChange={(value) => setReportFilters((prev) => ({ ...prev, transactionType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          <SelectItem value="entrada">Entradas</SelectItem>
                          <SelectItem value="saida">Saídas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                      <div>
                        <span className="text-sm text-gray-600">Entradas no Período</span>
                        <p className="text-xl font-bold text-green-600">R$ {filteredCashSummary.entradas.toFixed(2)}</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-600" />
                    </div>

                    <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                      <div>
                        <span className="text-sm text-gray-600">Saídas no Período</span>
                        <p className="text-xl font-bold text-red-600">R$ {filteredCashSummary.saidas.toFixed(2)}</p>
                      </div>
                      <TrendingDown className="w-8 h-8 text-red-600" />
                    </div>

                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                      <div>
                        <span className="text-sm text-gray-600">Saldo do Período</span>
                        <p
                          className={`text-xl font-bold ${filteredCashSummary.total >= 0 ? "text-blue-600" : "text-red-600"}`}
                        >
                          R$ {filteredCashSummary.total.toFixed(2)}
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-blue-600" />
                    </div>

                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div>
                        <span className="text-sm text-gray-600">Total Transações</span>
                        <p className="text-xl font-bold text-gray-700">{filteredCashSummary.transactionCount}</p>
                        <p className="text-xs text-gray-500">
                          {filteredCashSummary.automaticCount} automáticas • {filteredCashSummary.manualCount} manuais
                        </p>
                      </div>
                      <Receipt className="w-8 h-8 text-gray-600" />
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Resumo por Forma de Pagamento (Período Selecionado)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {paymentMethods.map((method) => {
                        const amount = filteredCashSummary.byPaymentMethod[method.value] || 0
                        const IconComponent = method.icon
                        return (
                          <div key={method.value} className="p-3 border rounded-lg">
                            <div className="flex items-center space-x-2 mb-1">
                              <IconComponent className="w-4 h-4" />
                              <span className="text-sm font-medium">{method.label}</span>
                            </div>
                            <p className={`text-lg font-bold ${amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                              R$ {amount.toFixed(2)}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Transações do Período ({getFilteredTransactions().length} encontradas)
                    </h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {getFilteredTransactions().map((transaction) => {
                        const PaymentIcon =
                          paymentMethods.find((m) => m.value === transaction.paymentMethod)?.icon || Banknote
                        const TypeIcon = transactionTypes.find((t) => t.value === transaction.type)?.icon || TrendingUp
                        const typeColor =
                          transactionTypes.find((t) => t.value === transaction.type)?.color || "text-gray-600"

                        return (
                          <div key={transaction.id} className="flex justify-between items-center p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div
                                className={`p-2 rounded-full ${transaction.type === "entrada" ? "bg-green-100" : "bg-red-100"}`}
                              >
                                <TypeIcon className={`w-4 h-4 ${typeColor}`} />
                              </div>
                              <div>
                                <p className="font-medium">{transaction.description}</p>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <PaymentIcon className="w-3 h-3" />
                                  <span>
                                    {paymentMethods.find((m) => m.value === transaction.paymentMethod)?.label}
                                  </span>
                                  <span>•</span>
                                  <span>{transaction.date}</span>
                                  <span>•</span>
                                  <span>{transaction.timestamp}</span>
                                  {transaction.isAutomatic && (
                                    <>
                                      <span>•</span>
                                      <Badge variant="outline" className="text-xs">
                                        Automático
                                      </Badge>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p
                                className={`font-bold ${transaction.type === "entrada" ? "text-green-600" : "text-red-600"}`}
                              >
                                {transaction.type === "entrada" ? "+" : "-"}R$ {transaction.amount.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                      {getFilteredTransactions().length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <p>Nenhuma transação encontrada no período selecionado</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Resumo do Caixa */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Resumo Geral do Caixa</CardTitle>
                    <CardDescription>Controle completo de entradas e saídas (todas as transações)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                        <div>
                          <span className="text-sm text-gray-600">Total Entradas</span>
                          <p className="text-xl font-bold text-green-600">R$ {cashSummary.entradas.toFixed(2)}</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-600" />
                      </div>

                      <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                        <div>
                          <span className="text-sm text-gray-600">Total Saídas</span>
                          <p className="text-xl font-bold text-red-600">R$ {cashSummary.saidas.toFixed(2)}</p>
                        </div>
                        <TrendingDown className="w-8 h-8 text-red-600" />
                      </div>

                      <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                        <div>
                          <span className="text-sm text-gray-600">Saldo Total</span>
                          <p
                            className={`text-xl font-bold ${cashSummary.total >= 0 ? "text-blue-600" : "text-red-600"}`}
                          >
                            R$ {cashSummary.total.toFixed(2)}
                          </p>
                        </div>
                        <DollarSign className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>

                    {/* Resumo por Forma de Pagamento */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">Por Forma de Pagamento</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {paymentMethods.map((method) => {
                          const amount = cashSummary.byPaymentMethod[method.value] || 0
                          const IconComponent = method.icon
                          return (
                            <div key={method.value} className="p-3 border rounded-lg">
                              <div className="flex items-center space-x-2 mb-1">
                                <IconComponent className="w-4 h-4" />
                                <span className="text-sm font-medium">{method.label}</span>
                              </div>
                              <p className={`text-lg font-bold ${amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                                R$ {amount.toFixed(2)}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Transações Recentes */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Transações Recentes</h3>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {cashTransactions.slice(0, 10).map((transaction) => {
                          const PaymentIcon =
                            paymentMethods.find((m) => m.value === transaction.paymentMethod)?.icon || Banknote
                          const TypeIcon =
                            transactionTypes.find((t) => t.value === transaction.type)?.icon || TrendingUp
                          const typeColor =
                            transactionTypes.find((t) => t.value === transaction.type)?.color || "text-gray-600"

                          return (
                            <div
                              key={transaction.id}
                              className="flex justify-between items-center p-3 border rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`p-2 rounded-full ${transaction.type === "entrada" ? "bg-green-100" : "bg-red-100"}`}
                                >
                                  <TypeIcon className={`w-4 h-4 ${typeColor}`} />
                                </div>
                                <div>
                                  <p className="font-medium">{transaction.description}</p>
                                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <PaymentIcon className="w-3 h-3" />
                                    <span>
                                      {paymentMethods.find((m) => m.value === transaction.paymentMethod)?.label}
                                    </span>
                                    <span>•</span>
                                    <span>{transaction.timestamp}</span>
                                    {transaction.isAutomatic && (
                                      <>
                                        <span>•</span>
                                        <Badge variant="outline" className="text-xs">
                                          Automático
                                        </Badge>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p
                                  className={`font-bold ${transaction.type === "entrada" ? "text-green-600" : "text-red-600"}`}
                                >
                                  {transaction.type === "entrada" ? "+" : "-"}R$ {transaction.amount.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Lançar Nova Transação */}
                <Card>
                  <CardHeader>
                    <CardTitle>Nova Transação</CardTitle>
                    <CardDescription>Lançar entrada ou saída manual</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Tipo de Transação</Label>
                      <Select
                        value={newTransaction.type}
                        onValueChange={(value) => setNewTransaction((prev) => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {transactionTypes.map((type) => {
                            const IconComponent = type.icon
                            return (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center space-x-2">
                                  <IconComponent className={`w-4 h-4 ${type.color}`} />
                                  <span>{type.label}</span>
                                </div>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Forma de Pagamento</Label>
                      <Select
                        value={newTransaction.paymentMethod}
                        onValueChange={(value) => setNewTransaction((prev) => ({ ...prev, paymentMethod: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethods.map((method) => {
                            const IconComponent = method.icon
                            return (
                              <SelectItem key={method.value} value={method.value}>
                                <div className="flex items-center space-x-2">
                                  <IconComponent className="w-4 h-4" />
                                  <span>{method.label}</span>
                                </div>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Valor</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={newTransaction.amount}
                        onChange={(e) => setNewTransaction((prev) => ({ ...prev, amount: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label>Descrição</Label>
                      <Textarea
                        placeholder="Descreva a transação..."
                        value={newTransaction.description}
                        onChange={(e) => setNewTransaction((prev) => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    <Button
                      className="w-full"
                      onClick={addManualTransaction}
                      disabled={!newTransaction.amount || !newTransaction.description}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Lançar Transação
                    </Button>

                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Nota:</strong> Pedidos do cardápio digital são automaticamente registrados como entradas
                        no caixa.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stock">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Controle de Estoque</CardTitle>
                  <CardDescription>Gerencie entrada e saída de produtos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Produto</Label>
                      <select className="w-full p-2 border rounded-md" id="stock-product">
                        <option value="">Selecione um produto</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} (Estoque: {product.stock})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Tipo de Movimentação</Label>
                      <select className="w-full p-2 border rounded-md" id="stock-type">
                        <option value="entrada">Entrada</option>
                        <option value="saida">Saída</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Quantidade</Label>
                      <Input
                        type="number"
                        min="0.1"
                        step={stockUnit === "kilo" ? "0.1" : "1"}
                        placeholder="0"
                        id="stock-quantity"
                      />
                    </div>
                    <div>
                      <Label>Unidade</Label>
                      <select
                        className="w-full p-2 border rounded-md"
                        id="stock-unit"
                        value={stockUnit}
                        onChange={(e) => setStockUnit(e.target.value as "unidade" | "kilo")}
                      >
                        <option value="unidade">Unidade</option>
                        <option value="kilo">Kilo (kg)</option>
                      </select>
                    </div>
                    <div>
                      <Label>Motivo</Label>
                      <Input placeholder="Ex: Compra, Perda, Ajuste" id="stock-reason" />
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      const productSelect = document.getElementById("stock-product") as HTMLSelectElement
                      const typeSelect = document.getElementById("stock-type") as HTMLSelectElement
                      const quantityInput = document.getElementById("stock-quantity") as HTMLInputElement
                      const reasonInput = document.getElementById("stock-reason") as HTMLInputElement
                      const unitSelect = document.getElementById("stock-unit") as HTMLSelectElement

                      if (productSelect.value && quantityInput.value && reasonInput.value) {
                        updateStock(
                          Number.parseInt(productSelect.value),
                          Number.parseFloat(quantityInput.value),
                          typeSelect.value as "entrada" | "saida",
                          reasonInput.value,
                          unitSelect.value as "unidade" | "kilo",
                        )
                        quantityInput.value = ""
                        reasonInput.value = ""
                        productSelect.value = ""
                      }
                    }}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Registrar Movimentação
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status do Estoque</CardTitle>
                  <CardDescription>Visualize o estoque atual de todos os produtos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {products.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-600">{product.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-bold text-lg ${product.stock <= stockAlert ? "text-red-600" : "text-green-600"}`}
                          >
                            {product.stock}{" "}
                            {product.category === "Carnes" || product.category === "Ingredientes" ? "kg" : "un"}
                          </p>
                          {product.stock <= stockAlert && (
                            <Badge variant="destructive" className="text-xs">
                              Estoque Baixo
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Histórico de Movimentações</CardTitle>
                <CardDescription>Últimas movimentações de estoque</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {stockMovements.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Nenhuma movimentação registrada</p>
                  ) : (
                    stockMovements.map((movement) => (
                      <div key={movement.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{movement.productName}</p>
                          <p className="text-sm text-gray-600">{movement.reason}</p>
                          <p className="text-xs text-gray-500">
                            {movement.date} - {movement.user}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={movement.type === "entrada" ? "default" : "secondary"}>
                            {movement.type === "entrada" ? "+" : "-"}
                            {movement.quantity} {movement.unit === "kilo" ? "kg" : "un"}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Sistema</CardTitle>
                <CardDescription>Gerencie as configurações administrativas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Configuração do WhatsApp
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="whatsapp-phone">Número do WhatsApp da Empresa</Label>
                          <Input
                            id="whatsapp-phone"
                            type="text"
                            placeholder="5511999999999 (apenas números)"
                            value={whatsappConfig.phone}
                            onChange={(e) => setWhatsappConfig((prev) => ({ ...prev, phone: e.target.value }))}
                          />
                          <p className="text-xs text-gray-500 mt-1">Digite apenas números (ex: 5511999999999)</p>
                        </div>

                        <div>
                          <Label htmlFor="whatsapp-message">Mensagem Padrão</Label>
                          <Textarea
                            id="whatsapp-message"
                            placeholder="Mensagem que aparecerá no WhatsApp"
                            value={whatsappConfig.message}
                            onChange={(e) => setWhatsappConfig((prev) => ({ ...prev, message: e.target.value }))}
                            rows={3}
                          />
                        </div>

                        <Button onClick={handleSaveWhatsappConfig} className="w-full">
                          <Save className="w-4 h-4 mr-2" />
                          Salvar Configuração WhatsApp
                        </Button>
                      </div>

                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">Como funciona:</h4>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• Cliente finaliza pedido no cardápio</li>
                          <li>• Pedido é enviado automaticamente para o WhatsApp</li>
                          <li>• Mensagem inclui todos os detalhes do pedido</li>
                          <li>• Cliente pode conversar diretamente com você</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Key className="w-5 h-5 mr-2" />
                      Alterar Credenciais de Acesso
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label>Credenciais Atuais</Label>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <User className="w-4 h-4 text-gray-600" />
                              <span className="text-sm text-gray-600">Usuário:</span>
                              <span className="font-medium">{credentials.username}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Lock className="w-4 h-4 text-gray-600" />
                              <span className="text-sm text-gray-600">Senha:</span>
                              <span className="font-medium">{"*".repeat(credentials.password.length)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="new-username">Novo Usuário</Label>
                          <Input
                            id="new-username"
                            type="text"
                            placeholder="Digite o novo usuário"
                            value={newCredentials.username}
                            onChange={(e) => setNewCredentials((prev) => ({ ...prev, username: e.target.value }))}
                          />
                        </div>

                        <div>
                          <Label htmlFor="new-password">Nova Senha</Label>
                          <Input
                            id="new-password"
                            type="password"
                            placeholder="Digite a nova senha"
                            value={newCredentials.password}
                            onChange={(e) => setNewCredentials((prev) => ({ ...prev, password: e.target.value }))}
                          />
                        </div>

                        <div>
                          <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                          <Input
                            id="confirm-password"
                            type="password"
                            placeholder="Confirme a nova senha"
                            value={newCredentials.confirmPassword}
                            onChange={(e) =>
                              setNewCredentials((prev) => ({ ...prev, confirmPassword: e.target.value }))
                            }
                          />
                        </div>

                        {credentialsError && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{credentialsError}</p>
                          </div>
                        )}

                        <Button
                          onClick={handleChangeCredentials}
                          disabled={
                            !newCredentials.username || !newCredentials.password || !newCredentials.confirmPassword
                          }
                          className="w-full"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Salvar Novas Credenciais
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Informações do Sistema</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900">Versão</h4>
                        <p className="text-blue-700">v1.0.0</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-900">Status</h4>
                        <p className="text-green-700">Online</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h4 className="font-medium text-purple-900">Último Acesso</h4>
                        <p className="text-purple-700">15/01/2024 14:50</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default AdminPanel
