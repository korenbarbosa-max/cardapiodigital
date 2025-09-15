import { type NextRequest, NextResponse } from "next/server"
import { getCashTransactions, createCashTransaction, getCashBalance } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    if (action === "balance") {
      const balance = await getCashBalance()
      return NextResponse.json({ balance })
    }

    const transactions = await getCashTransactions()
    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching cash data:", error)
    return NextResponse.json({ error: "Failed to fetch cash data" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const transaction = await createCashTransaction(body)
    return NextResponse.json(transaction)
  } catch (error) {
    console.error("Error creating cash transaction:", error)
    return NextResponse.json({ error: "Failed to create cash transaction" }, { status: 500 })
  }
}
