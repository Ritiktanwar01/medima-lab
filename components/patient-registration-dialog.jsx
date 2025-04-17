"use client"
import { useForm } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { registerPatient } from "@/redux/features/patientSlice"
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
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { MultiSelect } from "@/components/multi-select"
import { toast } from "@/components/ui/use-toast"
import { useState, useEffect } from "react"

export default function PatientRegistrationDialog({ open, onOpenChange, onSuccess }) {
  const dispatch = useDispatch()
  const { token } = useSelector((state) => state.auth) // Get token from Redux store
  const [doctors, setDoctors] = useState([])
  const [tests, setTests] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalAmount, setTotalAmount] = useState(0)

  const form = useForm({
    defaultValues: {
      name: "",
      mobile: "",
      email: "",
      whatsapp: "",
      gender: "male",
      age: "",
      doctorId: "",
      tests: [],
      paymentType: "prepaid",
      registrationAmount: 0,
    },
  })

  const paymentType = form.watch("paymentType")
  const selectedTests = form.watch("tests")

  // Fetch doctors and tests on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch doctors
        const doctorsResponse = await fetch("http://localhost:8000/api/doctors", {
          headers: {
            Authorization: `Bearer ${token}`, // Add token to request headers
          },
        })
        const doctorsData = await doctorsResponse.json()

        if (doctorsData.success) {
          setDoctors(
            doctorsData.data.map((doctor) => ({
              id: doctor.id,
              name: doctor.name,
            })),
          )
        }

        // Fetch tests
        const testsResponse = await fetch("http://localhost:8000/api/tests", {
          headers: {
            Authorization: `Bearer ${token}`, // Add token to request headers
          },
        })
        const testsData = await testsResponse.json()

        if (testsData.success) {
          setTests(
            testsData.data.map((test) => ({
              id: test._id,
              name: test.name,
              price: test.price,
              parameters: test.parameters || [],
            })),
          )
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load doctors and tests",
          variant: "destructive",
        })
      }
    }

    if (open && token) {
      fetchData()
    }
  }, [open, token])

  // Calculate total amount when selected tests change
  useEffect(() => {
    if (selectedTests.length > 0 && tests.length > 0) {
      const total = selectedTests.reduce((sum, testId) => {
        const test = tests.find((t) => t.id === testId)
        return sum + (test ? parseInt(test.price) : 0)
      }, 0)
      setTotalAmount(total)
      form.setValue("totalAmount", total)
    } else {
      setTotalAmount(0)
      form.setValue("totalAmount", 0)
    }
  }, [selectedTests, tests, form])

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      // Add doctor name and test details
      const selectedDoctor = doctors.find((d) => d.id === data.doctorId)
      const selectedTestsDetails = tests.filter((t) => data.tests.includes(t.id))

      const patientData = {
        ...data,
        doctorName: selectedDoctor ? selectedDoctor.name : "",
        totalAmount,
        tests: selectedTestsDetails.map((t) => ({
          testId: t.id,
          testName: t.name,
          price: t.price,
          parameters: t.parameters,
        })),
      }

      // Save to database
      const response = await fetch("http://localhost:8000/api/patients/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(patientData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to register patient")
      }

      // Also update Redux store
      await dispatch(registerPatient(result.data))

      toast({
        title: "Patient registered successfully",
        description: `${data.name} has been registered for ${data.tests.length} tests.`,
      })

      form.reset()
      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Error registering patient:", error)
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register New Patient</DialogTitle>
          <DialogDescription>Enter patient details to register for lab tests</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: "Name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter patient name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="age"
                rules={{
                  required: "Age is required",
                  pattern: {
                    value: /^[0-9]+$/,
                    message: "Please enter a valid age",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter age" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mobile"
                rules={{
                  required: "Mobile number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Please enter a valid 10-digit mobile number",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter mobile number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whatsapp"
                rules={{
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Please enter a valid 10-digit WhatsApp number",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter WhatsApp number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                rules={{
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Please enter a valid email address",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                rules={{ required: "Gender is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="male" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">Male</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="female" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">Female</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="other" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">Other</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="doctorId"
              rules={{ required: "Referring doctor is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referring Doctor</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a doctor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {doctors.map((doctor) => {
                        console.log(doctor)
                        return(
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.name}
                        </SelectItem>
                      )})}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tests"
              rules={{ required: "At least one test must be selected" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tests</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={tests.map((test) => ({
                        value: test.id,
                        label: `${test.name} (₹${test.price})`,
                      }))}
                      selected={field.value}
                      onChange={field.onChange}
                      placeholder="Select tests"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-muted p-3 rounded-md">
              <div className="font-medium">Total Amount: ₹{totalAmount}</div>
            </div>

            <FormField
              control={form.control}
              name="paymentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Type</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="prepaid" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">Prepaid</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="postpaid" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">Postpaid</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {paymentType === "postpaid" && (
              <FormField
                control={form.control}
                name="registrationAmount"
                rules={{
                  required: "Registration amount is required for postpaid",
                  validate: (value) => value >= 0 || "Registration amount cannot be negative",
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter registration amount"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Registering..." : "Register Patient"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
