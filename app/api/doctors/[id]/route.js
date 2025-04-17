import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import Doctor from "@/models/Doctor"

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    await dbConnect()

    const doctor = await Doctor.findOne({
      _id: params.id,
      userId: session.user.id,
    })

    if (!doctor) {
      return NextResponse.json({ success: false, message: "Doctor not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: doctor })
  } catch (error) {
    console.error("Get doctor error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    await dbConnect()

    const data = await request.json()

    const doctor = await Doctor.findOneAndUpdate({ _id: params.id, userId: session.user.id }, data, {
      new: true,
      runValidators: true,
    })

    if (!doctor) {
      return NextResponse.json({ success: false, message: "Doctor not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: doctor })
  } catch (error) {
    console.error("Update doctor error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    await dbConnect()

    const doctor = await Doctor.findOneAndDelete({
      _id: params.id,
      userId: session.user.id,
    })

    if (!doctor) {
      return NextResponse.json({ success: false, message: "Doctor not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: {} })
  } catch (error) {
    console.error("Delete doctor error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
