import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import ApiError from "../utils/ApiError.js";
import { getCache, setCache, deleteCache, deletePattern } from "../utils/cache.js";

// Start or Get Conversation
export const startConversationService = async (userId, targetUserId) => {
  if (userId.toString() === targetUserId.toString()) {
    throw new ApiError("You cannot start a conversation with yourself", 400);
  }

  const conversation = await Conversation.findOrCreate(userId, targetUserId);

  await conversation.populate("participants", "username avatar status lastSeen");
  await conversation.populate({
    path: "lastMessage",
    populate: { path: "sender", select: "username" },
  });

  await deleteCache(`conversations:my:${userId}`);
  await deleteCache(`conversations:my:${targetUserId}`);

  return conversation;
};

// Get My Conversations
export const getMyConversationsService = async (userId) => {
  const cacheKey = `conversations:my:${userId}`;

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const conversations = await Conversation.getUserConversations(userId);

  await setCache(cacheKey, conversations, 60 * 2); 

  return conversations;
};

// Get Conversation Messages
export const getConversationMessagesService = async (conversationId, userId, query) => {
  const { page = 1, limit = 50, before } = query;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new ApiError("Conversation not found", 404);

  if (!conversation.participants.includes(userId)) {
    throw new ApiError("You are not part of this conversation", 403);
  }

  const cacheKey = !before ? `messages:conversation:${conversationId}:${page}:${limit}` : null;

  if (cacheKey) {
    const cached = await getCache(cacheKey);
    if (cached) return cached;
  }

  const filter = { conversation: conversationId, isDeleted: false };
  if (before) filter._id = { $lt: before };

  const messages = await Message.find(filter)
    .populate("sender", "username avatar")
    .populate("replyTo", "content sender type")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const result = messages.reverse();

  if (cacheKey) await setCache(cacheKey, result, 60 * 2); 

  return result;
};

// Hide Conversation
export const hideConversationService = async (conversationId, userId) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new ApiError("Conversation not found", 404);

  if (!conversation.participants.includes(userId)) {
    throw new ApiError("You are not part of this conversation", 403);
  }

  conversation.hideFor(userId);
  await conversation.save();

  await deleteCache(`conversations:my:${userId}`);
};

// Delete Conversation
export const deleteConversationService = async (conversationId, userId) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new ApiError("Conversation not found", 404);

  if (!conversation.participants.includes(userId)) {
    throw new ApiError("You are not part of this conversation", 403);
  }

  await Conversation.findByIdAndUpdate(conversationId, { isActive: false });

  for (const participantId of conversation.participants) {
    await deleteCache(`conversations:my:${participantId}`);
  }
  await deletePattern(`messages:conversation:${conversationId}:*`);
};