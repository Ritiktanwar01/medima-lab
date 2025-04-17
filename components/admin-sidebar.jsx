"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Users, Settings, Menu, Activity, Database, LogOut, User, Receipt, ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function AdminSidebar({ className }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [adminUser, setAdminUser] = useState(null)
  const [collections, setCollections] = useState([])

  // Check if mobile on mount and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkIfMobile()

    // Add event listener
    window.addEventListener("resize", checkIfMobile)

    // Get admin user from localStorage
    const userStr = localStorage.getItem("adminUser")
    if (userStr) {
      setAdminUser(JSON.parse(userStr))
    }

    // Fetch collections
    const fetchCollections = async () => {
      try {
        const response = await fetch("/api/admin/collections")
        const result = await response.json()

        if (result.success) {
          setCollections(result.collections)
        }
      } catch (error) {
        console.error("Error fetching collections:", error)
      }
    }

    fetchCollections()

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    localStorage.removeItem("adminUser")
    router.push("/admin/login")
  }

  const getCollectionIcon = (name) => {
    switch (name) {
      case "users":
        return <User className="mr-2 h-4 w-4" />
      case "patients":
        return <Users className="mr-2 h-4 w-4" />
      case "doctors":
        return <Users className="mr-2 h-4 w-4" />
      case "tests":
        return <Activity className="mr-2 h-4 w-4" />
      case "reports":
        return <ClipboardList className="mr-2 h-4 w-4" />
      case "receipts":
        return <Receipt className="mr-2 h-4 w-4" />
      default:
        return <Database className="mr-2 h-4 w-4" />
    }
  }

  const routes = [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: <Home className="mr-2 h-4 w-4" />,
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
    },
  ]

  const SidebarContent = () => (
    <div className="flex h-full w-full flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold text-xl">
          Medima Admin
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {routes.map((route) => (
            <Link key={route.href} href={route.href} onClick={() => isMobile && setIsOpen(false)}>
              <Button
                variant={pathname === route.href ? "secondary" : "ghost"}
                className={cn("w-full justify-start", pathname === route.href && "bg-muted font-medium")}
              >
                {route.icon}
                {route.title}
              </Button>
            </Link>
          ))}

          {collections.length > 0 && (
            <>
              <div className="my-2 px-2 text-xs font-semibold text-muted-foreground">COLLECTIONS</div>

              {collections.map((collection) => (
                <Link
                  key={collection.name}
                  href={`/admin/dashboard?collection=${collection.name}`}
                  onClick={() => isMobile && setIsOpen(false)}
                >
                  <Button
                    variant={pathname.includes(collection.name) ? "secondary" : "ghost"}
                    className={cn("w-full justify-start", pathname.includes(collection.name) && "bg-muted font-medium")}
                  >
                    {getCollectionIcon(collection.name)}
                    {collection.displayName}
                    <span className="ml-auto text-xs text-muted-foreground">{collection.count}</span>
                  </Button>
                </Link>
              ))}
            </>
          )}
        </nav>
      </div>
      <div className="mt-auto border-t p-4">
        {adminUser && (
          <div className="mb-2 text-sm text-muted-foreground">
            Logged in as: <span className="font-medium">{adminUser.username}</span>
          </div>
        )}
        <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
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
