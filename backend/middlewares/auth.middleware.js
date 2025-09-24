import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userModel } from "../models/user.model.js";

export const hashPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({
        status: false,
        message: "Password is required.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    req.body.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
};

export const verifyJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  // Check if cookies exist
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const error = new Error("No token found. Authentication required.");
    error.statusCode = 401;
    return next(error);
  }

  const token = authHeader.split(" ")[1];

  // Check if token exists in cookies
  if (!token) {
    const error = new Error("Access denied. No authentication token provided.");
    error.statusCode = 401;
    return next(error);
  }
  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.id) {
      const error = new Error("Invalid token structure.");
      error.statusCode = 401;
      return next(error);
    }

    const userId = decoded.id;

    // Verify the user still exists in the database
    const user = await userModel.findById(userId);
    if (!user) {
      const error = new Error("User no longer exists.");
      error.statusCode = 401;
      return next(error);
    }

    req.userId = userId;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      error.message = "Session expired. Please log in again.";
      error.statusCode = 401;
    } else if (error.name === "JsonWebTokenError") {
      error.message = "Invalid authentication token.";
      error.statusCode = 401;
    } else if (!error.statusCode) {
      error.message = "Authentication failed.";
      error.statusCode = 401;
    }
    next(error);
  }
};
