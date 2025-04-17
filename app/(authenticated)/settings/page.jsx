"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux" // Use Redux instead of next-auth
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { User, Building, FileText, Users, Shield, Save, Printer } from "lucide-react"
import { PrinterSelector } from "@/components/printer-selector"

export default function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated, user } = useSelector((state) => state.auth) // Use Redux auth state
  const [isLoading, setIsLoading] = useState(false)

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
  })

  const [labForm, setLabForm] = useState({
    labName: "Medima Diagnostics",
    address: "123 Medical Street, Healthcare City",
    phone: "1234567890",
    email: "info@medima.com",
    website: "www.medima.com",
    gstNumber: "GST1234567890",
    printerName: "",
  })

  useEffect(() => {
    if (isAuthenticated && user) {
      // Set profile form data from Redux user state
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        phone: "",
      })

      setLabForm((prev) => ({
        ...prev,
        labName: user.labName || "Medima Diagnostics",
      }))
    }
  }, [user, isAuthenticated])

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleLabChange = (e) => {
    const { name, value } = e.target
    setLabForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePrinterChange = (value) => {
    setLabForm((prev) => ({ ...prev, printerName: value }))
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // In a real app, you would send this data to your API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Update failed",
        description: error.message || "An error occurred while updating your profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLabSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // In a real app, you would send this data to your API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Lab settings updated",
        description: "Your lab settings have been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating lab settings:", error)
      toast({
        title: "Update failed",
        description: error.message || "An error occurred while updating lab settings",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-6">Please log in to access settings</p>
        <Button onClick={() => router.push("/login")}>Go to Login</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-6 mb-6">
          <TabsTrigger value="profile" className="flex items-center">
            <User className="mr-2 h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="lab" className="flex items-center">
            <Building className="mr-2 h-4 w-4" /> Lab Info
          </TabsTrigger>
          <TabsTrigger value="printing" className="flex items-center">
            <Printer className="mr-2 h-4 w-4" /> Printing
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" /> Reports
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center">
            <Users className="mr-2 h-4 w-4" /> Users
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Shield className="mr-2 h-4 w-4" /> Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Manage your personal information</CardDescription>
            </CardHeader>
            <form onSubmit={handleProfileSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" value={profileForm.name} onChange={handleProfileChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" value={profileForm.phone} onChange={handleProfileChange} />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="flex items-center" disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="lab">
          <Card>
            <CardHeader>
              <CardTitle>Lab Information</CardTitle>
              <CardDescription>Manage your laboratory details</CardDescription>
            </CardHeader>
            <form onSubmit={handleLabSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="labName">Lab Name</Label>
                  <Input id="labName" name="labName" value={labForm.labName} onChange={handleLabChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" name="address" value={labForm.address} onChange={handleLabChange} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" value={labForm.phone} onChange={handleLabChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" value={labForm.email} onChange={handleLabChange} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" name="website" value={labForm.website} onChange={handleLabChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gstNumber">GST Number</Label>
                    <Input id="gstNumber" name="gstNumber" value={labForm.gstNumber} onChange={handleLabChange} />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="flex items-center" disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="printing">
          <Card>
            <CardHeader>
              <CardTitle>Printing Settings</CardTitle>
              <CardDescription>Configure your printing preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <PrinterSelector value={labForm.printerName} onChange={handlePrinterChange} />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Receipt Format</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-md p-4 cursor-pointer hover:border-primary">
                    <div className="text-center mb-2">Format A</div>
                    <div className="aspect-[3/4] bg-muted rounded-md flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">Preview</span>
                    </div>
                  </div>
                  <div className="border rounded-md p-4 cursor-pointer hover:border-primary">
                    <div className="text-center mb-2">Format B</div>
                    <div className="aspect-[3/4] bg-muted rounded-md flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">Preview</span>
                    </div>
                  </div>
                  <div className="border rounded-md p-4 cursor-pointer hover:border-primary">
                    <div className="text-center mb-2">Format C</div>
                    <div className="aspect-[3/4] bg-muted rounded-md flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">Preview</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="flex items-center" disabled={isLoading} onClick={handleLabSubmit}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Report Settings</CardTitle>
              <CardDescription>Configure report templates and formats</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Report settings will be implemented in the next phase.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage staff and user accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">User management will be implemented in the next phase.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage security and access controls</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Security settings will be implemented in the next phase.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
