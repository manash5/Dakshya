import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User, { IUser } from "../../src/models/user.model";
import { JWT_KEY } from "../../src/config/constant";

let counter = 0;

interface CreateTestUserOptions {
  role?: "user" | "admin";
  onboardingCompleted?: boolean;
  password?: string;
}

// Creates a real user document (via bcrypt, same as the real registration
// path) and a matching JWT signed exactly like userService.loginUser does,
// so route tests can authenticate with `Authorization: Bearer ${token}`
// without going through the actual /auth/login endpoint every time.
export async function createTestUser(
  options: CreateTestUserOptions = {},
): Promise<{ user: IUser; token: string; rawPassword: string }> {
  counter += 1;
  const rawPassword = options.password ?? "Password123!";
  const hashed = await bcrypt.hash(rawPassword, 10);

  const user = await User.create({
    firstName: "Test",
    lastName: `User${counter}`,
    email: `test.user${counter}@example.com`,
    username: `testuser${counter}`,
    password: hashed,
    role: options.role ?? "user",
    onboardingCompleted: options.onboardingCompleted ?? false,
  });

  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_KEY,
    { expiresIn: "30d" },
  );

  return { user, token, rawPassword };
}

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}
