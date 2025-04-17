"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiSelect } from "@/components/multi-select"

export default function EditPatientPage({ params }) {
  const { id } = params
  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated, token } = useSelector((state) => state.auth)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [patient, setPatient] = useState(null)
  const [doctors, setDoctors] = useState([])
  const [tests, setTests] = useState([])
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "male",
    mobile: "",
    whatsapp: "",
    email: "",
    doctorId: "",
    tests: [],
  })

  // Fetch patient data and other required data
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !id) return

      setIsLoading(true)
      try {
        // Fetch patient data
        const patientResponse = await fetch(`/api/patients/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!patientResponse.ok) {
          throw new Error("Failed to fetch patient data")
        }

        const patientData = await patientResponse.json()

        if (patientData.success) {
          setPatient(patientData.data)

          // Set form data from patient
          setFormData({
            name: patientData.data.name || "",
            age: patientData.data.age?.toString() || "",
            gender: patientData.data.gender || "male",
            mobile: patientData.data.mobile || "",
            whatsapp: patientData.data.whatsapp || "",
            email: patientData.data.email || "",
            doctorId: patientData.data.doctorId || "",
            tests: patientData.data.tests?.map((test) => test.testId) || [],
          })
        } else {
          toast({
            title: "Error",
            description: patientData.message || "Failed to fetch patient data",
            variant: "destructive",
          })
          router.push("/patients")
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

        // Fetch tests
        const testsResponse = await fetch("/api/tests", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const testsData = await testsResponse.json()
        if (testsData.success) {
          setTests(testsData.data)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to fetch patient data. Please try again.",
          variant: "destructive",
        })
        router.push("/patients")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id, isAuthenticated, router, toast, token])

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Format the data for API
      const updatedPatient = {
        ...formData,
        // Add any additional fields needed for the API
      }

      // Update patient data
      const response = await fetch(`/api/patients/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedPatient),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Patient updated",
          description: `${formData.name}'s information has been updated successfully.`,
        })
        router.push("/patients")
      } else {
        throw new Error(result.message || "Failed to update patient")
      }
    } catch (error) {
      console.error("Error updating patient:", error)
      toast({
        title: "Update failed",
        description: error.message || "An error occurred while updating the patient",
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
        <p className="text-muted-foreground mb-6">Please log in to edit patient information</p>
        <Button onClick={() => router.push("/login")}>Go to Login</Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="container mx-auto py-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Patient Not Found</CardTitle>
            <CardDescription>The patient you are looking for does not exist.</CardDescription>
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
        <h1 className="text-3xl font-bold">Edit Patient</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
            <CardDescription>Edit patient details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" value={formData.age} onChange={(e) => handleChange("age", e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  value={formData.mobile}
                  onChange={(e) => handleChange("mobile", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => handleChange("whatsapp", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <RadioGroup
                  value={formData.gender}
                  onValueChange={(value) => handleChange("gender", value)}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male" className="font-normal cursor-pointer">
                      Male
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female" className="font-normal cursor-pointer">
                      Female
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other" className="font-normal cursor-pointer">
                      Other
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="doctorId">Referring Doctor</Label>
              <Select value={formData.doctorId} onValueChange={(value) => handleChange("doctorId", value)}>
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

            <div className="space-y-2">
              <Label htmlFor="tests">Tests</Label>
              <MultiSelect
                options={tests.map((test) => ({
                  value: test._id,
                  label: test.name,
                }))}
                selected={formData.tests}
                onChange={(selected) => handleChange("tests", selected)}
                placeholder="Select tests"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" /> {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
