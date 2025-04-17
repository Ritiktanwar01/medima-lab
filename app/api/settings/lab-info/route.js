import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    await dbConnect()

    const user = await User.findById(session.user.id).select("-password")

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    const labInfo = {
      labName: user.labName,
      pharmacyName: user.pharmacyName,
      address: user.address,
      phone: user.phone,
      email: user.email,
      website: user.website,
      gstNumber: user.gstNumber,
    }

    return NextResponse.json({ success: true, data: labInfo })
  } catch (error) {
    console.error("Get lab info error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    await dbConnect()

    const data = await request.json()

    const user = await User.findByIdAndUpdate(
      session.user.id,
      {
        labName: data.labName,
        pharmacyName: data.pharmacyName,
        address: data.address,
        phone: data.phone,
        email: data.email,
        website: data.website,
        gstNumber: data.gstNumber,
      },
      { new: true },
    ).select("-password")

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error("Update lab info error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
