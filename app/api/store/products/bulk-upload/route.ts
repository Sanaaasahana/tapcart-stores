import { NextRequest, NextResponse } from "next/server"
import { getStoreSession } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"
import * as XLSX from 'xlsx'

function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is not set")
  return neon(url)
}

export async function POST(request: NextRequest) {
  try {
    const session = await getStoreSession()
    if (!session?.isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Please upload CSV or Excel files." }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    let jsonData: any[] = []

    // Parse file based on type
    if (file.type === 'text/csv') {
      const text = new TextDecoder().decode(arrayBuffer)
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
        const row: any = {}
        headers.forEach((header, index) => {
          row[header.toLowerCase()] = values[index] || ''
        })
        jsonData.push(row)
      }
    } else {
      // Excel file
      const workbook = XLSX.read(arrayBuffer)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      jsonData = XLSX.utils.sheet_to_json(worksheet)
    }

    // Validate required columns
    const requiredColumns = ['name', 'category', 'customid', 'price', 'quantity']
    const sampleRow = jsonData[0]
    if (!sampleRow) {
      return NextResponse.json({ error: "File is empty" }, { status: 400 })
    }

    const hasRequiredColumns = requiredColumns.every(col => 
      Object.keys(sampleRow).some(key => key.toLowerCase().includes(col))
    )

    if (!hasRequiredColumns) {
      return NextResponse.json({ 
        error: "Missing required columns. File must contain: name, category, customid, price, quantity" 
      }, { status: 400 })
    }

    const sql = getSql()
    
    // Ensure columns exist
    await sql`alter table products add column if not exists category varchar(100) default 'General'`
    await sql`alter table products add column if not exists custom_id varchar(50)`
    await sql`alter table products add column if not exists stock integer default 1`

    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    for (const row of jsonData) {
      try {
        // Map columns (case insensitive)
        const name = row.name || row.Name || row.NAME || ''
        const category = row.category || row.Category || row.CATEGORY || 'General'
        const customId = row.customid || row.customId || row.CustomID || row.CUSTOMID || ''
        const price = parseFloat(row.price || row.Price || row.PRICE || '0')
        const quantity = parseInt(row.quantity || row.Quantity || row.QUANTITY || '1')

        if (!name || !customId || isNaN(price) || isNaN(quantity) || quantity < 1) {
          errors.push(`Row ${successCount + errorCount + 1}: Invalid data`)
          errorCount++
          continue
        }

        // Check if custom ID already exists for this store
        const existing = await sql`select 1 from products where store_id = ${session.storeId} and custom_id = ${customId} limit 1`
        if (existing.length > 0) {
          errors.push(`Row ${successCount + errorCount + 1}: Custom ID "${customId}" already exists`)
          errorCount++
          continue
        }

        // Insert items (one row per quantity)
        for (let i = 0; i < quantity; i++) {
          await sql`insert into products (store_id, name, category, custom_id, price, stock) values (${session.storeId}, ${name}, ${category}, ${customId}, ${price}, 1)`
        }
        
        successCount++
      } catch (error) {
        errors.push(`Row ${successCount + errorCount + 1}: ${error}`)
        errorCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Upload completed. ${successCount} products added successfully, ${errorCount} errors.`,
      successCount,
      errorCount,
      errors: errors.slice(0, 10) // Limit error messages
    })

  } catch (error) {
    console.error("Bulk upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
