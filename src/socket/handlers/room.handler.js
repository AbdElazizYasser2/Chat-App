import Room from "../../models/Room.js";

export const handleRoomEvents = (socket, io) => {
  const user = socket.user;

  socket.on("room:join", async (data, callback) => {
    try {
      const { roomId } = data;

      const room = await Room.findById(roomId);

      if (!room) {
        return callback({
          success: false,
          message: "Room not found",
        });
      }

      if (!room.isMember(user._id)) {
        return callback({
          success: false,
          message: "You are not a member of this room",
        });
      }

      socket.join(roomId);

      socket.to(roomId).emit("room:userJoined", {
        roomId,
        user: {
          _id: user._id,
          username: user.username,
          avatar: user.avatar,
        },
      });

      callback({
        success: true,
      });
    } catch (err) {
      console.error(`room:join error: ${err.message}`);

      callback({
        success: false,
        message: "An error occurred",
      });
    }
  });

  socket.on("room:leave", async (data, callback) => {
    try {
      const { roomId } = data;

      socket.leave(roomId);

      socket.to(roomId).emit("room:userLeft", {
        roomId,
        userId: user._id,
        username: user.username,
      });

      callback({
        success: true,
      });
    } catch (err) {
      console.error(`room:leave error: ${err.message}`);

      callback({
        success: false,
        message: "An error occurred",
      });
    }
  });
};