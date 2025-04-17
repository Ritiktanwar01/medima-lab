"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search, FileText, Printer, Download, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { ReceiptPrint } from "@/components/receipt-print"

export default function ReceiptsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [receipts, setReceipts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedReceipt, setSelectedReceipt] = useState(null)
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false)
  const [labInfo, setLabInfo] = useState(null)
  const router = useRouter()
  const { isAuthenticated, token } = useSelector((state) => state.auth)
  const { toast } = useToast()

  const fetchReceipts = async () => {
    setIsLoading(true)
    try {
      // Updated to use Django backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/receipts/?search=${searchQuery}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()

      if (data.success) {
        setReceipts(data.data)
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch receipts",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching receipts:", error)
      toast({
        title: "Error",
        description: "Failed to fetch receipts. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchLabInfo = async () => {
    try {
      // Updated to use Django backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/settings/lab-info/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()

      if (data.success) {
        setLabInfo(data.data)
      }
    } catch (error) {
      console.error("Error fetching lab info:", error)
    }
  }

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchReceipts()
      fetchLabInfo()
    }
  }, [isAuthenticated, token])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchReceipts()
  }

  const handlePrintReceipt = (receipt) => {
    setSelectedReceipt(receipt)
    setIsPrintDialogOpen(true)
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-6">Please log in to view receipts</p>
        <Button onClick={() => router.push("/login")}>Go to Login</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Receipts</h1>
      </div>

      <div className="flex gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search receipts by ID or patient name"
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        <Button variant="outline" onClick={fetchReceipts} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Receipt ID</TableHead>
              <TableHead>Patient Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Tests</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : receipts.length > 0 ? (
              receipts.map((receipt) => (
                <TableRow key={receipt.id || receipt._id}>
                  <TableCell>{receipt.receipt_id || receipt.receiptId}</TableCell>
                  <TableCell className="font-medium">{receipt.patient_name || receipt.patientName}</TableCell>
                  <TableCell>{new Date(receipt.date).toLocaleDateString()}</TableCell>
                  <TableCell>₹{receipt.amount}</TableCell>
                  <TableCell>{receipt.payment_method || receipt.paymentMethod}</TableCell>
                  <TableCell>{receipt.tests.length} tests</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      {receipt.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon">
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handlePrintReceipt(receipt)}>
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  No receipts found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ReceiptPrint
        receipt={selectedReceipt}
        open={isPrintDialogOpen}
        onOpenChange={setIsPrintDialogOpen}
        labInfo={labInfo}
      />
    </div>
  )
}
