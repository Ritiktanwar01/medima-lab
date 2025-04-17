import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import Report from "@/models/Report"
import Patient from "@/models/Patient"
import Test from "@/models/Test"
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
    const status = searchParams.get("status") || ""
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 10
    const skip = (page - 1) * limit

    // Build query
    const query = { userId }

    if (search) {
      query.$or = [{ reportId: { $regex: search, $options: "i" } }, { patientName: { $regex: search, $options: "i" } }]
    }

    if (status && status !== "all") {
      query.status = status
    }

    // Get reports
    const reports = await Report.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)

    // Get total count
    const total = await Report.countDocuments(query)

    return NextResponse.json({
      success: true,
      data: reports,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get reports error:", error)
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

    // Add user ID to report data
    data.userId = userId

    // Fetch patient details if not provided
    if (data.patientId && !data.patientName) {
      const patient = await Patient.findById(data.patientId)
      if (patient) {
        data.patientName = patient.name
      }
    }

    // Fetch test details if not provided
    if (data.tests && data.tests.length > 0) {
      for (let i = 0; i < data.tests.length; i++) {
        const test = data.tests[i]
        if (test.testId && !test.testName) {
          const testDoc = await Test.findById(test.testId)
          if (testDoc) {
            data.tests[i].testName = testDoc.name

            // If no results provided, create empty results based on test parameters
            if (!test.results || test.results.length === 0) {
              data.tests[i].results = testDoc.parameters.map((param) => ({
                parameter: param.name,
                value: "",
                unit: param.normalRanges[0]?.unit || "",
                normalRange: `${param.normalRanges[0]?.minValue || ""}-${param.normalRanges[0]?.maxValue || ""}`,
              }))
            }
          }
        }
      }
    }

    const report = await Report.create(data)

    return NextResponse.json({ success: true, data: report })
  } catch (error) {
    console.error("Create report error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
