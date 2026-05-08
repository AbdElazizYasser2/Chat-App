import asyncHandler from "express-async-handler";
import * as conversationService from "../services/conversation.service.js";
import sendResponse from "../utils/sendResponse.js";

// POST /api/v1/conversations/:userId
export const startConversation = asyncHandler(async (req, res) => {
  const conversation = await conversationService.startConversationService(
    req.user._id,
    req.params.userId
  );
  sendResponse(res, 200, "Conversation started successfully", { conversation });
});

// GET /api/v1/conversations
export const getMyConversations = asyncHandler(async (req, res) => {
  const conversations = await conversationService.getMyConversationsService(req.user._id);
  sendResponse(res, 200, "Conversations fetched successfully", { conversations });
});

// GET /api/v1/conversations/:conversationId/messages
export const getConversationMessages = asyncHandler(async (req, res) => {
  const messages = await conversationService.getConversationMessagesService(
    req.params.conversationId,
    req.user._id,
    req.query
  );
  sendResponse(res, 200, "Messages fetched successfully", { messages });
});

// PUT /api/v1/conversations/:conversationId/hide
export const hideConversation = asyncHandler(async (req, res) => {
  await conversationService.hideConversationService(
    req.params.conversationId,
    req.user._id
  );
  sendResponse(res, 200, "Conversation hidden successfully");
});

// DELETE /api/v1/conversations/:conversationId
export const deleteConversation = asyncHandler(async (req, res) => {
  await conversationService.deleteConversationService(
    req.params.conversationId,
    req.user._id
  );
  sendResponse(res, 200, "Conversation deleted successfully");
});