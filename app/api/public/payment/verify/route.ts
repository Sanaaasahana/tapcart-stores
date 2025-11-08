import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is not set")
  return neon(url)
}

// Verify payment using store's Razorpay account
export async function POST(request: NextRequest) {
  try {
    const { storeId, orderId, paymentId, signature, amount } = await request.json()

    if (!storeId || !orderId || !paymentId || !signature) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 })
    }

    // Get store's Razorpay credentials
    const sql = getSql()
    const stores = await sql`
      SELECT razorpay_key_id, razorpay_key_secret
      FROM stores
      WHERE store_id = ${storeId}
      LIMIT 1
    `

    if (stores.length === 0) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 })
    }

    const store = stores[0] as any
    const razorpayKeySecret = store.razorpay_key_secret || process.env.RAZORPAY_KEY_SECRET

    if (!razorpayKeySecret) {
      return NextResponse.json(
        { error: "Payment gateway not configured for this store" },
        { status: 500 }
      )
    }

    // In production, verify with Razorpay using store's credentials:
    /*
    const crypto = require('crypto')
    const Razorpay = require('razorpay')
    const razorpay = new Razorpay({
      key_id: store.razorpay_key_id || process.env.RAZORPAY_KEY_ID,
      key_secret: razorpayKeySecret
    })

    // Verify signature
    const text = orderId + '|' + paymentId
    const generatedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(text)
      .digest('hex')

    if (generatedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    // Verify payment with Razorpay
    const payment = await razorpay.payments.fetch(paymentId)
    if (payment.status !== 'captured' && payment.status !== 'authorized') {
      return NextResponse.json({ error: "Payment not successful" }, { status: 400 })
    }
    */

    // For demo, accept all payments
    // In production, uncomment the Razorpay verification code above
    const transactionId = paymentId || `txn_${storeId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    return NextResponse.json({
      success: true,
      transactionId,
      orderId,
      paymentId,
      amount,
    })
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}

