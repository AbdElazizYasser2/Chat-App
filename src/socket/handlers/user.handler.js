import User from "../../models/User.js";
import redisClient from "../../config/redis.js";

export const handleUserEvents = (socket, io) => {
  const user = socket.user;

  socket.on("user:status", async (data, callback) => {
    try {
      const { status } = data;

      if (!["online", "offline", "away"].includes(status)) {
        return callback({ success: false, message: "Invalid status" });
      }

      await User.findByIdAndUpdate(user._id, { status });

      io.emit("user:statusChanged", { userId: user._id, status });

      callback({ success: true });
    } catch (err) {
      console.error(`user:status error: ${err.message}`);
      callback({ success: false, message: "An error occurred" });
    }
  });

  socket.on("user:getOnline", async (callback) => {
    try {
      const keys = await redisClient.keys("user:*");
      const onlineList = keys.map((key) => key.replace("user:", ""));
      callback({ success: true, onlineUsers: onlineList });
    } catch (err) {
      console.error(`user:getOnline error: ${err.message}`);
      callback({ success: false, message: "An error occurred" });
    }
  });
};