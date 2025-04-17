import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import Patient from "@/models/Patient"
import { verifyToken } from "@/lib/auth"

export async function GET(request, { params }) {
  try {
    const { id } = params

    // Try next-auth session first
    const session = await getServerSession(authOptions)

    // If no session, try JWT token
    let userId = null
    if (session) {
      userId = session.user.id
    } else {
      const decoded = await verifyToken(request)
      if (!decoded) {
        return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
      }
      userId = decoded.id
    }

    await dbConnect()

    const patient = await Patient.findOne({
      _id: id,
      userId: userId,
    })

    if (!patient) {
      return NextResponse.json({ success: false, message: "Patient not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: patient })
  } catch (error) {
    console.error("Get patient error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    await dbConnect()

    const data = await request.json()

    // Recalculate balance if payment info is updated
    if (data.paymentType === "prepaid") {
      data.paidAmount = data.totalAmount
      data.balance = 0
    } else if (data.paymentType === "postpaid" && data.registrationAmount !== undefined) {
      data.paidAmount = data.registrationAmount
      data.balance = data.totalAmount - data.paidAmount
    }

    const patient = await Patient.findOneAndUpdate({ _id: id, userId: session.user.id }, data, {
      new: true,
      runValidators: true,
    })

    if (!patient) {
      return NextResponse.json({ success: false, message: "Patient not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: patient })
  } catch (error) {
    console.error("Update patient error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    await dbConnect()

    const patient = await Patient.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    })

    if (!patient) {
      return NextResponse.json({ success: false, message: "Patient not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: {} })
  } catch (error) {
    console.error("Delete patient error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
