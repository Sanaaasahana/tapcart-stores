"use client"

import { StoreSidebar } from "@/components/store-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function RazorpayGuidePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <StoreSidebar />

      <div className="lg:ml-64">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <Link href="/store/settings">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Settings
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Razorpay Setup Guide</h1>
            <p className="text-slate-600">Step-by-step instructions to get your Razorpay keys</p>
          </div>

          {/* Quick Start */}
          <Card className="mb-6 border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Quick Start (5 Minutes)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 mb-4">
                <strong>Good news!</strong> You can start with <strong>Test Mode</strong> - no website verification needed!
              </p>
              <ol className="list-decimal list-inside space-y-2 text-slate-700">
                <li>Create a free Razorpay account (takes 2 minutes)</li>
                <li>Get your test keys (no verification required)</li>
                <li>Add them to your settings</li>
                <li>Start accepting test payments immediately</li>
              </ol>
            </CardContent>
          </Card>

          {/* Step-by-Step Guide */}
          <div className="space-y-6">
            {/* Step 1 */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Step 1: Create Razorpay Account</CardTitle>
                <CardDescription>Sign up for a free Razorpay account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-700 mb-2">
                      Go to <a href="https://razorpay.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">razorpay.com</a> and click <strong>"Sign Up"</strong>
                    </p>
                    <Button asChild variant="outline" size="sm" className="mt-2">
                      <a href="https://razorpay.com" target="_blank" rel="noopener noreferrer">
                        Open Razorpay <ExternalLink className="h-3 w-3 ml-2" />
                      </a>
                    </Button>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>What you'll need:</strong> Email, phone number, and business details. The account is free to create.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Step 2: Get Your API Keys</CardTitle>
                <CardDescription>Find your test keys in the Razorpay dashboard</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                    2
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-slate-700 mb-2 font-medium">In your Razorpay dashboard:</p>
                      <ol className="list-decimal list-inside space-y-1 text-slate-600 ml-2">
                        <li>Click on <strong>"Settings"</strong> in the left menu</li>
                        <li>Click on <strong>"API Keys"</strong></li>
                        <li>You'll see two sections: <strong>Test Mode</strong> and <strong>Live Mode</strong></li>
                        <li>Under <strong>Test Mode</strong>, click <strong>"Generate Key"</strong> if you haven't already</li>
                        <li>Copy your <strong>Key ID</strong> (starts with <code className="bg-slate-100 px-1 rounded">rzp_test_</code>)</li>
                        <li>Copy your <strong>Key Secret</strong> (click "Reveal" to see it)</li>
                      </ol>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-800">
                        <strong>✓ Test Mode Benefits:</strong> No website verification needed, instant setup, perfect for testing your payment flow!
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Step 3: Add Keys to Your Store</CardTitle>
                <CardDescription>Paste your keys in the settings page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                    3
                  </div>
                  <div className="flex-1 space-y-3">
                    <p className="text-slate-700">
                      Go back to <Link href="/store/settings" className="text-blue-600 hover:underline font-medium">Payment Settings</Link> and:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-slate-600 ml-2">
                      <li>Paste your <strong>Key ID</strong> in the first field</li>
                      <li>Paste your <strong>Key Secret</strong> in the second field</li>
                      <li>Click <strong>"Save Payment Settings"</strong></li>
                    </ol>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-sm text-amber-800">
                        <strong>⚠ Important:</strong> Keep your Key Secret secure. Never share it or commit it to code repositories.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 4 */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Step 4: Test Your Setup</CardTitle>
                <CardDescription>Verify payments are working correctly</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                    4
                  </div>
                  <div className="flex-1 space-y-3">
                    <p className="text-slate-700">
                      Test your payment integration using Razorpay's test cards:
                    </p>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                      <p className="text-sm font-mono text-slate-700 mb-2">
                        <strong>Test Card:</strong> 4111 1111 1111 1111
                      </p>
                      <p className="text-xs text-slate-600">
                        CVV: Any 3 digits | Expiry: Any future date | Name: Any name
                      </p>
                    </div>
                    <p className="text-sm text-slate-600">
                      Make a test purchase to ensure everything works. Test payments won't charge real money.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Production Mode */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="text-xl">Going Live (Production Mode)</CardTitle>
                <CardDescription>When you're ready for real payments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-slate-700">
                    When you're ready to accept real payments:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-slate-600 ml-2">
                    <li>Complete your Razorpay account activation (business verification)</li>
                    <li>Go to Settings → API Keys → <strong>Live Mode</strong></li>
                    <li>Generate your <strong>Live Key ID</strong> and <strong>Live Key Secret</strong></li>
                    <li>Update your keys in Payment Settings</li>
                    <li>Test with a small real transaction first</li>
                  </ol>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Live mode requires account activation and business verification. 
                      This can take a few days, so start with test mode!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help Section */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-slate-700">
                  <p>
                    <strong>Common Issues:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li><strong>Can't find API Keys:</strong> Make sure you're logged into your Razorpay dashboard</li>
                    <li><strong>Keys not working:</strong> Double-check you copied the entire key (no spaces)</li>
                    <li><strong>Test payments failing:</strong> Make sure you're using test mode keys, not live keys</li>
                  </ul>
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-sm">
                      <strong>Razorpay Support:</strong>{" "}
                      <a href="https://razorpay.com/support" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Visit Razorpay Support
                      </a>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Back Button */}
            <div className="flex justify-center pt-6">
              <Link href="/store/settings">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Go to Payment Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

