import { Request, Response } from "express";
import userService from "../services/user.service.js"; // Import the singleton instance
import { UserRegistrationSchema } from "../schemas/user.schema.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { env } from "../config/env.js";

// Extend Request for protected routes
interface AuthRequest extends Request {
  user?: { id: string; isAdmin: boolean };
}

export const register = async (req: Request, res: Response) => {
  try {
    const validatedData = UserRegistrationSchema.parse(req.body);
    
    // Using the class method from the singleton instance
    const user = await userService.createUser(validatedData);

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      env.JWT_SECRET as string,
      { expiresIn: "30d" }
    );

    const { password, ...userWithoutPassword } = user.toObject();
    res.status(201).json({ user: userWithoutPassword, token });
    
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ message: error.errors[0]?.message });
    }
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // 1. Find user using the service instance
    const user = await userService.findUserByEmail(email);

    // 2. Compare passwords
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: jwt.sign(
          { id: user._id, isAdmin: user.isAdmin }, 
          env.JWT_SECRET as string, 
          { expiresIn: "30d" }
        ),
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
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Using the service instance for lookup
    const user = await userService.findUserById(req.user.id);

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export default { register, login, getProfile };