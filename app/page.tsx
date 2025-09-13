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
  ShoppingCart,
  Plus,
  Minus,
  Settings,
  X,
  CreditCard,
  MapPin,
  User,
  MessageCircle,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"

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

export default function DigitalMenu() {
  const [cart, setCart] = useState<{ [key: number]: number }>({})
  const [activeCategory, setActiveCategory] = useState("Entradas")
  const [showCheckout, setShowCheckout] = useState(false)
  const [showOrderSuccess, setShowOrderSuccess] = useState(false)
  const [showOrderCompleted, setShowOrderCompleted] = useState(false)
  const [lastOrder, setLastOrder] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [customerData, setCustomerData] = useState({
    name: "",
    phone: "",
    address: "",
    paymentMethod: "",
    observations: "",
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedProducts = localStorage.getItem("products")
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts))
      } else {
        setProducts(initialMenuProducts)
        localStorage.setItem("products", JSON.stringify(initialMenuProducts))
      }
    }
  }, [])

  const visibleProducts = products.filter((product) => product.visibleInMenu && product.status === "ativo")

  const categories = Array.from(new Set(visibleProducts.map((product) => product.category)))

  const getProductsByCategory = (category: string) => {
    return visibleProducts.filter((product) => product.category === category)
  }

  const addToCart = (itemId: number) => {
    setCart((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }))
  }

  const removeFromCart = (itemId: number) => {
    setCart((prev) => {
      const newCart = { ...prev }
      if (newCart[itemId] > 1) {
        newCart[itemId]--
      } else {
        delete newCart[itemId]
      }
      return newCart
    })
  }

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [itemId, quantity]) => {
      const item = visibleProducts.find((item) => item.id === Number.parseInt(itemId))
      return total + (item?.price || 0) * quantity
    }, 0)
  }

  const getCartItemCount = () => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0)
  }

  const handleFinishOrder = () => {
    if (Object.keys(cart).length === 0) return

    const order = {
      id: Date.now(),
      items: Object.entries(cart).map(([itemId, quantity]) => {
        const item = visibleProducts.find((item) => item.id === Number.parseInt(itemId))
        return {
          id: Number.parseInt(itemId),
          name: item?.name,
          price: item?.price,
          quantity,
        }
      }),
      customer: customerData,
      total: getCartTotal(),
      status: "pendente",
      timestamp: new Date().toISOString(),
    }

    const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]")
    existingOrders.push(order)
    localStorage.setItem("orders", JSON.stringify(existingOrders))

    setLastOrder(order)
    setCart({})
    setShowCheckout(false)
    setShowOrderSuccess(true)
  }

  const sendToWhatsApp = () => {
    const whatsappConfig = JSON.parse(
      localStorage.getItem("whatsappConfig") || '{"phone":"","message":"Olá! Gostaria de fazer o seguinte pedido:"}',
    )

    if (whatsappConfig.phone && lastOrder) {
      let message = `${whatsappConfig.message}\n\n`
      message += `*PEDIDO #${lastOrder.id}*\n\n`
      message += `*Cliente:* ${lastOrder.customer.name}\n`
      message += `*Telefone:* ${lastOrder.customer.phone}\n`
      message += `*Endereço:* ${lastOrder.customer.address}\n`
      message += `*Pagamento:* ${lastOrder.customer.paymentMethod}\n\n`
      message += `*ITENS:*\n`

      lastOrder.items.forEach((item: any) => {
        message += `• ${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}\n`
      })

      message += `\n*TOTAL: R$ ${lastOrder.total.toFixed(2)}*\n`

      if (lastOrder.customer.observations) {
        message += `\n*Observações:* ${lastOrder.customer.observations}`
      }

      const encodedMessage = encodeURIComponent(message)
      const whatsappUrl = `https://wa.me/${whatsappConfig.phone}?text=${encodedMessage}`

      window.open(whatsappUrl, "_blank")
    }

    setShowOrderSuccess(false)
    setShowOrderCompleted(true)

    setTimeout(() => {
      setShowOrderCompleted(false)
      setLastOrder(null)
      setCustomerData({
        name: "",
        phone: "",
        address: "",
        paymentMethod: "",
        observations: "",
      })
    }, 3000)
  }

  const closeOrderSuccess = () => {
    setShowOrderSuccess(false)
    setShowOrderCompleted(true)

    setTimeout(() => {
      setShowOrderCompleted(false)
      setLastOrder(null)
      setCustomerData({
        name: "",
        phone: "",
        address: "",
        paymentMethod: "",
        observations: "",
      })
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <header className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <img src="/logo-bom-pastel.png" alt="Bom Pastel - Sabor Inigualável" className="h-12 w-auto" />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              </Link>

              <div className="relative">
                <button
                  style={{
                    background: "linear-gradient(to right, #f97316, #dc2626) !important",
                    color: "#ffffff !important",
                    border: "none !important",
                  }}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all h-9 px-4 py-2 shadow-sm hover:opacity-90"
                >
                  <ShoppingCart className="w-4 h-4" style={{ color: "#ffffff !important" }} />
                  <span style={{ color: "#ffffff !important" }}>Carrinho ({getCartItemCount()})</span>
                </button>
                {getCartItemCount() > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">{getCartItemCount()}</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
              <TabsList
                className="grid w-full mb-8"
                style={{ gridTemplateColumns: `repeat(${categories.length}, minmax(0, 1fr))` }}
              >
                {categories.map((category) => (
                  <TabsTrigger key={category} value={category} className="text-sm px-4 py-2">
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>

              {categories.map((category) => (
                <TabsContent key={category} value={category}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {getProductsByCategory(category).map((item) => (
                      <Card
                        key={item.id}
                        className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full"
                      >
                        <div className="aspect-[4/3] relative bg-gray-100 overflow-hidden">
                          <img
                            src={item.image || "/placeholder.svg?height=240&width=320&query=delicious food dish"}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform hover:scale-105"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/delicious-food-dish.png"
                            }}
                          />
                        </div>
                        <CardHeader className="flex-grow p-4">
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg leading-tight truncate">{item.name}</CardTitle>
                              <CardDescription className="mt-2 text-sm line-clamp-2 text-gray-600">
                                {item.description}
                              </CardDescription>
                            </div>
                            <Badge
                              variant="secondary"
                              className="text-lg font-bold whitespace-nowrap bg-orange-100 text-orange-800"
                            >
                              R$ {item.price.toFixed(2)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0 p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeFromCart(item.id)}
                                disabled={!cart[item.id]}
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-8 text-center font-medium">{cart[item.id] || 0}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addToCart(item.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            <button
                              onClick={() => addToCart(item.id)}
                              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all h-9 px-4 py-2 bg-orange-600 text-white hover:bg-orange-700 focus:bg-orange-700 active:bg-orange-800"
                              style={{
                                backgroundColor: "#ea580c !important",
                                color: "#ffffff !important",
                                border: "none !important",
                              }}
                            >
                              Adicionar
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Seu Pedido
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(cart).length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Carrinho vazio</p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(cart).map(([itemId, quantity]) => {
                      const item = visibleProducts.find((item) => item.id === Number.parseInt(itemId))
                      if (!item) return null

                      return (
                        <div key={itemId} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-gray-500">
                              {quantity}x R$ {item.price.toFixed(2)}
                            </p>
                          </div>
                          <p className="font-bold">R$ {(item.price * quantity).toFixed(2)}</p>
                        </div>
                      )
                    })}

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span>Total:</span>
                        <span>R$ {getCartTotal().toFixed(2)}</span>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                      onClick={() => setShowCheckout(true)}
                    >
                      Finalizar Pedido
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {showOrderSuccess && lastOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-xl text-green-600">Pedido Realizado!</CardTitle>
              <CardDescription>Seu pedido #{lastOrder.id} foi registrado com sucesso.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <h4 className="font-medium text-sm">Resumo:</h4>
                {lastOrder.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-sm border-t pt-2">
                  <span>Total:</span>
                  <span>R$ {lastOrder.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-gray-600 text-center">O que você gostaria de fazer agora?</p>

                <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={sendToWhatsApp}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Enviar pelo WhatsApp
                </Button>

                <Button variant="outline" className="w-full bg-transparent" onClick={closeOrderSuccess}>
                  Finalizar sem WhatsApp
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Seu pedido já foi registrado e pode ser acompanhado pela área administrativa.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {showOrderCompleted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-xl text-green-600">Pedido Concluído com Sucesso!</CardTitle>
              <CardDescription>
                Obrigado pela preferência! Seu pedido foi registrado e será preparado em breve.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-gray-600">Esta mensagem será fechada automaticamente em alguns segundos.</p>
            </CardContent>
          </Card>
        </div>
      )}

      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Finalizar Pedido
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowCheckout(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <User className="w-4 h-4" />
                  <span>Dados do Cliente</span>
                </div>

                <div>
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={customerData.name}
                    onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <MapPin className="w-4 h-4" />
                  <span>Endereço de Entrega</span>
                </div>

                <div>
                  <Label htmlFor="address">Endereço Completo *</Label>
                  <Textarea
                    id="address"
                    value={customerData.address}
                    onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
                    placeholder="Rua, número, bairro, cidade..."
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <CreditCard className="w-4 h-4" />
                  <span>Forma de Pagamento</span>
                </div>

                <Select
                  value={customerData.paymentMethod}
                  onValueChange={(value) => setCustomerData({ ...customerData, paymentMethod: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a forma de pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="cartao-debito">Cartão de Débito</SelectItem>
                    <SelectItem value="cartao-credito">Cartão de Crédito</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="observations">Observações</Label>
                <Textarea
                  id="observations"
                  value={customerData.observations}
                  onChange={(e) => setCustomerData({ ...customerData, observations: e.target.value })}
                  placeholder="Observações sobre o pedido (opcional)"
                />
              </div>

              <div className="border-t pt-4 space-y-2">
                <h4 className="font-medium">Resumo do Pedido:</h4>
                {Object.entries(cart).map(([itemId, quantity]) => {
                  const item = visibleProducts.find((item) => item.id === Number.parseInt(itemId))
                  if (!item) return null
                  return (
                    <div key={itemId} className="flex justify-between text-sm">
                      <span>
                        {quantity}x {item.name}
                      </span>
                      <span>R$ {(item.price * quantity).toFixed(2)}</span>
                    </div>
                  )
                })}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>R$ {getCartTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowCheckout(false)}>
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  onClick={handleFinishOrder}
                  disabled={
                    !customerData.name || !customerData.phone || !customerData.address || !customerData.paymentMethod
                  }
                >
                  Confirmar Pedido
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
