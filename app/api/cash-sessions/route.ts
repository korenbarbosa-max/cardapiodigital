import { NextResponse } from "next/server"
import {
  getActiveCashSession,
  getCashSessions,
  openCashSession,
  closeCashSession,
  getCashTransactionsBySession,
} from "@/lib/database"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")
    const sessionId = searchParams.get("sessionId")

    if (action === "active") {
      const session = await getActiveCashSession()
      return NextResponse.json(session)
    }

    if (action === "transactions" && sessionId) {
      const transactions = await getCashTransactionsBySession(Number(sessionId))
      return NextResponse.json(transactions)
    }

    const sessions = await getCashSessions()
    return NextResponse.json(sessions)
  } catch (error) {
    console.error("Error fetching cash sessions:", error)
    return NextResponse.json({ error: "Failed to fetch cash sessions" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const session = await openCashSession(body)
    return NextResponse.json(session)
  } catch (error: any) {
    console.error("Error opening cash session:", error)
    return NextResponse.json({ error: error.message || "Failed to open cash session" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { sessionId, ...closeData } = body
    const session = await closeCashSession(sessionId, closeData)
    return NextResponse.json(session)
  } catch (error) {
    console.error("Error closing cash session:", error)
    return NextResponse.json({ error: "Failed to close cash session" }, { status: 500 })
  }
}
