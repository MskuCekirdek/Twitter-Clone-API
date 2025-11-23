import * as userService from "./user.service.js";
import { success, error, notFound } from "../../utils/response.js";

export const getMe = async (req, res) => {
  try {
    const user = await userService.getMe(req.user.id);

    return success(res, "User loaded", user);
  } catch (err) {
    console.error("Error fetching user:", err);
    return error(res, err.message);
  }
};

export const getProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await userService.getProfile(username);

    if (!user) return notFound(res, "User not found");

    return success(res, "Profile loaded", user);
  } catch (err) {
    console.error("Error fetching profile:", err);
    return error(res, err.message);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updated = await userService.updateProfile(req.user.id, req.body);

    return success(res, "Profile updated", updated);
  } catch (err) {
    return error(res, err.message);
  }
};

export const updateBio = async (req, res) => {
  try {
    const bio = await userService.updateBio(req.user.id, req.body);

    return success(res, "Bio updated", bio);
  } catch (err) {
    return error(res, err.message);
  }
};

export const follow = async (req, res) => {
  try {
    const { username } = req.params;
    const result = await userService.follow(req.user.id, username);

    return success(res, "User followed", result);
  } catch (err) {
    return error(res, err.message);
  }
};

export const unfollow = async (req, res) => {
  try {
    const { username } = req.params;
    const result = await userService.unfollow(req.user.id, username);

    return success(res, "User unfollowed", result);
  } catch (err) {
    return error(res, err.message);
  }
};
