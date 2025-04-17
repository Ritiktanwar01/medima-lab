import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import Patient from "@/models/Patient"
import jwt from "jsonwebtoken" // Add JWT for token verification

// Helper function to verify JWT token
async function verifyToken(request) {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.split(" ")[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return decoded
  } catch (error) {
    console.error("Token verification error:", error)
    return null
  }
}

export async function GET(request) {
  try {
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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 100
    const skip = (page - 1) * limit

    // Build query
    const query = { userId }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ]
    }

    // Get patients
    const patients = await Patient.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)

    // Get total count
    const total = await Patient.countDocuments(query)

    return NextResponse.json({
      success: true,
      data: patients,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get patients error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
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

    const data = await request.json()

    // Add user ID to patient data
    data.userId = userId

    // Calculate balance based on payment type
    if (data.paymentType === "prepaid") {
      data.paidAmount = data.totalAmount
      data.balance = 0
    } else {
      data.paidAmount = data.registrationAmount || 0
      data.balance = data.totalAmount - data.paidAmount
    }

    // Ensure tests have all required fields
    if (data.tests && Array.isArray(data.tests)) {
      data.tests = data.tests.map((test) => ({
        testId: test.testId,
        testName: test.testName,
        price: test.price || 0,
        parameters: test.parameters || [],
      }))
    }

    const patient = await Patient.create(data)

    return NextResponse.json({ success: true, data: patient })
  } catch (error) {
    console.error("Create patient error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
