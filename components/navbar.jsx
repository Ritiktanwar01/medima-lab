"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useDispatch, useSelector } from "react-redux"
import { logout } from "@/redux/features/authSlice"
import { Home, Users, FileText, Settings, LogOut, LogIn, UserPlus, Menu } from "lucide-react"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"

export default function Navbar() {
  const pathname = usePathname()
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    dispatch(logout())
  }

  const routes = [
    { href: "/", label: "Home", icon: <Home className="h-4 w-4 mr-2" /> },
    { href: "/patients", label: "Patients", icon: <Users className="h-4 w-4 mr-2" />, auth: true },
    { href: "/receipts", label: "Receipts", icon: <FileText className="h-4 w-4 mr-2" />, auth: true },
    { href: "/settings", label: "Settings", icon: <Settings className="h-4 w-4 mr-2" />, auth: true },
  ]

  const NavLinks = ({ className = "", onClick = () => {} }) => (
    <div className={className}>
      {routes.map((route) => {
        if (route.auth && !isAuthenticated) return null

        return (
          <Button key={route.href} variant={pathname === route.href ? "default" : "ghost"} asChild onClick={onClick}>
            <Link href={route.href} className="flex items-center">
              {route.icon}
              {route.label}
            </Link>
          </Button>
        )
      })}
    </div>
  )

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold">
            Medima
          </Link>
          <nav className="hidden md:flex ml-6 space-x-2">
            <NavLinks />
          </nav>
        </div>

        <div className="hidden md:flex items-center space-x-2">
          {isAuthenticated ? (
            <>
              <span className="text-sm mr-4">Hello, {user?.name || "User"}</span>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Link>
              </Button>
              <Button asChild>
                <Link href="/signup">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </Link>
              </Button>
            </>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <div className="flex flex-col space-y-4 py-4">
              <SheetClose asChild>
                <NavLinks className="flex flex-col space-y-2" onClick={() => setOpen(false)} />
              </SheetClose>

              {isAuthenticated ? (
                <>
                  <div className="text-sm py-2 border-t">Hello, {user?.name || "User"}</div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleLogout()
                      setOpen(false)
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-2 border-t">
                  <SheetClose asChild>
                    <Button variant="ghost" asChild>
                      <Link href="/login">
                        <LogIn className="h-4 w-4 mr-2" />
                        Login
                      </Link>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button asChild>
                      <Link href="/signup">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Sign Up
                      </Link>
                    </Button>
                  </SheetClose>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
