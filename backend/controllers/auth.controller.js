import { userModel } from "../models/user.model.js";
import { journalModel } from "../models/journal.model.js";
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

export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { name, email } = req.body;

    if (!userId) {
      const error = new Error("Invalid or missing token.");
      error.statusCode = 401;
      return next(error);
    }

    // Check if email is being changed and if it's already in use
    if (email) {
      const existingUser = await userModel.findOne({ 
        email, 
        _id: { $ne: userId } 
      });

      if (existingUser) {
        const error = new Error("Email already in use by another account.");
        error.statusCode = 409;
        return next(error);
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const updatedUser = await userModel
      .findByIdAndUpdate(userId, updateData, { new: true })
      .select("-password");

    if (!updatedUser) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      status: true,
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      const error = new Error("Invalid or missing token.");
      error.statusCode = 401;
      return next(error);
    }

    if (!currentPassword || !newPassword) {
      const error = new Error("Current password and new password are required.");
      error.statusCode = 400;
      return next(error);
    }

    if (newPassword.length < 6) {
      const error = new Error("New password must be at least 6 characters long.");
      error.statusCode = 400;
      return next(error);
    }

    const user = await userModel.findById(userId);

    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      return next(error);
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      const error = new Error("Current password is incorrect.");
      error.statusCode = 401;
      return next(error);
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      status: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      const error = new Error("Invalid or missing token.");
      error.statusCode = 401;
      return next(error);
    }

    const user = await userModel.findById(userId);

    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      return next(error);
    }

    // Delete user account
    await userModel.findByIdAndDelete(userId);

    res.status(200).json({
      status: true,
      message: "Account deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const getNotificationSettings = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      const error = new Error("Invalid or missing token.");
      error.statusCode = 401;
      return next(error);
    }

    const user = await userModel.findById(userId).select("notificationSettings");

    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      status: true,
      message: "Notification settings fetched successfully.",
      settings: user.notificationSettings || {},
    });
  } catch (error) {
    next(error);
  }
};

export const updateNotificationSettings = async (req, res, next) => {
  try {
    const userId = req.userId;
    const {
      emailNotifications,
      journalReminders,
      weeklyDigest,
      moodReminders,
      achievementAlerts,
      securityAlerts,
    } = req.body;

    if (!userId) {
      const error = new Error("Invalid or missing token.");
      error.statusCode = 401;
      return next(error);
    }

    const notificationSettings = {};
    if (typeof emailNotifications === "boolean")
      notificationSettings.emailNotifications = emailNotifications;
    if (typeof journalReminders === "boolean")
      notificationSettings.journalReminders = journalReminders;
    if (typeof weeklyDigest === "boolean")
      notificationSettings.weeklyDigest = weeklyDigest;
    if (typeof moodReminders === "boolean")
      notificationSettings.moodReminders = moodReminders;
    if (typeof achievementAlerts === "boolean")
      notificationSettings.achievementAlerts = achievementAlerts;
    if (typeof securityAlerts === "boolean")
      notificationSettings.securityAlerts = securityAlerts;

    const updatedUser = await userModel
      .findByIdAndUpdate(
        userId,
        { notificationSettings },
        { new: true }
      )
      .select("notificationSettings");

    if (!updatedUser) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      status: true,
      message: "Notification settings updated successfully.",
      settings: updatedUser.notificationSettings,
    });
  } catch (error) {
    next(error);
  }
};

export const exportUserData = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { format } = req.query;

    if (!userId) {
      const error = new Error("Invalid or missing token.");
      error.statusCode = 401;
      return next(error);
    }

    const user = await userModel.findById(userId).select("-password");

    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      return next(error);
    }

    // Fetch all journal entries for the user
    const journalEntries = await journalModel.find({ user: userId }).sort({ createdAt: -1 });

    if (format === "csv") {
      // Generate CSV for journal entries only
      let csv = "Title,Content,Created Date,Updated Date\n";
      
      journalEntries.forEach(entry => {
        const title = `"${entry.title.replace(/"/g, '""')}"`;
        const content = `"${entry.content.replace(/"/g, '""')}"`;
        const createdAt = new Date(entry.createdAt).toISOString();
        const updatedAt = new Date(entry.updatedAt).toISOString();
        
        csv += `${title},${content},${createdAt},${updatedAt}\n`;
      });

      res.status(200).json({
        status: true,
        message: "Data exported successfully as CSV.",
        data: csv,
      });
    } else {
      // Generate JSON with all data
      const exportData = {
        profile: {
          name: user.name,
          email: user.email,
          accountCreated: user._id.getTimestamp(),
        },
        notificationSettings: user.notificationSettings,
        journalEntries: journalEntries.map(entry => ({
          title: entry.title,
          content: entry.content,
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt,
        })),
        statistics: {
          totalEntries: journalEntries.length,
          oldestEntry: journalEntries.length > 0 
            ? journalEntries[journalEntries.length - 1].createdAt 
            : null,
          latestEntry: journalEntries.length > 0 
            ? journalEntries[0].createdAt 
            : null,
        },
        exportDate: new Date().toISOString(),
      };

      res.status(200).json({
        status: true,
        message: "Data exported successfully as JSON.",
        data: exportData,
      });
    }
  } catch (error) {
    next(error);
  }
};
