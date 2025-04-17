"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Toaster } from "@/components/ui/toaster"

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check if user is authenticated
    const token = localStorage.getItem("adminToken")
    const user = localStorage.getItem("adminUser")

    if (!token || !user) {
      // If not on login page, redirect to login
      if (pathname !== "/admin/login") {
        router.push("/admin/login")
      }
      setIsAuthenticated(false)
    } else {
      setIsAuthenticated(true)
      // If on login page, redirect to dashboard
      if (pathname === "/admin/login") {
        router.push("/admin/dashboard")
      }
    }
    setIsLoading(false)
  }, [pathname, router])

  // Prevent hydration errors by not rendering until client-side
  if (!mounted) {
    return null
  }

  // Show login page without sidebar
  if (pathname === "/admin/login") {
    return (
      <>
        {children}
        <Toaster />
      </>
    )
  }

  // Show loading state
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  // Show admin layout with sidebar if authenticated
  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar className="w-64 hidden md:block" />
        <div className="flex-1">
          <div className="flex h-14 items-center border-b px-4 md:hidden">
            <AdminSidebar />
            <div className="ml-auto"></div>
          </div>
          <main className="p-4 md:p-8">{children}</main>
        </div>
        <Toaster />
      </div>
    )
  }

  // Fallback - should not reach here
  return null
}
