import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is not set")
  return neon(url)
}

// Create payment order using store's Razorpay account
export async function POST(request: NextRequest) {
  try {
    const { storeId, amount, currency = "INR" } = await request.json()

    if (!storeId || !amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid storeId or amount" }, { status: 400 })
    }

    // Get store's Razorpay credentials
    const sql = getSql()
    const stores = await sql`
      SELECT razorpay_key_id, razorpay_key_secret, status
      FROM stores
      WHERE store_id = ${storeId}
      LIMIT 1
    `

    if (stores.length === 0) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 })
    }

    const store = stores[0] as any

    if (store.status !== "approved") {
      return NextResponse.json({ error: "Store not approved" }, { status: 403 })
    }

    // Convert amount to paise (Razorpay uses paise as the smallest currency unit)
    const amountInPaise = Math.round(amount * 100)

    // If store has Razorpay keys, use them; otherwise use default/fallback
    const razorpayKeyId = store.razorpay_key_id || process.env.RAZORPAY_KEY_ID
    const razorpayKeySecret = store.razorpay_key_secret || process.env.RAZORPAY_KEY_SECRET

    if (!razorpayKeyId || !razorpayKeySecret) {
      return NextResponse.json(
        { error: "Payment gateway not configured for this store" },
        { status: 500 }
      )
    }

    // In production, use Razorpay SDK with store's credentials:
    /*
    const Razorpay = require('razorpay')
    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret
    })

    const options = {
      amount: amountInPaise,
      currency: currency,
      receipt: `receipt_${storeId}_${Date.now()}`,
      notes: {
        store_id: storeId
      }
    }

    const order = await razorpay.orders.create(options)
    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: razorpayKeyId, // Return key for client-side integration
    })
    */

    // For demo, return a mock order ID
    // In production, uncomment the Razorpay code above
    const orderId = `order_${storeId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    return NextResponse.json({
      success: true,
      orderId,
      amount: amountInPaise,
      currency,
      key: razorpayKeyId, // Return store's Razorpay key for client-side
    })
  } catch (error) {
    console.error("Payment order creation error:", error)
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 })
  }
}

