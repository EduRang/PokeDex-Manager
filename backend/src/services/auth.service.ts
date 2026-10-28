import bcrypt from "bcryptjs";
import { UserModel } from "../models/User.js";
import { HttpError } from "../errors/HttpError.js";
import { isDuplicateKeyError } from "../errors/mongoErrors.js";
import type { RegisterInput } from "../validators/auth.validators.js";

const SALT_ROUNDS = 12;

export async function registerUser(input: RegisterInput) {
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  try {
    const user = await UserModel.create({
      username: input.username,
      email: input.email,
      passwordHash,
    });
    return { id: user.id, username: user.username, email: user.email };
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      throw new HttpError(409, "Username or email already in use");
    }
    throw err;
  }
}
