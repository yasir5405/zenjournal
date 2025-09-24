import { userModel } from "../models/user.model.js";
import { loginSchema, signupSchema } from "../utils/validation.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signupUser = async (req, res, next) => {
  try {
    const parsedBody = signupSchema.safeParse(req.body);

    if (!parsedBody.success) {
      const error = new Error(parsedBody.error.issues[0].message);
      error.statusCode = 400;
      return next(error);
    }

    const { name, email, password } = parsedBody.data;

    const duplicateEmail = await userModel.findOne({
      email: email,
    });

    if (duplicateEmail) {
      const error = new Error("Email already registered.");
      error.statusCode = 409;
      return next(error);
    }

    // 3. HASH PASSWORD AFTER VALIDATION
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });

    const { password: _, ...safeUser } = user._doc;

    res.status(201).json({
      status: true,
      message: "User Signup successfull!",
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const parsedBody = loginSchema.safeParse(req.body);

    if (!parsedBody.success) {
      const error = new Error(parsedBody.error.issues[0].message);
      error.statusCode = 400;
      return next(error);
    }

    const { email, password } = parsedBody.data;

    const user = await userModel.findOne({
      email,
    });

    if (!user) {
      const error = new Error("Invalid credentials.");
      error.statusCode = 401;
      return next(error);
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      const error = new Error("Invalid credentials.");
      error.statusCode = 401;
      return next(error);
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET
    );

    const { password: _, ...safeUser } = user._doc;

    res.status(200).json({
      status: true,
      message: "User login successfull!",
      token,
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

export const fetchUser = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      const error = new Error("Invalid or missing token.");
      error.statusCode = 401;
      return next(error);
    }

    const user = await userModel.findById(userId).select("-password");

    if (!user) {
      const error = new Error("Invalid or missing token.");
      error.statusCode = 401;
      return next(error);
    }

    res.status(200).json({
      status: true,
      message: "User data fetched successfully. ",
      user: user,
    });
  } catch (error) {
    next(error);
  }
};
