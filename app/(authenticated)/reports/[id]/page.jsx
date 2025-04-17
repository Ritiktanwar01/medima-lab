"use client"

import { useState, useEffect, useRef } from "react"
import { useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { ArrowLeft, Printer, Download, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function ViewReportPage({ params }) {
  const { id } = params
  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated, token } = useSelector((state) => state.auth)
  const [isLoading, setIsLoading] = useState(true)
  const [report, setReport] = useState(null)
  const [labInfo, setLabInfo] = useState(null)
  const [isPrinting, setIsPrinting] = useState(false)
  const printRef = useRef(null)

  // Fetch report data
  useEffect(() => {
    const fetchReport = async () => {
      if (!isAuthenticated || !id) return

      setIsLoading(true)
      try {
        const response = await fetch(`/api/reports/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch report")
        }

        const data = await response.json()
        if (data.success) {
          setReport(data.data)
        } else {
          toast({
            title: "Error",
            description: data.message || "Failed to fetch report",
            variant: "destructive",
          })
          router.push("/reports")
        }
      } catch (error) {
        console.error("Error fetching report:", error)
        toast({
          title: "Error",
          description: "Failed to fetch report. Please try again.",
          variant: "destructive",
        })
        router.push("/reports")
      } finally {
        setIsLoading(false)
      }
    }

    const fetchLabInfo = async () => {
      if (!isAuthenticated) return

      try {
        const response = await fetch("/api/settings/lab-info", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch lab info")
        }

        const data = await response.json()
        if (data.success) {
          setLabInfo(data.data)
        }
      } catch (error) {
        console.error("Error fetching lab info:", error)
      }
    }

    fetchReport()
    fetchLabInfo()
  }, [id, isAuthenticated, router, toast, token])

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>
      case "pending":
        return <Badge variant="outline">Pending</Badge>
      case "in-progress":
        return <Badge className="bg-amber-500">In Progress</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

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
            <title>Print Report</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                color: #333;
              }
              .report {
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
              .report-details {
                margin-bottom: 20px;
              }
              .report-id {
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
              .notes {
                margin-top: 20px;
                padding: 10px;
                background-color: #f9f9f9;
                border-radius: 4px;
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
        description: "Failed to print report. Please try again.",
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

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-6">Please log in to view reports</p>
        <Button onClick={() => router.push("/login")}>Go to Login</Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="container mx-auto py-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Report Not Found</CardTitle>
            <CardDescription>The report you are looking for does not exist.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="outline" onClick={() => router.back()} className="mr-2">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-3xl font-bold">Report {report.reportId}</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
          <Button onClick={handlePrint} disabled={isPrinting}>
            <Printer className="mr-2 h-4 w-4" /> {isPrinting ? "Printing..." : "Print"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Report Details</span>
              {getStatusBadge(report.status)}
            </CardTitle>
            <CardDescription>Basic information about the report</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium">Report ID</h3>
                <p>{report.reportId}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Date</h3>
                <p>{new Date(report.date).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Patient Name</h3>
                <p>{report.patientName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Doctor</h3>
                <p>{report.doctorName}</p>
              </div>
            </div>
            {report.notes && (
              <div>
                <h3 className="text-sm font-medium">Notes</h3>
                <p className="bg-muted p-3 rounded-md">{report.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {report.tests.map((test, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{test.testName}</CardTitle>
              <CardDescription>Test results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="p-2 text-left">Parameter</th>
                      <th className="p-2 text-left">Value</th>
                      <th className="p-2 text-left">Unit</th>
                      <th className="p-2 text-left">Normal Range</th>
                    </tr>
                  </thead>
                  <tbody>
                    {test.results &&
                      test.results.map((result, resultIndex) => (
                        <tr key={resultIndex} className="border-t">
                          <td className="p-2">{result.parameter}</td>
                          <td className="p-2 font-medium">{result.value || "-"}</td>
                          <td className="p-2">{result.unit}</td>
                          <td className="p-2">{result.normalRange}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Hidden div for printing */}
      <div className="hidden">
        <div ref={printRef} className="report">
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

          <div className="report-details">
            <h2>TEST REPORT</h2>
            <p>
              <span className="report-id">Report ID:</span> {report.reportId}
            </p>
            <p>
              <span className="report-id">Date:</span> {new Date(report.date).toLocaleDateString()}
            </p>
            <p>
              <span className="report-id">Status:</span> {report.status}
            </p>
          </div>

          <div className="patient-info">
            <h3>Patient Information</h3>
            <p>
              <strong>Name:</strong> {report.patientName}
            </p>
            <p>
              <strong>Doctor:</strong> {report.doctorName}
            </p>
          </div>

          {report.tests.map((test, index) => (
            <div key={index} style={{ marginBottom: "20px" }}>
              <h3>{test.testName}</h3>
              <table>
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Value</th>
                    <th>Unit</th>
                    <th>Normal Range</th>
                  </tr>
                </thead>
                <tbody>
                  {test.results &&
                    test.results.map((result, resultIndex) => (
                      <tr key={resultIndex}>
                        <td>{result.parameter}</td>
                        <td>{result.value || "-"}</td>
                        <td>{result.unit}</td>
                        <td>{result.normalRange}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ))}

          {report.notes && (
            <div className="notes">
              <h3>Notes</h3>
              <p>{report.notes}</p>
            </div>
          )}

          <div className="signature">
            <div className="signature-line">Authorized Signature</div>
          </div>

          <div className="footer">
            <p>Thank you for choosing {labInfo?.labName || "Medima Diagnostics"}!</p>
            <p>This is a computer-generated report and does not require a physical signature.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
