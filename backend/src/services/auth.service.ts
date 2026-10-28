import bcrypt from "bcryptjs";
import { UserModel } from "../models/User.js";
import { HttpError } from "../errors/HttpError.js";
import { isDuplicateKeyError } from "../errors/mongoErrors.js";
import type {
  LoginInput,
  RegisterInput,
} from "../validators/auth.validators.js";
import {
  createRefreshToken,
  revokeRefreshToken,
  rotateRefreshToken,
  signAccessToken,
} from "./token.service.js";

const SALT_ROUNDS = 12;

type UserDoc = { id: string; username: string; email: string };

function toPublicUser(user: UserDoc) {
  return { id: user.id, username: user.username, email: user.email };
}

export async function registerUser(input: RegisterInput) {
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  try {
    const user = await UserModel.create({
      username: input.username,
      email: input.email,
      passwordHash,
    });
    return toPublicUser(user);
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      throw new HttpError(409, "Username or email already in use");
    }
    throw err;
  }
}

export async function loginUser(input: LoginInput) {
  // Usernames can't contain "@", so an identifier with "@" is an email
  const field = input.identifier.includes("@") ? "email" : "username";
  const user = await UserModel.findOne({ [field]: input.identifier }).select(
    "+passwordHash",
  );

  // Same message for unknown user and wrong password, so attackers can't
  // use login to find out which emails/usernames are registered
  const passwordMatches =
    user !== null && (await bcrypt.compare(input.password, user.passwordHash));
  if (!user || !passwordMatches) {
    throw new HttpError(401, "Invalid credentials");
  }

  return {
    user: toPublicUser(user),
    accessToken: signAccessToken(user.id),
    refreshToken: await createRefreshToken(user.id),
  };
}

export async function refreshSession(refreshToken: string) {
  const rotated = await rotateRefreshToken(refreshToken);

  const user = await UserModel.findById(rotated.userId);
  if (!user) {
    await revokeRefreshToken(rotated.refreshToken);
    throw new HttpError(401, "Invalid or expired session");
  }

  return {
    user: toPublicUser(user),
    accessToken: signAccessToken(user.id),
    refreshToken: rotated.refreshToken,
  };
}

export async function logoutUser(refreshToken: string) {
  await revokeRefreshToken(refreshToken);
}

export async function getUserById(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new HttpError(404, "User not found");
  }
  return toPublicUser(user);
}
