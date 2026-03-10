import User from "../models/User.js";
import bcrypt from "bcrypt";
import { UserRegistration } from "../schemas/user.schema.js";

export const createUser = async (userData: UserRegistration) => {
  // 1. Check if user already exists
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) throw new Error("User already exists");

  // 2. Hash the password (Don't store plain text!)
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt);

  // 3. Save to DB
  const user = new User({
    ...userData,
    password: hashedPassword,
  });

  return await user.save();
};

export const findUserByEmail = async (email: string) => {
  return await User.findOne({ email });
};