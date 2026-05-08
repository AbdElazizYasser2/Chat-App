import asyncHandler from "express-async-handler";
import * as roomService from "../services/room.service.js";
import sendResponse from "../utils/sendResponse.js";

// POST /api/v1/rooms
export const createRoom = asyncHandler(async (req, res) => {
  const room = await roomService.createRoomService(req.user._id, req.body);
  sendResponse(res, 201, "Room created successfully", { room });
});

// GET /api/v1/rooms
export const getPublicRooms = asyncHandler(async (req, res) => {
  const data = await roomService.getPublicRoomsService(req.query);
  sendResponse(res, 200, "Rooms fetched successfully", data);
});

// GET /api/v1/rooms/my
export const getMyRooms = asyncHandler(async (req, res) => {
  const rooms = await roomService.getMyRoomsService(req.user._id);
  sendResponse(res, 200, "My rooms fetched successfully", { rooms });
});

// GET /api/v1/rooms/search
export const searchRooms = asyncHandler(async (req, res) => {
  const rooms = await roomService.searchRoomsService(req.query);
  sendResponse(res, 200, "Rooms fetched successfully", { rooms });
});

// GET /api/v1/rooms/:roomId
export const getRoomById = asyncHandler(async (req, res) => {
  const room = await roomService.getRoomByIdService(req.params.roomId);
  sendResponse(res, 200, "Room fetched successfully", { room });
});

// PUT /api/v1/rooms/:roomId
export const updateRoom = asyncHandler(async (req, res) => {
  const room = await roomService.updateRoomService(req.params.roomId, req.user._id, req.body);
  sendResponse(res, 200, "Room updated successfully", { room });
});

// DELETE /api/v1/rooms/:roomId
export const deleteRoom = asyncHandler(async (req, res) => {
  await roomService.deleteRoomService(req.params.roomId, req.user._id);
  sendResponse(res, 200, "Room deleted successfully");
});

// POST /api/v1/rooms/:roomId/join
export const joinRoom = asyncHandler(async (req, res) => {
  const room = await roomService.joinRoomService(req.params.roomId, req.user._id);
  sendResponse(res, 200, "Joined room successfully", { room });
});

// POST /api/v1/rooms/:roomId/leave
export const leaveRoom = asyncHandler(async (req, res) => {
  await roomService.leaveRoomService(req.params.roomId, req.user._id);
  sendResponse(res, 200, "Left room successfully");
});

// PUT /api/v1/rooms/:roomId/members/:userId/role
export const changeMemberRole = asyncHandler(async (req, res) => {
  const room = await roomService.changeMemberRoleService(
    req.params.roomId,
    req.user._id,
    req.params.userId,
    req.body.role
  );
  sendResponse(res, 200, "Role updated successfully", { room });
});

// DELETE /api/v1/rooms/:roomId/members/:userId
export const removeMember = asyncHandler(async (req, res) => {
  await roomService.removeMemberService(req.params.roomId, req.user._id, req.params.userId);
  sendResponse(res, 200, "Member removed successfully");
});