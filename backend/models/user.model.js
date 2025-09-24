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
});

const userModel = mongoose.model("users", userSchema);

export { userModel };
