import { Router } from "express";
import {
  sendMessage,
  getRoomMessages,
  editMessage,
  deleteMessage,
  reactToMessage,
  markAsRead,
} from "../controllers/message.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { uploadSingleImage } from "../middlewares/upload.middleware.js";

import {
  sendMessageSchema,
  editMessageSchema,
  deleteMessageSchema,
  getRoomMessagesSchema,
  reactToMessageSchema,
  markAsReadSchema,
} from "../validations/message.validation.js";

const router = Router();

router.use(protect);

router.post("/", validate(sendMessageSchema), sendMessage);
router.post("/image", uploadSingleImage("image"), sendMessage);
router.put("/read", validate(markAsReadSchema), markAsRead);

router.get("/room/:roomId", validate(getRoomMessagesSchema), getRoomMessages);

router.put("/:messageId", validate(editMessageSchema), editMessage);
router.delete("/:messageId", validate(deleteMessageSchema), deleteMessage);
router.post("/:messageId/react", validate(reactToMessageSchema), reactToMessage);

export default router;