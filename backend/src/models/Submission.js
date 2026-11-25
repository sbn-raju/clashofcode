const mongoose = require("mongoose");

const VERDICTS = [
  "Accepted",
  "Wrong Answer",
  "Time Limit Exceeded",
  "Compilation Error",
  "Runtime Error",
  "Internal Error",
];

const submissionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    problem: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true },
    languageId: { type: Number, required: true },
    code: { type: String, required: true, maxlength: 65_536 },
    verdict: { type: String, enum: VERDICTS, required: true },
    passed: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    // Max across tests
    time: { type: Number },
    memory: { type: Number },
  },
  { timestamps: true },
);

submissionSchema.index({ user: 1, problem: 1, createdAt: -1 });
submissionSchema.index({ user: 1, verdict: 1 });

module.exports = mongoose.model("Submission", submissionSchema);
