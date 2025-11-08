"use client"

import { useState, useEffect } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { StoreSidebar } from "@/components/store-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CreditCard, CheckCircle, AlertCircle, Loader2, Info } from "lucide-react"
import { useRouter } from "next/navigation"

export default function StoreSettingsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [razorpayKeyId, setRazorpayKeyId] = useState("")
  const [razorpayKeySecret, setRazorpayKeySecret] = useState("")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [hasExistingKeys, setHasExistingKeys] = useState(false)

  useEffect(() => {
    // Check if user is authenticated and load existing settings
    const loadSettings = async () => {
      try {
        const response = await fetch("/api/store/payment-settings")
        if (response.status === 401) {
          router.push("/store/login")
          return
        }

        if (response.ok) {
          const data = await response.json()
          if (data.razorpayKeyId) {
            setRazorpayKeyId(data.razorpayKeyId)
            setHasExistingKeys(true)
            // Don't load the secret key for security
          }
        }
      } catch (error) {
        console.error("Failed to load settings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    if (!razorpayKeyId) {
      setMessage({ type: "error", text: "Please enter your Razorpay Key ID" })
      setIsSaving(false)
      return
    }

    // Only require secret if it's a new setup (no existing keys)
    if (!hasExistingKeys && !razorpayKeySecret) {
      setMessage({ type: "error", text: "Please enter your Razorpay Key Secret for initial setup" })
      setIsSaving(false)
      return
    }

    try {
      const response = await fetch("/api/store/payment-settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          razorpayKeyId: razorpayKeyId.trim(),
          razorpayKeySecret: razorpayKeySecret.trim(),
        }),
      })

      if (response.ok) {
        setMessage({ type: "success", text: "Payment settings saved successfully!" })
        setHasExistingKeys(true)
        // Clear the secret field for security (don't want it visible after saving)
        setRazorpayKeySecret("")
      } else {
        const error = await response.json().catch(() => ({ error: "Failed to save settings" }))
        setMessage({ type: "error", text: error.error || "Failed to save payment settings" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred while saving settings" })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <StoreSidebar />

      <div className="lg:ml-64">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Payment Settings</h1>
            <p className="text-slate-600">Configure your Razorpay merchant account to receive payments</p>
          </div>

          {/* Info Alert */}
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <strong>Quick Setup (5 Minutes):</strong>
                  <div className="mt-2 space-y-2 text-sm">
                    <p>
                      <strong className="text-green-700">✓ No website verification needed!</strong> Just get your Razorpay test keys and paste them below.
                    </p>
                    <ol className="list-decimal list-inside ml-2 mt-1 space-y-1">
                      <li>Sign up at <a href="https://razorpay.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">razorpay.com</a></li>
                      <li>Go to <strong>Settings → API Keys → Test Mode</strong></li>
                      <li>Copy your <strong>Key ID</strong> and <strong>Key Secret</strong></li>
                      <li>Paste them below and save</li>
                    </ol>
                  </div>
                </div>
                <Link href="/store/settings/razorpay-guide">
                  <Button variant="outline" size="sm" className="ml-4 bg-white hover:bg-blue-100">
                    Detailed Guide
                  </Button>
                </Link>
              </div>
            </AlertDescription>
          </Alert>

          {/* Payment Settings Card */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900">Razorpay Configuration</CardTitle>
                  <CardDescription>Enter your Razorpay merchant account credentials</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Status Badge */}
                {hasExistingKeys && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-800 font-medium">Payment account is configured</span>
                  </div>
                )}

                {/* Razorpay Key ID */}
                <div className="space-y-2">
                  <Label htmlFor="razorpayKeyId" className="text-slate-700 font-medium">
                    Razorpay Key ID <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="razorpayKeyId"
                    type="text"
                    placeholder="rzp_test_xxxxx (for testing) or rzp_live_xxxxx (for production)"
                    value={razorpayKeyId}
                    onChange={(e) => setRazorpayKeyId(e.target.value)}
                    disabled={isSaving}
                    className="bg-white"
                    required
                  />
                  <p className="text-xs text-slate-500">
                    Your Razorpay Key ID from Settings → API Keys
                    {razorpayKeyId && (
                      <span className={`ml-2 font-medium ${razorpayKeyId.startsWith('rzp_test_') ? 'text-green-600' : razorpayKeyId.startsWith('rzp_live_') ? 'text-blue-600' : 'text-amber-600'}`}>
                        {razorpayKeyId.startsWith('rzp_test_') ? '✓ Test Mode' : razorpayKeyId.startsWith('rzp_live_') ? '✓ Live Mode' : '⚠ Check format'}
                      </span>
                    )}
                  </p>
                </div>

                {/* Razorpay Key Secret */}
                <div className="space-y-2">
                  <Label htmlFor="razorpayKeySecret" className="text-slate-700 font-medium">
                    Razorpay Key Secret {!hasExistingKeys && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    id="razorpayKeySecret"
                    type="password"
                    placeholder={hasExistingKeys ? "Enter new secret to update (leave blank to keep existing)" : "Enter your Razorpay Key Secret"}
                    value={razorpayKeySecret}
                    onChange={(e) => setRazorpayKeySecret(e.target.value)}
                    disabled={isSaving}
                    className="bg-white"
                    required={!hasExistingKeys}
                  />
                  <p className="text-xs text-slate-500">
                    Your Razorpay Key Secret from Settings → API Keys
                    {hasExistingKeys && (
                      <span className="text-blue-600 ml-1 font-medium">(Leave blank to keep existing secret)</span>
                    )}
                    <br />
                    <span className="text-amber-600">🔒 Keep this secure - never share it publicly</span>
                  </p>
                </div>

                {/* Message Alert */}
                {message && (
                  <Alert
                    className={
                      message.type === "success"
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }
                  >
                    {message.type === "success" ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription
                      className={message.type === "success" ? "text-green-800" : "text-red-800"}>
                      {message.text}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Submit Button */}
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Save Payment Settings
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card className="mt-6 border-0 shadow-sm bg-amber-50 border-amber-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900 mb-1">Security Notice</h3>
                  <p className="text-sm text-amber-800">
                    Your Razorpay Key Secret is encrypted and stored securely. Never share your API keys with anyone.
                    If you suspect your keys have been compromised, regenerate them in your Razorpay dashboard
                    immediately.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

