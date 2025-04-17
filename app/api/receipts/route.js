import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import Receipt from "@/models/Receipt"
import jwt from "jsonwebtoken"

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
    const limit = Number.parseInt(searchParams.get("limit")) || 10
    const skip = (page - 1) * limit

    // Build query
    const query = { userId }

    if (search) {
      query.$or = [{ receiptId: { $regex: search, $options: "i" } }, { patientName: { $regex: search, $options: "i" } }]
    }

    // Get receipts
    const receipts = await Receipt.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)

    // Get total count
    const total = await Receipt.countDocuments(query)

    return NextResponse.json({
      success: true,
      data: receipts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get receipts error:", error)
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

    // Add user ID to receipt data
    data.userId = userId

    const receipt = await Receipt.create(data)

    return NextResponse.json({ success: true, data: receipt })
  } catch (error) {
    console.error("Create receipt error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
