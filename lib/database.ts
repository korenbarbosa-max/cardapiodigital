import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

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
  const result = await sql`SELECT * FROM categories ORDER BY name`
  return result as Category[]
}

export async function createCategory(name: string): Promise<Category> {
  const result = await sql`
    INSERT INTO categories (name)
    VALUES (${name})
    RETURNING *
  `
  return result[0] as Category
}

export async function ensureDefaultCategories(): Promise<void> {
  const defaultCategories = ["Lanches", "Bebidas", "Sobremesas", "Pratos Principais", "Petiscos"]

  for (const categoryName of defaultCategories) {
    try {
      // Verificar se a categoria já existe
      const existing = await sql`
        SELECT id FROM categories WHERE name = ${categoryName}
      `

      // Se não existir, criar
      if (existing.length === 0) {
        await sql`
          INSERT INTO categories (name) 
          VALUES (${categoryName})
        `
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
  const result = await sql`
    UPDATE categories 
    SET name = ${newName}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  return result[0] as Category
}

export async function deleteCategory(id: number): Promise<void> {
  await sql`DELETE FROM categories WHERE id = ${id}`
}

// Funções para Produtos
export async function getProducts(): Promise<Product[]> {
  const result = await sql`
    SELECT p.*, c.name as category_name 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
    ORDER BY p.name
  `
  return result as Product[]
}

export async function getVisibleProducts(): Promise<Product[]> {
  const result = await sql`
    SELECT p.*, c.name as category_name 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
    WHERE p.visible = true 
    ORDER BY c.name, p.name
  `
  return result as Product[]
}

export async function createProduct(product: Omit<Product, "id" | "created_at" | "updated_at">): Promise<Product> {
  const result = await sql`
    INSERT INTO products (name, price, category_id, image, visible, stock_control, stock_quantity, per_kilo, extras)
    VALUES (${product.name}, ${product.price}, ${product.category_id}, ${product.image || null}, ${product.visible}, ${product.stock_control}, ${product.stock_quantity}, ${product.per_kilo}, ${JSON.stringify(product.extras)})
    RETURNING *
  `
  return result[0] as Product
}

export async function updateProduct(id: number, product: Partial<Product>): Promise<Product> {
  const result = await sql`
    UPDATE products 
    SET 
      name = COALESCE(${product.name}, name),
      price = COALESCE(${product.price}, price),
      category_id = COALESCE(${product.category_id}, category_id),
      image = COALESCE(${product.image}, image),
      visible = COALESCE(${product.visible}, visible),
      stock_control = COALESCE(${product.stock_control}, stock_control),
      stock_quantity = COALESCE(${product.stock_quantity}, stock_quantity),
      per_kilo = COALESCE(${product.per_kilo}, per_kilo),
      extras = COALESCE(${product.extras ? JSON.stringify(product.extras) : null}, extras),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  return result[0] as Product
}

export async function deleteProduct(id: number): Promise<void> {
  await sql`DELETE FROM products WHERE id = ${id}`
}

// Funções para Pedidos
export async function getOrders(): Promise<Order[]> {
  const result = await sql`SELECT * FROM orders ORDER BY created_at DESC`
  return result as Order[]
}

export async function createOrder(order: Omit<Order, "id" | "created_at" | "updated_at">): Promise<Order> {
  const result = await sql`
    INSERT INTO orders (customer_name, customer_phone, items, total, status)
    VALUES (${order.customer_name || null}, ${order.customer_phone || null}, ${JSON.stringify(order.items)}, ${order.total}, ${order.status})
    RETURNING *
  `
  return result[0] as Order
}

export async function updateOrderStatus(id: number, status: string): Promise<Order> {
  const result = await sql`
    UPDATE orders 
    SET status = ${status}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  return result[0] as Order
}

// Funções para Transações de Caixa
export async function getCashTransactions(): Promise<CashTransaction[]> {
  const result = await sql`SELECT * FROM cash_transactions ORDER BY created_at DESC`
  return result as CashTransaction[]
}

export async function createCashTransaction(
  transaction: Omit<CashTransaction, "id" | "created_at">,
): Promise<CashTransaction> {
  const result = await sql`
    INSERT INTO cash_transactions (type, amount, description)
    VALUES (${transaction.type}, ${transaction.amount}, ${transaction.description || null})
    RETURNING *
  `
  return result[0] as CashTransaction
}

export async function getCashBalance(): Promise<number> {
  const result = await sql`
    SELECT 
      COALESCE(SUM(CASE WHEN type = 'entrada' THEN amount ELSE 0 END), 0) -
      COALESCE(SUM(CASE WHEN type = 'saida' THEN amount ELSE 0 END), 0) as balance
    FROM cash_transactions
  `
  return Number(result[0]?.balance || 0)
}
