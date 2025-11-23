import * as postService from "./post.service.js";
import { success, error, notFound } from "../../utils/response.js";

export const create = async (req, res) => {
  try {
    const result = await postService.create(req.user.id, req.body);
    return success(res, "Post created", result, 201);
  } catch (err) {
    return error(res, err.message);
  }
};

export const getPost = async (req, res) => {
  try {
    const post = await postService.getPost(req.params.id);

    if (!post) return notFound(res, "Post not found");

    return success(res, "Post loaded", post);
  } catch (err) {
    return error(res, err.message);
  }
};

export const deletePost = async (req, res) => {
  try {
    await postService.deletePost(req.user.id, req.params.id);
    return success(res, "Post deleted");
  } catch (err) {
    return error(res, err.message);
  }
};

export const likePost = async (req, res) => {
  try {
    const result = await postService.likePost(req.user.id, req.params.id);
    return success(res, "Post liked", result);
  } catch (err) {
    return error(res, err.message);
  }
};

export const unlikePost = async (req, res) => {
  try {
    await postService.unlikePost(req.user.id, req.params.id);
    return success(res, "Post unliked");
  } catch (err) {
    return error(res, err.message);
  }
};

export const repost = async (req, res) => {
  try {
    const result = await postService.repost(req.user.id, req.params.id);
    return success(res, "Post reposted", result);
  } catch (err) {
    return error(res, err.message);
  }
};

export const unrepost = async (req, res) => {
  try {
    await postService.unrepost(req.user.id, req.params.id);
    return success(res, "Repost removed");
  } catch (err) {
    return error(res, err.message);
  }
};

export const getFeed = async (req, res) => {
  try {
    const posts = await postService.getFeed(req.user.id);
    return success(res, "Feed loaded", posts);
  } catch (err) {
    return error(res, err.message);
  }
};
