import { Router } from "express";
import {
  fetchUser,
  loginUser,
  signupUser,
  updateProfile,
  changePassword,
  deleteAccount,
  getNotificationSettings,
  updateNotificationSettings,
  exportUserData,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const authRouter = Router();

authRouter.post("/signup", signupUser);
authRouter.post("/login", loginUser);
authRouter.get("/me", verifyJWT, fetchUser);
authRouter.put("/profile", verifyJWT, updateProfile);
authRouter.put("/change-password", verifyJWT, changePassword);
authRouter.delete("/account", verifyJWT, deleteAccount);
authRouter.get("/notification-settings", verifyJWT, getNotificationSettings);
authRouter.put("/notification-settings", verifyJWT, updateNotificationSettings);
authRouter.get("/export-data", verifyJWT, exportUserData);

export { authRouter };
