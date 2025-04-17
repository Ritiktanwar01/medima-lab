import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import { verifyAdminToken } from "@/lib/auth-helpers"
import bcrypt from "bcryptjs"

export async function POST(request) {
  try {
    // Verify admin token
    const admin = await verifyAdminToken(request)
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const { currentPassword, newPassword } = await request.json()

    // Get admin with password
    const adminWithPassword = await User.findById(admin._id).select("+password")

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, adminWithPassword.password)
    if (!isMatch) {
      return NextResponse.json({ success: false, message: "Current password is incorrect" }, { status: 400 })
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    // Update password
    adminWithPassword.password = hashedPassword
    await adminWithPassword.save()

    return NextResponse.json({ success: true, message: "Password updated successfully" })
  } catch (error) {
    console.error("Admin password update error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
