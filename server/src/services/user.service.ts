import User from "../models/User";
import bcrypt from "bcrypt";
import { UserRegistration } from "../schemas/user.schema";

class UserService {
  /**
   * Registers a new user after checking for duplicates and hashing password
   */
  async createUser(userData: UserRegistration) {
    // 1. Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error("User already exists");
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // 3. Save to DB
    const user = new User({
      ...userData,
      password: hashedPassword,
    });

    return await user.save();
  }

  /**
   * Finds a user by email for login/auth purposes
   */
  async findUserByEmail(email: string) {
    return await User.findOne({ email });
  }

  /**
   * Finds a user by ID (useful for profile lookups)
   */
  async findUserById(id: string) {
    return await User.findById(id).select("-password");
  }
}

// Export a singleton instance
export default new UserService();