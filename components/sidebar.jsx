"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSelector } from "react-redux"
import { cn } from "@/lib/utils"
import { Home, Users, FileText, Settings, Menu, Activity, BarChart, ClipboardList, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useDispatch } from "react-redux"
import { logout } from "@/redux/features/authSlice"

export function Sidebar({ className }) {
  const pathname = usePathname()
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const [isMobile, setIsMobile] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const dispatch = useDispatch()

  // Fix hydration issues by mounting after client-side render
  useEffect(() => {
    setMounted(true)

    // Check if mobile on mount and when window resizes
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkIfMobile()

    // Add event listener
    window.addEventListener("resize", checkIfMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  // Don't render until client-side to prevent hydration mismatch
  if (!mounted) {
    return null
  }

  const handleLogout = () => {
    dispatch(logout())
  }

  const routes = [
    {
      title: "Dashboard",
      href: "/",
      icon: Home,
      requireAuth: false,
    },
    {
      title: "Patients",
      href: "/patients",
      icon: Users,
      requireAuth: true,
    },
    {
      title: "Receipts",
      href: "/receipts",
      icon: FileText,
      requireAuth: true,
    },
    {
      title: "Reports",
      href: "/reports",
      icon: ClipboardList,
      requireAuth: true,
    },
    {
      title: "Tests",
      href: "/tests",
      icon: Activity,
      requireAuth: true,
    },
    {
      title: "Doctors",
      href: "/doctors",
      icon: Users,
      requireAuth: true,
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: BarChart,
      requireAuth: true,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
      requireAuth: true,
    },
  ]

  const filteredRoutes = routes.filter((route) => !route.requireAuth || isAuthenticated)

  const SidebarContent = () => (
    <div className="flex h-full w-full flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          Medima
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {filteredRoutes.map((route) => (
            <Button
              key={route.href}
              variant={pathname === route.href ? "secondary" : "ghost"}
              className={cn("w-full justify-start", pathname === route.href && "bg-muted font-medium")}
              asChild
            >
              <Link href={route.href} onClick={() => isMobile && setIsOpen(false)}>
                <route.icon className="mr-2 h-4 w-4" />
                {route.title}
              </Link>
            </Button>
          ))}
        </nav>
      </div>
      {isAuthenticated && (
        <div className="mt-auto border-t p-4">
          {user && (
            <div className="mb-2 text-sm text-muted-foreground">
              Logged in as: <span className="font-medium">{user.name}</span>
            </div>
          )}
          <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      )}
    </div>
  )

  // Mobile sidebar with Sheet component
  if (isMobile) {
    return (
      <>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </>
    )
  }

  // Desktop sidebar
  return (
    <div className={cn("hidden border-r bg-background md:block", className)}>
      <SidebarContent />
    </div>
  )
}
