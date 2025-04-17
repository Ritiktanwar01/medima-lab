import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import Report from "@/models/Report"
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

export async function GET(request, context) {
  try {
    // Extract the id from context.params
    const { id } = context.params

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

    // Use the extracted id directly
    const report = await Report.findOne({
      _id: id,
      userId,
    })

    if (!report) {
      return NextResponse.json({ success: false, message: "Report not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: report })
  } catch (error) {
    console.error("Get report error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

export async function PUT(request, context) {
  try {
    // Extract the id from context.params
    const { id } = context.params

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

    const report = await Report.findOneAndUpdate({ _id: id, userId }, data, { new: true, runValidators: true })

    if (!report) {
      return NextResponse.json({ success: false, message: "Report not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: report })
  } catch (error) {
    console.error("Update report error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

export async function DELETE(request, context) {
  try {
    // Extract the id from context.params
    const { id } = context.params

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

    const report = await Report.findOneAndDelete({
      _id: id,
      userId,
    })

    if (!report) {
      return NextResponse.json({ success: false, message: "Report not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: {} })
  } catch (error) {
    console.error("Delete report error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
