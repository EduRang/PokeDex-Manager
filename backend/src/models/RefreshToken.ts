import { Schema, model } from "mongoose";

const refreshTokenSchema = new Schema({
  // SHA-256 of the token. The raw token only lives in the user's cookie
  tokenHash: {
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
    // TTL index
    expires: 0,
  },
});

export const RefreshTokenModel = model("RefreshToken", refreshTokenSchema);
