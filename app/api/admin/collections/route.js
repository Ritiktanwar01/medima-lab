import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"

// Import all models
import User from "@/models/User"
import Patient from "@/models/Patient"
import Doctor from "@/models/Doctor"
import Test from "@/models/Test"
import Report from "@/models/Report"
import Receipt from "@/models/Receipt"

const models = {
  users: User,
  patients: Patient,
  doctors: Doctor,
  tests: Test,
  reports: Report,
  receipts: Receipt,
}

export async function GET(request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const collection = searchParams.get("collection")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""

    // If no collection specified, return list of collections
    if (!collection) {
      const collections = Object.keys(models).map((key) => ({
        name: key,
        displayName: key.charAt(0).toUpperCase() + key.slice(1),
        count: 0,
      }))

      // Get counts for each collection
      for (const col of collections) {
        col.count = await models[col.name].countDocuments()
      }

      return NextResponse.json({ success: true, collections })
    }

    // Check if collection exists
    if (!models[collection]) {
      return NextResponse.json({ success: false, message: "Collection not found" }, { status: 404 })
    }

    // Build query
    const query = {}
    if (search) {
      // Add search functionality based on collection
      switch (collection) {
        case "users":
          query.$or = [
            { username: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { labName: { $regex: search, $options: "i" } },
          ]
          break
        case "patients":
          query.$or = [
            { name: { $regex: search, $options: "i" } },
            { mobile: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ]
          break
        case "doctors":
          query.$or = [
            { name: { $regex: search, $options: "i" } },
            { specialization: { $regex: search, $options: "i" } },
          ]
          break
        case "tests":
          query.$or = [
            { name: { $regex: search, $options: "i" } },
            { code: { $regex: search, $options: "i" } },
            { groupName: { $regex: search, $options: "i" } },
          ]
          break
        default:
          // Generic search for other collections
          query.$or = [{ name: { $regex: search, $options: "i" } }, { id: { $regex: search, $options: "i" } }]
      }
    }

    // Get data with pagination
    const skip = (page - 1) * limit
    const data = await models[collection].find(query).skip(skip).limit(limit).sort({ createdAt: -1 })
    const total = await models[collection].countDocuments(query)

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Admin collections error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    await dbConnect()

    const { collection, id } = await request.json()

    // Check if collection exists
    if (!models[collection]) {
      return NextResponse.json({ success: false, message: "Collection not found" }, { status: 404 })
    }

    // Delete document
    const result = await models[collection].findByIdAndDelete(id)

    if (!result) {
      return NextResponse.json({ success: false, message: "Document not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Document deleted successfully" })
  } catch (error) {
    console.error("Admin delete error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
