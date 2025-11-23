import { notFound } from "../utils/response.js";

export const notFoundMiddleware = (req, res) => {
  return notFound(res, `Route not found: ${req.originalUrl}`);
};
