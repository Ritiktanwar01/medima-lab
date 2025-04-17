import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import { verifyAdminToken } from "@/lib/auth-helpers"

export async function GET(request) {
  try {
    // Verify admin token
    const admin = await verifyAdminToken(request)
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 10
    const skip = (page - 1) * limit

    // Build query
    const query = {}
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { labName: { $regex: search, $options: "i" } },
      ]
    }

    // Get users
    const users = await User.find(query).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit)

    // Get total count
    const total = await User.countDocuments(query)

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Admin users error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    // Verify admin token
    const admin = await verifyAdminToken(request)
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const data = await request.json()

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username: data.username }, { email: data.email }] })
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User with this username or email already exists" },
        { status: 400 },
      )
    }

    // Create user
    const user = await User.create(data)

    // Return user without password
    const userWithoutPassword = await User.findById(user._id).select("-password")

    return NextResponse.json({ success: true, data: userWithoutPassword })
  } catch (error) {
    console.error("Admin create user error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
