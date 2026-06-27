import { model, Schema } from "mongoose";

const RefreshTokenSchema = new Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      expires: 0,
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const RefreshToken = model("RefreshToken", RefreshTokenSchema);
export default RefreshToken;
