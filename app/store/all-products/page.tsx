"use client"

import { useEffect, useMemo, useState } from "react"
import { StoreSidebar } from "@/components/store-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ProductItem {
  id: number
  name: string
  category: string
  price: number
  stock: number
}

export default function AllProductsPage() {
  const [items, setItems] = useState<ProductItem[]>([])
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string>("all")

  const load = async () => {
    const res = await fetch("/api/store/products")
    const data = await res.json()
    setItems(data.items || [])
  }

  useEffect(() => {
    load()
  }, [])

  const categories = useMemo(() => {
    const s = new Set(items.map((i) => i.category || "General"))
    return ["all", ...Array.from(s)]
  }, [items])

  const filtered = useMemo(() => {
    return items
      .filter((i) => (category === "all" ? true : i.category === category))
      .filter((i) => i.name.toLowerCase().includes(search.toLowerCase()) || String(i.id).includes(search))
  }, [items, search, category])

  const categoryTotals = useMemo(() => {
    const map = new Map<string, { items: number; stock: number }>()
    for (const i of filtered) {
      const key = i.category || "General"
      const cur = map.get(key) || { items: 0, stock: 0 }
      cur.items += 1
      cur.stock += Number(i.stock || 0)
      map.set(key, cur)
    }
    return Array.from(map.entries()).map(([category, v]) => ({ category, ...v }))
  }, [filtered])

  return (
    <div className="min-h-screen bg-slate-50">
      <StoreSidebar />
      <div className="lg:ml-64">
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">All Products</h1>
            <p className="text-slate-600">Search, filter by category, and view totals per category</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input placeholder="Search by item name or ID" value={search} onChange={(e) => setSearch(e.target.value)} className="md:w-1/2" />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card className="border-0 shadow-sm mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">Totals by Category</CardTitle>
              <CardDescription>Number of items and total stock remaining per category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {categoryTotals.map((c) => (
                  <Badge key={c.category} className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                    {c.category}: {c.items} items • {c.stock} stock
                  </Badge>
                ))}
                {categoryTotals.length === 0 && <span className="text-slate-500 text-sm">No data</span>}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">Items</CardTitle>
              <CardDescription>Includes item IDs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filtered.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200">
                    <div className="font-medium text-slate-900">#{p.id} — {p.name}</div>
                    <div className="text-slate-600">{p.category}</div>
                    <div className="text-slate-900 font-medium">₹{p.price.toFixed(2)}</div>
                    <div className="text-slate-600">Stock: {p.stock}</div>
                  </div>
                ))}
                {filtered.length === 0 && <div className="text-center text-slate-500 py-10">No items</div>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


