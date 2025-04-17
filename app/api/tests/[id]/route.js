import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import Test from "@/models/Test"

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    await dbConnect()

    const test = await Test.findOne({
      _id: params.id,
      userId: session.user.id,
    })

    if (!test) {
      return NextResponse.json({ success: false, message: "Test not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: test })
  } catch (error) {
    console.error("Get test error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    await dbConnect()

    const data = await request.json()

    const test = await Test.findOneAndUpdate({ _id: params.id, userId: session.user.id }, data, {
      new: true,
      runValidators: true,
    })

    if (!test) {
      return NextResponse.json({ success: false, message: "Test not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: test })
  } catch (error) {
    console.error("Update test error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    await dbConnect()

    const test = await Test.findOneAndDelete({
      _id: params.id,
      userId: session.user.id,
    })

    if (!test) {
      return NextResponse.json({ success: false, message: "Test not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: {} })
  } catch (error) {
    console.error("Delete test error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
