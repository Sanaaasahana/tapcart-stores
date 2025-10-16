"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Store, Lock, User, Upload, FileText, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function StoreLoginPage() {
  const [storeId, setStoreId] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState("")
  const [showUploadSuccess, setShowUploadSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/store/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId, password }),
      })

      const data = await response.json()

      if (response.ok) {
        router.replace("/store/products")
      } else {
        setError(data.error || "Login failed")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadMessage("")
    setError("")
    setShowUploadSuccess(false)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch("/api/store/products/bulk-upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setUploadMessage(data.message)
        setShowUploadSuccess(true)
        if (data.errors && data.errors.length > 0) {
          setUploadMessage(data.message + "\nErrors: " + data.errors.join(", "))
        }
      } else {
        setError(data.error || "Upload failed")
      }
    } catch (error) {
      setError("Network error during upload. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:20px_20px] opacity-30"></div>

      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl relative z-10">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center">
            <Store className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-slate-900">Store Login</CardTitle>
            <CardDescription className="text-slate-600 mt-2">Access your store dashboard</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {/* File Upload Section */}
          <div className="mb-6 p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-900">Bulk Upload Products</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Upload CSV file with product details
                </p>
                <a 
                  href="data:text/csv;charset=utf-8,name,category,customid,price,quantity%0ASample%20Product,Electronics,PROD001,99.99,5%0AAnother%20Product,Clothing,PROD002,49.99,10" 
                  download="product-template.csv"
                  className="text-xs text-blue-600 hover:text-blue-700 underline"
                >
                  Download CSV template
                </a>
              </div>
              
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
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Choose File
                  </>
                )}
              </Button>
              
              {uploadMessage && (
                <Alert className={`mt-3 ${showUploadSuccess ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}`}>
                  <div className="flex items-center gap-2">
                    {showUploadSuccess && <CheckCircle className="h-4 w-4 text-green-600" />}
                    <AlertDescription className={showUploadSuccess ? 'text-green-700' : 'text-blue-700'}>
                      <pre className="whitespace-pre-wrap text-xs">{uploadMessage}</pre>
                    </AlertDescription>
                  </div>
                </Alert>
              )}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">Or sign in manually</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div className="space-y-2">
              <Label htmlFor="storeId" className="text-slate-700 font-medium">
                Store ID
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  id="storeId"
                  type="text"
                  placeholder="Enter your store ID"
                  value={storeId}
                  onChange={(e) => setStoreId(e.target.value)}
                  className="pl-10 h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600">
              {"Don't have an account? "}
              <Link href="/store/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign up here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
