import asyncHandler from "express-async-handler";
import * as userService from "../services/User.service.js";
import sendResponse from "../utils/sendResponse.js";

// GET /api/v1/users/profile
export const getProfile = asyncHandler(async (req, res) => {
  sendResponse(res, 200, "Profile fetched successfully", {
    user: req.user.toPublicJSON(),
  });
});

// GET /api/v1/users/:userId
export const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserByIdService(req.params.userId);
  sendResponse(res, 200, "User fetched successfully", { user });
});

// PUT /api/v1/users/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfileService(req.user._id, req.body);
  sendResponse(res, 200, "Profile updated successfully", { user });
});

// PUT /api/v1/users/avatar
export const updateAvatar = asyncHandler(async (req, res) => {
  const avatar = await userService.updateAvatarService(req.user._id, req.file);
  sendResponse(res, 200, "Avatar updated successfully", { avatar });
});

// PUT /api/v1/users/password
export const changePassword = asyncHandler(async (req, res) => {
  await userService.changePasswordService(req.user._id, req.body);
  sendResponse(res, 200, "Password changed successfully");
});

// PUT /api/v1/users/status
export const updateStatus = asyncHandler(async (req, res) => {
  const status = await userService.updateStatusService(req.user._id, req.body.status);
  sendResponse(res, 200, "Status updated successfully", { status });
});

// GET /api/v1/users/search?q=
export const searchUsers = asyncHandler(async (req, res) => {
  const users = await userService.searchUsersService(req.user._id, req.query);
  sendResponse(res, 200, "Users fetched successfully", { users });
});

// DELETE /api/v1/users
export const deleteAccount = asyncHandler(async (req, res) => {
  await userService.deleteAccountService(req.user._id);
  sendResponse(res, 200, "Account deleted successfully");
});