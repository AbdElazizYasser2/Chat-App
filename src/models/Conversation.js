import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    hiddenBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

conversationSchema.pre("save", function (next) {
  if (this.participants.length !== 2) {
    return next(new Error("المحادثة لازم تكون بين يوزرين بالظبط"));
  }
  next();
});

conversationSchema.statics.findOrCreate = async function (userId1, userId2) {
  let conversation = await this.findOne({
    participants: { $all: [userId1, userId2] },
  });

  if (!conversation) {
    conversation = await this.create({
      participants: [userId1, userId2],
    });
  }

  return conversation;
};

conversationSchema.statics.getUserConversations = function (userId) {
  return this.find({
    participants: userId,
    hiddenBy: { $ne: userId },
    isActive: true,
  })
    .populate("participants", "username avatar status lastSeen")
    .populate({
      path: "lastMessage",
      populate: { path: "sender", select: "username" },
    })
    .sort({ updatedAt: -1 });
};

conversationSchema.methods.hideFor = function (userId) {
  if (!this.hiddenBy.includes(userId)) {
    this.hiddenBy.push(userId);
  }
};

conversationSchema.methods.unhideFor = function (userId) {
  this.hiddenBy = this.hiddenBy.filter(
    (id) => id.toString() !== userId.toString()
  );
};

conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;