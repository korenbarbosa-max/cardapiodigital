import { createClient } from "@/lib/supabase/server"

export interface Product {
  id?: number
  name: string
  price: number
  category_id: number
  image?: string
  visible: boolean
  stock_control: boolean
  stock_quantity: number
  per_kilo: boolean
  extras: Array<{ name: string; price: number }>
  created_at?: string
  updated_at?: string
  category_name?: string
}

export interface Category {
  id: number
  name: string
  created_at?: string
  updated_at?: string
}

export interface Order {
  id?: number
  customer_name?: string
  customer_phone?: string
  items: Array<{
    id: number
    name: string
    price: number
    quantity: number
    extras?: Array<{ name: string; price: number }>
  }>
  total: number
  status: string
  created_at?: string
  updated_at?: string
}

export interface CashTransaction {
  id?: number
  type: "entrada" | "saida" | "balance"
  amount: number
  description?: string
  created_at?: string
}

// Funções para Categorias
export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("categories").select("*").order("name")

  if (error) throw error
  return data as Category[]
}

export async function createCategory(name: string): Promise<Category> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("categories").insert({ name }).select().single()

  if (error) throw error
  return data as Category
}

export async function ensureDefaultCategories(): Promise<void> {
  const supabase = await createClient()
  const defaultCategories = ["Lanches", "Bebidas", "Sobremesas", "Pratos Principais", "Petiscos"]

  for (const categoryName of defaultCategories) {
    try {
      // Verificar se a categoria já existe
      const { data: existing } = await supabase.from("categories").select("id").eq("name", categoryName).single()

      // Se não existir, criar
      if (!existing) {
        await supabase.from("categories").insert({ name: categoryName })
      }
    } catch (error) {
      console.error(`Error creating category ${categoryName}:`, error)
    }
  }
}

export async function addCategory(name: string): Promise<Category> {
  return await createCategory(name)
}

export async function updateCategory(id: number, newName: string): Promise<Category> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("categories")
    .update({ name: newName, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data as Category
}

export async function deleteCategory(id: number): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from("categories").delete().eq("id", id)

  if (error) throw error
}

// Funções para Produtos
export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("products").select("*, categories(name)").order("name")

  if (error) throw error

  // Transform data to include category_name
  return data.map((item: any) => ({
    ...item,
    category_name: item.categories?.name || null,
    categories: undefined,
  })) as Product[]
}

export async function getVisibleProducts(): Promise<Product[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name)")
    .eq("visible", true)
    .order("name")

  if (error) throw error

  // Transform data to include category_name e filtrar produtos sem categoria
  return data
    .filter((item: any) => item.category_id !== null)
    .map((item: any) => ({
      ...item,
      category_name: item.categories?.name || null,
      categories: undefined,
    })) as Product[]
}

export async function createProduct(product: Omit<Product, "id" | "created_at" | "updated_at">): Promise<Product> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .insert({
      name: product.name,
      price: product.price,
      category_id: product.category_id,
      image: product.image || null,
      visible: product.visible,
      stock_control: product.stock_control,
      stock_quantity: product.stock_quantity,
      per_kilo: product.per_kilo,
      extras: product.extras,
    })
    .select()
    .single()

  if (error) throw error
  return data as Product
}

export async function updateProduct(id: number, product: Partial<Product>): Promise<Product> {
  const supabase = await createClient()

  // Build update object with only provided fields
  const updateData: any = { updated_at: new Date().toISOString() }
  if (product.name !== undefined) updateData.name = product.name
  if (product.price !== undefined) updateData.price = product.price
  if (product.category_id !== undefined) updateData.category_id = product.category_id
  if (product.image !== undefined) updateData.image = product.image
  if (product.visible !== undefined) updateData.visible = product.visible
  if (product.stock_control !== undefined) updateData.stock_control = product.stock_control
  if (product.stock_quantity !== undefined) updateData.stock_quantity = product.stock_quantity
  if (product.per_kilo !== undefined) updateData.per_kilo = product.per_kilo
  if (product.extras !== undefined) updateData.extras = product.extras

  const { data, error } = await supabase.from("products").update(updateData).eq("id", id).select().single()

  if (error) throw error
  return data as Product
}

export async function deleteProduct(id: number): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from("products").delete().eq("id", id)

  if (error) throw error
}

// Funções para Pedidos
export async function getOrders(): Promise<Order[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false })

  if (error) throw error
  return data as Order[]
}

export async function createOrder(order: Omit<Order, "id" | "created_at" | "updated_at">): Promise<Order> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("orders")
    .insert({
      customer_name: order.customer_name || null,
      customer_phone: order.customer_phone || null,
      items: order.items,
      total: order.total,
      status: order.status,
    })
    .select()
    .single()

  if (error) throw error
  return data as Order
}

export async function updateOrderStatus(id: number, status: string): Promise<Order> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data as Order
}

// Funções para Transações de Caixa
export async function getCashTransactions(): Promise<CashTransaction[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("cash_transactions").select("*").order("created_at", { ascending: false })

  if (error) throw error
  return data as CashTransaction[]
}

export async function createCashTransaction(
  transaction: Omit<CashTransaction, "id" | "created_at">,
): Promise<CashTransaction> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("cash_transactions")
    .insert({
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description || null,
    })
    .select()
    .single()

  if (error) throw error
  return data as CashTransaction
}

export async function getCashBalance(): Promise<number> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("cash_transactions").select("type, amount")

  if (error) throw error

  // Calculate balance from transactions
  const balance = data.reduce((acc, transaction) => {
    if (transaction.type === "entrada") {
      return acc + Number(transaction.amount)
    } else if (transaction.type === "saida") {
      return acc - Number(transaction.amount)
    }
    return acc
  }, 0)

  return balance
}
