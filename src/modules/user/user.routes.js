import { Router } from "express";
import * as userController from "./user.controller.js";
import { authGuard } from "../../middlewares/auth.middleware.js";

const router = Router();

// user info
router.get("/me", authGuard, userController.getMe);

// public profile
router.get("/:username", userController.getProfile);

// update user profile
router.put("/update", authGuard, userController.updateProfile);

// update bio
router.put("/bio", authGuard, userController.updateBio);

// follow/unfollow
router.post("/follow/:username", authGuard, userController.follow);
router.post("/unfollow/:username", authGuard, userController.unfollow);

export default router;
