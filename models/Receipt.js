import mongoose from "mongoose"

const ReceiptSchema = new mongoose.Schema(
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
    date: {
      type: Date,
      default: Date.now,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Credit Card", "Debit Card", "UPI", "Online", "Other"],
      default: "Cash",
    },
    tests: [
      {
        testId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Test",
        },
        testName: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    status: {
      type: String,
      enum: ["Paid", "Partial", "Pending"],
      default: "Paid",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiptId: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true },
)

// Generate unique receipt ID before saving
ReceiptSchema.pre("save", async function (next) {
  if (!this.receiptId) {
    const date = new Date()
    const year = date.getFullYear().toString().substr(-2)
    const month = ("0" + (date.getMonth() + 1)).slice(-2)
    const day = ("0" + date.getDate()).slice(-2)

    // Find the count of receipts created today
    const Model = mongoose.model("Receipt")
    const count = await Model.countDocuments({
      createdAt: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999)),
      },
      userId: this.userId,
    })

    // Format: REC-YYMMDD-001
    this.receiptId = `REC-${year}${month}${day}-${("000" + (count + 1)).slice(-3)}`
  }
  next()
})

export default mongoose.models.Receipt || mongoose.model("Receipt", ReceiptSchema)
