import Message from "../models/Message.js";
import Room from "../models/Room.js";
import Conversation from "../models/Conversation.js";
import ApiError from "../utils/ApiError.js";
import { getCache, setCache, deletePattern } from "../utils/cache.js";

// Send Message
export const sendMessageService = async (senderId, body) => {
  const { content, type = "text", roomId, conversationId, replyTo, attachment } = body;

  if (roomId) {
    const room = await Room.findById(roomId);
    if (!room) throw new ApiError("Room not found", 404);
    if (!room.isMember(senderId)) throw new ApiError("You are not a member of this room", 403);
  }

  if (conversationId) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) throw new ApiError("Conversation not found", 404);
    if (!conversation.participants.includes(senderId)) {
      throw new ApiError("You are not part of this conversation", 403);
    }
  }

  const message = await Message.create({
    sender: senderId,
    content,
    type,
    room: roomId,
    conversation: conversationId,
    replyTo,
    attachment,
  });

  await message.populate("sender", "username avatar");
  if (replyTo) await message.populate("replyTo", "content sender type");

  if (roomId) {
    await Room.findByIdAndUpdate(roomId, { lastMessage: message._id });

    await deletePattern(`messages:room:${roomId}:*`);
  }

  if (conversationId) {
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      updatedAt: new Date(),
    });
    await deletePattern(`messages:conversation:${conversationId}:*`);
  }

  return message;
};

// Get Room Messages
export const getRoomMessagesService = async (roomId, userId, query) => {
  const { page = 1, limit = 50, before } = query;

  const room = await Room.findById(roomId);
  if (!room) throw new ApiError("Room not found", 404);
  if (!room.isMember(userId)) throw new ApiError("You are not a member of this room", 403);

  const cacheKey = !before ? `messages:room:${roomId}:${page}:${limit}` : null;

  if (cacheKey) {
    const cached = await getCache(cacheKey);
    if (cached) return cached;
  }

  const filter = { room: roomId, isDeleted: false };
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

// Edit Message
export const editMessageService = async (messageId, userId, content) => {
  const message = await Message.findById(messageId);
  if (!message) throw new ApiError("Message not found", 404);

  if (message.sender.toString() !== userId.toString()) {
    throw new ApiError("You can only edit your own messages", 403);
  }

  if (message.type !== "text") {
    throw new ApiError("Only text messages can be edited", 400);
  }

  message.editContent(content);
  await message.save();
  await message.populate("sender", "username avatar");

  if (message.room) await deletePattern(`messages:room:${message.room}:*`);
  if (message.conversation) await deletePattern(`messages:conversation:${message.conversation}:*`);

  return message;
};

// Delete Message
export const deleteMessageService = async (messageId, userId) => {
  const message = await Message.findById(messageId);
  if (!message) throw new ApiError("Message not found", 404);

  if (message.sender.toString() !== userId.toString()) {
    throw new ApiError("You can only delete your own messages", 403);
  }

  message.softDelete();
  await message.save();

  if (message.room) await deletePattern(`messages:room:${message.room}:*`);
  if (message.conversation) await deletePattern(`messages:conversation:${message.conversation}:*`);

  return message;
};

// React to Message
export const reactToMessageService = async (messageId, userId, emoji) => {
  const message = await Message.findById(messageId);
  if (!message) throw new ApiError("Message not found", 404);

  message.toggleReaction(userId, emoji);
  await message.save();

  return message.reactions;
};

// Mark as Read
export const markAsReadService = async (messageIds, userId) => {
  await Message.updateMany(
    {
      _id: { $in: messageIds },
      "readBy.user": { $ne: userId },
    },
    {
      $push: { readBy: { user: userId, readAt: new Date() } },
    }
  );
};