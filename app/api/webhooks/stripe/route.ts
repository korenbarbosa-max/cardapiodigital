import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createOrder } from "@/lib/database"
import type Stripe from "stripe"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error("[v0] Webhook signature verification failed:", error)
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session

    if (session.payment_status === "paid") {
      try {
        const metadata = session.metadata || {}
        const items = metadata.items_json ? JSON.parse(metadata.items_json) : []

        await createOrder({
          customer_name: metadata.customer_name || "",
          customer_phone: metadata.customer_phone || "",
          customer_address: metadata.customer_address || "",
          payment_method: "cartao-online",
          notes: metadata.is_pre_order === "true" 
            ? `[ENCOMENDA] ${metadata.observations || ""}`
            : metadata.observations || "",
          items,
          total: Number(metadata.total) || (session.amount_total ? session.amount_total / 100 : 0),
          status: "pago",
        })

        console.log("[v0] Order created from webhook for session:", session.id)
      } catch (error) {
        console.error("[v0] Error creating order from webhook:", error)
      }
    }
  }

  return NextResponse.json({ received: true })
}
