'use server'

import { stripe } from '@/lib/stripe'

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  extras?: Array<{ name: string; price: number }>
}

interface CheckoutData {
  items: CartItem[]
  subtotal: number
  deliveryFee: number
  total: number
  customerName: string
  customerPhone: string
  customerAddress: string
  observations?: string
  isPreOrder?: boolean
}

export async function createCheckoutSession(data: CheckoutData) {
  const origin = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  // Create line items for Stripe
  const lineItems = data.items.map((item) => {
    const extrasTotal = item.extras?.reduce((sum, extra) => sum + extra.price, 0) || 0
    const itemTotal = (item.price + extrasTotal) * 100 // Convert to cents

    let description = `Quantidade: ${item.quantity}`
    if (item.extras && item.extras.length > 0) {
      description += ` | Extras: ${item.extras.map(e => e.name).join(', ')}`
    }

    return {
      price_data: {
        currency: 'brl',
        product_data: {
          name: item.name,
          description,
        },
        unit_amount: Math.round(itemTotal),
      },
      quantity: item.quantity,
    }
  })

  // Add delivery fee if applicable
  if (data.deliveryFee > 0) {
    lineItems.push({
      price_data: {
        currency: 'brl',
        product_data: {
          name: 'Taxa de Entrega',
          description: 'Entrega no endereço informado',
        },
        unit_amount: Math.round(data.deliveryFee * 100),
      },
      quantity: 1,
    })
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: lineItems,
    metadata: {
      customer_name: data.customerName,
      customer_phone: data.customerPhone,
      customer_address: data.customerAddress,
      observations: data.observations || '',
      is_pre_order: data.isPreOrder ? 'true' : 'false',
      items_json: JSON.stringify(data.items),
      subtotal: data.subtotal.toString(),
      delivery_fee: data.deliveryFee.toString(),
      total: data.total.toString(),
    },
    redirect_on_completion: 'never',
  })

  return {
    clientSecret: session.client_secret,
    sessionId: session.id,
  }
}

export async function getCheckoutSession(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  return {
    status: session.status,
    paymentStatus: session.payment_status,
    customerEmail: session.customer_details?.email,
  }
}
