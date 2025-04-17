"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { useSelector } from "react-redux"

export default function AuthenticatedLayout({ children }) {
  const pathname = usePathname()
  const { isAuthenticated } = useSelector((state) => state.auth)
  const [mounted, setMounted] = useState(false)

  // Fix hydration issues by mounting after client-side render
  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't show sidebar on login or signup pages
  const hideOnPaths = ["/login", "/signup", "/admin/login"]
  const shouldHideSidebar = hideOnPaths.includes(pathname)

  if (!mounted) {
    return null
  }

  if (shouldHideSidebar) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar className="w-64 hidden md:block" />
      <div className="flex-1">
        <div className="flex h-14 items-center border-b px-4 md:hidden">
          <Sidebar />
          <div className="ml-auto"></div>
        </div>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}
