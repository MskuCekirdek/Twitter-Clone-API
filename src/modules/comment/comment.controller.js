import * as commentService from "./comment.service.js";
import { success, error, notFound } from "../../utils/response.js";

export const create = async (req, res) => {
  try {
    const result = await commentService.create(req.user.id, req.body);
    return success(res, "Comment created", result, 201);
  } catch (err) {
    return error(res, err.message);
  }
};

export const getComment = async (req, res) => {
  try {
    const comment = await commentService.getComment(req.params.id);

    if (!comment) return notFound(res, "Comment not found");

    return success(res, "Comment loaded", comment);
  } catch (err) {
    return error(res, err.message);
  }
};

export const deleteComment = async (req, res) => {
  try {
    await commentService.deleteComment(req.user.id, req.params.id);
    return success(res, "Comment deleted");
  } catch (err) {
    return error(res, err.message);
  }
};

export const getCommentsForPost = async (req, res) => {
  try {
    const comments = await commentService.getCommentsForPost(req.params.postId);
    return success(res, "Comments loaded", comments);
  } catch (err) {
    return error(res, err.message);
  }
};
