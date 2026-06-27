import { model, Schema } from "mongoose";
import argon2 from "argon2";

const UserSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true },
);

// combine first and last name into name
UserSchema.pre("save", function () {
  if (this.isModified("firstName") || this.isModified("lastName")) {
    this.name = `${this.firstName} ${this.lastName}`.trim();
  }
});

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await argon2.hash(this.password);
});

UserSchema.methods.comparePassword = async function (userPassword) {
  return await argon2.verify(this.password, userPassword);
};

UserSchema.index({ name: "text" });

const User = model("User", UserSchema);
export default User;
