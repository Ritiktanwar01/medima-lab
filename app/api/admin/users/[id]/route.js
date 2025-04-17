import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import { verifyAdminToken } from "@/lib/auth-helpers"
import bcrypt from "bcryptjs"

export async function GET(request, { params }) {
  try {
    // Verify admin token
    const admin = await verifyAdminToken(request)
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const user = await User.findById(params.id).select("-password")

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error("Admin get user error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    // Verify admin token
    const admin = await verifyAdminToken(request)
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const data = await request.json()

    // Check if updating username or email to one that already exists
    if (data.username || data.email) {
      const query = { _id: { $ne: params.id } }
      if (data.username) query.username = data.username
      if (data.email) query.email = data.email

      const existingUser = await User.findOne(query)
      if (existingUser) {
        return NextResponse.json(
          { success: false, message: "Username or email already in use by another user" },
          { status: 400 },
        )
      }
    }

    // If password is provided, hash it
    if (data.password) {
      const salt = await bcrypt.genSalt(10)
      data.password = await bcrypt.hash(data.password, salt)
    }

    // Update user
    const user = await User.findByIdAndUpdate(params.id, data, { new: true }).select("-password")

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error("Admin update user error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    // Verify admin token
    const admin = await verifyAdminToken(request)
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Don't allow deleting the current admin
    if (params.id === admin.id) {
      return NextResponse.json({ success: false, message: "Cannot delete your own account" }, { status: 400 })
    }

    const user = await User.findByIdAndDelete(params.id)

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: {} })
  } catch (error) {
    console.error("Admin delete user error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
