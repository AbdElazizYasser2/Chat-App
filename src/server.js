import { createServer } from "http";
import { Server } from "socket.io";
import redisClient from "./config/redis.js";
import dotenv from "dotenv";

import app from "./app.js";
import connectDB from "./config/database.js";
import socketAuth from "./middlewares/socket.auth.middleware.js";
import initSocket from "./socket/index.js";

dotenv.config();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

io.use(socketAuth);
initSocket(io);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await redisClient.connect();

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  });
};

startServer();

process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  httpServer.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});