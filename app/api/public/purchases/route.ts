import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is not set")
  return neon(url)
}

// Public endpoint to record a purchase and update inventory
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      storeId,
      customerName,
      customerPhone,
      items,
      totalAmount,
      transactionId,
      paymentMethod,
    } = body

    if (!storeId || !customerPhone || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: storeId, customerPhone, items" },
        { status: 400 }
      )
    }

    const sql = getSql()

    // Start transaction - we'll process all items
    // First, verify all products exist and have stock
    for (const item of items) {
      const { customId, quantity } = item
      
      if (!customId || !quantity || quantity < 1) {
        return NextResponse.json(
          { error: "Invalid item: customId and quantity required" },
          { status: 400 }
        )
      }

      // Check product exists and has stock
      const products = await sql`
        SELECT id, stock, name, price
        FROM products
        WHERE custom_id = ${customId} 
          AND store_id = ${storeId}
        LIMIT 1
      `

      if (products.length === 0) {
        return NextResponse.json(
          { error: `Product ${customId} not found` },
          { status: 404 }
        )
      }

      const product = products[0] as any
      const currentStock = product.stock || 1

      if (currentStock < quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for product ${customId}` },
          { status: 400 }
        )
      }
    }

    // Get or create customer
    let customers = await sql`
      SELECT id FROM customers
      WHERE store_id = ${storeId} AND phone = ${customerPhone}
      LIMIT 1
    `

    let customerId: number
    if (customers.length === 0) {
      // Create new customer
      const newCustomers = await sql`
        INSERT INTO customers (store_id, name, phone)
        VALUES (${storeId}, ${customerName || "Customer"}, ${customerPhone})
        RETURNING id
      `
      customerId = (newCustomers[0] as any).id
    } else {
      customerId = (customers[0] as any).id
      
      // Update customer name if provided
      if (customerName) {
        await sql`
          UPDATE customers
          SET name = ${customerName}
          WHERE id = ${customerId}
        `
      }
    }

    // Record purchases and update inventory
    const purchaseIds: number[] = []
    
    for (const item of items) {
      const { customId, quantity } = item

      // Get product details
      const products = await sql`
        SELECT id, price, name
        FROM products
        WHERE custom_id = ${customId} AND store_id = ${storeId}
        LIMIT 1
      `
      const product = products[0] as any
      const itemTotal = parseFloat(product.price) * quantity

      // Create purchase record
      const purchases = await sql`
        INSERT INTO purchases (
          store_id,
          customer_id,
          product_id,
          quantity,
          total_amount,
          transaction_id,
          payment_method
        )
        VALUES (
          ${storeId},
          ${customerId},
          ${product.id},
          ${quantity},
          ${itemTotal},
          ${transactionId || null},
          ${paymentMethod || null}
        )
        RETURNING id
      `
      purchaseIds.push((purchases[0] as any).id)

      // Update inventory (decrement stock)
      await sql`
        UPDATE products
        SET stock = GREATEST(0, COALESCE(stock, 1) - ${quantity})
        WHERE id = ${product.id} AND store_id = ${storeId}
      `
    }

    return NextResponse.json({
      success: true,
      purchaseIds,
      customerId,
      message: "Purchase recorded successfully",
    })
  } catch (err) {
    console.error("Public purchases POST error", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

