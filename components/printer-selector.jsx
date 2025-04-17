"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Printer, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function PrinterSelector({ value, onChange }) {
  const [printers, setPrinters] = useState([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const { toast } = useToast()

  // Fetch available printers
  const fetchPrinters = async () => {
    setRefreshing(true)
    try {
      // In a real app, you would fetch printers from your API
      // For now, we'll simulate a delay and return mock data
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setPrinters([
        { id: "default", name: "Default Printer" },
        { id: "hp-laserjet", name: "HP LaserJet Pro" },
        { id: "epson-l3150", name: "Epson L3150" },
        { id: "canon-g2010", name: "Canon G2010" },
        { id: "brother-dcp", name: "Brother DCP-T710W" },
      ])
    } catch (error) {
      console.error("Error fetching printers:", error)
      toast({
        title: "Error",
        description: "Failed to load available printers",
        variant: "destructive",
      })
    } finally {
      setRefreshing(false)
    }
  }

  // Test print
  const handleTestPrint = async () => {
    if (!value) {
      toast({
        title: "No printer selected",
        description: "Please select a printer first",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // In a real app, you would send a test print request to your API
      // For now, we'll simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Test print sent",
        description: `A test page has been sent to ${printers.find((p) => p.id === value)?.name || value}`,
      })
    } catch (error) {
      console.error("Error sending test print:", error)
      toast({
        title: "Error",
        description: "Failed to send test print",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch printers on component mount
  useEffect(() => {
    fetchPrinters()
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1 space-y-2">
          <Label htmlFor="printer">Default Printer</Label>
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger id="printer">
              <SelectValue placeholder="Select a printer" />
            </SelectTrigger>
            <SelectContent>
              {printers.map((printer) => (
                <SelectItem key={printer.id} value={printer.id}>
                  {printer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchPrinters} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={handleTestPrint} disabled={loading || !value}>
            <Printer className="mr-2 h-4 w-4" />
            {loading ? "Printing..." : "Test Print"}
          </Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Select your default printer for receipts and reports. You can change this at any time.
      </p>
    </div>
  )
}
