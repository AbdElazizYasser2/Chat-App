import { Router } from "express";
import {
  getProfile,
  getUserById,
  updateAvatar,
  updateProfile,
  updateStatus,
  changePassword,
  searchUsers,
  deleteAccount,
} from '../controllers/User.controller.js';

import validate from '../middlewares/Validation.middleware.js';
import protect from '../middlewares/Auth.middleware.js';
import { uploadSingleImage } from "../middlewares/upload.middleware.js";

import {
  updateProfileSchema,
  updateStatusSchema,
  changePasswordSchema,
  getUserByIdSchema,
  searchUsersSchema,
} from '../validations/user.validation.js';

const router = Router();

router.use(protect);
 
router.get("/profile", getProfile);
router.get("/search", validate(searchUsersSchema), searchUsers);
router.get("/:userId", validate(getUserByIdSchema), getUserById);
 
router.put("/profile", validate(updateProfileSchema), updateProfile);
router.put("/avatar", uploadSingleImage("avatar"), updateAvatar);
router.put("/password", validate(changePasswordSchema), changePassword);
router.put("/status", validate(updateStatusSchema), updateStatus);
 
router.delete("/", deleteAccount);
 
export default router;