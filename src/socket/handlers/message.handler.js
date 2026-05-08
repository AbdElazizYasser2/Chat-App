import Message from "../../models/Message.js";
import Room from "../../models/Room.js";
import Conversation from "../../models/Conversation.js";
import redisClient from "../../config/redis.js";

export const handleMessageEvents = (socket, io) => {
  const user = socket.user;

  socket.on("message:send", async (data, callback) => {
    try {
      const { content, type = "text", roomId, conversationId, replyTo, attachment } = data;

      if (roomId) {
        const room = await Room.findById(roomId);
        if (!room || !room.isMember(user._id)) {
          return callback({ success: false, message: "You are not a member of this room" });
        }
      }

      const message = await Message.create({
        sender: user._id,
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
        io.to(roomId).emit("message:receive", message);
      }

      if (conversationId) {
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: message._id,
          updatedAt: new Date(),
        });

        const conversation = await Conversation.findById(conversationId);

        for (const participantId of conversation.participants) {
          const socketId = await redisClient.get(`user:${participantId.toString()}`);
          if (socketId) io.to(socketId).emit("message:receive", message);
        }
      }

      callback({ success: true, message });
    } catch (err) {
      console.error(`message:send error: ${err.message}`);
      callback({ success: false, message: "An error occurred while sending the message" });
    }
  });

  socket.on("message:edit", async (data, callback) => {
    try {
      const { messageId, content } = data;

      const message = await Message.findById(messageId);
      if (!message) {
        return callback({ success: false, message: "Message not found" });
      }

      if (message.sender.toString() !== user._id.toString()) {
        return callback({ success: false, message: "You are not allowed to edit someone else's message" });
      }

      message.editContent(content);
      await message.save();
      await message.populate("sender", "username avatar");

      const target = message.room || message.conversation;
      io.to(target.toString()).emit("message:edited", message);

      callback({ success: true, message });
    } catch (err) {
      console.error(`message:edit error: ${err.message}`);
      callback({ success: false, message: "An error occurred while editing the message" });
    }
  });

  socket.on("message:delete", async (data, callback) => {
    try {
      const { messageId } = data;

      const message = await Message.findById(messageId);
      if (!message) {
        return callback({ success: false, message: "Message not found" });
      }

      if (message.sender.toString() !== user._id.toString()) {
        return callback({ success: false, message: "You are not allowed to delete someone else's message" });
      }

      message.softDelete();
      await message.save();

      const target = message.room || message.conversation;
      io.to(target.toString()).emit("message:deleted", { messageId });

      callback({ success: true });
    } catch (err) {
      console.error(`message:delete error: ${err.message}`);
      callback({ success: false, message: "An error occurred while deleting the message" });
    }
  });

  socket.on("message:react", async (data, callback) => {
    try {
      const { messageId, emoji } = data;

      const message = await Message.findById(messageId);
      if (!message) {
        return callback({ success: false, message: "Message not found" });
      }

      message.toggleReaction(user._id, emoji);
      await message.save();

      const target = message.room || message.conversation;
      io.to(target.toString()).emit("message:reacted", {
        messageId,
        reactions: message.reactions,
      });

      callback({ success: true });
    } catch (err) {
      console.error(`message:react error: ${err.message}`);
      callback({ success: false, message: "An error occurred while adding the reaction" });
    }
  });

  socket.on("message:read", async (data, callback) => {
    try {
      const { messageIds } = data;

      await Message.updateMany(
        {
          _id: { $in: messageIds },
          "readBy.user": { $ne: user._id },
        },
        {
          $push: { readBy: { user: user._id, readAt: new Date() } },
        }
      );

      for (const messageId of messageIds) {
        const message = await Message.findById(messageId).select("sender room conversation");
        if (message) {
          const senderSocketId = await redisClient.get(`user:${message.sender.toString()}`);
          if (senderSocketId) {
            io.to(senderSocketId).emit("message:readConfirm", {
              messageId,
              readBy: user._id,
            });
          }
        }
      }

      callback({ success: true });
    } catch (err) {
      console.error(`message:read error: ${err.message}`);
      callback({ success: false, message: "An error occurred" });
    }
  });

  socket.on("typing:start", (data) => {
    const { roomId, conversationId } = data;
    const target = roomId || conversationId;
    socket.to(target).emit("typing:start", {
      userId: user._id,
      username: user.username,
    });
  });

  socket.on("typing:stop", (data) => {
    const { roomId, conversationId } = data;
    const target = roomId || conversationId;
    socket.to(target).emit("typing:stop", { userId: user._id });
  });
};