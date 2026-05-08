import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required'],
    },

    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      default: null,
    },

    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      default: null,
    },

    content: {
      type: String,
      trim: true,
      maxlength: [2000, 'The message must be no more than 2000 characters'],
    },

    type: {
      type: String,
      enum: ['text', 'image', 'video', 'audio', 'file', 'system'],
      default: 'text',
    },

    attachment: {
      url: { type: String },
      filename: { type: String },
      size: { type: Number },   
      mimeType: { type: String },
    },

    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    reactions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        emoji: {
          type: String,
          maxlength: 10,
        },
      },
    ],

    isEdited: {
      type: Boolean,
      default: false,
    },

    editedAt: {
      type: Date,
      default: null,
    },
 
    isDeleted: {
      type: Boolean,
      default: false,
    },
 
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true
  }
);

messageSchema.pre("save", function (next) {
  if (!this.room && !this.conversation) {
    return next(new Error("الرسالة لازم تبقى في Room أو Conversation"));
  }
  if (this.type === "text" && !this.content) {
    return next(new Error("محتوى الرسالة مطلوب"));
  }
  next();
});

messageSchema.methods.markAsRead = function (userId) {
  const alreadyRead = this.readBy.some(
    (r) => r.user.toString() === userId.toString()
  );
  if (!alreadyRead) {
    this.readBy.push({ user: userId });
  }
};

messageSchema.methods.toggleReaction = function (userId, emoji) {
  const existingIndex = this.reactions.findIndex(
    (r) => r.user.toString() === userId.toString()
  );
 
  if (existingIndex !== -1) {
    if (this.reactions[existingIndex].emoji === emoji) {
      this.reactions.splice(existingIndex, 1);
    } else {
      this.reactions[existingIndex].emoji = emoji;
    }
  } else {
    this.reactions.push({ user: userId, emoji });
  }
};

messageSchema.methods.editContent = function (newContent) {
  this.content = newContent;
  this.isEdited = true;
  this.editedAt = new Date();
};

messageSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.content = "تم حذف هذه الرسالة";
  this.attachment = undefined;
};

messageSchema.statics.getRoomMessages = function (roomId, page = 1, limit = 50) {
  return this.find({ room: roomId, isDeleted: false })
    .populate("sender", "username avatar status")
    .populate("replyTo", "content sender type")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

messageSchema.index({ room: 1, createdAt: -1 });
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
 
const Message = mongoose.model("Message", messageSchema);
export default Message;