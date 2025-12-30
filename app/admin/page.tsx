"use client"

import type React from "react"

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
  X,
  CreditCard,
  Banknote,
  Smartphone,
  TrendingUp,
  TrendingDown,
  Lock,
  LogOut,
  ArrowLeft,
  Check,
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
  { value: "cartao_credito", label: "Cartão de Crédito", icon: CreditCard },
  { value: "cartao_debito", label: "Cartão de Débito", icon: CreditCard },
  { value: "pix", label: "PIX", icon: Smartphone },
  { value: "ajuste", label: "Ajuste/Balanço", icon: Settings },
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
    username: "admin",
    password: "123456",
  })
  const [loginForm, setLoginForm] = useState({ username: "", password: "" })
  const [showChangeCredentials, setShowChangeCredentials] = useState(false)
  const [newCredentials, setNewCredentials] = useState({ username: "", password: "", confirmPassword: "" })
  const [loginError, setLoginError] = useState("")
  const [credentialsError, setCredentialsError] = useState("")

  const [categories, setCategories] = useState([])
  const [newCategory, setNewCategory] = useState("")
  const [editingCategory, setEditingCategory] = useState<number | null>(null)
  const [editCategoryName, setEditCategoryName] = useState("")

  const [activeTab, setActiveTab] = useState("dashboard")

  const [orders, setOrders] = useState(mockOrders)
  const [products, setProducts] = useState([])
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
    image: "",
    visibleInMenu: true,
    extras: [] as { name: string; price: number }[], // Acréscimos disponíveis
  })

  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
    image: "",
    visibleInMenu: true,
    extras: [] as { name: string; price: number }[],
  })

  const [newExtra, setNewExtra] = useState({ name: "", price: "" })
  const [editExtra, setEditExtra] = useState({ name: "", price: "" })
  const [editingProduct, setEditingProduct] = useState<number | null>(null)

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

  const [stockBalance, setStockBalance] = useState({
    productId: "",
    newStock: "",
    reason: "",
  })

  const [cashBalance, setCashBalance] = useState({
    newBalance: "",
    reason: "",
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAuth = localStorage.getItem("admin_authenticated")
      const savedCredentials = localStorage.getItem("admin_credentials")
      const savedUsername = localStorage.getItem("admin_username")
      const savedPassword = localStorage.getItem("admin_password")

      if (savedAuth === "true") {
        setIsAuthenticated(true)
      }

      if (savedCredentials) {
        setCredentials(JSON.parse(savedCredentials))
      } else if (savedUsername || savedPassword) {
        setCredentials({
          username: savedUsername || "admin",
          password: savedPassword || "123456",
        })
      }
    }
  }, [])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        // Load products
        const productsResponse = await fetch("/api/products")
        if (productsResponse.ok) {
          const productsData = await productsResponse.json()
          setProducts(productsData)
        }

        // Load categories
        const categoriesResponse = await fetch("/api/categories")
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          setCategories(categoriesData)
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (typeof window === "undefined") return

    const loadOrdersFromStorage = () => {
      const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]")
      if (storedOrders.length > 0) {
        // Converter pedidos do localStorage para o formato do formato do admin
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("menuProducts", JSON.stringify(products))
    }
  }, [products])

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
      name: product.name || "",
      category: product.category || "",
      price: product.price ? product.price.toString() : "",
      description: product.description || "",
      image: product.image || "",
      visibleInMenu: product.visibleInMenu ?? true,
      extras: product.extras || [],
    })
  }

  const saveEditProduct = async () => {
    if (editingProduct) {
      try {
        const response = await fetch("/api/products", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: editingProduct,
            name: editForm.name,
            category_id: Number.parseInt(editForm.category),
            price: Number.parseFloat(editForm.price),
            image: editForm.image,
            visible: editForm.visibleInMenu,
            stock_control: editForm.stockControl,
            stock_quantity: editForm.stockQuantity,
            per_kilo: editForm.perKilo,
            extras: editForm.extras,
          }),
        })

        if (response.ok) {
          const updatedProduct = await response.json()
          setProducts((prev) => prev.map((product) => (product.id === editingProduct ? updatedProduct : product)))
          setEditingProduct(null)
          setEditForm({
            name: "",
            category: "",
            price: "",
            description: "",
            image: "",
            visibleInMenu: true,
            stockControl: false,
            stockQuantity: 0,
            perKilo: false,
            extras: [],
          })
        } else {
          const errorData = await response.json()
          console.error("Erro ao salvar produto:", errorData)
        }
      } catch (error) {
        console.error("Erro ao salvar produto:", error)
      }
    }
  }

  const cancelEdit = () => {
    setEditingProduct(null)
    setEditForm({ name: "", category: "", price: "", description: "", image: "", visibleInMenu: true, extras: [] })
  }

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const addExtraToNewProduct = () => {
    if (newExtra.name && newExtra.price) {
      setNewProduct((prev) => ({
        ...prev,
        extras: [...prev.extras, { name: newExtra.name, price: Number.parseFloat(newExtra.price) }],
      }))
      setNewExtra({ name: "", price: "" })
    }
  }

  const removeExtraFromNewProduct = (index: number) => {
    setNewProduct((prev) => ({
      ...prev,
      extras: prev.extras.filter((_, i) => i !== index),
    }))
  }

  const addExtraToEditProduct = () => {
    if (editExtra.name && editExtra.price) {
      setEditForm((prev) => ({
        ...prev,
        extras: [...prev.extras, { name: editExtra.name, price: Number.parseFloat(editExtra.price) }],
      }))
      setEditExtra({ name: "", price: "" })
    }
  }

  const removeExtraFromEditProduct = (index: number) => {
    setEditForm((prev) => ({
      ...prev,
      extras: prev.extras.filter((_, i) => i !== index),
    }))
  }

  const addNewProduct = async () => {
    if (newProduct.name && newProduct.category && newProduct.price) {
      try {
        const selectedCategory = categories.find((cat) => cat.id === Number.parseInt(newProduct.category))
        if (!selectedCategory) {
          console.error("Categoria não encontrada")
          return
        }

        const response = await fetch("/api/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newProduct.name,
            category_id: selectedCategory.id,
            price: Number.parseFloat(newProduct.price),
            image: newProduct.image || "/vibrant-food-dish.png",
            visible: newProduct.visibleInMenu,
            stock_control: false,
            stock_quantity: 0,
            per_kilo: false,
            extras: newProduct.extras || [],
          }),
        })

        if (response.ok) {
          const createdProduct = await response.json()
          setProducts((prev) => [...prev, createdProduct])
          setNewProduct({
            name: "",
            category: "",
            price: "",
            description: "",
            image: "",
            visibleInMenu: true,
            extras: [],
          })
        } else {
          const errorData = await response.text()
          console.error("[v0] Erro na resposta da API:", errorData)
        }
      } catch (error) {
        console.error("Erro ao adicionar produto:", error)
      }
    }
  }

  const handleNewProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const base64 = await convertToBase64(file)
        setNewProduct({ ...newProduct, image: base64 })
      } catch (error) {
        console.error("Erro ao converter imagem:", error)
      }
    }
  }

  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const base64 = await convertToBase64(file)
        setEditForm({ ...editForm, image: base64 })
      } catch (error) {
        console.error("Erro ao converter imagem:", error)
      }
    }
  }

  const deleteProduct = async (productId: number) => {
    if (confirm("Tem certeza que deseja deletar este produto?")) {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          setProducts((prev) => prev.filter((product) => product.id !== productId))
        }
      } catch (error) {
        console.error("Erro ao deletar produto:", error)
      }
    }
  }

  const toggleProductStatus = async (productId: number) => {
    const product = products.find((p) => p.id === productId)
    if (product) {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...product,
            status: product.status === "ativo" ? "inativo" : "ativo",
          }),
        })

        if (response.ok) {
          const updatedProduct = await response.json()
          setProducts((prev) => prev.map((p) => (p.id === productId ? updatedProduct : p)))
        }
      } catch (error) {
        console.error("Erro ao alterar status do produto:", error)
      }
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
        date: new Date().toISOString().split("T")[0],
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

  const balanceStock = (productId: number, newStock: number, reason: string) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    const oldStock = product.stock
    const difference = newStock - oldStock
    const movementType = difference >= 0 ? "entrada" : "saida"

    setProducts((prev) =>
      prev.map((product) => {
        if (product.id === productId) {
          return { ...product, stock: newStock }
        }
        return product
      }),
    )

    // Registrar movimentação de balanço
    const movement = {
      id: Date.now(),
      productId,
      productName: product.name,
      type: "balanco" as any,
      quantity: Math.abs(difference),
      unit: "unidade" as any,
      reason: `Balanço: ${reason} (${oldStock} → ${newStock})`,
      date: new Date().toLocaleString("pt-BR"),
      user: "Admin",
    }
    setStockMovements((prev) => [movement, ...prev])
  }

  const balanceCash = (newBalance: number, reason: string) => {
    const currentBalance = cashTransactions.reduce((total, transaction) => {
      return transaction.type === "entrada" ? total + transaction.amount : total - transaction.amount
    }, 0)

    const difference = newBalance - currentBalance
    const transactionType = difference >= 0 ? "entrada" : "saida"

    const transaction = {
      id: `balance-${Date.now()}`,
      type: transactionType,
      amount: Math.abs(difference),
      paymentMethod: "ajuste",
      description: `Balanço de Caixa: ${reason} (R$ ${currentBalance.toFixed(2)} → R$ ${newBalance.toFixed(2)})`,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      date: new Date().toISOString().split("T")[0],
      isAutomatic: false,
    }

    setCashTransactions((prev) => [transaction, ...prev])
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

  const addCategory = async () => {
    if (newCategory.trim()) {
      try {
        const response = await fetch("/api/categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: newCategory.trim() }),
        })

        if (response.ok) {
          const createdCategory = await response.json()
          setCategories((prev) => [...prev, createdCategory])
          setNewCategory("")
        } else {
          console.error("Erro ao adicionar categoria")
        }
      } catch (error) {
        console.error("Erro ao adicionar categoria:", error)
      }
    }
  }

  const updateCategory = async (categoryId: number, newName: string) => {
    try {
      const response = await fetch("/api/categories", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: categoryId, name: newName }),
      })

      if (response.ok) {
        const updatedCategory = await response.json()
        setCategories((prev) => prev.map((cat) => (cat.id === categoryId ? updatedCategory : cat)))
        setEditingCategory(null)
        setEditCategoryName("")
      } else {
        console.error("Erro ao atualizar categoria")
      }
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error)
    }
  }

  const deleteCategory = async (categoryId: number) => {
    if (confirm("Tem certeza que deseja deletar esta categoria?")) {
      try {
        const response = await fetch("/api/categories", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: categoryId }),
        })

        if (response.ok) {
          setCategories((prev) => prev.filter((cat) => cat.id !== categoryId))
        } else {
          console.error("Erro ao deletar categoria")
        }
      } catch (error) {
        console.error("Erro ao deletar categoria:", error)
      }
    }
  }

  if (loading && isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados...</p>
        </div>
      </div>
    )
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
          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Gerenciar Produtos</h2>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Adicionar Novo Produto</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="product-name">Nome do Produto</Label>
                      <Input
                        id="product-name"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        placeholder="Nome do produto"
                      />
                    </div>
                    <div>
                      <Label htmlFor="product-category">Categoria</Label>
                      <Select
                        value={newProduct.category}
                        onChange={(value) => setNewProduct({ ...newProduct, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="product-price">Preço (R$)</Label>
                      <Input
                        id="product-price"
                        type="number"
                        step="0.01"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="product-description">Descrição</Label>
                      <Input
                        id="product-description"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        placeholder="Descrição do produto"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="product-image">Imagem do Produto</Label>
                      <div className="space-y-2">
                        <Input
                          id="product-image"
                          type="file"
                          accept="image/*"
                          onChange={handleNewProductImageUpload}
                          className="cursor-pointer"
                        />
                        {newProduct.image && (
                          <div className="mt-2">
                            <img
                              src={newProduct.image || "/placeholder.svg"}
                              alt="Preview"
                              className="w-32 h-24 object-cover rounded-md border"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="md:col-span-2 flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="visible-menu"
                        checked={newProduct.visibleInMenu}
                        onChange={(e) => setNewProduct({ ...newProduct, visibleInMenu: e.target.checked })}
                      />
                      <Label htmlFor="visible-menu">Visível no cardápio</Label>
                    </div>
                    <div className="space-y-2">
                      <Label>Acréscimos Disponíveis</Label>
                      <div className="border rounded-lg p-4 space-y-3">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Nome do acréscimo (ex: Bacon)"
                            value={newExtra.name}
                            onChange={(e) => setNewExtra({ ...newExtra, name: e.target.value })}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Preço"
                            value={newExtra.price}
                            onChange={(e) => setNewExtra({ ...newExtra, price: e.target.value })}
                            className="w-24"
                          />
                          <Button type="button" onClick={addExtraToNewProduct} size="sm">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        {newProduct.extras.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Acréscimos adicionados:</p>
                            {newProduct.extras.map((extra, index) => (
                              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                <span className="text-sm">
                                  {extra.name} - R$ {extra.price.toFixed(2)}
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeExtraFromNewProduct(index)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button onClick={addNewProduct} className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Produto
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Lista de Produtos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {products.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                        {editingProduct === product.id ? (
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label>Nome</Label>
                              <Input
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label>Categoria</Label>
                              <Select
                                value={editForm.category}
                                onChange={(value) => setEditForm({ ...editForm, category: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id.toString()}>
                                      {category.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Preço (R$)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={editForm.price}
                                onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                              />
                            </div>
                            <div className="md:col-span-2">
                              <Label>Descrição</Label>
                              <Input
                                value={editForm.description}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                              />
                            </div>
                            <div className="md:col-span-3">
                              <Label>Imagem do Produto</Label>
                              <div className="space-y-2">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleEditImageUpload}
                                  className="cursor-pointer"
                                />
                                {editForm.image && (
                                  <div className="mt-2">
                                    <img
                                      src={editForm.image || "/placeholder.svg"}
                                      alt="Preview"
                                      className="w-32 h-24 object-cover rounded-md border"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="md:col-span-3 flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`visible-menu-${product.id}`}
                                checked={editForm.visibleInMenu}
                                onChange={(e) => setEditForm({ ...editForm, visibleInMenu: e.target.checked })}
                              />
                              <Label htmlFor={`visible-menu-${product.id}`}>Visível no cardápio</Label>
                            </div>
                            <div className="space-y-2">
                              <Label>Acréscimos Disponíveis</Label>
                              <div className="border rounded-lg p-4 space-y-3">
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="Nome do acréscimo (ex: Bacon)"
                                    value={editExtra.name}
                                    onChange={(e) => setEditExtra({ ...editExtra, name: e.target.value })}
                                    className="flex-1"
                                  />
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="Preço"
                                    value={editExtra.price}
                                    onChange={(e) => setEditExtra({ ...editExtra, price: e.target.value })}
                                    className="w-24"
                                  />
                                  <Button type="button" onClick={addExtraToEditProduct} size="sm">
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>

                                {editForm.extras.length > 0 && (
                                  <div className="space-y-2">
                                    <p className="text-sm font-medium">Acréscimos adicionados:</p>
                                    {editForm.extras.map((extra, index) => (
                                      <div
                                        key={index}
                                        className="flex items-center justify-between bg-gray-50 p-2 rounded"
                                      >
                                        <span className="text-sm">
                                          {extra.name} - R$ {extra.price.toFixed(2)}
                                        </span>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => removeExtraFromEditProduct(index)}
                                        >
                                          <X className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="md:col-span-3 flex space-x-2">
                              <Button onClick={saveEditProduct} size="sm">
                                <Check className="w-4 h-4 mr-1" />
                                Salvar
                              </Button>
                              <Button onClick={cancelEdit} variant="outline" size="sm">
                                <X className="w-4 h-4 mr-1" />
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center space-x-4">
                              <div className="w-16 h-12 bg-gray-100 rounded-md overflow-hidden">
                                <img
                                  src={product.image || "/placeholder.svg?height=48&width=64&query=food"}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <h3 className="font-medium">{product.name}</h3>
                                <p className="text-sm text-gray-500">{product.category_name || "Sem categoria"}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm" onClick={() => startEditProduct(product)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => deleteProduct(product.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Categorias */}
          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Categorias</CardTitle>
                <CardDescription>Adicione, edite ou remova categorias de produtos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Nova categoria"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    />
                    <Button onClick={addCategory}>Adicionar</Button>
                  </div>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center justify-between p-3 border rounded-md">
                        {editingCategory === category.id ? (
                          <div className="flex items-center space-x-2">
                            <Input value={editCategoryName} onChange={(e) => setEditCategoryName(e.target.value)} />
                            <Button onClick={() => updateCategory(category.id, editCategoryName)}>Salvar</Button>
                            <Button variant="ghost" onClick={() => setEditingCategory(null)}>
                              Cancelar
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span>{category.name}</span>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingCategory(category.id)
                                  setEditCategoryName(category.name)
                                }}
                              >
                                Editar
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => deleteCategory(category.id)}>
                                Remover
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Estoque */}
          <TabsContent value="stock">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Estoque</CardTitle>
                <CardDescription>Acompanhe e ajuste o estoque de seus produtos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stock-product">Produto</Label>
                      <Select onValueChange={(value) => setStockBalance({ ...stockBalance, productId: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um produto" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="stock-new">Novo Estoque</Label>
                      <Input
                        id="stock-new"
                        type="number"
                        value={stockBalance.newStock}
                        onChange={(e) => setStockBalance({ ...stockBalance, newStock: e.target.value })}
                        placeholder="Quantidade"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="stock-reason">Motivo</Label>
                      <Textarea
                        id="stock-reason"
                        value={stockBalance.reason}
                        onChange={(e) => setStockBalance({ ...stockBalance, reason: e.target.value })}
                        placeholder="Motivo do ajuste"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      if (stockBalance.productId && stockBalance.newStock && stockBalance.reason) {
                        balanceStock(Number(stockBalance.productId), Number(stockBalance.newStock), stockBalance.reason)
                        setStockBalance({ productId: "", newStock: "", reason: "" })
                      }
                    }}
                  >
                    Ajustar Estoque
                  </Button>
                </div>

                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">Movimentação de Estoque</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                      <thead>
                        <tr>
                          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Produto
                          </th>
                          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Tipo
                          </th>
                          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Quantidade
                          </th>
                          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Motivo
                          </th>
                          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Data
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {stockMovements.map((movement) => (
                          <tr key={movement.id}>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                              {movement.productName}
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{movement.type}</td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                              {movement.quantity} {movement.unit}
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{movement.reason}</td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{movement.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Caixa */}
          <TabsContent value="cash">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Caixa</CardTitle>
                <CardDescription>Registre transações, visualize o histórico e ajuste o saldo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="transaction-type">Tipo de Transação</Label>
                      <Select onValueChange={(value) => setNewTransaction({ ...newTransaction, type: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {transactionTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="transaction-amount">Valor (R$)</Label>
                      <Input
                        id="transaction-amount"
                        type="number"
                        step="0.01"
                        value={newTransaction.amount}
                        onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="transaction-payment">Método de Pagamento</Label>
                      <Select onValueChange={(value) => setNewTransaction({ ...newTransaction, paymentMethod: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o método" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethods.map((method) => (
                            <SelectItem key={method.value} value={method.value}>
                              {method.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="transaction-description">Descrição</Label>
                      <Textarea
                        id="transaction-description"
                        value={newTransaction.description}
                        onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                        placeholder="Detalhes da transação"
                      />
                    </div>
                  </div>
                  <Button onClick={addManualTransaction}>Adicionar Transação</Button>
                </div>

                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">Relatório de Caixa</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <Label htmlFor="report-start-date">Data Inicial</Label>
                      <Input
                        id="report-start-date"
                        type="date"
                        value={reportFilters.startDate}
                        onChange={(e) => setReportFilters({ ...reportFilters, startDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="report-end-date">Data Final</Label>
                      <Input
                        id="report-end-date"
                        type="date"
                        value={reportFilters.endDate}
                        onChange={(e) => setReportFilters({ ...reportFilters, endDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="report-payment-method">Método de Pagamento</Label>
                      <Select onValueChange={(value) => setReportFilters({ ...reportFilters, paymentMethod: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos" />
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
                      <Label htmlFor="report-transaction-type">Tipo de Transação</Label>
                      <Select onValueChange={(value) => setReportFilters({ ...reportFilters, transactionType: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          {transactionTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Resumo do Período</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Total</CardTitle>
                        </CardHeader>
                        <CardContent>R$ {filteredCashSummary.total.toFixed(2)}</CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle>Entradas</CardTitle>
                        </CardHeader>
                        <CardContent>R$ {filteredCashSummary.entradas.toFixed(2)}</CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle>Saídas</CardTitle>
                        </CardHeader>
                        <CardContent>R$ {filteredCashSummary.saidas.toFixed(2)}</CardContent>
                      </Card>
                    </div>

                    <h4 className="text-lg font-semibold">Detalhes por Método de Pagamento</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(filteredCashSummary.byPaymentMethod).map(([method, amount]) => (
                        <Card key={method}>
                          <CardHeader>
                            <CardTitle>{paymentMethods.find((m) => m.value === method)?.label || method}</CardTitle>
                          </CardHeader>
                          <CardContent>R$ {Number(amount).toFixed(2)}</CardContent>
                        </Card>
                      ))}
                    </div>

                    <h4 className="text-lg font-semibold">Contagem de Transações</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Total de Transações</CardTitle>
                        </CardHeader>
                        <CardContent>{filteredCashSummary.transactionCount}</CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle>Transações Automáticas</CardTitle>
                        </CardHeader>
                        <CardContent>{filteredCashSummary.automaticCount}</CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle>Transações Manuais</CardTitle>
                        </CardHeader>
                        <CardContent>{filteredCashSummary.manualCount}</CardContent>
                      </Card>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mt-8 mb-4">Histórico de Transações</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                      <thead>
                        <tr>
                          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Tipo
                          </th>
                          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Valor
                          </th>
                          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Método
                          </th>
                          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Descrição
                          </th>
                          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Data
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {getFilteredTransactions().map((transaction) => (
                          <tr key={transaction.id} className={transaction.isAutomatic ? "opacity-50" : ""}>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                              <div className="flex items-center">
                                <div className="ml-3">
                                  <p
                                    className={`text-gray-900 whitespace-no-wrap ${transactionTypes.find((t) => t.value === transaction.type)?.color}`}
                                  >
                                    {transactionTypes.find((t) => t.value === transaction.type)?.label}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                              <p className="text-gray-900 whitespace-no-wrap">R$ {transaction.amount.toFixed(2)}</p>
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                              <p className="text-gray-900 whitespace-no-wrap">
                                {paymentMethods.find((m) => m.value === transaction.paymentMethod)?.label}
                              </p>
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                              <p className="text-gray-900 whitespace-no-wrap">{transaction.description}</p>
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                              <p className="text-gray-900 whitespace-no-wrap">{transaction.date}</p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">Ajuste de Saldo</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cash-new">Novo Saldo (R$)</Label>
                      <Input
                        id="cash-new"
                        type="number"
                        value={cashBalance.newBalance}
                        onChange={(e) => setCashBalance({ ...cashBalance, newBalance: e.target.value })}
                        placeholder="Saldo atualizado"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="cash-reason">Motivo</Label>
                      <Textarea
                        id="cash-reason"
                        value={cashBalance.reason}
                        onChange={(e) => setCashBalance({ ...cashBalance, reason: e.target.value })}
                        placeholder="Motivo do ajuste"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      if (cashBalance.newBalance && cashBalance.reason) {
                        balanceCash(Number(cashBalance.newBalance), cashBalance.reason)
                        setCashBalance({ newBalance: "", reason: "" })
                      }
                    }}
                  >
                    Ajustar Saldo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>Ajuste as configurações do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Configurações do WhatsApp</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="whatsapp-phone">Número do WhatsApp</Label>
                      <Input
                        id="whatsapp-phone"
                        type="tel"
                        placeholder="Número com DDD"
                        value={whatsappConfig.phone}
                        onChange={(e) => setWhatsappConfig({ ...whatsappConfig, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="whatsapp-message">Mensagem Padrão</Label>
                      <Textarea
                        id="whatsapp-message"
                        placeholder="Mensagem enviada com o pedido"
                        value={whatsappConfig.message}
                        onChange={(e) => setWhatsappConfig({ ...whatsappConfig, message: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={handleSaveWhatsappConfig}>Salvar Configurações do WhatsApp</Button>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Alterar Credenciais</h3>
                  <Button onClick={() => setShowChangeCredentials(!showChangeCredentials)}>
                    {showChangeCredentials ? "Cancelar" : "Alterar Credenciais"}
                  </Button>

                  {showChangeCredentials && (
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="new-username">Novo Usuário</Label>
                        <Input
                          id="new-username"
                          type="text"
                          placeholder="Novo usuário"
                          value={newCredentials.username}
                          onChange={(e) => setNewCredentials({ ...newCredentials, username: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-password">Nova Senha</Label>
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="Nova senha"
                          value={newCredentials.password}
                          onChange={(e) => setNewCredentials({ ...newCredentials, password: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirm-password">Confirmar Senha</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="Confirme a nova senha"
                          value={newCredentials.confirmPassword}
                          onChange={(e) => setNewCredentials({ ...newCredentials, confirmPassword: e.target.value })}
                        />
                      </div>

                      {credentialsError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-600">{credentialsError}</p>
                        </div>
                      )}

                      <Button onClick={handleChangeCredentials}>Salvar Credenciais</Button>
                    </div>
                  )}
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
