const mongoose = require("mongoose");
const { LANGUAGE_IDS } = require("../config/languages");

const DIFFICULTIES = ["Easy", "Medium", "Hard", "Expert"];

const testCaseSchema = new mongoose.Schema(
  {
    input: { type: String, default: "", maxlength: 1_000_000 },
    expectedOutput: { type: String, default: "", maxlength: 1_000_000 },
    // Sample tests are shown to developers; the rest stay hidden.
    isSample: { type: Boolean, default: false },
    explanation: { type: String, default: "", maxlength: 2000 },
  },
  { _id: true },
);

const problemSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Title is required"], trim: true, maxlength: 120 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug may only contain lowercase letters, numbers, and dashes"],
    },
    difficulty: { type: String, enum: DIFFICULTIES, default: "Medium" },
    tags: { type: [String], default: [] },
    // Markdown
    description: { type: String, default: "", maxlength: 50_000 },
    inputFormat: { type: String, default: "", maxlength: 5000 },
    outputFormat: { type: String, default: "", maxlength: 5000 },
    constraints: { type: String, default: "", maxlength: 5000 },

    timeLimit: { type: Number, default: 2, min: 0.5, max: 15 }, // seconds (CPU)
    memoryLimit: { type: Number, default: 256, min: 32, max: 500 }, // MB

    referenceSolution: {
      languageId: { type: Number, enum: LANGUAGE_IDS, default: 71 },
      code: { type: String, default: "", maxlength: 65_536 },
    },

    testCases: { type: [testCaseSchema], default: [] },

    status: { type: String, enum: ["draft", "published"], default: "draft", index: true },
    publishedAt: { type: Date },
    // Set whenever the reference solution passes every test on the server.
    verifiedAt: { type: Date },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

problemSchema.statics.DIFFICULTIES = DIFFICULTIES;

module.exports = mongoose.model("Problem", problemSchema);
