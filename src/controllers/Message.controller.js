import asyncHandler from "express-async-handler";
import * as messageService from "../services/message.service.js";
import sendResponse from "../utils/sendResponse.js";

// POST /api/v1/messages
export const sendMessage = asyncHandler(async (req, res) => {
  const message = await messageService.sendMessageService(req.user._id, req.body);
  sendResponse(res, 201, "Message sent successfully", { message });
});

// GET /api/v1/messages/room/:roomId
export const getRoomMessages = asyncHandler(async (req, res) => {
  const messages = await messageService.getRoomMessagesService(
    req.params.roomId,
    req.user._id,
    req.query
  );
  sendResponse(res, 200, "Messages fetched successfully", { messages });
});

// PUT /api/v1/messages/:messageId
export const editMessage = asyncHandler(async (req, res) => {
  const message = await messageService.editMessageService(
    req.params.messageId,
    req.user._id,
    req.body.content
  );
  sendResponse(res, 200, "Message edited successfully", { message });
});

// DELETE /api/v1/messages/:messageId
export const deleteMessage = asyncHandler(async (req, res) => {
  await messageService.deleteMessageService(req.params.messageId, req.user._id);
  sendResponse(res, 200, "Message deleted successfully");
});

// POST /api/v1/messages/:messageId/react
export const reactToMessage = asyncHandler(async (req, res) => {
  const reactions = await messageService.reactToMessageService(
    req.params.messageId,
    req.user._id,
    req.body.emoji
  );
  sendResponse(res, 200, "Reaction updated successfully", { reactions });
});

// PUT /api/v1/messages/read
export const markAsRead = asyncHandler(async (req, res) => {
  await messageService.markAsReadService(req.body.messageIds, req.user._id);
  sendResponse(res, 200, "Messages marked as read");
});