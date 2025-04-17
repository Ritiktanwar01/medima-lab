"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search, Plus, Edit, Trash, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import DoctorFormDialog from "@/components/doctor-form-dialog"

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState(null)
  const router = useRouter()
  const { isAuthenticated, token } = useSelector((state) => state.auth) // Get token from Redux store
  const { toast } = useToast()

  const fetchDoctors = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`http://localhost:8000/api/doctors/?search=${searchQuery}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()

      if (data.success) {
        setDoctors(data.data)
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch doctors",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching doctors:", error)
      toast({
        title: "Error",
        description: "Failed to fetch doctors. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchDoctors()
    }
  }, [isAuthenticated, token, searchQuery])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchDoctors()
  }

  const handleAddDoctor = () => {
    setEditingDoctor(null)
    setIsDialogOpen(true)
  }

  const handleEditDoctor = (doctor) => {
    setEditingDoctor(doctor)
    setIsDialogOpen(true)
  }

  const handleDeleteDoctor = async (doctorId) => {
    if (!confirm("Are you sure you want to delete this doctor?")) return

    try {
      const response = await fetch(`http://localhost:8000/api/doctors/${doctorId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Doctor deleted successfully",
        })
        fetchDoctors()
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete doctor",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting doctor:", error)
      toast({
        title: "Error",
        description: "Failed to delete doctor. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-6">Please log in to view doctors</p>
        <Button onClick={() => router.push("/login")}>Go to Login</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Doctors</h1>
        <Button onClick={handleAddDoctor}>
          <Plus className="mr-2 h-4 w-4" /> Add New Doctor
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search doctors by name or specialization"
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        <Button variant="outline" onClick={fetchDoctors} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Specialization</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : doctors.length > 0 ? (
              doctors.map((doctor) => (
                <TableRow key={doctor._id}>
                  <TableCell className="font-medium">{doctor.name}</TableCell>
                  <TableCell>{doctor.specialization || "-"}</TableCell>
                  <TableCell>{doctor.phone || "-"}</TableCell>
                  <TableCell>{doctor.email || "-"}</TableCell>
                  <TableCell>{doctor.address || "-"}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditDoctor(doctor)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteDoctor(doctor._id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No doctors found. Click "Add New Doctor" to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DoctorFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        doctor={editingDoctor}
        onSuccess={fetchDoctors}
      />
    </div>
  )
}
