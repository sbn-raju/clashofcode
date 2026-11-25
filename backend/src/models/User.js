const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 12;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [60, "Name must be at most 60 characters"],
    },
    handle: {
      type: String,
      required: [true, "Handle is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Handle must be at least 3 characters"],
      maxlength: [24, "Handle must be at most 24 characters"],
      match: [/^[a-z0-9_]+$/, "Handle may only contain letters, numbers, and underscores"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    // Public sign-up always creates "professional" accounts. Admins are created
    // with `npm run create-admin` and manage the problem set.
    role: {
      type: String,
      enum: ["professional", "admin"],
      default: "professional",
      immutable: true,
    },
    rating: { type: Number, default: 1200 },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    handle: this.handle,
    email: this.email,
    role: this.role,
    rating: this.rating,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model("User", userSchema);
