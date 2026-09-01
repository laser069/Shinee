import { Request, Response } from "express";
import userService from "../services/user.service"; // Import the singleton instance
import { UserRegistrationSchema } from "../schemas/user.schema";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { ZodError } from "zod";
import { env } from "../config/env";

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
    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully',
      data: { user: userWithoutPassword, token } 
    });
    
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: error.issues[0]?.message ?? "Request validation failed",
        errors: error.issues
      });
    }
    res.status(400).json({ success: false, message: error.message });
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
        success: true,
        message: 'Login successful',
        data: {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
          },
          token: jwt.sign(
            { id: user._id, isAdmin: user.isAdmin }, 
            env.JWT_SECRET as string, 
            { expiresIn: "30d" }
          ),
        }
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid email or password" });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
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
      res.json({ 
        success: true, 
        data: user 
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export default { register, login, getProfile };