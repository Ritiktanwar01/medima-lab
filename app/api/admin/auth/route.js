import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(request) {
  try {
    await dbConnect()

    const { username, password } = await request.json()

    // Check if admin user exists
    let admin = await User.findOne({ username, role: "admin" }).select("+password")

    // If admin doesn't exist, create one with the provided credentials (only for first login)
    if (!admin) {
      const adminCount = await User.countDocuments({ role: "admin" })

      if (adminCount === 0 && username === "ritik" && password === "jaat") {
        admin = await User.create({
          username,
          password,
          email: "admin@medima.com",
          labName: "Medima Admin",
          role: "admin",
        })

        // Return without password
        admin = await User.findById(admin._id)
      } else {
        return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
      }
    } else {
      // Verify password
      const isMatch = await bcrypt.compare(password, admin.password)

      if (!isMatch) {
        return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
      }
    }

    // Create token
    const token = jwt.sign({ id: admin._id, username: admin.username, role: admin.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    })

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: admin._id,
        username: admin.username,
        role: admin.role,
      },
    })
  } catch (error) {
    console.error("Admin auth error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
