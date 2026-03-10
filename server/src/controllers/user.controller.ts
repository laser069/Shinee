import { Request, Response } from "express";
import * as UserService from "../services/user.service.js";
import { UserRegistrationSchema } from "../schemas/user.schema.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js"; // Import your model for the profile lookup
import { env } from "../config/env";
// Extend Request to include the user property from your middleware
interface AuthRequest extends Request {
  user?: { id: string; isAdmin: boolean };
}

export const register = async (req: Request, res: Response) => {
  try {
    const validatedData = UserRegistrationSchema.parse(req.body);
    const user = await UserService.createUser(validatedData);

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      env.JWT_SECRET!,
      { expiresIn: "30d" }
    );

    const { password, ...userWithoutPassword } = user.toObject();
    res.status(201).json({ user: userWithoutPassword, token });
    
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(400).json({ message: error.message });
  }
};


export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // 1. Find user
    const user = await UserService.findUserByEmail(email);

    // 2. Compare passwords (C++ devs love this part—it's high-perf math!)
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: jwt.sign({ id: user._id }, env.JWT_SECRET!, { expiresIn: "30d" }),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    // 1. req.user was populated by the 'protect' middleware
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // 2. Find user in DB by ID (excluding the password)
    const user = await User.findById(req.user.id).select("-password");

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Use ES Export instead of module.exports
export default { register, getProfile };