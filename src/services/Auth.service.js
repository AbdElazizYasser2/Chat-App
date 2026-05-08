import crypto from "crypto";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import ApiError from "../utils/ApiError.js";
import { deleteCache } from "../utils/cache.js";

export const registerService = async ({ username, email, password }) => {
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    const field = existingUser.email === email ? "Email" : "Username";
    throw new ApiError(`${field} already exists`, 409);
  }

  const user = await User.create({ username, email, password });
  const token = generateToken(user._id);

  return { token, user: user.toPublicJSON() };
};

export const loginService = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password +passwordChangedAt");

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError("Invalid email or password", 401);
  }

  if (!user.isActive) {
    throw new ApiError("Your account is not active", 403);
  }

  await user.updateOne({ status: "online" });

  const token = generateToken(user._id);

  return { token, user: user.toPublicJSON() };
};

export const logoutService = async (userId) => {
  await User.findByIdAndUpdate(userId, {
    status: "offline",
    lastSeen: new Date(),
  });

  await deleteCache(`user:profile:${userId}`);
};

export const forgotPasswordService = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new ApiError("No user found with this email", 404);

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  await user.updateOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: Date.now() + 10 * 60 * 1000,
  });

  return { resetToken };
};

export const resetPasswordService = async ({ token, password }) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) throw new ApiError("Invalid or expired reset token", 400);

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  await deleteCache(`user:profile:${user._id}`);

  const newToken = generateToken(user._id);

  return { token: newToken };
};