"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { PlusCircle, Search, FileText, Edit, Trash, RefreshCw } from "lucide-react"
import PatientRegistrationDialog from "@/components/patient-registration-dialog"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

export default function PatientsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [patients, setPatients] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { isAuthenticated, token } = useSelector((state) => state.auth)
  const { toast } = useToast()

  const fetchPatients = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`http://97.74.90.82:1200/api/patients/?search=${searchQuery}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()

      if (data.success) {
        setPatients(data.data)
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch patients",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching patients:", error)
      toast({
        title: "Error",
        description: "Failed to fetch patients. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchPatients()
    }
  }, [isAuthenticated, token])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchPatients()
  }

  const handleDeletePatient = async (patientId) => {
    if (!confirm("Are you sure you want to delete this patient?")) return

    try {
      const response = await fetch(`http://97.74.90.82:1200/api/patients/${patientId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Patient deleted successfully",
        })
        fetchPatients()
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete patient",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting patient:", error)
      toast({
        title: "Error",
        description: "Failed to delete patient. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-6">Please log in to view patients</p>
        <Button onClick={() => router.push("/login")}>Go to Login</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Patients</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Register New Patient
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients by name, mobile or email"
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        <Button variant="outline" onClick={fetchPatients} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Registered Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : patients.length > 0 ? (
              patients.map((patient) => (
                <TableRow key={patient._id}>
                  <TableCell>{patient._id.substring(0, 8)}...</TableCell>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell className="capitalize">{patient.gender}</TableCell>
                  <TableCell>{patient.mobile}</TableCell>
                  <TableCell>{patient.email || "-"}</TableCell>
                  <TableCell>{patient.doctorName || "-"}</TableCell>
                  <TableCell>{new Date(patient.registeredDate || patient.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => router.push(`/patients/${patient._id}`)}>
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => router.push(`/patients/edit/${patient._id}`)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeletePatient(patient._id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4">
                  No patients found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <PatientRegistrationDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSuccess={fetchPatients} />
    </div>
  )
}
