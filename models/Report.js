import mongoose from "mongoose"

const ResultSchema = new mongoose.Schema({
  parameter: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  unit: {
    type: String,
  },
  normalRange: {
    type: String,
  },
})

const TestResultSchema = new mongoose.Schema({
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Test",
  },
  testName: {
    type: String,
    required: true,
  },
  results: [ResultSchema],
})

const ReportSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    patientName: {
      type: String,
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },
    doctorName: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    tests: [TestResultSchema],
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
    notes: {
      type: String,
    },
    reportId: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true },
)

// Generate unique report ID before saving
ReportSchema.pre("save", async function (next) {
  if (!this.reportId) {
    const date = new Date()
    const year = date.getFullYear().toString().substr(-2)
    const month = ("0" + (date.getMonth() + 1)).slice(-2)
    const day = ("0" + date.getDate()).slice(-2)

    // Find the count of reports created today
    const Model = mongoose.model("Report")
    const count = await Model.countDocuments({
      createdAt: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999)),
      },
      userId: this.userId,
    })

    // Format: REP-YYMMDD-001
    this.reportId = `REP-${year}${month}${day}-${("000" + (count + 1)).slice(-3)}`
  }
  next()
})

export default mongoose.models.Report || mongoose.model("Report", ReportSchema)
