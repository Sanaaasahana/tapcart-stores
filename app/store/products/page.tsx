"use client"

import { useEffect, useState } from "react"
import { StoreSidebar } from "@/components/store-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Package2, Layers, IndianRupee, Plus, Trash2, Pencil } from "lucide-react"

interface ProductItem {
  id: number
  name: string
  category: string
  price: number
  stock: number
}

interface CategoryCount { category: string; count: number }

export const dynamic = "force-dynamic"

export default function StoreProductsPage() {
  const [items, setItems] = useState<ProductItem[]>([])
  const [categoryCounts, setCategoryCounts] = useState<CategoryCount[]>([])
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [price, setPrice] = useState<number | "">("")
  const [quantity, setQuantity] = useState<number | "">(1)

  const [editId, setEditId] = useState<number | null>(null)
  const [editName, setEditName] = useState("")
  const [editCategory, setEditCategory] = useState("")
  const [editPrice, setEditPrice] = useState<number | "">("")

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/store/products")
      if (!res.ok) {
        console.error("Failed to load products:", res.status)
        return
      }
      const data = await res.json()
      setItems(data.items || [])
      setCategoryCounts(data.categoryCounts || [])
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const submitNew = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !category || price === "" || quantity === "") return
    setLoading(true)
    try {
      const response = await fetch("/api/store/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category, price: Number(price), quantity: Number(quantity) }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error("Failed to add product:", errorData)
        return
      }
      
      setName("")
      setCategory("")
      setPrice("")
      setQuantity(1)
      await load()
    } catch (error) {
      console.error("Error adding product:", error)
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (p: ProductItem) => {
    setEditId(p.id)
    setEditName(p.name)
    setEditCategory(p.category)
    setEditPrice(p.price)
  }

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editId == null) return
    setLoading(true)
    try {
      await fetch("/api/store/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editId, name: editName, category: editCategory, price: Number(editPrice) }),
      })
      setEditId(null)
      await load()
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id: number) => {
    setLoading(true)
    try {
      await fetch("/api/store/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      await load()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <StoreSidebar />

      <div className="lg:ml-64">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Inventory</h1>
            <p className="text-slate-600">Manage your items and category counts</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Items</CardTitle>
                <Package2 className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{items.length}</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-green-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Categories</CardTitle>
                <Layers className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {categoryCounts.map((c) => (
                    <Badge key={c.category} className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                      {c.category}: {c.count}
                    </Badge>
                  ))}
                  {categoryCounts.length === 0 && <span className="text-slate-500 text-sm">No categories yet</span>}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Value (₹)</CardTitle>
                <IndianRupee className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  ₹{items.reduce((s, p) => s + (p.price ?? 0), 0).toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add Item */}
          <Card className="border-0 shadow-sm mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">Add Items</CardTitle>
              <CardDescription>Create multiple items by quantity</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid grid-cols-1 md:grid-cols-4 gap-4" onSubmit={submitNew}>
                <div>
                  <Label htmlFor="name">Item Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input id="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))} required />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value === "" ? "" : Number(e.target.value))} required />
                </div>
                <div className="md:col-span-4">
                  <Button type="submit" disabled={loading} className="gap-2">
                    <Plus className="h-4 w-4" /> Add Items
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Items List */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200">
                    {editId === p.id ? (
                      <form onSubmit={submitEdit} className="flex flex-col md:flex-row gap-3 w-full">
                        <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="md:w-1/4" />
                        <Input value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="md:w-1/4" />
                        <Input type="number" step="0.01" value={editPrice} onChange={(e) => setEditPrice(e.target.value === "" ? "" : Number(e.target.value))} className="md:w-1/6" />
                        <div className="ml-auto flex gap-2">
                          <Button type="submit" size="sm">Save</Button>
                          <Button type="button" variant="outline" size="sm" onClick={() => setEditId(null)}>Cancel</Button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex-1">
                          <div className="font-medium text-slate-900">{p.name}</div>
                          <div className="text-sm text-slate-600">Category: {p.category}</div>
                        </div>
                        <div className="w-24 text-right font-medium">₹{p.price.toFixed(2)}</div>
                        <div className="ml-4 flex gap-2">
                          <Button variant="outline" size="icon" className="text-white bg-slate-900 hover:bg-slate-800" onClick={() => startEdit(p)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="icon" onClick={() => remove(p.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {items.length === 0 && <div className="text-center text-slate-500 py-10">No items yet</div>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 
