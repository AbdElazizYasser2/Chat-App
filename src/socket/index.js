import redisClient from "../config/redis.js";
import { handleMessageEvents } from "./handlers/message.handler.js";
import { handleRoomEvents } from "./handlers/room.handler.js";
import { handleUserEvents } from "./handlers/user.handler.js";

const initSocket = (io) => {
  io.on("connection", async (socket) => {
    const user = socket.user;
    console.log(`${user.username} connected — socketId: ${socket.id}`);

    await redisClient.set(`user:${user._id}`, socket.id);

    socket.broadcast.emit("user:online", {
      userId: user._id,
      username: user.username,
    });

    handleMessageEvents(socket, io);
    handleRoomEvents(socket, io);
    handleUserEvents(socket, io);

    socket.on("disconnect", async () => {
      console.log(`${user.username} disconnected`);

      await redisClient.del(`user:${user._id}`);

      socket.broadcast.emit("user:offline", {
        userId: user._id,
        username: user.username,
        lastSeen: new Date(),
      });

      try {
        await user.updateOne({
          status: "offline",
          lastSeen: new Date(),
        });
      } catch (err) {
        console.error(`Error updating lastSeen: ${err.message}`);
      }
    });
  });
};

export default initSocket;