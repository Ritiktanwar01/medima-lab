"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useSelector } from "react-redux"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ReportFormDialog({ open, onOpenChange, onSuccess }) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [allTests, setAllTests] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [testParameters, setTestParameters] = useState({})
  const { token } = useSelector((state) => state.auth)

  const form = useForm({
    defaultValues: {
      patientId: "",
      doctorId: "",
      status: "pending",
      notes: "",
    },
  })

  // Watch for patient selection changes
  const selectedPatientId = form.watch("patientId")

  // Fetch patients, doctors, and tests on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch patients
        const patientsResponse = await fetch("/api/patients", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const patientsData = await patientsResponse.json()

        if (patientsData.success) {
          setPatients(patientsData.data)
        }

        // Fetch doctors
        const doctorsResponse = await fetch("/api/doctors", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const doctorsData = await doctorsResponse.json()

        if (doctorsData.success) {
          setDoctors(doctorsData.data)
        }

        // Fetch all tests
        const testsResponse = await fetch("/api/tests", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const testsData = await testsResponse.json()

        if (testsData.success) {
          setAllTests(testsData.data)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive",
        })
      }
    }

    if (open) {
      fetchData()
    }
  }, [open, token, toast])

  // When patient is selected, get their tests
  useEffect(() => {
    if (selectedPatientId && patients.length > 0) {
      const patient = patients.find((p) => p._id === selectedPatientId)
      if (patient) {
        setSelectedPatient(patient)

        // Set doctor if available
        if (patient.doctorId) {
          form.setValue("doctorId", patient.doctorId)
        }

        // Initialize test parameters
        if (patient.tests && patient.tests.length > 0) {
          const params = {}

          patient.tests.forEach((test) => {
            // Find the test details from allTests
            const testDetails = allTests.find((t) => t._id === test.testId)

            if (testDetails && testDetails.parameters) {
              params[test.testId] = testDetails.parameters.map((param) => {
                const normalRange = param.normalRanges && param.normalRanges.length > 0 ? param.normalRanges[0] : null

                return {
                  parameter: param.name,
                  value: "",
                  unit: normalRange ? normalRange.unit : "",
                  normalRange: normalRange ? `${normalRange.minValue}-${normalRange.maxValue}` : "",
                }
              })
            } else {
              // Fallback if test details not found
              params[test.testId] = [
                {
                  parameter: "Result",
                  value: "",
                  unit: "",
                  normalRange: "",
                },
              ]
            }
          })

          setTestParameters(params)
        }
      }
    }
  }, [selectedPatientId, patients, allTests, form])

  const handleParameterChange = (testId, paramIndex, value) => {
    setTestParameters((prev) => {
      const updated = { ...prev }
      if (updated[testId] && updated[testId][paramIndex]) {
        updated[testId][paramIndex].value = value
      }
      return updated
    })
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      if (!selectedPatient || !selectedPatient.tests || selectedPatient.tests.length === 0) {
        toast({
          title: "Error",
          description: "No tests found for this patient",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Format the tests data with results
      const formattedTests = selectedPatient.tests.map((test) => {
        return {
          testId: test.testId,
          testName: test.testName,
          results: testParameters[test.testId] || [],
        }
      })

      const reportData = {
        patientId: selectedPatient._id,
        patientName: selectedPatient.name,
        doctorId: data.doctorId,
        doctorName: doctors.find((d) => d._id === data.doctorId)?.name || "",
        tests: formattedTests,
        status: data.status,
        notes: data.notes,
        date: new Date().toISOString(),
      }

      const response = await fetch("http://97.74.90.82:1200/api/reports/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reportData),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Report created successfully",
        })

        // If report is completed, create a receipt
        if (data.status === "completed") {
          await createReceipt(result.data, selectedPatient)
        }

        form.reset()
        onOpenChange(false)
        if (onSuccess) onSuccess()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to create report",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating report:", error)
      toast({
        title: "Error",
        description: "Failed to create report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Function to create a receipt for completed reports
  const createReceipt = async (report, patient) => {
    try {
      // Calculate total amount
      const totalAmount = patient.tests.reduce((sum, test) => sum + (test.price || 0), 0)

      const receiptData = {
        patientId: patient._id,
        patientName: patient.name,
        date: new Date().toISOString(),
        amount: totalAmount,
        paymentMethod: "Cash",
        tests: patient.tests,
        status: "Paid",
        reportId: report._id,
      }

      const response = await fetch("http://97.74.90.82:1200/api/receipts/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(receiptData),
      })

      const result = await response.json()

      if (!result.success) {
        console.error("Failed to create receipt:", result.message)
      }
    } catch (error) {
      console.error("Error creating receipt:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Report</DialogTitle>
          <DialogDescription>Enter report details to create a new test report</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="patientId"
              rules={{ required: "Patient is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a patient" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient._id} value={patient._id}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="doctorId"
              rules={{ required: "Doctor is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referring Doctor</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a doctor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor._id} value={doctor._id}>
                          {doctor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedPatient && selectedPatient.tests && selectedPatient.tests.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Test Results</h3>
                <Accordion type="multiple" className="w-full">
                  {selectedPatient.tests.map((test) => (
                    <AccordionItem key={test.testId} value={test.testId}>
                      <AccordionTrigger>{test.testName}</AccordionTrigger>
                      <AccordionContent>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Parameters</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {testParameters[test.testId]?.map((param, index) => (
                                <div key={index} className="grid grid-cols-3 gap-4">
                                  <div>
                                    <FormLabel>{param.parameter}</FormLabel>
                                  </div>
                                  <div>
                                    <Input
                                      value={param.value}
                                      onChange={(e) => handleParameterChange(test.testId, index, e.target.value)}
                                      placeholder="Enter value"
                                    />
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {param.unit} ({param.normalRange})
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter any notes or observations" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Report"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
