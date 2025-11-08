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

    // Ensure columns exist (for backward compatibility)
    try {
      await sql`ALTER TABLE stores ADD COLUMN IF NOT EXISTS razorpay_key_id VARCHAR(255)`
      await sql`ALTER TABLE stores ADD COLUMN IF NOT EXISTS razorpay_key_secret VARCHAR(255)`
    } catch (alterError) {
      // Columns might already exist, that's fine
      console.log("Columns check:", alterError)
    }

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
  } catch (err: any) {
    console.error("Payment settings GET error:", err)
    const errorMessage = process.env.NODE_ENV === "development" 
      ? err.message || "Internal server error"
      : "Internal server error"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// Update store's payment settings
export async function PATCH(request: NextRequest) {
  try {
    const session = await getStoreSession()
    if (!session?.isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { razorpayKeyId, razorpayKeySecret } = body

    if (!razorpayKeyId) {
      return NextResponse.json(
        { error: "Razorpay Key ID is required" },
        { status: 400 }
      )
    }

    const sql = getSql()

    // Ensure columns exist (for backward compatibility)
    try {
      await sql`ALTER TABLE stores ADD COLUMN IF NOT EXISTS razorpay_key_id VARCHAR(255)`
      await sql`ALTER TABLE stores ADD COLUMN IF NOT EXISTS razorpay_key_secret VARCHAR(255)`
    } catch (alterError) {
      // Columns might already exist, that's fine
      console.log("Columns check:", alterError)
    }

    // Verify store exists first
    const storeCheck = await sql`
      SELECT store_id FROM stores WHERE store_id = ${session.storeId} LIMIT 1
    `
    
    if (storeCheck.length === 0) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      )
    }

    // If secret is provided, update both; otherwise only update key ID
    if (razorpayKeySecret && razorpayKeySecret.trim() !== "") {
      // Update both key ID and secret
      await sql`
        UPDATE stores
        SET razorpay_key_id = ${razorpayKeyId.trim()},
            razorpay_key_secret = ${razorpayKeySecret.trim()}
        WHERE store_id = ${session.storeId}
      `
    } else {
      // Only update key ID, keep existing secret
      await sql`
        UPDATE stores
        SET razorpay_key_id = ${razorpayKeyId.trim()}
        WHERE store_id = ${session.storeId}
      `
    }

    return NextResponse.json({ success: true, message: "Payment settings updated successfully" })
  } catch (err: any) {
    console.error("Payment settings PATCH error:", err)
    // Return more detailed error in development
    const errorMessage = process.env.NODE_ENV === "development" 
      ? err.message || "Internal server error"
      : "Internal server error"
    return NextResponse.json(
      { error: errorMessage, details: process.env.NODE_ENV === "development" ? err.stack : undefined },
      { status: 500 }
    )
  }
}

