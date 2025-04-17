"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Printer, Download } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function ReceiptPrint({ receipt, open, onOpenChange, labInfo }) {
  const printRef = useRef(null)
  const { toast } = useToast()
  const [isPrinting, setIsPrinting] = useState(false)

  const handlePrint = () => {
    setIsPrinting(true)

    try {
      const printContent = printRef.current

      // Create a new window for printing
      const printWindow = window.open("", "_blank", "width=800,height=600")
      printWindow.document.open()
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Receipt</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                color: #333;
              }
              .receipt {
                max-width: 800px;
                margin: 0 auto;
                position: relative;
              }
              .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 2px solid #333;
              }
              .logo {
                width: 80px;
                height: 80px;
              }
              .lab-info {
                text-align: center;
                flex: 1;
              }
              .lab-name {
                font-size: 24px;
                font-weight: bold;
                margin: 0;
              }
              .lab-address {
                margin: 5px 0;
              }
              .contact-info {
                text-align: right;
              }
              .receipt-details {
                margin-bottom: 20px;
              }
              .receipt-id {
                font-weight: bold;
              }
              .patient-info {
                margin-bottom: 20px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
              }
              th, td {
                padding: 8px;
                text-align: left;
                border-bottom: 1px solid #ddd;
              }
              th {
                background-color: #f2f2f2;
              }
              .total {
                text-align: right;
                font-weight: bold;
                margin-top: 20px;
              }
              .footer {
                margin-top: 30px;
                text-align: center;
                font-size: 12px;
                color: #666;
                border-top: 1px solid #ddd;
                padding-top: 10px;
              }
              .watermark {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-45deg);
                opacity: 0.1;
                font-size: 60px;
                font-weight: bold;
                color: #333;
                z-index: -1;
              }
              .signature {
                margin-top: 50px;
                text-align: right;
              }
              .signature-line {
                width: 200px;
                border-top: 1px dotted #333;
                margin-left: auto;
                padding-top: 5px;
              }
              @media print {
                @page {
                  size: A4;
                  margin: 10mm;
                }
                body {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `)

      printWindow.document.close()

      // Wait for images to load before printing
      setTimeout(() => {
        printWindow.focus()
        printWindow.print()
        printWindow.onafterprint = () => {
          printWindow.close()
          setIsPrinting(false)
        }
      }, 1000)
    } catch (error) {
      console.error("Error printing:", error)
      toast({
        title: "Error",
        description: "Failed to print receipt. Please try again.",
        variant: "destructive",
      })
      setIsPrinting(false)
    }
  }

  const handleDownload = () => {
    // Implementation for downloading as PDF would go here
    toast({
      title: "Feature coming soon",
      description: "PDF download will be available in the next update.",
    })
  }

  if (!receipt) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Receipt Preview</DialogTitle>
        </DialogHeader>

        <div ref={printRef} className="receipt">
          <div className="watermark">{labInfo?.labName || "MEDIMA"}</div>

          <div className="header">
            <div className="logo-container">
              <svg className="logo" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="45" fill="#f0f0f0" stroke="#333" strokeWidth="2" />
                <circle cx="50" cy="30" r="10" fill="#333" />
                <rect x="45" y="40" width="10" height="30" fill="#333" />
                <path d="M30,60 Q50,80 70,60" fill="none" stroke="#333" strokeWidth="3" />
              </svg>
            </div>

            <div className="lab-info">
              <h1 className="lab-name">{labInfo?.labName || "Medima Diagnostics"}</h1>
              <p className="lab-address">{labInfo?.address || "123 Medical Street, Healthcare City"}</p>
              <p className="lab-address">{labInfo?.gstNumber ? `GST: ${labInfo.gstNumber}` : ""}</p>
            </div>

            <div className="contact-info">
              <p>{labInfo?.phone || "Phone: 1234567890"}</p>
              <p>{labInfo?.email || "Email: info@medima.com"}</p>
              <p>{labInfo?.website || "www.medima.com"}</p>
            </div>
          </div>

          <div className="receipt-details">
            <p>
              <span className="receipt-id">Receipt ID:</span> {receipt.receiptId || receipt._id}
            </p>
            <p>
              <span className="receipt-id">Date:</span> {new Date(receipt.date).toLocaleDateString()}
            </p>
          </div>

          <div className="patient-info">
            <h3>Patient Information</h3>
            <p>
              <strong>Name:</strong> {receipt.patientName}
            </p>
            <p>
              <strong>Doctor:</strong> {receipt.doctorName || "N/A"}
            </p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Test</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {receipt.tests.map((test, index) => (
                <tr key={index}>
                  <td>{test.testName}</td>
                  <td>₹{test.price}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="total">
            <p>Total Amount: ₹{receipt.amount}</p>
            <p>Payment Method: {receipt.paymentMethod}</p>
            <p>Status: {receipt.status}</p>
          </div>

          <div className="signature">
            <div className="signature-line">Authorized Signature</div>
          </div>

          <div className="footer">
            <p>Thank you for choosing {labInfo?.labName || "Medima Diagnostics"}!</p>
            <p>This is a computer-generated receipt and does not require a physical signature.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
          <Button onClick={handlePrint} disabled={isPrinting}>
            <Printer className="mr-2 h-4 w-4" /> {isPrinting ? "Printing..." : "Print Receipt"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
