import { NextRequest, NextResponse } from "next/server"
import { getStoreSession } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is not set")
  return neon(url)
}

export async function GET() {
  try {
    const session = await getStoreSession()
    if (!session?.isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const sql = getSql()

    // Ensure category column exists
    await sql`alter table products add column if not exists category varchar(100) default 'General'`
    await sql`alter table products add column if not exists stock integer default 1`

    const items = await sql`select id, store_id, name, coalesce(category,'General') as category, (price::float8) as price, coalesce(stock,1)::int as stock from products where store_id = ${session.storeId} order by id desc`
    const categoryCounts = await sql`select coalesce(category,'General') as category, count(*)::int as count from products where store_id = ${session.storeId} group by category order by category`

    return NextResponse.json({ items: items as any, categoryCounts: categoryCounts as any })
  } catch (err) {
    console.error("Products GET error", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getStoreSession()
    if (!session?.isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { name, category, price, quantity } = await request.json()
    if (!name || !category || typeof price !== "number" || !quantity || quantity < 1) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }
    const sql = getSql()
    await sql`alter table products add column if not exists category varchar(100) default 'General'`

    // Insert N rows (each item unique id), stock=1 per spec
    for (let i = 0; i < quantity; i++) {
      // default stock=1 to keep compatibility with dashboard
      await sql`insert into products (store_id, name, category, price, stock) values (${session.storeId}, ${name}, ${category}, ${price}, 1)`
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Products POST error", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getStoreSession()
    if (!session?.isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { id, name, category, price } = await request.json()
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
    const sql = getSql()
    await sql`alter table products add column if not exists category varchar(100) default 'General'`

    await sql`update products set name = coalesce(${name}, name), category = coalesce(${category}, category), price = coalesce(${price}, price) where id = ${id} and store_id = ${session.storeId}`
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Products PATCH error", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getStoreSession()
    if (!session?.isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { id } = await request.json()
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
    const sql = getSql()
    await sql`delete from products where id = ${id} and store_id = ${session.storeId}`
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Products DELETE error", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 
