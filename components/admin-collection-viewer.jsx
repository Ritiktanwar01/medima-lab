"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Search, Trash, Eye, Plus, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import AdminUserFormDialog from "@/components/admin-user-form-dialog"

export function AdminCollectionViewer({ collection }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  })
  const [selectedItem, setSelectedItem] = useState(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const { toast } = useToast()
  const [isUserFormOpen, setIsUserFormOpen] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/admin/collections?collection=${collection}&page=${pagination.page}&limit=${pagination.limit}&search=${searchQuery}`,
      )
      const result = await response.json()

      if (result.success) {
        setData(result.data)
        setPagination(result.pagination)
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to fetch data",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching collection data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [collection, pagination.page, searchQuery])

  const handleSearch = (e) => {
    e.preventDefault()
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchData()
  }

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleView = (item) => {
    setSelectedItem(item)
    setViewDialogOpen(true)
  }

  const handleDelete = async () => {
    try {
      const response = await fetch("/api/admin/collections", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          collection,
          id: selectedItem._id,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Item deleted successfully",
        })
        setDeleteDialogOpen(false)
        fetchData()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete item",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting item:", error)
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive",
      })
    }
  }

  const confirmDelete = (item) => {
    setSelectedItem(item)
    setDeleteDialogOpen(true)
  }

  // Get column headers based on first item
  const getHeaders = () => {
    if (data.length === 0) return []

    // Common fields to display first
    const priorityFields = ["_id", "name", "username", "email", "status", "createdAt"]

    // Fields to exclude
    const excludeFields = ["__v", "password"]

    const firstItem = data[0]
    const headers = Object.keys(firstItem._doc || firstItem).filter((key) => !excludeFields.includes(key))

    // Sort headers to put priority fields first
    headers.sort((a, b) => {
      const aIndex = priorityFields.indexOf(a)
      const bIndex = priorityFields.indexOf(b)

      if (aIndex === -1 && bIndex === -1) return 0
      if (aIndex === -1) return 1
      if (bIndex === -1) return -1
      return aIndex - bIndex
    })

    return headers.slice(0, 6) // Limit to 6 columns for better display
  }

  // Format cell value for display
  const formatCellValue = (value, key) => {
    if (value === null || value === undefined) return "-"

    if (key === "_id") return value.toString().substring(0, 8) + "..."

    if (typeof value === "boolean") return value ? "Yes" : "No"

    if (value instanceof Date || (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value))) {
      return new Date(value).toLocaleDateString()
    }

    if (typeof value === "object") {
      if (Array.isArray(value)) {
        return `${value.length} items`
      }
      return "Object"
    }

    return String(value).length > 20 ? String(value).substring(0, 20) + "..." : String(value)
  }

  const handleAddNew = () => {
    if (collection === "users") {
      setSelectedItem(null)
      setIsUserFormOpen(true)
    } else {
      // Handle other collections
      toast({
        title: "Feature coming soon",
        description: `Adding new ${collection} will be available soon.`,
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${collection}...`}
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="capitalize">{collection}</CardTitle>
          <CardDescription>
            Showing {data.length} of {pagination.total} items
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No data found</div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    {getHeaders().map((header) => (
                      <TableHead key={header} className="capitalize">
                        {header === "_id" ? "ID" : header.replace(/([A-Z])/g, " $1").trim()}
                      </TableHead>
                    ))}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, index) => (
                    <TableRow key={index}>
                      {getHeaders().map((header) => (
                        <TableCell key={header}>
                          {header === "status" ? (
                            <Badge
                              variant={
                                item[header] === "completed" || item[header] === "Paid"
                                  ? "success"
                                  : item[header] === "pending" || item[header] === "Pending"
                                    ? "outline"
                                    : "secondary"
                              }
                            >
                              {formatCellValue(item[header], header)}
                            </Badge>
                          ) : (
                            formatCellValue(item[header], header)
                          )}
                        </TableCell>
                      ))}
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleView(item)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => confirmDelete(item)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {pagination.pages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                    disabled={pagination.page === 1}
                  />
                </PaginationItem>

                {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                  let pageNum

                  if (pagination.pages <= 5) {
                    pageNum = i + 1
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1
                  } else if (pagination.page >= pagination.pages - 2) {
                    pageNum = pagination.pages - 4 + i
                  } else {
                    pageNum = pagination.page - 2 + i
                  }

                  return (
                    <PaginationItem key={i}>
                      <PaginationLink onClick={() => handlePageChange(pageNum)} isActive={pagination.page === pageNum}>
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(Math.min(pagination.pages, pagination.page + 1))}
                    disabled={pagination.page === pagination.pages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>View Item Details</DialogTitle>
            <DialogDescription>Detailed information about this item</DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(selectedItem._doc || selectedItem)
                .filter(([key]) => key !== "__v" && key !== "password")
                .map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <h4 className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</h4>
                    <div className="rounded-md bg-muted p-2 text-sm break-words">
                      {typeof value === "object" ? (
                        Array.isArray(value) ? (
                          <div className="space-y-1">
                            {value.length === 0 ? (
                              <span className="text-muted-foreground">Empty array</span>
                            ) : (
                              value.map((item, i) => (
                                <div key={i} className="border-b pb-1 last:border-0">
                                  {typeof item === "object" ? JSON.stringify(item) : String(item)}
                                </div>
                              ))
                            )}
                          </div>
                        ) : value === null ? (
                          <span className="text-muted-foreground">null</span>
                        ) : (
                          <pre className="whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>
                        )
                      ) : (
                        String(value)
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {collection === "users" && (
        <AdminUserFormDialog
          open={isUserFormOpen}
          onOpenChange={setIsUserFormOpen}
          user={selectedItem}
          onSuccess={fetchData}
        />
      )}
    </div>
  )
}
