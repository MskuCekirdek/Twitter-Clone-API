import { serverError } from "../utils/response.js";

export const errorHandler = (err, req, res, next) => {
  console.error("Global Error:", err);

  return serverError(res, "An unexpected error occurred");
};
