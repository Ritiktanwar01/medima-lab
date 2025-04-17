import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import jwt from "jsonwebtoken"

export async function POST(request) {
  try {
    await dbConnect()

    const { name, email, password } = await request.json()

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username: email.split("@")[0] }],
    })

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            existingUser.email === email
              ? "User with this email already exists"
              : "Username already taken. Please use a different email.",
        },
        { status: 400 },
      )
    }

    // Create new user
    const user = await User.create({
      username: email.split("@")[0], // Generate username from email
      email,
      password, // Will be hashed by the pre-save hook in the User model
      labName: name + "'s Lab", // Default lab name
      role: "user",
    })

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    )

    // Remove password from response
    const userWithoutPassword = {
      id: user._id,
      username: user.username,
      email: user.email,
      labName: user.labName,
      role: user.role,
    }

    return NextResponse.json({
      success: true,
      message: "User registered successfully",
      user: userWithoutPassword,
      token,
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ success: false, message: error.message || "Registration failed" }, { status: 500 })
  }
}
