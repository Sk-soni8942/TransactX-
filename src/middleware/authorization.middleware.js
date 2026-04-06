import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { verifyJWT } from "./auth.middleware.js";

const authorizeRoles = (...allowedRoles) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user?.role) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // if (!req.user.isActive) {
    //   throw new ApiError(403, "User inactive");
    // }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, "Access Denied");
    }

    next();
  });

export { authorizeRoles };
