"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, FileText, Activity, Database } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { AdminCollectionViewer } from "@/components/admin-collection-viewer"

export default function AdminDashboardPage() {
  const [collections, setCollections] = useState([])
  const [activeCollection, setActiveCollection] = useState(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch("/api/admin/collections")
        const result = await response.json()

        if (result.success) {
          setCollections(result.collections)
          if (result.collections.length > 0) {
            setActiveCollection(result.collections[0].name)
          }
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to fetch collections",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching collections:", error)
        toast({
          title: "Error",
          description: "Failed to fetch collections. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCollections()
  }, [toast])

  const getCollectionIcon = (name) => {
    switch (name) {
      case "users":
        return <Users className="h-4 w-4 mr-2" />
      case "patients":
      case "doctors":
        return <Users className="h-4 w-4 mr-2" />
      case "reports":
      case "receipts":
        return <FileText className="h-4 w-4 mr-2" />
      case "tests":
        return <Activity className="h-4 w-4 mr-2" />
      default:
        return <Database className="h-4 w-4 mr-2" />
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {collections.map((collection) => (
              <Card
                key={collection.name}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => setActiveCollection(collection.name)}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    {getCollectionIcon(collection.name)}
                    {collection.displayName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{collection.count}</div>
                  <p className="text-xs text-muted-foreground">Total entries</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs value={activeCollection} onValueChange={setActiveCollection} className="w-full">
            <TabsList className="mb-6 w-full overflow-x-auto flex-nowrap">
              {collections.map((collection) => (
                <TabsTrigger key={collection.name} value={collection.name} className="flex items-center">
                  {getCollectionIcon(collection.name)}
                  {collection.displayName}
                </TabsTrigger>
              ))}
            </TabsList>

            {collections.map((collection) => (
              <TabsContent key={collection.name} value={collection.name}>
                <AdminCollectionViewer collection={collection.name} />
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}
    </div>
  )
}
