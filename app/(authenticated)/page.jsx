"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Activity, FileText, Users, Settings } from "lucide-react"
import PatientRegistrationDialog from "@/components/patient-registration-dialog"
import { useSelector } from "react-redux"
import Link from "next/link"

export default function Home() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { isAuthenticated } = useSelector((state) => state.auth)

  return (
    <div className="container mx-auto">
      <section className="mb-10">
        <h1 className="text-4xl font-bold mb-4">Welcome to Medima</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Your trusted partner for accurate and timely pathology services
        </p>
        {isAuthenticated ? (
          <Button onClick={() => setIsDialogOpen(true)} className="mb-8">
            <PlusCircle className="mr-2 h-4 w-4" /> Register New Patient
          </Button>
        ) : (
          <div className="mb-8 space-y-4">
            <p className="text-muted-foreground">Please log in to access all features</p>
            <div className="flex gap-4">
              <Button asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        )}
      </section>

      {isAuthenticated && (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" /> Patients
              </CardTitle>
              <CardDescription>Manage patient records</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <Link href="/patients">View Patients</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" /> Receipts
              </CardTitle>
              <CardDescription>View payment history</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <Link href="/receipts">View Receipts</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5" /> Tests
              </CardTitle>
              <CardDescription>Manage lab tests</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <Link href="/tests">View Tests</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" /> Settings
              </CardTitle>
              <CardDescription>Configure system settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <Link href="/settings">Manage Settings</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      )}

      <PatientRegistrationDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  )
}
