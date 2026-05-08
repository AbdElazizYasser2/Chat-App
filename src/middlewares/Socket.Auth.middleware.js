import jwt from "jsonwebtoken";
import User from "../models/User.js";

const socketAuth = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];

    if (!token) {
      return next(new Error("Unauthorized — token is required"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next(new Error("User not found"));
    }

    if (!user.isActive) {
      return next(new Error("This account is suspended"));
    }

    socket.user = user;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return next(new Error("Invalid token"));
    }

    if (err.name === "TokenExpiredError") {
      return next(new Error("Token has expired"));
    }

    next(new Error("Authentication error"));
  }
};

export default socketAuth;