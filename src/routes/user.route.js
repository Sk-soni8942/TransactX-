import Router from "express";
import {
  getAllUsers,
  loginUser,
  registerUser,
  logoutUSer,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  refreshUserToken,
} from "../controller/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { authorizeRoles } from "../middleware/authorization.middleware.js";

import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(upload.none(), registerUser);
router.route("/login").post(upload.none(), loginUser);
router.route("/logout").post(verifyJWT, logoutUSer);
router.route("/refresh-token").post(verifyJWT, refreshUserToken);
router
  .route("/Users")
  .get(verifyJWT, authorizeRoles("admin", "analyst"), getAllUsers);
router
  .route("/users/role/:userId")
  .patch(verifyJWT, authorizeRoles("admin"), updateUserRole);
router
  .route("/users/status/:userId")
  .patch(verifyJWT, authorizeRoles("admin"), updateUserStatus);
router
  .route("/users/:userId")
  .delete(verifyJWT, authorizeRoles("admin"), deleteUser);

export default router;
