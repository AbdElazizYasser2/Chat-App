import { Router } from "express";
import {
  startConversation,
  getMyConversations,
  getConversationMessages,
  hideConversation,
  deleteConversation,
} from "../controllers/conversation.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";

import {
  startConversationSchema,
  getConversationMessagesSchema,
  hideConversationSchema,
  deleteConversationSchema,
} from "../validations/conversation.validation.js";

const router = Router();

router.use(protect);

router.get("/", getMyConversations);
router.post("/:userId", validate(startConversationSchema), startConversation);

router.get("/:conversationId/messages", validate(getConversationMessagesSchema), getConversationMessages);
router.put("/:conversationId/hide", validate(hideConversationSchema), hideConversation);
router.delete("/:conversationId", validate(deleteConversationSchema), deleteConversation);

export default router;