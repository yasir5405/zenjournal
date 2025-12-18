import mongoose from "mongoose";

const Schema = mongoose.Schema;
const ObjectID = Schema.ObjectId;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  notificationSettings: {
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    journalReminders: {
      type: Boolean,
      default: true,
    },
    weeklyDigest: {
      type: Boolean,
      default: false,
    },
    moodReminders: {
      type: Boolean,
      default: true,
    },
    achievementAlerts: {
      type: Boolean,
      default: true,
    },
    securityAlerts: {
      type: Boolean,
      default: true,
    },
  },
});

const userModel = mongoose.model("users", userSchema);

export { userModel };
