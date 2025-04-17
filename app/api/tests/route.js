import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import Test from "@/models/Test"
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
    const group = searchParams.get("group") || ""
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 100
    const skip = (page - 1) * limit

    // Build query
    const query = { userId }

    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { code: { $regex: search, $options: "i" } }]
    }

    if (group) {
      query.groupName = { $regex: group, $options: "i" }
    }

    // Get tests
    const tests = await Test.find(query).sort({ groupName: 1, name: 1 }).skip(skip).limit(limit)

    // Get total count
    const total = await Test.countDocuments(query)

    // Get distinct group names
    const groups = await Test.distinct("groupName", { userId })

    return NextResponse.json({
      success: true,
      data: tests,
      groups,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get tests error:", error)
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

    // Add user ID to test data
    data.userId = userId

    const test = await Test.create(data)

    return NextResponse.json({ success: true, data: test })
  } catch (error) {
    console.error("Create test error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
