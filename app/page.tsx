"use client"

import { useState, useEffect } from "react"
// Atualizado em 04/02/2026
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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

export default function DigitalMenu() {
  const [cart, setCart] = useState<{ [key: string]: { quantity: number; extras: { name: string; price: number }[] } }>(
    {},
  )
  const [selectedExtras, setSelectedExtras] = useState<{ [key: number]: { name: string; price: number }[] }>({})
  const [showExtrasModal, setShowExtrasModal] = useState<number | null>(null)
  const [activeCategory, setActiveCategory] = useState("Entradas")
  const [showCheckout, setShowCheckout] = useState(false)
  const [showOrderSuccess, setShowOrderSuccess] = useState(false)
  const [showOrderCompleted, setShowOrderCompleted] = useState(false)
  const [lastOrder, setLastOrder] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [customerData, setCustomerData] = useState({
    name: "",
    phone: "",
    address: "",
    paymentMethod: "",
    observations: "",
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)

        // Load products from database
        const productsResponse = await fetch("/api/products?visible=true") // Carregando apenas produtos visíveis
        if (productsResponse.ok) {
          const productsData = await productsResponse.json()
          setProducts(productsData)

          // Load categories from database
          const categoriesResponse = await fetch("/api/categories")
          if (categoriesResponse.ok) {
            const categoriesData = await categoriesResponse.json()

            const uniqueCategories = Array.from(
              new Set(
                productsData.filter((product: any) => product.visible).map((product: any) => product.category_name),
              ),
            ).filter(Boolean)

            setCategories(uniqueCategories)

            if (uniqueCategories.length > 0) {
              setActiveCategory(uniqueCategories[0])
            }
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        // Fallback to localStorage if API fails
        const savedProducts = localStorage.getItem("menuProducts")
        if (savedProducts) {
          const parsedProducts = JSON.parse(savedProducts)
          setProducts(parsedProducts)
          const uniqueCategories = Array.from(
            new Set(
              parsedProducts.filter((product: any) => product.visibleInMenu).map((product: any) => product.category),
            ),
          )
          setCategories(uniqueCategories)
          if (uniqueCategories.length > 0) {
            setActiveCategory(uniqueCategories[0])
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const visibleProducts = products.filter(
    (product) => product.visible, // Usando visible ao invés de visible_in_menu
  )

  const getProductsByCategory = (category: string) => {
    return visibleProducts.filter((product) => product.category_name === category) // Usando category_name
  }

  const addToCartWithExtras = (itemId: number, extras: { name: string; price: number }[] = []) => {
    const cartKey = `${itemId}-${JSON.stringify(extras.sort((a, b) => a.name.localeCompare(b.name)))}`
    setCart((prev) => ({
      ...prev,
      [cartKey]: {
        quantity: (prev[cartKey]?.quantity || 0) + 1,
        extras: extras,
      },
    }))
    setShowExtrasModal(null)
    setSelectedExtras((prev) => ({ ...prev, [itemId]: [] }))
  }

  const removeFromCart = (cartKey: string) => {
    setCart((prev) => {
      const newCart = { ...prev }
      if (newCart[cartKey].quantity > 1) {
        newCart[cartKey].quantity--
      } else {
        delete newCart[cartKey]
      }
      return newCart
    })
  }

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [cartKey, cartItem]) => {
      const itemId = Number.parseInt(cartKey.split("-")[0])
      const item = visibleProducts.find((item) => item.id === itemId)
      if (!item) return total

      const itemPrice = item.price
      const extrasPrice = cartItem.extras.reduce((sum, extra) => sum + extra.price, 0)
      return total + (itemPrice + extrasPrice) * cartItem.quantity
    }, 0)
  }

  const getCartItemCount = () => {
    return Object.values(cart).reduce((total, cartItem) => total + cartItem.quantity, 0)
  }

  const toggleExtra = (itemId: number, extra: { name: string; price: number }) => {
    setSelectedExtras((prev) => {
      const current = prev[itemId] || []
      const exists = current.find((e) => e.name === extra.name)

      if (exists) {
        return {
          ...prev,
          [itemId]: current.filter((e) => e.name !== extra.name),
        }
      } else {
        return {
          ...prev,
          [itemId]: [...current, extra],
        }
      }
    })
  }

  const handleFinishOrder = async () => {
    if (Object.keys(cart).length === 0) return

    const orderData = {
      customer_name: customerData.name,
      customer_phone: customerData.phone,
      customer_address: customerData.address,
      payment_method: customerData.paymentMethod,
      notes: customerData.observations,
      items: Object.entries(cart).map(([cartKey, cartItem]) => {
        const itemId = Number.parseInt(cartKey.split("-")[0])
        const item = visibleProducts.find((item) => item.id === itemId)
        return {
          id: itemId,
          name: item?.name,
          price: item?.price,
          quantity: cartItem.quantity,
          extras: cartItem.extras,
        }
      }),
      total: getCartTotal(),
      status: "pendente",
    }

    console.log("[v0] Enviando pedido:", orderData)

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      console.log("[v0] Response status:", response.status)

      const responseData = await response.json()
      console.log("[v0] Response data:", responseData)

      if (response.ok) {
        setLastOrder(responseData)
        setCart({})
        setShowCheckout(false)
        setShowOrderSuccess(true)
      } else {
        console.error("[v0] Erro na API:", responseData)
        // Fallback to localStorage if API fails
        const order = {
          id: Date.now(),
          ...orderData,
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
    } catch (error) {
      console.error("[v0] Erro ao salvar pedido:", error)
      // Fallback to localStorage
      const order = {
        id: Date.now(),
        ...orderData,
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
  }

  const sendToWhatsApp = () => {
    const whatsappConfig = JSON.parse(
      localStorage.getItem("whatsappConfig") || '{"phone":"","message":"Olá! Gostaria de fazer o seguinte pedido:"}',
    )

    if (whatsappConfig.phone && lastOrder) {
      let message = `${whatsappConfig.message}\n\n`
      message += `*PEDIDO #${lastOrder.id}*\n\n`
      message += `*Cliente:* ${lastOrder.customer_name || customerData.name}\n`
      message += `*Telefone:* ${lastOrder.customer_phone || customerData.phone}\n`

      if (customerData.address) {
        message += `*Endereço:* ${customerData.address}\n`
      }
      if (customerData.paymentMethod) {
        message += `*Pagamento:* ${customerData.paymentMethod}\n`
      }

      message += `\n*ITENS:*\n`

      lastOrder.items.forEach((item: any) => {
        const itemTotal = item.price * item.quantity
        const extrasTotal =
          item.extras && item.extras.length > 0
            ? item.extras.reduce((sum: number, extra: any) => sum + (extra.price || 0), 0) * item.quantity
            : 0

        message += `• ${item.quantity}x ${item.name} - R$ ${(itemTotal + extrasTotal).toFixed(2)}`
        if (item.extras && item.extras.length > 0) {
          message += ` (+ ${item.extras.map((extra: any) => `${extra.name}`).join(", ")})`
        }
        message += `\n`
      })

      message += `\n*TOTAL: R$ ${lastOrder.total.toFixed(2)}*\n`

      if (customerData.observations) {
        message += `\n*Observações:* ${customerData.observations}`
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando cardápio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <header className="bg-white shadow-sm border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center">
                <img src="/logo-bom-pastel.png" alt="Bom Pastel" className="h-10 sm:h-12 w-auto" />
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/admin">
                <Button
                  variant="outline"
                  size="sm"
                  className="px-3 sm:px-4 h-9 border-orange-500 text-orange-600 hover:bg-orange-50 bg-transparent"
                >
                  <Settings className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              </Link>

              <div className="relative">
                <button
                  onClick={() => setShowCheckout(true)}
                  style={{
                    background: "linear-gradient(to right, #f97316, #dc2626) !important",
                    color: "#ffffff !important",
                    border: "none !important",
                  }}
                  className="inline-flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap rounded-md text-xs sm:text-sm font-medium transition-all h-9 px-2 sm:px-4 py-2 shadow-sm hover:opacity-90"
                >
                  <ShoppingCart className="w-4 h-4" style={{ color: "#ffffff !important" }} />
                  <span style={{ color: "#ffffff !important" }} className="hidden xs:inline">
                    Carrinho
                  </span>
                  <span style={{ color: "#ffffff !important" }}>({getCartItemCount()})</span>
                </button>
                {getCartItemCount() > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white h-5 w-5 flex items-center justify-center text-xs p-0">
                    {getCartItemCount()}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8">
          <div className="lg:col-span-3">
            {isLoading ? (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
                  <h2 className="text-xl font-semibold text-gray-800">Carregando cardapio...</h2>
                  <p className="text-gray-600">Aguarde enquanto buscamos os produtos</p>
                </div>
              </Card>
            ) : categories.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                    <Settings className="w-10 h-10 text-orange-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Cardapio em Configuracao</h2>
                  <p className="text-gray-600 max-w-md">
                    Nenhum produto cadastrado ainda. Acesse o painel administrativo para adicionar categorias e produtos ao cardapio.
                  </p>
                  <Link href="/admin">
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                      <Settings className="w-4 h-4 mr-2" />
                      Acessar Painel Admin
                    </Button>
                  </Link>
                </div>
              </Card>
            ) : (
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
              <div className="relative mb-4 sm:mb-8">
                <TabsList className="w-full flex overflow-x-auto scrollbar-hide gap-1 sm:gap-2 h-auto p-1">
                  {categories.map((category) => (
                    <TabsTrigger
                      key={category}
                      value={category}
                      className="text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap flex-shrink-0"
                    >
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {categories.map((category) => (
                <TabsContent key={category} value={category}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
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
                        <CardHeader className="flex-grow p-3 sm:p-4">
                          <div className="flex justify-between items-start gap-2 sm:gap-3">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-base sm:text-lg leading-tight truncate">{item.name}</CardTitle>
                              <CardDescription className="mt-1 sm:mt-2 text-xs sm:text-sm line-clamp-2 text-gray-600">
                                {item.description}
                              </CardDescription>
                            </div>
                            <Badge
                              variant="secondary"
                              className="text-base sm:text-lg font-bold whitespace-nowrap bg-orange-100 text-orange-800"
                            >
                              R$ {item.price.toFixed(2)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0 p-3 sm:p-4">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center space-x-1 sm:space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeFromCart(`${item.id}-${JSON.stringify([])}`)}
                                disabled={!cart[`${item.id}-${JSON.stringify([])}`]}
                                className="h-8 w-8 sm:h-9 sm:w-9 p-0 touch-manipulation"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-6 sm:w-8 text-center font-medium text-sm sm:text-base">
                                {cart[`${item.id}-${JSON.stringify([])}`]?.quantity || 0}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (item.extras && item.extras.length > 0) {
                                    setShowExtrasModal(item.id)
                                  } else {
                                    addToCartWithExtras(item.id, [])
                                  }
                                }}
                                className="h-8 w-8 sm:h-9 sm:w-9 p-0 touch-manipulation"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            <button
                              onClick={() => {
                                if (item.extras && item.extras.length > 0) {
                                  setShowExtrasModal(item.id)
                                } else {
                                  addToCartWithExtras(item.id, [])
                                }
                              }}
                              className="inline-flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap rounded-md text-xs sm:text-sm font-medium transition-all h-8 sm:h-9 px-3 sm:px-4 py-2 bg-orange-600 text-white hover:bg-orange-700 touch-manipulation"
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
            )}
          </div>

          <div className="hidden lg:block">
            <Card className="sticky top-20">
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
                    {Object.entries(cart).map(([cartKey, cartItem]) => {
                      const itemId = Number.parseInt(cartKey.split("-")[0])
                      const item = visibleProducts.find((item) => item.id === itemId)
                      if (!item) return null

                      const extrasPrice = cartItem.extras.reduce((sum, extra) => sum + extra.price, 0)
                      const totalItemPrice = (item.price + extrasPrice) * cartItem.quantity

                      return (
                        <div key={cartKey} className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.name}</p>
                            {cartItem.extras.length > 0 && (
                              <p className="text-xs text-blue-600">+ {cartItem.extras.map((e) => e.name).join(", ")}</p>
                            )}
                            <p className="text-xs text-gray-500">
                              {cartItem.quantity}x R$ {(item.price + extrasPrice).toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(cartKey)}
                              className="h-6 w-6 p-0"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <p className="font-bold text-sm">R$ {totalItemPrice.toFixed(2)}</p>
                          </div>
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

      {Object.keys(cart).length > 0 && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
          <Button
            onClick={() => setShowCheckout(true)}
            className="w-full h-14 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-2xl text-base font-bold"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Ver Carrinho ({getCartItemCount()} itens) • R$ {getCartTotal().toFixed(2)}
          </Button>
        </div>
      )}

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
                    {item.extras.length > 0 && <span>+ {item.extras.map((extra: any) => extra.name).join(", ")}</span>}
                    <span>
                      R${" "}
                      {(
                        item.price +
                        item.extras.reduce((sum: number, extra: any) => sum + (extra.price || 0), 0) * item.quantity
                      ).toFixed(2)}
                    </span>
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
                  <span>Forma de Pagamento *</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "dinheiro", label: "Dinheiro" },
                    { value: "pix", label: "PIX" },
                    { value: "cartao-debito", label: "Cartão Débito" },
                    { value: "cartao-credito", label: "Cartão Crédito" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setCustomerData({ ...customerData, paymentMethod: option.value })}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        customerData.paymentMethod === option.value
                          ? "border-orange-500 bg-orange-50 text-orange-700"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
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
                {Object.entries(cart).map(([cartKey, cartItem]) => {
                  const itemId = Number.parseInt(cartKey.split("-")[0])
                  const item = visibleProducts.find((item) => item.id === itemId)
                  if (!item) return null
                  return (
                    <div key={cartKey} className="flex justify-between text-sm">
                      <span>
                        {cartItem.quantity}x {item.name}
                      </span>
                      {cartItem.extras.length > 0 && (
                        <span>+ {cartItem.extras.map((extra: any) => extra.name).join(", ")}</span>
                      )}
                      <span>
                        R${" "}
                        {(
                          item.price +
                          cartItem.extras.reduce((sum: number, extra: any) => sum + (extra.price || 0), 0) *
                            cartItem.quantity
                        ).toFixed(2)}
                      </span>
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

      {showExtrasModal &&
        (() => {
          const item = visibleProducts.find((p) => p.id === showExtrasModal)

          return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Personalizar Produto</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setShowExtrasModal(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(() => {
                    if (!item) return null

                    return (
                      <>
                        <div>
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-gray-600">{item.description}</p>
                          <p className="text-lg font-bold text-orange-600">R$ {item.price.toFixed(2)}</p>
                        </div>

                        {item.extras && item.extras.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Acréscimos disponíveis:</h4>
                            <div className="space-y-2">
                              {item.extras.map((extra, index) => (
                                <label key={index} className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={(selectedExtras[item.id] || []).some((e) => e.name === extra.name)}
                                    onChange={() => toggleExtra(item.id, extra)}
                                    className="rounded"
                                  />
                                  <span className="flex-1">{extra.name}</span>
                                  <span className="font-medium">+ R$ {extra.price.toFixed(2)}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center mb-4">
                            <span className="font-medium">Total:</span>
                            <span className="text-lg font-bold">
                              R${" "}
                              {(
                                item.price +
                                (selectedExtras[item.id] || []).reduce((sum, extra) => sum + (extra.price || 0), 0)
                              ).toFixed(2)}
                            </span>
                          </div>

                          <Button
                            className="w-full bg-orange-600 hover:bg-orange-700"
                            onClick={() => addToCartWithExtras(item.id, selectedExtras[item.id] || [])}
                          >
                            Adicionar ao Carrinho
                          </Button>
                        </div>
                      </>
                    )
                  })()}
                </CardContent>
              </Card>
            </div>
          )
        })()}
    </div>
  )
}
