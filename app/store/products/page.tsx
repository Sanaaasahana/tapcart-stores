"use client"

import { useEffect, useState } from "react"
import { StoreSidebar } from "@/components/store-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package2, Layers, IndianRupee, Plus, Trash2, Pencil, Search, Filter, Eye, AlertTriangle, TrendingUp, BarChart3 } from "lucide-react"

interface ProductItem {
  id: number
  customId?: string
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
  const [customId, setCustomId] = useState("")
  const [category, setCategory] = useState("")
  const [price, setPrice] = useState<number | "">("")
  const [quantity, setQuantity] = useState<number | "">(1)

  const [editId, setEditId] = useState<number | null>(null)
  const [editName, setEditName] = useState("")
  const [editCustomId, setEditCustomId] = useState("")
  const [editCategory, setEditCategory] = useState("")
  const [editPrice, setEditPrice] = useState<number | "">("")

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "table">("table")

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
    if (!name || !category || !customId || price === "" || quantity === "") return
    setLoading(true)
    try {
      const response = await fetch("/api/store/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category, customId, price: Number(price), quantity: Number(quantity) }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error("Failed to add product:", errorData)
        return
      }
      
      setName("")
      setCustomId("")
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
    setEditCustomId(p.customId || "")
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
        body: JSON.stringify({ id: editId, name: editName, customId: editCustomId, category: editCategory, price: Number(editPrice) }),
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

  // Filter and search logic
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.customId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // Calculate statistics
  const totalValue = items.reduce((sum, item) => sum + item.price, 0)
  const lowStockItems = items.filter(item => item.stock < 10)
  const outOfStockItems = items.filter(item => item.stock === 0)

  return (
    <div className="min-h-screen bg-slate-50">
      <StoreSidebar />

      <div className="lg:ml-64">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Inventory Management</h1>
                <p className="text-slate-600">Track and manage your product stock levels</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "table" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Table
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Package2 className="h-4 w-4 mr-2" />
                  Grid
                </Button>
              </div>
            </div>
          </div>

          {/* Enhanced Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Products</CardTitle>
                <Package2 className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{items.length}</div>
                <p className="text-xs text-slate-500 mt-1">Active items in inventory</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-green-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Categories</CardTitle>
                <Layers className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{categoryCounts.length}</div>
                <p className="text-xs text-slate-500 mt-1">Product categories</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-red-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Low Stock Alert</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{lowStockItems.length}</div>
                <p className="text-xs text-slate-500 mt-1">Items below 10 units</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Value</CardTitle>
                <IndianRupee className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  ₹{totalValue.toFixed(2)}
                </div>
                <p className="text-xs text-slate-500 mt-1">Inventory worth</p>
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
              <form className="grid grid-cols-1 md:grid-cols-5 gap-4" onSubmit={submitNew}>
                <div>
                  <Label htmlFor="customId">Custom ID</Label>
                  <Input id="customId" value={customId} onChange={(e) => setCustomId(e.target.value)} required />
                </div>
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
                <div className="md:col-span-5">
                  <Button type="submit" disabled={loading} className="gap-2">
                    <Plus className="h-4 w-4" /> Add Items
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Search and Filter */}
          <Card className="border-0 shadow-sm mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-900">Search & Filter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search products, IDs, or categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categoryCounts.map((category) => (
                        <SelectItem key={category.category} value={category.category}>
                          {category.category} ({category.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Showing {filteredItems.length} of {items.length} items
                  </Badge>
                  {lowStockItems.length > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {lowStockItems.length} low stock
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items List */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-slate-900">Product Inventory</CardTitle>
                <div className="flex gap-2">
                  {lowStockItems.length > 0 && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Low Stock Alert
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === "table" ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-medium text-slate-600">Product</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">Category</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">Price</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">Stock</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((p) => (
                        <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-4 px-4">
                            <div className="font-medium text-slate-900">{p.name}</div>
                            <div className="text-sm text-slate-500">#{p.customId || p.id}</div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant="secondary" className="text-xs">
                              {p.category}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-medium text-slate-900">₹{p.price.toFixed(2)}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`font-medium ${p.stock < 10 ? 'text-red-600' : 'text-slate-900'}`}>
                              {p.stock} units
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <Badge
                              variant={p.stock === 0 ? "destructive" : p.stock < 10 ? "secondary" : "default"}
                              className={
                                p.stock === 0
                                  ? "bg-red-100 text-red-700 hover:bg-red-100"
                                  : p.stock < 10
                                    ? "bg-orange-100 text-orange-700 hover:bg-orange-100"
                                    : "bg-green-100 text-green-700 hover:bg-green-100"
                              }
                            >
                              {p.stock === 0 ? "Out of Stock" : p.stock < 10 ? "Low Stock" : "In Stock"}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => startEdit(p)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => remove(p.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map((p) => (
                    <div key={p.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-slate-900 mb-1">{p.name}</h3>
                          <p className="text-sm text-slate-500">#{p.customId || p.id}</p>
                        </div>
                        <Badge
                          variant={p.stock === 0 ? "destructive" : p.stock < 10 ? "secondary" : "default"}
                          className={
                            p.stock === 0
                              ? "bg-red-100 text-red-700 hover:bg-red-100"
                              : p.stock < 10
                                ? "bg-orange-100 text-orange-700 hover:bg-orange-100"
                                : "bg-green-100 text-green-700 hover:bg-green-100"
                          }
                        >
                          {p.stock === 0 ? "Out" : p.stock < 10 ? "Low" : "In Stock"}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Category:</span>
                          <Badge variant="outline" className="text-xs">{p.category}</Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Price:</span>
                          <span className="font-medium">₹{p.price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Stock:</span>
                          <span className={`font-medium ${p.stock < 10 ? 'text-red-600' : 'text-slate-900'}`}>
                            {p.stock} units
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => startEdit(p)} className="flex-1">
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => remove(p.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {filteredItems.length === 0 && (
                <div className="text-center py-10">
                  <Package2 className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No products found</h3>
                  <p className="text-slate-500">
                    {items.length === 0 
                      ? "Get started by adding your first product above."
                      : "Try adjusting your search or filter criteria."
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 
