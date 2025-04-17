import { Providers } from "@/redux/provider"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Medima - Medical Laboratory Services",
  description: "Pathology lab management system",
  generator: "v0.dev",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}

import "./globals.css"

import "./globals.css"

import "./globals.css"


import './globals.css'