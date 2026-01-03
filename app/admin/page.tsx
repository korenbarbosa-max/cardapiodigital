"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Settings, CreditCard, Banknote, Smartphone, TrendingUp, TrendingDown } from "lucide-react"

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

  const [newExtra, setNewExtra] = useState({ name: "", price: "" }) // Acréscimo para um produto específico
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

  const [activeCashSession, setActiveCashSession] = useState<any>(null)
  const [cashSessions, setCashSessions] = useState<any[]>([])
  const [openCashForm, setOpenCashForm] = useState({
    opening_amount: "",
    opened_by: "",
    opening_notes: "",
  })
  const [closeCashForm, setCloseCashForm] = useState({
    closing_amount: "",
    closed_by: "",
    closing_notes: "",
  })
  const [showOpenCashDialog, setShowOpenCashDialog] = useState(false)
  const [showCloseCashDialog, setShowCloseCashDialog] = useState(false)

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

  const [cashBalance, setCashBalance] = useState({
    newBalance: "",
    reason: "",
  })

  const [stockBalance, setStockBalance] = useState({
    productId: "",
    newStock: "",
    reason: "",
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
            },
          }
        })

        setOrders(convertedOrders)
      }
    } catch (error) {
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
  // </CHANGE>

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

      loadExtras() // Load product-specific extras from localStorage
      // loadGlobalExtras() // Load global extras - temporariamente desabilitado
      // </CHANGE>

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

  const loadActiveCashSession = async () => {
    try {
      const response = await fetch("/api/cash-sessions?action=active")
      if (response.ok) {
        const session = await response.json()
        setActiveCashSession(session)
      } else if (response.status === 404) {
        // Tabela não existe, sessões desabilitadas
        setActiveCashSession(null)
      }
    } catch (error) {
      console.log("Erro ao carregar sessão ativa:", error)
      setActiveCashSession(null)
    }
    // </CHANGE>
  }

  const loadCashSessions = async () => {
    try {
      const response = await fetch("/api/cash-sessions")
      if (response.ok) {
        const data = await response.json()
        setCashSessions(data)
      } else if (response.status === 404) {
        // Tabela não existe, sessões desabilitadas
        console.log("Sistema de sessões de caixa não disponível")
        setCashSessions([])
      }
    } catch (error) {
      console.log("Erro ao carregar sessões de caixa:", error)
      setCashSessions([])
    }
    // </CHANGE>
  }

  const handleOpenCash = async () => {
    if (!openCashForm.opening_amount) {
      alert("Por favor, informe o valor de abertura")
      return
    }

    try {
      const response = await fetch("/api/cash-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opening_amount: Number.parseFloat(openCashForm.opening_amount),
          opened_by: openCashForm.opened_by || "Administrador",
          opening_notes: openCashForm.opening_notes,
        }),
      })

      if (response.ok) {
        const session = await response.json()
        setActiveCashSession(session)
        setShowOpenCashDialog(false)
        setOpenCashForm({ opening_amount: "", opened_by: "", opening_notes: "" })
        alert("Caixa aberto com sucesso!")
        loadCashSessions()
      } else {
        const error = await response.json()
        alert(error.error || "Erro ao abrir caixa")
      }
    } catch (error) {
      console.error("Erro ao abrir caixa:", error)
      alert("Erro ao abrir caixa")
    }
  }

  const handleCloseCash = async () => {
    if (!closeCashForm.closing_amount || !activeCashSession) {
      alert("Por favor, informe o valor de fechamento")
      return
    }

    try {
      const response = await fetch("/api/cash-sessions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeCashSession.id,
          closing_amount: Number.parseFloat(closeCashForm.closing_amount),
          closed_by: closeCashForm.closed_by || "Administrador",
          closing_notes: closeCashForm.closing_notes,
        }),
      })

      if (response.ok) {
        const session = await response.json()
        setActiveCashSession(null)
        setShowCloseCashDialog(false)
        setCloseCashForm({ closing_amount: "", closed_by: "", closing_notes: "" })

        // Mostrar resumo do fechamento
        const difference = session.difference || 0
        const message = `Caixa fechado com sucesso!\n\nValor esperado: R$ ${session.expected_amount?.toFixed(2)}\nValor contado: R$ ${session.closing_amount?.toFixed(2)}\nDiferença: R$ ${difference.toFixed(2)} ${difference > 0 ? "(Sobra)" : difference < 0 ? "(Falta)" : ""}`
        alert(message)

        loadCashSessions()
      } else {
        alert("Erro ao fechar caixa")
      }
    } catch (error) {
      console.error("Erro ao fechar caixa:", error)
      alert("Erro ao fechar caixa")
    }
  }

  // Inicializa os dados ao montar o componente
  useEffect(() => {
    loadData()
    loadCashTransactions()
    loadExtras()
    // loadActiveCashSession()
    // loadCashSessions()
    // </CHANGE>

    const interval = setInterval(() => {
      loadOrders() // Poll orders
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Load cash transactions from API based on authentication
  useEffect(() => {
    if (!isAuthenticated) return
    loadCashTransactions()
  }, [isAuthenticated])

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
        console.error("Erro ao atualizar status do produto:", error)
      }
    }
  }

  return <div>{/* Component content goes here */}</div>
}

export default AdminPanel
