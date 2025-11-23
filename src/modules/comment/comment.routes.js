import { Router } from "express";
import * as commentController from "./comment.controller.js";
import { authGuard } from "../../middlewares/auth.middleware.js";

const router = Router();

// create comment
router.post("/create", authGuard, commentController.create);

// get comment by id
router.get("/:id", commentController.getComment);

// delete comment
router.delete("/delete/:id", authGuard, commentController.deleteComment);

// list comments of a post
router.get("/post/:postId", commentController.getCommentsForPost);

export default router;
