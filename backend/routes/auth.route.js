import { Router } from "express";
import {
  fetchUser,
  loginUser,
  signupUser,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const authRouter = Router();

authRouter.post("/signup", signupUser);
authRouter.post("/login", loginUser);
authRouter.get("/me", verifyJWT, fetchUser);

export { authRouter };
