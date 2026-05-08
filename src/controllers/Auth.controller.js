import asyncHandler from "express-async-handler";
import * as authService from "../services/Auth.service.js";
import sendResponse from "../utils/sendResponse.js";

// POST /api/v1/auth/register
export const register = asyncHandler(async (req, res) => {
  const data = await authService.registerService(req.body);
  sendResponse(res, 201, "Registered successfully", data);
});

// POST /api/v1/auth/login
export const login = asyncHandler(async (req, res) => {
  const data = await authService.loginService(req.body);
  sendResponse(res, 200, "Login successful", data);
});

// POST /api/v1/auth/logout
export const logout = asyncHandler(async (req, res) => {
  await authService.logoutService(req.user._id);
  sendResponse(res, 200, "Logged out successfully");
});

// GET /api/v1/auth/me
export const getMe = asyncHandler(async (req, res) => {
  sendResponse(res, 200, "User fetched successfully", {
    user: req.user.toPublicJSON(),
  });
});

// POST /api/v1/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const data = await authService.forgotPasswordService(req.body.email);
  sendResponse(res, 200, "Reset token generated", data);
});

// POST /api/v1/auth/reset-password/:token
export const resetPassword = asyncHandler(async (req, res) => {
  const data = await authService.resetPasswordService({
    token: req.params.token,
    password: req.body.password,
  });
  sendResponse(res, 200, "Password reset successfully", data);
});