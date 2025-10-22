"use client"

import { useEffect, useState, useRef } from "react"
import { StoreSidebar } from "@/components/store-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Package2, Layers, IndianRupee, Plus, Trash2, Pencil, Search, Filter, Eye, AlertTriangle, TrendingUp, BarChart3, Upload, FileText, CheckCircle, Loader2 } from "lucide-react"

interface ProductItem {
  id: number
  custom_id?: string
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
  const [custom_id, setCustom_id] = useState("")
  const [category, setCategory] = useState("")
  const [price, setPrice] = useState<number | "">("")
  const [quantity, setQuantity] = useState<number | "">(1)

  const [editId, setEditId] = useState<number | null>(null)
  const [editName, setEditName] = useState("")
  const [editCustom_id, setEditCustom_id] = useState("")
  const [editCategory, setEditCategory] = useState("")
  const [editPrice, setEditPrice] = useState<number | "">("")

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "table">("table")

  // File upload states
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    if (!name || !category || !custom_id || price === "" || quantity === "") return
    setLoading(true)
    try {
      const response = await fetch("/api/store/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category, customId: custom_id, price: Number(price), quantity: Number(quantity) }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error("Failed to add product:", errorData)
        
        // Show specific error message
        toast({
          title: "Error Adding Product",
          description: errorData.error === "Custom ID already exists" 
            ? "Duplicate ID Error: This custom ID already exists. Please use a different ID."
            : errorData.error || "Failed to add product. Please try again.",
          variant: "destructive",
          duration: 7000,
          className: "bg-red-600 text-white border-red-700",
        })
        return
      }
      
      setName("")
      setCustom_id("")
      setCategory("")
      setPrice("")
      setQuantity(1)
      
      // Show success message
      toast({
        title: "Product Added Successfully! 🎉",
        description: `Product "${name}" has been added to your inventory.`,
        duration: 5000,
      })
      
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
    setEditCustom_id(p.custom_id || "")
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
        body: JSON.stringify({ id: editId, name: editName, customId: editCustom_id, category: editCategory, price: Number(editPrice) }),
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
                         item.custom_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // Calculate statistics
  const totalValue = items.reduce((sum, item) => sum + item.price, 0)
  const lowStockItems = items.filter(item => item.stock < 10)
  const outOfStockItems = items.filter(item => item.stock === 0)

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch("/api/store/products/bulk-upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Show success toast
        toast({
          title: "Upload Successful! 🎉",
          description: data.message,
          duration: 5000,
        })
        
        // Show errors if any
        if (data.errors && data.errors.length > 0) {
          setTimeout(() => {
            toast({
              title: "Some Issues Found",
              description: `Some rows had errors: ${data.errors.slice(0, 3).join('; ')}${data.errors.length > 3 ? '...' : ''}`,
              variant: "destructive",
              duration: 8000,
              className: "bg-red-600 text-white border-red-700",
            })
          }, 1000)
        }
        
        // Reload products after successful upload
        await load()
      } else {
        // Show error toast with better visibility
        toast({
          title: "Upload Failed ❌",
          description: data.error || data.message || "Upload failed. Please check your CSV file and try again.",
          variant: "destructive",
          duration: 10000,
          className: "bg-red-600 text-white border-red-700",
        })
      }
    } catch (error) {
      // Show network error toast
      toast({
        title: "Network Error ❌",
        description: "Network error during upload. Please check your connection and try again.",
        variant: "destructive",
        duration: 10000,
        className: "bg-red-600 text-white border-red-700",
      })
    } finally {
      setIsUploading(false)
    }
  }

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
          <Card className="border-0 shadow-sm mb-6">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">Add Items</CardTitle>
              <CardDescription>Create multiple items by quantity</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid grid-cols-1 md:grid-cols-5 gap-4" onSubmit={submitNew}>
                <div>
                  <Label htmlFor="custom_id">Custom ID</Label>
                  <Input id="custom_id" value={custom_id} onChange={(e) => setCustom_id(e.target.value)} required />
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

          {/* Bulk Upload Section */}
          <Card className="border-0 shadow-sm mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">Bulk Upload Products</CardTitle>
              <CardDescription>Upload CSV file to add multiple products at once</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
                      <div className="mx-auto w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-sm font-medium text-slate-900 mb-2">Upload CSV File</h3>
                      <p className="text-xs text-slate-500 mb-4">
                        Upload a CSV file with product details (name, category, customid, price, quantity)
                      </p>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="gap-2 mb-3 bg-slate-900 text-white border-slate-900 hover:bg-slate-800"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4" />
                            Choose CSV File
                          </>
                        )}
                      </Button>
                      
                      <div className="text-xs">
                        <a 
                          href="data:text/csv;charset=utf-8,name,category,customid,price,quantity%0ATest Product,Electronics,TEST001,99.99,5%0AAnother Product,Clothing,CLOTH001,49.99,10" 
                          download="product-template.csv"
                          className="text-blue-600 hover:text-blue-700 underline"
                        >
                          Download CSV template
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items List */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">Product Inventory</CardTitle>
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
                          {editId === p.id ? (
                            <td colSpan={6} className="py-4 px-4">
                              <form onSubmit={submitEdit} className="flex flex-col md:flex-row gap-3 w-full">
                                <Input value={editCustom_id} onChange={(e) => setEditCustom_id(e.target.value)} className="md:w-1/5" placeholder="Custom ID" />
                                <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="md:w-1/5" placeholder="Name" />
                                <Input value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="md:w-1/5" placeholder="Category" />
                                <Input type="number" step="0.01" value={editPrice} onChange={(e) => setEditPrice(e.target.value === "" ? "" : Number(e.target.value))} className="md:w-1/6" placeholder="Price" />
                                <div className="flex gap-2">
                                  <Button type="submit" size="sm" className="bg-slate-900 text-white hover:bg-slate-800">Save</Button>
                                  <Button type="button" variant="outline" size="sm" onClick={() => setEditId(null)} className="text-slate-700 border-slate-300">Cancel</Button>
                                </div>
                              </form>
                            </td>
                          ) : (
                            <>
                              <td className="py-4 px-4">
                                <div className="font-medium text-slate-900">{p.name}</div>
                                <div className="text-sm text-slate-500">#{p.custom_id || 'No ID'}</div>
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
                                <span className="font-medium text-slate-900">
                                  {p.stock} units
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">
                                  In Stock
                                </Badge>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => startEdit(p)}
                                    className="bg-slate-900 text-white border-slate-900 hover:bg-slate-800"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button variant="destructive" size="sm" onClick={() => remove(p.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map((p) => (
                    <div key={p.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      {editId === p.id ? (
                        <form onSubmit={submitEdit} className="space-y-3">
                          <Input value={editCustom_id} onChange={(e) => setEditCustom_id(e.target.value)} placeholder="Custom ID" />
                          <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Name" />
                          <Input value={editCategory} onChange={(e) => setEditCategory(e.target.value)} placeholder="Category" />
                          <Input type="number" step="0.01" value={editPrice} onChange={(e) => setEditPrice(e.target.value === "" ? "" : Number(e.target.value))} placeholder="Price" />
                          <div className="flex gap-2">
                            <Button type="submit" size="sm" className="flex-1 bg-slate-900 text-white hover:bg-slate-800">Save</Button>
                            <Button type="button" variant="outline" size="sm" onClick={() => setEditId(null)} className="text-slate-700 border-slate-300">Cancel</Button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="font-medium text-slate-900 mb-1">{p.name}</h3>
                              <p className="text-sm text-slate-500">#{p.custom_id || 'No ID'}</p>
                            </div>
                            <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">
                              In Stock
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
                              <span className="font-medium text-slate-900">
                                {p.stock} units
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => startEdit(p)} 
                              className="flex-1 bg-slate-900 text-white border-slate-900 hover:bg-slate-800"
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => remove(p.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      )}
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
      <Toaster />
    </div>
  )
} 
