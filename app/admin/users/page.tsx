import { redirect } from "next/navigation"
import { getAdminSession } from "@/lib/auth"
import { getAllStores } from "@/lib/db"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Store, Calendar, Mail, CheckCircle, Clock, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function AdminUsersPage() {
  const session = await getAdminSession()

  if (!session?.isAuthenticated) {
    redirect("/admin/login")
  }

  const stores = await getAllStores()

  // Mock additional stores for demo
  const allStores = [
    ...stores,
    {
      id: 2,
      store_id: "TECH001",
      email: "tech@store.com",
      status: "pending" as const,
      created_at: "2024-01-20T10:30:00Z",
    },
    {
      id: 3,
      store_id: "FASHION02",
      email: "fashion@boutique.com",
      status: "pending" as const,
      created_at: "2024-01-21T14:15:00Z",
    },
  ]

  const approvedStores = allStores.filter((store) => store.status === "approved")
  const pendingStores = allStores.filter((store) => store.status === "pending")
  const deniedStores = allStores.filter((store) => store.status === "denied")

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />

      <div className="lg:ml-64">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Store Users</h1>
            <p className="text-slate-600">Manage all registered store accounts and their status</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Stores</CardTitle>
                <Store className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{allStores.length}</div>
                <p className="text-xs text-slate-500 mt-1">All registrations</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{approvedStores.length}</div>
                <p className="text-xs text-slate-500 mt-1">Active stores</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-red-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Pending</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{pendingStores.length}</div>
                <p className="text-xs text-slate-500 mt-1">Awaiting approval</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-pink-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Denied</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{deniedStores.length}</div>
                <p className="text-xs text-slate-500 mt-1">Rejected applications</p>
              </CardContent>
            </Card>
          </div>

          {/* Users List */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">All Store Users</CardTitle>
              <CardDescription>Complete list of registered stores and their approval status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allStores.map((store) => (
                  <div
                    key={store.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-200"
                  >
                    <Avatar className="h-12 w-12 bg-gradient-to-br from-blue-500 to-cyan-500">
                      <AvatarFallback className="text-white font-medium">
                        {store.store_id.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-slate-900">{store.store_id}</h3>
                        <Badge
                          variant={
                            store.status === "approved"
                              ? "default"
                              : store.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                          className={
                            store.status === "approved"
                              ? "bg-green-100 text-green-700 hover:bg-green-100"
                              : store.status === "pending"
                                ? "bg-orange-100 text-orange-700 hover:bg-orange-100"
                                : "bg-red-100 text-red-700 hover:bg-red-100"
                          }
                        >
                          {store.status.charAt(0).toUpperCase() + store.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 mb-1">
                        <Mail className="h-4 w-4" />
                        <span className="text-sm">{store.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar className="h-4 w-4" />
                        <span className="text-xs">Registered: {new Date(store.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-medium text-slate-900">Store ID</div>
                      <div className="text-xs text-slate-500 font-mono">{store.store_id}</div>
                      {store.status === "approved" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="mt-2"
                          onClick={async () => {
                            const email = store.email
                            const res = await fetch("/api/admin/approve-store", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ storeId: store.store_id, email, action: "deny", reason: "Access revoked by admin" }),
                            })
                            if (res.ok) {
                              // Soft refresh: mark as denied client-side
                              location.reload()
                            }
                          }}
                        >
                          Revoke Access
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {allStores.length === 0 && (
                  <div className="text-center py-12">
                    <Store className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No stores registered</h3>
                    <p className="text-slate-500">Store registrations will appear here when users sign up.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
