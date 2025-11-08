import { NextRequest, NextResponse } from "next/server"
import { getStoreSession } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is not set")
  return neon(url)
}

// Get store's payment settings
export async function GET() {
  try {
    const session = await getStoreSession()
    if (!session?.isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sql = getSql()
    const stores = await sql`
      SELECT razorpay_key_id, razorpay_key_secret
      FROM stores
      WHERE store_id = ${session.storeId}
      LIMIT 1
    `

    if (stores.length === 0) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 })
    }

    const store = stores[0] as any

    // Don't return the secret key, only indicate if it's set
    return NextResponse.json({
      hasRazorpayKey: !!store.razorpay_key_id,
      razorpayKeyId: store.razorpay_key_id || null,
      // Never return the secret key to the client
    })
  } catch (err) {
    console.error("Payment settings GET error", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Update store's payment settings
export async function PATCH(request: NextRequest) {
  try {
    const session = await getStoreSession()
    if (!session?.isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { razorpayKeyId, razorpayKeySecret } = await request.json()

    if (!razorpayKeyId || !razorpayKeySecret) {
      return NextResponse.json(
        { error: "Razorpay Key ID and Secret are required" },
        { status: 400 }
      )
    }

    const sql = getSql()

    // Update store's Razorpay credentials
    await sql`
      UPDATE stores
      SET razorpay_key_id = ${razorpayKeyId},
          razorpay_key_secret = ${razorpayKeySecret}
      WHERE store_id = ${session.storeId}
    `

    return NextResponse.json({ success: true, message: "Payment settings updated" })
  } catch (err) {
    console.error("Payment settings PATCH error", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

