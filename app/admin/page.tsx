"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart3,
  ShoppingBag,
  Package,
  DollarSign,
  Settings,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Printer,
  LogOut,
  Home,
  Lock,
  ArrowLeft,
  FileText,
  User,
  Phone,
  MapPin,
  CreditCard,
  Eye,
  EyeOff,
  Tag,
  Banknote,
  Smartphone,
  TrendingUp,
  TrendingDown,
  Receipt,
  Save,
  Trash,
  Volume2,
  VolumeX,
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

export default function AdminPanel() {
  const previousOrdersCountRef = useRef<number>(0)
  const audioContextRef = useRef<AudioContext | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const userInteractedRef = useRef(false)

  // Inicializar AudioContext após interação do usuário (necessário para navegadores)
  useEffect(() => {
    if (typeof window === "undefined") return

    const savedSoundPref = localStorage.getItem("soundEnabled")
    if (savedSoundPref !== null) {
      setSoundEnabled(JSON.parse(savedSoundPref))
    }

    const initAudioContext = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      if (audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume()
      }
      userInteractedRef.current = true
    }

    document.addEventListener("click", initAudioContext, { once: false })
    document.addEventListener("touchstart", initAudioContext, { once: false })

    return () => {
      document.removeEventListener("click", initAudioContext)
      document.removeEventListener("touchstart", initAudioContext)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("soundEnabled", JSON.stringify(soundEnabled))
    }
  }, [soundEnabled])

  const playNotificationSound = () => {
    if (!soundEnabled) return

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      const ctx = audioContextRef.current
      if (ctx.state === "suspended") {
        ctx.resume()
      }

      const now = ctx.currentTime

      // Som de alerta chamativo: padrão urgente que repete 3 vezes
      const playBurst = (startTime: number) => {
        const masterGain = ctx.createGain()
        masterGain.connect(ctx.destination)
        masterGain.gain.setValueAtTime(0.5, startTime)

        // Primeiro tom - agudo e forte
        const osc1 = ctx.createOscillator()
        osc1.type = "square"
        osc1.frequency.setValueAtTime(880, startTime) // A5
        osc1.connect(masterGain)
        osc1.start(startTime)
        osc1.stop(startTime + 0.1)

        // Segundo tom - mais agudo
        const osc2 = ctx.createOscillator()
        osc2.type = "square"
        osc2.frequency.setValueAtTime(1174.66, startTime + 0.12) // D6
        osc2.connect(masterGain)
        osc2.start(startTime + 0.12)
        osc2.stop(startTime + 0.22)

        // Terceiro tom - pico
        const osc3 = ctx.createOscillator()
        osc3.type = "square"
        osc3.frequency.setValueAtTime(1396.91, startTime + 0.24) // F6
        osc3.connect(masterGain)
        osc3.start(startTime + 0.24)
        osc3.stop(startTime + 0.38)

        masterGain.gain.setValueAtTime(0.5, startTime + 0.38)
        masterGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5)
      }

      // Toca o padrão 3 vezes com intervalo
      playBurst(now)
      playBurst(now + 0.6)
      playBurst(now + 1.2)
    } catch (err) {
      console.log("Não foi possível tocar o som:", err)
    }
  }

  const [stockMovementType, setStockMovementType] = useState<"entrada" | "saida" | "ajuste">("entrada")
  const [stockMovement, setStockMovement] = useState({
    productId: "",
    quantity: "",
    reason: "",
  })
  const [stockMovements, setStockMovements] = useState<any[]>([])

  const [extras, setExtras] = useState<Array<{ id: string; name: string; price: number }>>([])
  const [extraForm, setExtraForm] = useState({
    name: "",
    price: "",
  })
  const [editingExtra, setEditingExtra] = useState<string | null>(null)

  // Existing states
  const [newExtraGlobal, setNewExtraGlobal] = useState({ name: "", price: "", active: true }) // This seems to be for global extras, which might be different from product-specific extras
  // const [editingExtra, setEditingExtra] = useState<any>(null) // This was likely a duplicate, replaced by the new one above

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
    stockControl: false,
    stockQuantity: 0,
    perKilo: false,
    extras: [] as { name: string; price: number }[],
  })

  const [editExtra, setEditExtra] = useState({ name: "", price: "" }) // Acréscimo para edição de um produto específico
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

  const [deliveryConfig, setDeliveryConfig] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("deliveryConfig")
      return saved ? JSON.parse(saved) : { fee: 0, freeDeliveryMinimum: 0, enabled: true }
    }
    return { fee: 0, freeDeliveryMinimum: 0, enabled: true }
  })

  const [scheduleConfig, setScheduleConfig] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("scheduleConfig")
      return saved ? JSON.parse(saved) : {
        enabled: true,
        allowPreOrder: true,
        weekdays: { open: "13:00", close: "22:00", closed: false }, // Segunda a Sexta
        saturday: { open: "17:00", close: "22:00", closed: false },
        sunday: { open: "", close: "", closed: true },
      }
    }
    return {
      enabled: true,
      allowPreOrder: true,
      weekdays: { open: "13:00", close: "22:00", closed: false },
      saturday: { open: "17:00", close: "22:00", closed: false },
      sunday: { open: "", close: "", closed: true },
    }
  })

  const [cashBalance, setCashBalance] = useState({
    newBalance: "",
    reason: "",
  })

  const [stockBalance, setStockBalance] = useState({
    productId: "",
    newStock: "",
    reason: "",
  })

  // Adicionando estados para sessão de caixa
  const [cashSession, setCashSession] = useState<{
    isOpen: boolean
    openingBalance: number
    openingTime: string
    openingUser: string
  } | null>(null)

  const [cashOpening, setCashOpening] = useState({
    initialBalance: "",
    observation: "",
  })

  const [cashClosing, setCashClosing] = useState({
    declaredBalance: "",
    observation: "",
  })

  const [loading, setLoading] = useState(true)

  const loadProducts = async () => {
    try {
      const productsResponse = await fetch("/api/products")
      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        setProducts(productsData)
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error)
    }
  }

  const loadCategories = async () => {
    try {
      const categoriesResponse = await fetch("/api/categories")
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData)
      }
    } catch (error) {
      console.error("Erro ao carregar categorias:", error)
    }
  }

  const loadOrders = async () => {
    try {
      const ordersResponse = await fetch("/api/orders")

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()

        // Convert API orders to admin format
        const convertedOrders = ordersData.map((order: any) => {
          const orderDate = order.created_at ? new Date(order.created_at) : new Date()

          return {
            id: order.id,
            mesa: order.customer_name ? `Cliente: ${order.customer_name}` : "Pedido sem nome",
            items: order.items,
            total: order.total,
            status: order.status,
            timestamp: orderDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
            customer: {
              name: order.customer_name || "",
              phone: order.customer_phone || "",
              address: order.customer_address || "",
              paymentMethod: order.payment_method || "",
              notes: order.notes || "",
            },
          }
        })

        const pendingOrders = convertedOrders.filter((o: any) => o.status === "pendente")
        if (previousOrdersCountRef.current > 0 && pendingOrders.length > previousOrdersCountRef.current) {
          playNotificationSound()
        }
        previousOrdersCountRef.current = pendingOrders.length

        setOrders(convertedOrders)
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return
      }
      console.error("Erro ao carregar pedidos:", error)
    }
  }

  const loadExtras = () => {
    const savedExtras = localStorage.getItem("extras")
    if (savedExtras) {
      setExtras(JSON.parse(savedExtras))
    }
  }

  // Global extras functions (kept for now, but might need refactoring if they overlap with `extras`)
  const loadGlobalExtras = async () => {
    // Temporariamente desabilitado - aguardando criação da tabela extras no Supabase
    // Para usar acréscimos agora, use a aba "Acréscimos" que salva no localStorage
    console.log("Sistema de acréscimos usando localStorage temporariamente")
    /*
    try {
      const response = await fetch("/api/extras")
      if (response.ok) {
        const data = await response.json()
        // Assuming the API returns an array of extras
        // setNewExtraGlobal should be replaced with a state that holds an array
        // For now, commenting out the incorrect assignment
        // setNewExtraGlobal(data)
      } else if (response.status === 404) {
        // Table doesn't exist yet, silently ignore
        console.log("Tabela extras ainda não foi criada no banco de dados")
      }
    } catch (error) {
      console.log("Aguardando criação da tabela extras no banco de dados")
    }
    */
  }

  const addExtraGlobal = async () => {
    if (!newExtraGlobal.name || !newExtraGlobal.price) {
      alert("Preencha todos os campos")
      return
    }

    try {
      const response = await fetch("/api/extras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newExtraGlobal.name,
          price: Number.parseFloat(newExtraGlobal.price),
          active: newExtraGlobal.active,
        }),
      })

      if (response.ok) {
        await loadGlobalExtras() // Reload global extras
        setNewExtraGlobal({ name: "", price: "", active: true })
      }
    } catch (error) {
      console.error("Erro ao adicionar acréscimo global:", error)
    }
  }

  const updateExtraGlobal = async () => {
    if (!newExtraGlobal.name || !newExtraGlobal.price) {
      // Assuming editing the global extra
      alert("Preencha todos os campos")
      return
    }

    try {
      const response = await fetch("/api/extras", {
        // Assuming this API endpoint updates global extras
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Assuming API expects ID if updating, but the state `newExtraGlobal` doesn't have ID
          name: newExtraGlobal.name,
          price: Number.parseFloat(newExtraGlobal.price),
          active: newExtraGlobal.active,
        }),
      })

      if (response.ok) {
        await loadGlobalExtras() // Reload global extras
        alert("Acréscimo global atualizado com sucesso!")
      }
    } catch (error) {
      console.error("Erro ao atualizar acréscimo global:", error)
    }
  }

  const deleteExtraGlobal = async (id: number) => {
    // Assuming global extras have numeric IDs
    if (!confirm("Tem certeza que deseja excluir este acréscimo global?")) return

    try {
      const response = await fetch(`/api/extras?id=${id}`, {
        // Assuming API supports deletion by ID
        method: "DELETE",
      })

      if (response.ok) {
        await loadGlobalExtras() // Reload global extras
      }
    } catch (error) {
      console.error("Erro ao excluir acréscimo global:", error)
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      await loadProducts()
      await loadCategories()
      await loadOrders() // Ensure orders are loaded initially

      loadExtras() // Load product-specific extras from localStorage
      // loadGlobalExtras() // Load global extras - temporariamente desabilitado

      const savedCredentials = localStorage.getItem("admin_credentials")
      if (savedCredentials) {
        setCredentials(JSON.parse(savedCredentials))
      }

      const isAuthenticatedFromStorage = localStorage.getItem("admin_authenticated")
      if (isAuthenticatedFromStorage === "true") {
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error("Erro ao carregar dados iniciais:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadCashTransactions = async () => {
    try {
      const response = await fetch("/api/cash")
      if (response.ok) {
        const transactions = await response.json()
        setCashTransactions(
          transactions.map((t: any) => ({
            ...t,
            amount: Number.parseFloat(t.amount) || 0,
            paymentMethod: t.paymentMethod || "dinheiro",
            timestamp: new Date(t.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
            date: new Date(t.created_at).toISOString().split("T")[0],
            isAutomatic: false,
          })),
        )
      }
    } catch (error) {
      console.error("Erro ao carregar transações:", error)
    }
  }

  // Inicializa os dados ao montar o componente
  useEffect(() => {
    loadData()
    // loadOrders() already called in loadData
    loadCashTransactions() // Ensure cash transactions are loaded
    loadExtras()

    if (typeof window !== "undefined") {
      const savedSession = localStorage.getItem("cashSession")
      if (savedSession) {
        setCashSession(JSON.parse(savedSession))
      }
    }

    const interval = setInterval(() => {
      loadOrders() // Poll orders
    }, 10000) // A cada 10 segundos

    return () => clearInterval(interval)
  }, [])

  // Load cash transactions from API based on authentication
  useEffect(() => {
    if (!isAuthenticated) return
    loadCashTransactions()
  }, [isAuthenticated])

  // Load orders from API with polling - Already handled in the main useEffect
  // useEffect(() => {
  //   if (!isAuthenticated) return

  //   const interval = setInterval(loadOrders, 5000)
  //   return () => clearInterval(interval)
  // }, [isAuthenticated])

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
    localStorage.removeItem("cashSession") // Limpar sessão de caixa ao deslogar
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

const updateOrderStatus = async (orderId: number, newStatus: string) => {
    // Atualiza localmente primeiro para feedback imediato
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
    
    // Persiste no banco de dados
    try {
      const response = await fetch("/api/orders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      })
      
      if (!response.ok) {
        console.error("Erro ao atualizar status do pedido no servidor")
        // Reverte em caso de erro
        setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: order.status } : order)))
      }
    } catch (error) {
      console.error("Erro ao atualizar status do pedido:", error)
    }
  }

  const printOrder = (orderId: number) => {
    // Simular impressão
    alert(`Imprimindo pedido #${orderId}`)
  }

  const startEditProduct = (product: any) => {
    setEditingProduct(product.id)
    setEditForm({
      name: product.name || "",
      category: product.category_id ? product.category_id.toString() : "",
      price: product.price ? product.price.toString() : "",
      description: product.description || "",
      image: product.image || "",
      visibleInMenu: product.visible ?? true,
      stockControl: product.stock_control ?? false,
      stockQuantity: product.stock_quantity ?? 0,
      perKilo: product.per_kilo ?? false,
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

  const [newExtra, setNewExtra] = useState({ name: "", price: "" }) // Estado para o formulário de acréscimos no produto

  const addExtraToNewProduct = () => {
    if (newExtra.name && newExtra.price) {
      setNewProduct((prev) => ({
        ...prev,
        extras: [...prev.extras, { name: newExtra.name, price: Number.parseFloat(newExtra.price) }],
      }))
      setNewExtra({ name: "", price: "" })
    }
  }

  // Nova função para adicionar acréscimo da lista global
  const addGlobalExtraToNewProduct = (extraId: string) => {
    const extra = extras.find((e) => e.id === extraId)
    if (extra && !newProduct.extras.find((e) => e.name === extra.name)) {
      setNewProduct((prev) => ({
        ...prev,
        extras: [...prev.extras, { name: extra.name, price: extra.price }],
      }))
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

  // Nova função para adicionar acréscimo da lista global ao produto em edição
  const addGlobalExtraToEditProduct = (extraId: string) => {
    const extra = extras.find((e) => e.id === extraId)
    if (extra && !editForm.extras.find((e) => e.name === extra.name)) {
      setEditForm((prev) => ({
        ...prev,
        extras: [...prev.extras, { name: extra.name, price: extra.price }],
      }))
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

  const toggleProductVisibility = async (productId: number, currentVisibility: boolean) => {
    try {
      const response = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId, visible: !currentVisibility }),
      })

      if (response.ok) {
        setProducts(products.map((p) => (p.id === productId ? { ...p, visible: !currentVisibility } : p)))
      }
    } catch (error) {
      console.error("Erro ao alterar visibilidade:", error)
    }
  }

  const enableStockControl = async (productId: number) => {
    try {
      const response = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: productId,
          stock_control: true,
          stock_quantity: 0,
        }),
      })

      if (response.ok) {
        await loadProducts()
        return true
      }
      return false
    } catch (error) {
      console.error("Erro ao habilitar controle de estoque:", error)
      return false
    }
  }

  const addStockMovement = async () => {
    if (!stockMovement.productId || !stockMovement.quantity || !stockMovement.reason) {
      alert("Preencha todos os campos")
      return
    }

    const product = products.find((p) => p.id === Number(stockMovement.productId))
    if (!product) {
      alert("Produto não encontrado")
      return
    }

    // Se o produto não tem controle de estoque, perguntar se deseja habilitar
    if (!product.stock_control) {
      const enable = confirm(
        `O produto "${product.name}" não tem controle de estoque habilitado.\n\nDeseja habilitar o controle de estoque para este produto?`,
      )
      if (!enable) return

      const enabled = await enableStockControl(product.id)
      if (!enabled) {
        alert("Erro ao habilitar controle de estoque")
        return
      }
    }

    const quantity = Number(stockMovement.quantity)
    let newStock = product.stock_quantity || 0

    if (stockMovementType === "entrada") {
      newStock += quantity
    } else if (stockMovementType === "saida") {
      newStock = Math.max(0, newStock - quantity)
    } else if (stockMovementType === "ajuste") {
      newStock = quantity
    }

    try {
      // Atualizar estoque do produto
      const response = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: Number(stockMovement.productId),
          stock_quantity: newStock,
        }),
      })

      if (!response.ok) throw new Error("Erro ao atualizar estoque")

      // Registrar movimentação
      const movement = {
        id: Date.now(),
        productId: Number(stockMovement.productId),
        productName: product.name,
        type: stockMovementType,
        quantity,
        unit: "unidade",
        reason: stockMovement.reason,
        date: new Date().toLocaleString("pt-BR"),
        user: "Admin",
      }
      setStockMovements((prev) => [movement, ...prev])

      // Atualizar lista de produtos
      await loadProducts()
      setStockMovement({ productId: "", quantity: "", reason: "" })
      alert(
        `${stockMovementType === "entrada" ? "Entrada" : stockMovementType === "saida" ? "Saída" : "Ajuste"} registrada com sucesso!`,
      )
    } catch (error) {
      console.error("Erro ao registrar movimentação:", error)
      alert("Erro ao registrar movimentação")
    }
  }

  const addManualTransaction = async () => {
    if (newTransaction.amount && newTransaction.description) {
      try {
        const response = await fetch("/api/cash", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: newTransaction.type,
            amount: Number.parseFloat(newTransaction.amount),
            description: newTransaction.description,
            // Include paymentMethod if it's needed by the API
            paymentMethod: newTransaction.paymentMethod,
          }),
        })

        if (response.ok) {
          const transaction = await response.json()
          setCashTransactions((prev) => [
            {
              ...transaction,
              paymentMethod: newTransaction.paymentMethod,
              timestamp: new Date(transaction.created_at).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              date: new Date(transaction.created_at).toISOString().split("T")[0],
              isAutomatic: false,
            },
            ...prev,
          ])
          setNewTransaction({
            type: "entrada",
            amount: "",
            paymentMethod: "dinheiro",
            description: "",
          })
        }
      } catch (error) {
        console.error("Erro ao adicionar transação:", error)
      }
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
      byPaymentMethod: {} as { [key: string]: number },
      transactionCount: filteredTransactions.length,
      automaticCount: filteredTransactions.filter((t) => t.isAutomatic).length,
      manualCount: filteredTransactions.filter((t) => !t.isAutomatic).length,
    }

    filteredTransactions.forEach((transaction) => {
      const numAmount =
        typeof transaction.amount === "string" ? Number.parseFloat(transaction.amount) : transaction.amount
      const amount = transaction.type === "entrada" ? numAmount : -numAmount
      summary.total += amount

      if (transaction.type === "entrada") {
        summary.entradas += numAmount
      } else {
        summary.saidas += numAmount
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
      byPaymentMethod: {} as { [key: string]: number },
    }

    cashTransactions.forEach((transaction) => {
      const numAmount =
        typeof transaction.amount === "string" ? Number.parseFloat(transaction.amount) : transaction.amount
      const amount = transaction.type === "entrada" ? numAmount : -numAmount
      summary.total += amount

      if (transaction.type === "entrada") {
        summary.entradas += numAmount
      } else {
        summary.saidas += numAmount
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

  const balanceStock = async (productId: number, newStock: number, reason: string) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    // Se o produto não tem controle de estoque, habilitar
    if (!product.stock_control) {
      const enable = confirm(
        `O produto "${product.name}" não tem controle de estoque habilitado.\n\nDeseja habilitar o controle de estoque para este produto?`,
      )
      if (!enable) return

      const enabled = await enableStockControl(product.id)
      if (!enabled) {
        alert("Erro ao habilitar controle de estoque")
        return
      }
    }

    try {
      const response = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: productId,
          stock_quantity: newStock,
        }),
      })

      if (!response.ok) throw new Error("Erro ao atualizar estoque")

      const oldStock = product.stock_quantity || 0
      const difference = newStock - oldStock

      // Registrar movimentação de balanço
      const movement = {
        id: Date.now(),
        productId,
        productName: product.name,
        type: "ajuste",
        quantity: Math.abs(difference),
        unit: "unidade",
        reason: `Ajuste: ${reason} (${oldStock} → ${newStock})`,
        date: new Date().toLocaleString("pt-BR"),
        user: "Admin",
      }
      setStockMovements((prev) => [movement, ...prev])

      await loadProducts()
      alert("Estoque ajustado com sucesso!")
    } catch (error) {
      console.error("Erro ao ajustar estoque:", error)
      alert("Erro ao ajustar estoque")
    }
  }

  const openCashRegister = async () => {
    if (!cashOpening.initialBalance) {
      alert("Informe o valor inicial do caixa (sangria)")
      return
    }

    const openingBalance = Number.parseFloat(cashOpening.initialBalance)

    // Registrar transação de abertura
    try {
      const response = await fetch("/api/cash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "balance",
          amount: openingBalance,
          description: `Abertura de caixa - ${cashOpening.observation || "Sem observação"}`,
          paymentMethod: "dinheiro",
        }),
      })

      if (response.ok) {
        const session = {
          isOpen: true,
          openingBalance,
          openingTime: new Date().toLocaleString("pt-BR"),
          openingUser: credentials.username,
        }

        setCashSession(session)
        localStorage.setItem("cashSession", JSON.stringify(session))
        setCashOpening({ initialBalance: "", observation: "" })

        await loadCashTransactions()
        alert("Caixa aberto com sucesso!")
      }
    } catch (error) {
      console.error("Erro ao abrir caixa:", error)
      alert("Erro ao abrir caixa. Tente novamente.")
    }
  }

  const closeCashRegister = async () => {
    if (!cashSession) {
      alert("Nenhum caixa aberto")
      return
    }

    if (!cashClosing.declaredBalance) {
      alert("Informe o valor contado no fechamento")
      return
    }

    const declaredBalance = Number.parseFloat(cashClosing.declaredBalance)
    const expectedBalance = getCashSummary().total // Usando getCashSummary para obter o saldo atual

    const difference = declaredBalance - expectedBalance

    const confirmMessage = `
Fechamento de Caixa:
- Valor esperado: R$ ${expectedBalance.toFixed(2)}
- Valor contado: R$ ${declaredBalance.toFixed(2)}
- Diferença: R$ ${difference.toFixed(2)}

${cashClosing.observation ? `Observação: ${cashClosing.observation}` : ""}

Confirma o fechamento?
    `

    if (!confirm(confirmMessage)) {
      return
    }

    try {
      // Registrar transação de fechamento
      const response = await fetch("/api/cash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "balance",
          amount: declaredBalance,
          description: `Fechamento de caixa - Diferença: R$ ${difference.toFixed(2)} - ${cashClosing.observation || "Sem observação"}`,
          paymentMethod: "dinheiro",
        }),
      })

      if (response.ok) {
        setCashSession(null)
        localStorage.removeItem("cashSession")
        setCashClosing({ declaredBalance: "", observation: "" })

        await loadCashTransactions()
        alert("Caixa fechado com sucesso!")
      }
    } catch (error) {
      console.error("Erro ao fechar caixa:", error)
      alert("Erro ao fechar caixa. Tente novamente.")
    }
  }

  const balanceCash = async (newBalance: number, reason: string) => {
    const currentBalance = cashTransactions.reduce((total, transaction) => {
      return transaction.type === "entrada" ? total + transaction.amount : total - transaction.amount
    }, 0)

    const difference = newBalance - currentBalance
    const transactionType = difference >= 0 ? "entrada" : "saida"

    try {
      const response = await fetch("/api/cash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: transactionType,
          amount: Math.abs(difference),
          description: `Balanço de Caixa: ${reason} (R$ ${currentBalance.toFixed(2)} → R$ ${newBalance.toFixed(2)})`,
          // Assuming 'ajuste' is a valid paymentMethod or handled internally
          paymentMethod: "ajuste",
        }),
      })

      if (response.ok) {
        const transaction = await response.json()
        setCashTransactions((prev) => [
          {
            ...transaction,
            paymentMethod: "ajuste",
            timestamp: new Date(transaction.created_at).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            date: new Date(transaction.created_at).toISOString().split("T")[0],
            isAutomatic: false,
          },
          ...prev,
        ])
      }
    } catch (error) {
      console.error("Erro ao ajustar saldo:", error)
    }
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

