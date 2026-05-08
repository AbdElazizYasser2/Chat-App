import { Router } from "express";
import {
  createRoom,
  getPublicRooms,
  getMyRooms,
  searchRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  joinRoom,
  leaveRoom,
  changeMemberRole,
  removeMember,
} from "../controllers/room.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";

import {
  createRoomSchema,
  updateRoomSchema,
  joinRoomSchema,
  leaveRoomSchema,
  changeMemberRoleSchema,
  removeMemberSchema,
  searchRoomsSchema,
} from "../validations/room.validation.js";

const router = Router();

router.use(protect);

router.get("/", getPublicRooms);
router.get("/my", getMyRooms);
router.get("/search", validate(searchRoomsSchema), searchRooms);
router.get("/:roomId", validate(joinRoomSchema), getRoomById);

router.post("/", validate(createRoomSchema), createRoom);
router.post("/:roomId/join", validate(joinRoomSchema), joinRoom);
router.post("/:roomId/leave", validate(leaveRoomSchema), leaveRoom);

router.put("/:roomId", validate(updateRoomSchema), updateRoom);

router.put("/:roomId/members/:userId/role", validate(changeMemberRoleSchema), changeMemberRole);

router.delete("/:roomId", deleteRoom);
router.delete("/:roomId/members/:userId", validate(removeMemberSchema), removeMember);

export default router;