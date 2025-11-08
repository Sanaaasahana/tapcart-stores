import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is not set")
  return neon(url)
}

// Public endpoint to get product by custom_id and store_id
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customId = searchParams.get("customId")
    const storeId = searchParams.get("storeId")

    if (!customId || !storeId) {
      return NextResponse.json(
        { error: "customId and storeId are required" },
        { status: 400 }
      )
    }

    const sql = getSql()

    // Fetch product by custom_id and store_id
    const products = await sql`
      SELECT 
        id,
        store_id,
        name,
        custom_id,
        (price::float8) as price,
        COALESCE(stock, 1)::int as stock,
        COALESCE(category, 'General') as category
      FROM products
      WHERE custom_id = ${customId} 
        AND store_id = ${storeId}
        AND COALESCE(stock, 1) > 0
      LIMIT 1
    `

    if (products.length === 0) {
      return NextResponse.json(
        { error: "Product not found or out of stock" },
        { status: 404 }
      )
    }

    const product = products[0] as any

    // Return product with image placeholder
    return NextResponse.json({
      id: product.custom_id || product.id.toString(),
      productId: product.id,
      storeId: product.store_id,
      name: product.name,
      price: parseFloat(product.price),
      stock: product.stock,
      category: product.category,
      image: "/diverse-products-still-life.png", // Default image
    })
  } catch (err) {
    console.error("Public products GET error", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

