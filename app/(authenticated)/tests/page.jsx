"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search, Plus, Edit, Trash, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import TestFormDialog from "@/components/test-form-dialog"

export default function TestsPage() {
  const [tests, setTests] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTest, setEditingTest] = useState(null)
  const router = useRouter()
  const { isAuthenticated, token } = useSelector((state) => state.auth) // Get token from Redux store
  const { toast } = useToast()

  const fetchTests = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`http://97.74.90.82:1200/api/tests/?search=${searchQuery}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()

      if (data.success) {
        setTests(data.data)
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch tests",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching tests:", error)
      toast({
        title: "Error",
        description: "Failed to fetch tests. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchTests()
    }
  }, [isAuthenticated, token, searchQuery])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchTests()
  }

  const handleAddTest = () => {
    setEditingTest(null)
    setIsDialogOpen(true)
  }

  const handleEditTest = (test) => {
    setEditingTest(test)
    setIsDialogOpen(true)
  }

  const handleDeleteTest = async (testId) => {
    if (!confirm("Are you sure you want to delete this test?")) return

    try {
      const response = await fetch(`http://97.74.90.82:1200/api/tests/${testId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Test deleted successfully",
        })
        fetchTests()
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete test",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting test:", error)
      toast({
        title: "Error",
        description: "Failed to delete test. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-6">Please log in to view tests</p>
        <Button onClick={() => router.push("/login")}>Go to Login</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Lab Tests</h1>
        <Button onClick={handleAddTest}>
          <Plus className="mr-2 h-4 w-4" /> Add New Test
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tests by name or code"
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        <Button variant="outline" onClick={fetchTests} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Parameters</TableHead>
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
            ) : tests.length > 0 ? (
              tests.map((test) => (
                <TableRow key={test._id}>
                  <TableCell className="font-medium">{test.name}</TableCell>
                  <TableCell>{test.code}</TableCell>
                  <TableCell>{test.groupName}</TableCell>
                  <TableCell>₹{test.price}</TableCell>
                  <TableCell>{test.parameters?.length || 0} parameters</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditTest(test)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteTest(test._id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No tests found. Click "Add New Test" to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <TestFormDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} test={editingTest} onSuccess={fetchTests} />
    </div>
  )
}
