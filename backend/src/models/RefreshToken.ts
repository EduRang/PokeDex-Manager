import { Schema, model } from "mongoose";

const refreshTokenSchema = new Schema({
  // SHA-256 del token. El token original solo existe en la cookie del usuario
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
    // TTL index: MongoDB borra el documento cuando expiresAt ya pasó
    expires: 0,
  },
});

export const RefreshTokenModel = model("RefreshToken", refreshTokenSchema);
