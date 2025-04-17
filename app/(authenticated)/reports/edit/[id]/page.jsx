"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, RefreshCw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function EditReportPage({ params }) {
  const { id } = params
  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated, token } = useSelector((state) => state.auth)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [report, setReport] = useState(null)
  const [doctors, setDoctors] = useState([])
  const [formData, setFormData] = useState({
    doctorId: "",
    status: "",
    notes: "",
    tests: [],
  })

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
          setFormData({
            doctorId: data.data.doctorId || "",
            status: data.data.status || "pending",
            notes: data.data.notes || "",
            tests: data.data.tests || [],
          })
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

    const fetchDoctors = async () => {
      if (!isAuthenticated) return

      try {
        const response = await fetch("/api/doctors", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch doctors")
        }

        const data = await response.json()
        if (data.success) {
          setDoctors(data.data)
        }
      } catch (error) {
        console.error("Error fetching doctors:", error)
      }
    }

    fetchReport()
    fetchDoctors()
  }, [id, isAuthenticated, router, toast, token])

  const handleTestResultChange = (testIndex, resultIndex, field, value) => {
    const updatedTests = [...formData.tests]
    updatedTests[testIndex].results[resultIndex][field] = value
    setFormData({ ...formData, tests: updatedTests })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Get doctor name if doctorId changed
      let doctorName = report.doctorName
      if (formData.doctorId !== report.doctorId) {
        const doctor = doctors.find((d) => d._id === formData.doctorId)
        if (doctor) {
          doctorName = doctor.name
        }
      }

      const updatedReport = {
        ...formData,
        doctorName,
      }

      const response = await fetch(`/api/reports/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedReport),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Report updated",
          description: `Report has been updated successfully.`,
        })
        router.push("/reports")
      } else {
        throw new Error(data.message || "Failed to update report")
      }
    } catch (error) {
      console.error("Error updating report:", error)
      toast({
        title: "Update failed",
        description: error.message || "An error occurred while updating the report",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-6">Please log in to edit reports</p>
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
      <div className="flex items-center mb-6">
        <Button variant="outline" onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-3xl font-bold">Edit Report {report.reportId}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Information</CardTitle>
              <CardDescription>Basic information about the report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patientName">Patient Name</Label>
                  <Input id="patientName" value={report.patientName} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctorId">Doctor</Label>
                  <Select
                    value={formData.doctorId}
                    onValueChange={(value) => setFormData({ ...formData, doctorId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor._id} value={doctor._id}>
                          {doctor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {formData.tests.map((test, testIndex) => (
            <Card key={testIndex}>
              <CardHeader>
                <CardTitle>{test.testName}</CardTitle>
                <CardDescription>Test results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-10 px-4 text-left align-middle font-medium">Parameter</th>
                        <th className="h-10 px-4 text-left align-middle font-medium">Value</th>
                        <th className="h-10 px-4 text-left align-middle font-medium">Unit</th>
                        <th className="h-10 px-4 text-left align-middle font-medium">Normal Range</th>
                      </tr>
                    </thead>
                    <tbody>
                      {test.results &&
                        test.results.map((result, resultIndex) => (
                          <tr key={resultIndex} className="border-b">
                            <td className="p-2 align-middle">{result.parameter}</td>
                            <td className="p-2 align-middle">
                              <Input
                                value={result.value}
                                onChange={(e) =>
                                  handleTestResultChange(testIndex, resultIndex, "value", e.target.value)
                                }
                                className="h-8"
                              />
                            </td>
                            <td className="p-2 align-middle">{result.unit}</td>
                            <td className="p-2 align-middle">{result.normalRange}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardFooter className="flex justify-between pt-6">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" /> {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}
