import mongoose from "mongoose"

const NormalRangeSchema = new mongoose.Schema({
  gender: {
    type: String,
    enum: ["male", "female", "child", "all"],
    required: true,
  },
  minAge: {
    type: Number,
    default: 0,
  },
  maxAge: {
    type: Number,
    default: 150,
  },
  minValue: {
    type: String,
    required: true,
  },
  maxValue: {
    type: String,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
})

const ParameterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  normalRanges: [NormalRangeSchema],
})

const TestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide test name"],
      trim: true,
    },
    code: {
      type: String,
      trim: true,
    },
    groupName: {
      type: String,
      required: [true, "Please provide group name"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Please provide test price"],
    },
    parameters: [ParameterSchema],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
)

export default mongoose.models.Test || mongoose.model("Test", TestSchema)
