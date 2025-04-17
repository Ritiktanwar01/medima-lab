import mongoose from "mongoose"

const PatientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide patient name"],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, "Please provide patient age"],
    },
    gender: {
      type: String,
      required: [true, "Please provide patient gender"],
      enum: ["male", "female", "other"],
    },
    mobile: {
      type: String,
      required: [true, "Please provide mobile number"],
      trim: true,
    },
    whatsapp: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"],
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
    registeredDate: {
      type: Date,
      default: Date.now,
    },
    paymentType: {
      type: String,
      enum: ["prepaid", "postpaid"],
      default: "prepaid",
    },
    registrationAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    balance: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
)

export default mongoose.models.Patient || mongoose.model("Patient", PatientSchema)
