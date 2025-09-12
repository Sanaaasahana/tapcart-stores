import { redirect } from "next/navigation"
import { getAdminSession } from "@/lib/auth"
import { getAllStores } from "@/lib/db"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Store } from "lucide-react"
import { AdminUsersClient } from "@/components/admin-users-client"

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
          <AdminUsersClient stores={allStores} />
        </div>
      </div>
    </div>
  )
}