const handleSaveDeliveryConfig = () => {
  localStorage.setItem("deliveryConfig", JSON.stringify(deliveryConfig))
  alert("Configuração de entrega salva com sucesso!")
  }

  const handleSaveScheduleConfig = () => {
    localStorage.setItem("scheduleConfig", JSON.stringify(scheduleConfig))
    alert("Horário de funcionamento salvo com sucesso!")
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

  const addExtra = () => {
    if (extraForm.name && extraForm.price) {
      const newExtra = {
        id: Date.now().toString(),
        name: extraForm.name,
        price: Number.parseFloat(extraForm.price),
      }

      const updatedExtras = [...extras, newExtra]
      setExtras(updatedExtras)
      setExtraForm({ name: "", price: "" })

      // Salvar no localStorage imediatamente
      localStorage.setItem("extras", JSON.stringify(updatedExtras))
    }
  }

  const saveEditExtra = () => {
    if (editingExtra && extraForm.name && extraForm.price) {
      const updatedExtras = extras.map((extra) =>
        extra.id === editingExtra
          ? { ...extra, name: extraForm.name, price: Number.parseFloat(extraForm.price) }
          : extra,
      )

      setExtras(updatedExtras)
      setEditingExtra(null)
      setExtraForm({ name: "", price: "" })

      // Salvar no localStorage imediatamente
      localStorage.setItem("extras", JSON.stringify(updatedExtras))
    }
  }

  const cancelEditExtra = () => {
    setEditingExtra(null)
    setExtraForm({ name: "", price: "" })
  }

  const startEditExtra = (extra: { id: string; name: string; price: number }) => {
    setEditingExtra(extra.id)
    setExtraForm({ name: extra.name, price: extra.price.toString() })
  }

  const deleteExtra = (extraId: string) => {
    if (confirm("Tem certeza que deseja excluir este acréscimo?")) {
      const updatedExtras = extras.filter((extra) => extra.id !== extraId)
      setExtras(updatedExtras)

      // Salvar no localStorage imediatamente
      localStorage.setItem("extras", JSON.JSON.stringify(updatedExtras))
    }
  }

  const calculateCashSummary = () => {
    const summary = {
      total: 0,
      entradas: 0,
      saidas: 0,
    }
    cashTransactions.forEach((transaction) => {
      const amount = Number.parseFloat(transaction.amount)
      if (transaction.type === "entrada") {
        summary.entradas += amount
        summary.total += amount
      } else {
        summary.saidas += amount
        summary.total -= amount
      }
    })
    return summary
  }

  const printReport = () => {
    window.print()
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
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Settings className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-bold text-gray-900">Admin</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Restaurante Delícia</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="h-9 px-2 sm:px-3"
                title={soundEnabled ? "Desativar som de notificação" : "Ativar som de notificação"}
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                <span className="hidden sm:inline ml-1">{soundEnabled ? "Som On" : "Som Off"}</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout} className="h-9 px-2 sm:px-3 bg-transparent">
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Sair</span>
              </Button>

              <Link href="/">
                <Button variant="outline" size="sm" className="h-9 px-2 sm:px-3 bg-transparent">
                  <Home className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Cardápio</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* <TabsList className="w-full flex overflow-x-auto scrollbar-hide gap-1 h-auto p-1"> */}
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1 h-auto p-1">
            <TabsTrigger
              value="dashboard"
              className="text-xs sm:text-sm px-2 sm:px-4 py-2 whitespace-nowrap flex-shrink-0"
            >
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Home</span>
            </TabsTrigger>
            <TabsTrigger value="extras" className="text-xs sm:text-sm px-2 py-1.5">
              <Plus className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Acréscimos</span>
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="text-xs sm:text-sm px-2 sm:px-4 py-2 whitespace-nowrap flex-shrink-0"
            >
              <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              Pedidos
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="text-xs sm:text-sm px-2 sm:px-4 py-2 whitespace-nowrap flex-shrink-0"
            >
              <Package className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              Produtos
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="text-xs sm:text-sm px-2 sm:px-4 py-2 whitespace-nowrap flex-shrink-0"
            >
              <Tag className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Categorias</span>
              <span className="sm:hidden">Cat.</span>
            </TabsTrigger>
            <TabsTrigger value="stock" className="text-xs sm:text-sm px-2 sm:px-4 py-2 whitespace-nowrap flex-shrink-0">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              Estoque
            </TabsTrigger>
            <TabsTrigger value="cash" className="text-xs sm:text-sm px-2 sm:px-4 py-2 whitespace-nowrap flex-shrink-0">
              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              Caixa
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="text-xs sm:text-sm px-2 sm:px-4 py-2 whitespace-nowrap flex-shrink-0"
            >
              <FileText className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Relatórios</span>
              <span className="sm:hidden">Rel.</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="text-xs sm:text-sm px-2 sm:px-4 py-2 whitespace-nowrap flex-shrink-0"
            >
              <Settings className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Configurações</span>
              <span className="sm:hidden">Config</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Pedidos Hoje</CardTitle>
                  <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{stats.totalOrders}</div>
                  <p className="text-xs text-muted-foreground">{stats.pendingOrders} pendentes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Faturamento</CardTitle>
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">R$ {stats.totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Hoje</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Produtos Ativos</CardTitle>
                  <Receipt className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                    {products.filter((p) => p.status === "ativo").length}
                  </div>
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
                        <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">Cliente:</span>
                            <span>{order.customer?.name || "Não informado"}</span>
                          </div>
                          {order.customer?.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">Telefone:</span>
                              <span>{order.customer.phone}</span>
                            </div>
                          )}
                          {order.customer?.address && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">Endereço:</span>
                              <span>{order.customer.address}</span>
                            </div>
                          )}
                          {order.customer?.paymentMethod && (
                            <div className="flex items-center gap-2 text-sm">
                              <CreditCard className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">Pagamento:</span>
                              <span>{order.customer.paymentMethod}</span>
                            </div>
                          )}
                          {order.customer?.notes && (
                            <div className="flex items-start gap-2 text-sm">
                              <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
                              <span className="font-medium">Obs:</span>
                              <span>{order.customer.notes}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2 mb-4">
                          {order.items.map((item, index) => {
                            const extrasTotal = item.extras && item.extras.length > 0
                              ? item.extras.reduce((sum: number, extra: any) => sum + (extra.price || 0), 0)
                              : 0
                            const itemTotal = (item.price + extrasTotal) * item.quantity
                            return (
                              <div key={index}>
                                <div className="flex justify-between">
                                  <span>
                                    {item.quantity}x {item.name}
                                  </span>
                                  <span>R$ {itemTotal.toFixed(2)}</span>
                                </div>
                                {item.extras && item.extras.length > 0 && (
                                  <div className="ml-6 mt-1 space-y-0.5">
                                    {item.extras.map((extra: any, extraIndex: number) => (
                                      <div key={extraIndex} className="flex justify-between text-xs text-orange-600">
                                        <span>+ {extra.name}</span>
                                        <span>+ R$ {(extra.price || 0).toFixed(2)}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )
                          })}
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
                        onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
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
                    {/* Seção de Acréscimos no formulário de NOVO produto */}
                    <div className="space-y-2">
                      <Label className="text-sm sm:text-base">Acréscimos Disponíveis</Label>

                      {extras.length > 0 && (
                        <div className="space-y-2">
                          <Select onValueChange={addGlobalExtraToNewProduct}>
                            <SelectTrigger className="text-sm sm:text-base">
                              <SelectValue placeholder="Selecionar acréscimo cadastrado" />
                            </SelectTrigger>
                            <SelectContent>
                              {extras.map((extra) => (
                                <SelectItem key={extra.id} value={extra.id} className="text-sm sm:text-base">
                                  {extra.name} - R$ {extra.price.toFixed(2)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">Ou adicione um acréscimo personalizado abaixo</p>
                        </div>
                      )}

                      {/* Formulário manual para acréscimos personalizados */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-2">
                        <div>
                          <Label htmlFor="new-extra-name" className="text-xs sm:text-sm">
                            Nome (personalizado)
                          </Label>
                          <Input
                            id="new-extra-name"
                            placeholder="Ex: Bacon Extra"
                            value={newExtra.name}
                            onChange={(e) => setNewExtra({ ...newExtra, name: e.target.value })}
                            className="text-sm sm:text-base"
                          />
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <Label htmlFor="new-extra-price" className="text-xs sm:text-sm">
                              Preço (R$)
                            </Label>
                            <Input
                              id="new-extra-price"
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={newExtra.price}
                              onChange={(e) => setNewExtra({ ...newExtra, price: e.target.value })}
                              className="text-sm sm:text-base"
                            />
                          </div>
                          <div className="flex items-end">
                            <Button
                              type="button"
                              onClick={addExtraToNewProduct}
                              size="sm"
                              className="text-xs sm:text-sm"
                            >
                              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Lista de acréscimos adicionados */}
                      {newProduct.extras.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {newProduct.extras.map((extra, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-muted rounded text-xs sm:text-sm"
                            >
                              <span>
                                {extra.name} - R$ {extra.price.toFixed(2)}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeExtraFromNewProduct(index)}
                                className="h-6 w-6 p-0"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
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
                                onValueChange={(value) => setEditForm({ ...editForm, category: value })}
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
                            {/* Seção de Acréscimos no formulário de EDIÇÃO de produto */}
                            <div className="space-y-2">
                              <Label className="text-sm sm:text-base">Acréscimos Disponíveis</Label>

                              {extras.length > 0 && (
                                <div className="space-y-2">
                                  <Select onValueChange={addGlobalExtraToEditProduct}>
                                    <SelectTrigger className="text-sm sm:text-base">
                                      <SelectValue placeholder="Selecionar acréscimo cadastrado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {extras.map((extra) => (
                                        <SelectItem key={extra.id} value={extra.id} className="text-sm sm:text-base">
                                          {extra.name} - R$ {extra.price.toFixed(2)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <p className="text-xs text-muted-foreground">
                                    Ou adicione um acréscimo personalizado abaixo
                                  </p>
                                </div>
                              )}

                              {/* Formulário manual para acréscimos personalizados */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-2">
                                <div>
                                  <Label htmlFor="edit-extra-name" className="text-xs sm:text-sm">
                                    Nome (personalizado)
                                  </Label>
                                  <Input
                                    id="edit-extra-name"
                                    placeholder="Ex: Bacon Extra"
                                    value={editExtra.name}
                                    onChange={(e) => setEditExtra({ ...editExtra, name: e.target.value })}
                                    className="text-sm sm:text-base"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <div className="flex-1">
                                    <Label htmlFor="edit-extra-price" className="text-xs sm:text-sm">
                                      Preço (R$)
                                    </Label>
                                    <Input
                                      id="edit-extra-price"
                                      type="number"
                                      step="0.01"
                                      placeholder="0.00"
                                      value={editExtra.price}
                                      onChange={(e) => setEditExtra({ ...editExtra, price: e.target.value })}
                                      className="text-sm sm:text-base"
                                    />
                                  </div>
                                  <div className="flex items-end">
                                    <Button
                                      type="button"
                                      onClick={addExtraToEditProduct}
                                      size="sm"
                                      className="text-xs sm:text-sm"
                                    >
                                      <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              {/* Lista de acréscimos adicionados ao produto em edição */}
                              {editForm.extras.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {editForm.extras.map((extra, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between p-2 bg-muted rounded text-xs sm:text-sm"
                                    >
                                      <span>
                                        {extra.name} - R$ {extra.price.toFixed(2)}
                                      </span>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeExtraFromEditProduct(index)}
                                        className="h-6 w-6 p-0"
                                      >
                                        <X className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
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
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleProductVisibility(product.id, product.visible)}
                                title={product.visible ? "Ocultar do cardápio" : "Mostrar no cardápio"}
                              >
                                {product.visible ? (
                                  <Eye className="w-4 h-4 text-green-600" />
                                ) : (
                                  <EyeOff className="w-4 h-4 text-gray-400" />
                                )}
                              </Button>
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
          </TabsContent>

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

          {/* Acréscimos Tab Content */}
          <TabsContent value="extras" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Gerenciar Acréscimos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Formulário de Acréscimo */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold">
                    {editingExtra ? "Editar Acréscimo" : "Novo Acréscimo"}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label htmlFor="extra-name" className="text-sm">
                        Nome do Acréscimo
                      </Label>
                      <Input
                        id="extra-name"
                        placeholder="Ex: Bacon, Queijo Extra..."
                        value={extraForm.name}
                        onChange={(e) => setExtraForm({ ...extraForm, name: e.target.value })}
                        className="text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <Label htmlFor="extra-price" className="text-sm">
                        Preço (R$)
                      </Label>
                      <Input
                        id="extra-price"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={extraForm.price}
                        onChange={(e) => setExtraForm({ ...extraForm, price: e.target.value })}
                        className="text-sm sm:text-base"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {editingExtra ? (
                      <>
                        <Button onClick={saveEditExtra} className="flex-1 text-sm sm:text-base">
                          <Save className="w-4 h-4 mr-2" />
                          Salvar Alterações
                        </Button>
                        <Button
                          onClick={cancelEditExtra}
                          variant="outline"
                          className="flex-1 text-sm sm:text-base bg-transparent"
                        >
                          Cancelar
                        </Button>
                      </>
                    ) : (
                      <Button onClick={addExtra} className="w-full text-sm sm:text-base">
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Acréscimo
                      </Button>
                    )}
                  </div>
                </div>

                {/* Lista de Acréscimos */}
                <div className="space-y-3">
                  <h3 className="text-base sm:text-lg font-semibold">Acréscimos Cadastrados</h3>
                  {extras.length === 0 ? (
                    <p className="text-muted-foreground text-center py-6 sm:py-8 text-sm sm:text-base">
                      Nenhum acréscimo cadastrado ainda
                    </p>
                  ) : (
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                      <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                        <table className="min-w-full divide-y divide-border">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium">
                                Nome
                              </th>
                              <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium">
                                Preço
                              </th>
                              <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-medium">
                                Ações
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border bg-background">
                            {extras.map((extra) => (
                              <tr key={extra.id} className="hover:bg-muted/50">
                                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">{extra.name}</td>
                                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                                  R$ {extra.price.toFixed(2)}
                                </td>
                                <td className="px-3 sm:px-4 py-2 sm:py-3 text-right">
                                  <div className="flex justify-end gap-1 sm:gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => startEditExtra(extra)}
                                      className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm"
                                    >
                                      <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => deleteExtra(extra.id)}
                                      className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
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
                <div className="space-y-6">
                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4">Movimentação de Estoque</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Tipo de Movimentação</Label>
                          <Select value={stockMovementType} onValueChange={(value: any) => setStockMovementType(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="entrada">Entrada</SelectItem>
                              <SelectItem value="saida">Saída</SelectItem>
                              <SelectItem value="ajuste">Ajuste</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Produto</Label>
                          <Select onValueChange={(value) => setStockMovement({ ...stockMovement, productId: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um produto" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id.toString()}>
                                  {product.name}
                                  {product.stock_control
                                    ? ` (Estoque: ${product.stock_quantity || 0})`
                                    : " (Sem controle)"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Quantidade</Label>
                          <Input
                            type="number"
                            min="0"
                            value={stockMovement.quantity}
                            onChange={(e) => setStockMovement({ ...stockMovement, quantity: e.target.value })}
                            placeholder="Quantidade"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Motivo</Label>
                        <Textarea
                          value={stockMovement.reason}
                          onChange={(e) => setStockMovement({ ...stockMovement, reason: e.target.value })}
                          placeholder="Motivo da movimentação"
                        />
                      </div>
                      <Button onClick={addStockMovement}>
                        {stockMovementType === "entrada"
                          ? "Registrar Entrada"
                          : stockMovementType === "saida"
                            ? "Registrar Saída"
                            : "Registrar Ajuste"}
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4">Ajuste Direto de Estoque</h3>
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
                                  {product.stock_control
                                    ? ` (Estoque atual: ${product.stock_quantity || 0})`
                                    : " (Sem controle)"}
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
                            min="0"
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
                            balanceStock(
                              Number(stockBalance.productId),
                              Number(stockBalance.newStock),
                              stockBalance.reason,
                            )
                            setStockBalance({ productId: "", newStock: "", reason: "" })
                          }
                        }}
                      >
                        Ajustar Estoque
                      </Button>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-xl font-bold mb-4">Histórico de Movimentações</h3>
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
                                {products.find((p) => p.id === movement.productId)?.name}
                              </td>
                              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <Badge
                                  variant={
                                    movement.type === "entrada"
                                      ? "default"
                                      : movement.type === "saida"
                                        ? "destructive"
                                        : "secondary"
                                  }
                                >
                                  {movement.type === "entrada"
                                    ? "Entrada"
                                    : movement.type === "saida"
                                      ? "Saída"
                                      : "Ajuste"}
                                </Badge>
                              </td>
                              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                {movement.quantity}
                              </td>
                              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{movement.reason}</td>
                              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                {new Date(movement.date).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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
                <CardDescription>Abra/feche caixa, registre transações e visualize o histórico</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                    {!cashSession?.isOpen ? (
                      // Formulário de Abertura
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Lock className="w-5 h-5" />
                          Abrir Caixa
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="opening-balance">Valor Inicial (Sangria) *</Label>
                            <Input
                              id="opening-balance"
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={cashOpening.initialBalance}
                              onChange={(e) => setCashOpening({ ...cashOpening, initialBalance: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="opening-observation">Observação</Label>
                            <Input
                              id="opening-observation"
                              placeholder="Ex: Operador João Silva"
                              value={cashOpening.observation}
                              onChange={(e) => setCashOpening({ ...cashOpening, observation: e.target.value })}
                            />
                          </div>
                        </div>
                        <Button onClick={openCashRegister} className="w-full">
                          <Lock className="w-4 h-4 mr-2" />
                          Abrir Caixa
                        </Button>
                      </div>
                    ) : (
                      // Informações do Caixa Aberto e Fechamento
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Check className="w-5 h-5 text-green-600" />
                            Caixa Aberto
                          </h3>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Em operação
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                          <div className="bg-background p-3 rounded">
                            <p className="text-muted-foreground">Abertura</p>
                            <p className="font-semibold">{cashSession.openingTime}</p>
                          </div>
                          <div className="bg-background p-3 rounded">
                            <p className="text-muted-foreground">Operador</p>
                            <p className="font-semibold">{cashSession.openingUser}</p>
                          </div>
                          <div className="bg-background p-3 rounded">
                            <p className="text-muted-foreground">Valor Inicial</p>
                            <p className="font-semibold">R$ {cashSession.openingBalance.toFixed(2)}</p>
                          </div>
                        </div>

                        {/* Formulário de Fechamento */}
                        <div className="border-t pt-4 mt-4 space-y-4">
                          <h4 className="font-semibold">Fechar Caixa</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="closing-balance">Valor Contado *</Label>
                              <Input
                                id="closing-balance"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={cashClosing.declaredBalance}
                                onChange={(e) => setCashClosing({ ...cashClosing, declaredBalance: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="closing-observation">Observação</Label>
                              <Input
                                id="closing-observation"
                                placeholder="Observações do fechamento"
                                value={cashClosing.observation}
                                onChange={(e) => setCashClosing({ ...cashClosing, observation: e.target.value })}
                              />
                            </div>
                          </div>
                          <Button onClick={closeCashRegister} variant="destructive" className="w-full">
                            <X className="w-4 h-4 mr-2" />
                            Fechar Caixa
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Adicionar Transação Manual */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Registrar Transação Manual</h3>
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
                        <Select
                          onValueChange={(value) => setNewTransaction({ ...newTransaction, paymentMethod: value })}
                        >
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
                        <Select
                          onValueChange={(value) => setReportFilters({ ...reportFilters, transactionType: value })}
                        >
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

                    <h4 className="text-lg font-semibold">Resumo do Período</h4>
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
                                <p className="text-gray-900 whitespace-no-wrap">
                                  R${" "}
                                  {(typeof transaction.amount === "string"
                                    ? Number.parseFloat(transaction.amount)
                                    : transaction.amount
                                  ).toFixed(2)}
                                </p>
                              </td>
                              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <p className="text-gray-900 whitespace-no-wrap">
                                  {paymentMethods.find((m) => m.value === transaction.paymentMethod)?.label ||
                                    transaction.paymentMethod}
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
                    className="mt-4"
                  >
                    Ajustar Saldo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Relatórios Tab Content */}
          <TabsContent value="reports">
            <div className="space-y-6">
              <div className="flex justify-between items-center print:hidden">
                <h2 className="text-2xl font-bold">Relatórios</h2>
                <Button onClick={printReport} variant="outline">
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir Relatório
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Relatório de Vendas</CardTitle>
                  <CardDescription>Análise detalhada das vendas e faturamento</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Total de Pedidos</span>
                        <ShoppingBag className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="text-2xl font-bold">{orders.length}</div>
                      <p className="text-xs text-gray-500">
                        {orders.filter((o) => o.status === "pendente").length} pendentes
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Faturamento Total</span>
                        <DollarSign className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="text-2xl font-bold">
                        R$ {orders.reduce((acc, order) => acc + order.total, 0).toFixed(2)}
                      </div>
                      <p className="text-xs text-gray-500">Todos os pedidos</p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Ticket Médio</span>
                        <Receipt className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="text-2xl font-bold">
                        R${" "}
                        {orders.length > 0
                          ? (orders.reduce((acc, order) => acc + order.total, 0) / orders.length).toFixed(2)
                          : "0.00"}
                      </div>
                      <p className="text-xs text-gray-500">Por pedido</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Produtos Mais Vendidos</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-4">Produto</th>
                            <th className="text-center py-2 px-4">Quantidade</th>
                            <th className="text-right py-2 px-4">Faturamento</th>
                          </tr>
                        </thead>
                        <tbody>
                          {productSalesData.slice(0, 10).map((product) => (
                            <tr key={product.fullName} className="border-b">
                              <td className="py-2 px-4">{product.fullName}</td>
                              <td className="text-center py-2 px-4">{product.quantity}</td>
                              <td className="text-right py-2 px-4">
                                R${" "}
                                {(
                                  product.quantity * (products.find((p) => p.name === product.fullName)?.price || 0)
                                ).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Relatório de Caixa</CardTitle>
                  <CardDescription>Resumo das movimentações financeiras</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 border rounded-lg bg-green-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-green-700">Total Entradas</span>
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="text-2xl font-bold text-green-700">
                        R${" "}
                        {cashTransactions
                          .filter((t) => t.type === "entrada")
                          .reduce((acc, t) => acc + t.amount, 0)
                          .toFixed(2)}
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg bg-red-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-red-700">Total Saídas</span>
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="text-2xl font-bold text-red-700">
                        R${" "}
                        {cashTransactions
                          .filter((t) => t.type === "saida")
                          .reduce((acc, t) => acc + t.amount, 0)
                          .toFixed(2)}
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg bg-blue-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-blue-700">Saldo</span>
                        <DollarSign className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-blue-700">
                        R${" "}
                        {(
                          cashTransactions.filter((t) => t.type === "entrada").reduce((acc, t) => acc + t.amount, 0) -
                          cashTransactions.filter((t) => t.type === "saida").reduce((acc, t) => acc + t.amount, 0)
                        ).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Últimas Transações</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-4">Data/Hora</th>
                            <th className="text-left py-2 px-4">Tipo</th>
                            <th className="text-left py-2 px-4">Descrição</th>
                            <th className="text-right py-2 px-4">Valor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cashTransactions.slice(0, 10).map((transaction) => (
                            <tr key={transaction.id} className={transaction.isAutomatic ? "opacity-50" : ""}>
                              <td className="py-2 px-4 text-sm">{transaction.timestamp}</td>
                              <td className="py-2 px-4">
                                <Badge variant={transaction.type === "entrada" ? "default" : "destructive"}>
                                  {transaction.type}
                                </Badge>
                              </td>
                              <td className="py-2 px-4 text-sm">{transaction.description}</td>
                              <td
                                className={`py-2 px-4 text-right font-semibold ${
                                  transaction.type === "entrada" ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                {transaction.type === "entrada" ? "+" : "-"} R$ {transaction.amount.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Relatório de Estoque</CardTitle>
                  <CardDescription>Status atual do inventário</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-4">Produto</th>
                            <th className="text-center py-2 px-4">Controle</th>
                            <th className="text-center py-2 px-4">Quantidade</th>
                            <th className="text-center py-2 px-4">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((product) => (
                            <tr key={product.id} className="border-b">
                              <td className="py-2 px-4">{product.name}</td>
                              <td className="text-center py-2 px-4">
                                {product.stockControl ? (
                                  <Badge variant="outline">Ativo</Badge>
                                ) : (
                                  <Badge variant="secondary">Inativo</Badge>
                                )}
                              </td>
                              <td className="text-center py-2 px-4">
                                {product.stockControl ? product.stockQuantity : "-"}
                              </td>
                              <td className="text-center py-2 px-4">
                                {product.stockControl && (
                                  <>
                                    {product.stockQuantity === 0 && <Badge variant="destructive">Sem estoque</Badge>}
                                    {product.stockQuantity > 0 && product.stockQuantity <= 10 && (
                                      <Badge className="bg-yellow-500">Baixo</Badge>
                                    )}
                                    {product.stockQuantity > 10 && <Badge className="bg-green-500">OK</Badge>}
                                  </>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

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

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-2">Taxa de Entrega</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="delivery-fee">Taxa de Entrega (R$)</Label>
                      <Input
                        id="delivery-fee"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={deliveryConfig.fee || ""}
                        onChange={(e) => setDeliveryConfig({ ...deliveryConfig, fee: Number(e.target.value) })}
                      />
                      <p className="text-xs text-gray-500 mt-1">Valor cobrado por entrega</p>
                    </div>
                    <div>
                      <Label htmlFor="free-delivery-min">Frete Grátis a partir de (R$)</Label>
                      <Input
                        id="free-delivery-min"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={deliveryConfig.freeDeliveryMinimum || ""}
                        onChange={(e) => setDeliveryConfig({ ...deliveryConfig, freeDeliveryMinimum: Number(e.target.value) })}
                      />
                      <p className="text-xs text-gray-500 mt-1">Deixe 0 para desativar</p>
                    </div>
                    <div className="flex items-end">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="delivery-enabled"
                          checked={deliveryConfig.enabled}
                          onChange={(e) => setDeliveryConfig({ ...deliveryConfig, enabled: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <Label htmlFor="delivery-enabled">Cobrar taxa de entrega</Label>
                      </div>
                    </div>
                  </div>
<Button onClick={handleSaveDeliveryConfig} className="mt-4">Salvar Configurações de Entrega</Button>
  </div>

  <div className="border-t pt-6">
    <h3 className="text-lg font-semibold mb-2">Horário de Funcionamento</h3>
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <input
          type="checkbox"
          id="schedule-enabled"
          checked={scheduleConfig.enabled}
          onChange={(e) => setScheduleConfig({ ...scheduleConfig, enabled: e.target.checked })}
          className="w-4 h-4 rounded border-gray-300"
        />
        <Label htmlFor="schedule-enabled">Exibir horário de funcionamento para clientes</Label>
      </div>
      
      <div className="flex items-center space-x-2 mb-4">
        <input
          type="checkbox"
          id="allow-preorder"
          checked={scheduleConfig.allowPreOrder}
          onChange={(e) => setScheduleConfig({ ...scheduleConfig, allowPreOrder: e.target.checked })}
          className="w-4 h-4 rounded border-gray-300"
        />
        <Label htmlFor="allow-preorder">Permitir encomendas quando fechado</Label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Segunda a Sexta */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium">Segunda a Sexta</span>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="weekdays-closed"
                checked={scheduleConfig.weekdays.closed}
                onChange={(e) => setScheduleConfig({ 
                  ...scheduleConfig, 
                  weekdays: { ...scheduleConfig.weekdays, closed: e.target.checked } 
                })}
                className="w-4 h-4 rounded border-gray-300"
              />
              <Label htmlFor="weekdays-closed" className="text-sm">Fechado</Label>
            </div>
          </div>
          {!scheduleConfig.weekdays.closed && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Abre</Label>
                <Input
                  type="time"
                  value={scheduleConfig.weekdays.open}
                  onChange={(e) => setScheduleConfig({ 
                    ...scheduleConfig, 
                    weekdays: { ...scheduleConfig.weekdays, open: e.target.value } 
                  })}
                />
              </div>
              <div>
                <Label className="text-xs">Fecha</Label>
                <Input
                  type="time"
                  value={scheduleConfig.weekdays.close}
                  onChange={(e) => setScheduleConfig({ 
                    ...scheduleConfig, 
                    weekdays: { ...scheduleConfig.weekdays, close: e.target.value } 
                  })}
                />
              </div>
            </div>
          )}
        </div>

        {/* Sábado */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium">Sábado</span>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="saturday-closed"
                checked={scheduleConfig.saturday.closed}
                onChange={(e) => setScheduleConfig({ 
                  ...scheduleConfig, 
                  saturday: { ...scheduleConfig.saturday, closed: e.target.checked } 
                })}
                className="w-4 h-4 rounded border-gray-300"
              />
              <Label htmlFor="saturday-closed" className="text-sm">Fechado</Label>
            </div>
          </div>
          {!scheduleConfig.saturday.closed && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Abre</Label>
                <Input
                  type="time"
                  value={scheduleConfig.saturday.open}
                  onChange={(e) => setScheduleConfig({ 
                    ...scheduleConfig, 
                    saturday: { ...scheduleConfig.saturday, open: e.target.value } 
                  })}
                />
              </div>
              <div>
                <Label className="text-xs">Fecha</Label>
                <Input
                  type="time"
                  value={scheduleConfig.saturday.close}
                  onChange={(e) => setScheduleConfig({ 
                    ...scheduleConfig, 
                    saturday: { ...scheduleConfig.saturday, close: e.target.value } 
                  })}
                />
              </div>
            </div>
          )}
        </div>

        {/* Domingo */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium">Domingo</span>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sunday-closed"
                checked={scheduleConfig.sunday.closed}
                onChange={(e) => setScheduleConfig({ 
                  ...scheduleConfig, 
                  sunday: { ...scheduleConfig.sunday, closed: e.target.checked } 
                })}
                className="w-4 h-4 rounded border-gray-300"
              />
              <Label htmlFor="sunday-closed" className="text-sm">Fechado</Label>
            </div>
          </div>
          {!scheduleConfig.sunday.closed && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Abre</Label>
                <Input
                  type="time"
                  value={scheduleConfig.sunday.open}
                  onChange={(e) => setScheduleConfig({ 
                    ...scheduleConfig, 
                    sunday: { ...scheduleConfig.sunday, open: e.target.value } 
                  })}
                />
              </div>
              <div>
                <Label className="text-xs">Fecha</Label>
                <Input
                  type="time"
                  value={scheduleConfig.sunday.close}
                  onChange={(e) => setScheduleConfig({ 
                    ...scheduleConfig, 
                    sunday: { ...scheduleConfig.sunday, close: e.target.value } 
                  })}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    <Button onClick={handleSaveScheduleConfig} className="mt-4">Salvar Horário de Funcionamento</Button>
  </div>
  
  <div className="border-t pt-6">
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
