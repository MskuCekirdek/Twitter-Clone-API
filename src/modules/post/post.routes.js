import { Router } from "express";
import * as postController from "./post.controller.js";
import { authGuard } from "../../middlewares/auth.middleware.js";

const router = Router();

// create post
router.post("/create", authGuard, postController.create);

// get single post
router.get("/:id", postController.getPost);

// delete post
router.delete("/delete/:id", authGuard, postController.deletePost);

// like & unlike
router.post("/like/:id", authGuard, postController.likePost);
router.post("/unlike/:id", authGuard, postController.unlikePost);

// repost & unrepost
router.post("/repost/:id", authGuard, postController.repost);
router.post("/unrepost/:id", authGuard, postController.unrepost);

// feed (following + your posts)
router.get("/feed/me", authGuard, postController.getFeed);

export default router;
