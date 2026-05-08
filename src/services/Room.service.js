import Room from "../models/Room.js";
import ApiError from "../utils/ApiError.js";
import { getCache, setCache, deleteCache, deletePattern } from "../utils/cache.js";

// Create Room
export const createRoomService = async (userId, { name, description, type, requiresApproval }) => {
  const existing = await Room.findOne({ name });
  if (existing) throw new ApiError("Room name already exists", 409);

  const room = await Room.create({
    name,
    description,
    type,
    requiresApproval,
    createdBy: userId,
    members: [{ user: userId, role: "owner" }],
  });

  await deletePattern("rooms:public:*");

  return room;
};

// Get All Public Rooms
export const getPublicRoomsService = async ({ page = 1, limit = 20 }) => {
  const cacheKey = `rooms:public:${page}:${limit}`;

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const rooms = await Room.find({ type: "public", isActive: true })
    .populate("createdBy", "username avatar")
    .populate("lastMessage")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Room.countDocuments({ type: "public", isActive: true });

  const data = { rooms, total, page: Number(page), limit: Number(limit) };

  await setCache(cacheKey, data, 60 * 5); 

  return data;
};

// Get Room By ID
export const getRoomByIdService = async (roomId) => {
  const cacheKey = `rooms:${roomId}`;

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const room = await Room.findById(roomId)
    .populate("createdBy", "username avatar")
    .populate("members.user", "username avatar status")
    .populate("lastMessage");

  if (!room) throw new ApiError("Room not found", 404);

  await setCache(cacheKey, room, 60 * 10); 

  return room;
};

// Update Room
export const updateRoomService = async (roomId, userId, updates) => {
  const room = await Room.findById(roomId);
  if (!room) throw new ApiError("Room not found", 404);

  if (!room.isAdmin(userId)) {
    throw new ApiError("Only admins can update the room", 403);
  }

  const updated = await Room.findByIdAndUpdate(roomId, updates, {
    new: true,
    runValidators: true,
  });

  await deleteCache(`rooms:${roomId}`);
  await deletePattern("rooms:public:*");

  return updated;
};

// Delete Room
export const deleteRoomService = async (roomId, userId) => {
  const room = await Room.findById(roomId);
  if (!room) throw new ApiError("Room not found", 404);

  const member = room.members.find((m) => m.user.toString() === userId.toString());
  if (!member || member.role !== "owner") {
    throw new ApiError("Only the owner can delete the room", 403);
  }

  await Room.findByIdAndUpdate(roomId, { isActive: false });

  await deleteCache(`rooms:${roomId}`);
  await deletePattern("rooms:public:*");
};

// Join Room
export const joinRoomService = async (roomId, userId) => {
  const room = await Room.findById(roomId);
  if (!room) throw new ApiError("Room not found", 404);
  if (!room.isActive) throw new ApiError("Room is not active", 400);

  if (room.isMember(userId)) {
    throw new ApiError("You are already a member", 409);
  }

  if (room.type === "private" && room.requiresApproval) {
    throw new ApiError("This room requires admin approval", 403);
  }

  room.addMember(userId);
  await room.save();

  await deleteCache(`rooms:${roomId}`);

  return room;
};

// Leave Room
export const leaveRoomService = async (roomId, userId) => {
  const room = await Room.findById(roomId);
  if (!room) throw new ApiError("Room not found", 404);

  if (!room.isMember(userId)) {
    throw new ApiError("You are not a member of this room", 400);
  }

  const member = room.members.find((m) => m.user.toString() === userId.toString());
  if (member.role === "owner") {
    throw new ApiError("Owner cannot leave the room, transfer ownership first", 400);
  }

  room.removeMember(userId);
  await room.save();

  await deleteCache(`rooms:${roomId}`);
};

// Change Member Role
export const changeMemberRoleService = async (roomId, adminId, targetUserId, role) => {
  const room = await Room.findById(roomId);
  if (!room) throw new ApiError("Room not found", 404);

  if (!room.isAdmin(adminId)) {
    throw new ApiError("Only admins can change roles", 403);
  }

  const member = room.members.find((m) => m.user.toString() === targetUserId.toString());
  if (!member) throw new ApiError("User is not a member of this room", 404);

  member.role = role;
  await room.save();

  await deleteCache(`rooms:${roomId}`);

  return room;
};

// Remove Member
export const removeMemberService = async (roomId, adminId, targetUserId) => {
  const room = await Room.findById(roomId);
  if (!room) throw new ApiError("Room not found", 404);

  if (!room.isAdmin(adminId)) {
    throw new ApiError("Only admins can remove members", 403);
  }

  if (!room.isMember(targetUserId)) {
    throw new ApiError("User is not a member of this room", 404);
  }

  room.removeMember(targetUserId);
  await room.save();

  await deleteCache(`rooms:${roomId}`);
};

// Search Rooms
export const searchRoomsService = async ({ q, type, page = 1, limit = 20 }) => {
  const cacheKey = `rooms:search:${q}:${type || "all"}:${page}:${limit}`;

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const filter = {
    $or: [
      { name: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ],
    isActive: true,
  };

  if (type) filter.type = type;

  const rooms = await Room.find(filter)
    .populate("createdBy", "username avatar")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  await setCache(cacheKey, rooms, 60 * 5); 

  return rooms;
};

// Get My Rooms
export const getMyRoomsService = async (userId) => {
  const cacheKey = `rooms:my:${userId}`;

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const rooms = await Room.find({
    "members.user": userId,
    isActive: true,
  })
    .populate("lastMessage")
    .sort({ updatedAt: -1 });

  await setCache(cacheKey, rooms, 60 * 5); 

  return rooms;
};