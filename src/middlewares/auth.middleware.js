import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import { unauthorized, notFound, error } from "../utils/response.js";

export const authGuard = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    // Token yoksa → 401
    if (!header) {
      return unauthorized(res, "Authorization header missing");
    }

    const token = header.split(" ")[1];

    if (!token) {
      return unauthorized(res, "Token not provided");
    }

    // Token verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, username: true },
    });

    if (!user) {
      return notFound(res, "User not found");
    }

    req.user = user;
    next();
  } catch (err) {
    return unauthorized(res, "Invalid or expired token");
  }
};
