import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { getCache, setCache, deleteCache } from "../utils/cache.js";

// Get User By ID
export const getUserByIdService = async (userId) => {
  const cacheKey = `user:profile:${userId}`;

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const user = await User.findById(userId);
  if (!user) throw new ApiError("User not found", 404);

  const publicUser = user.toPublicJSON();
  await setCache(cacheKey, publicUser, 60 * 60); 

  return publicUser;
};

// Update Profile
export const updateProfileService = async (userId, { username, bio }) => {
  if (username) {
    const existing = await User.findOne({ username, _id: { $ne: userId } });
    if (existing) throw new ApiError("Username already taken", 409);
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { username, bio },
    { new: true, runValidators: true }
  );

  await deleteCache(`user:profile:${userId}`);

  return user.toPublicJSON();
};

// Update Avatar
export const updateAvatarService = async (userId, file) => {
  if (!file) throw new ApiError("Please upload an image", 400);

  const avatarUrl = file.path || `uploads/${file.filename}`;

  const user = await User.findByIdAndUpdate(
    userId,
    { avatar: avatarUrl },
    { new: true }
  );

  await deleteCache(`user:profile:${userId}`);

  return user.avatar;
};

// Change Password
export const changePasswordService = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select("+password");

  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError("Current password is incorrect", 401);
  }

  user.password = newPassword;
  await user.save();
};

// Update Status
export const updateStatusService = async (userId, status) => {
  await User.findByIdAndUpdate(userId, { status });

  const cacheKey = `user:profile:${userId}`;
  const cached = await getCache(cacheKey);
  if (cached) await setCache(cacheKey, { ...cached, status }, 60 * 60);

  return status;
};

// Search Users
export const searchUsersService = async (userId, { q, page = 1, limit = 20 }) => {
  const cacheKey = `user:search:${q}:${page}:${limit}`;

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const users = await User.find({
    $or: [
      { username: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
    ],
    _id: { $ne: userId },
    isActive: true,
  })
    .select("username email avatar status lastSeen")
    .skip((page - 1) * limit)
    .limit(Number(limit));

  await setCache(cacheKey, users, 60 * 5); 

  return users;
};

// Delete Account
export const deleteAccountService = async (userId) => {
  await User.findByIdAndUpdate(userId, { isActive: false });
  await deleteCache(`user:profile:${userId}`);
};