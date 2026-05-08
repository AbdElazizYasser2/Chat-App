import mongoose, { Schema } from "mongoose";

const roomSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Room name is required'],
      trim: true,
      minlength: [3, 'The name must be at least 3 characters long.'],
      maxlength: [50, 'The name must be at least 6 characters long.']
    },

    description: {
      type: String, 
      maxlength: [200, ''],
      default: "",
    },

    type: {
      type: String,
      enum: ['public', 'private', 'group'],
      default: 'public',
    },

    avatar: {
      type: String,
      default: function () {
        return `https://api.dicebear.com/7.x/identicon/svg?seed=${this.name}`;
      },
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    member: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["member", "admin", "owner"],
          default: "member",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      required: true,
    },

    requiresApproval: {
      type: Boolean,
      default: false,
    },

    is_active: {
      type: Boolean,
      default: true,
    },
    
  },
  {
    timestamps: true
  }
);

roomSchema.virtual('membersCount').get(function () {
  return this.member.length;
});

roomSchema.methods.addMember = function (userId, role = "member") {
  const alreadyMember = this.members.some(
    (m) => m.user.toString() === userId.toString()
  );
  if (alreadyMember) return false;
 
  this.members.push({ user: userId, role });
  return true;
};

roomSchema.methods.removeMember = function (userId) {
  this.members = this.members.filter(
    (m) => m.user.toString() !== userId.toString()
  );
};

roomSchema.methods.isAdmin = function (userId) {
  const member = this.members.find(
    (m) => m.user.toString() === userId.toString()
  );
  return member && ["admin", "owner"].includes(member.role);
};

roomSchema.methods.isMember = function (userId) {
  return this.members.some(
    (m) => m.user.toString() === userId.toString()
  );
};

roomSchema.index({ name: "text", description: "text" });
roomSchema.index({ type: 1, is_active: 1 });

const Room = mongoose.model("Room", roomSchema);
export default Room;