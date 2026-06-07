import { UserMongoRepository } from "../repository/user.repository";
import { CreateUserDto, LoginUserDto } from "../dtos/user.dto";
import { HttpException } from "../exceptions/http-exceptions";
import bycrypt from "bcryptjs"; // to hash password
import { IUser } from "../models/user.model";
// jwt for taken generation
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../config/constant";

const userRepository = new UserMongoRepository();
export class UserService {
  async createUser(userData: CreateUserDto) {
    // Check if username or email already exists
    const existingUserByUsername = await userRepository.findByUsername(
      userData.username,
    );
    if (existingUserByUsername) {
      throw new HttpException(400, "Username already exists");
    }
    const existingUserByEmail = await userRepository.findByEmail(
      userData.email,
    );
    if (existingUserByEmail) {
      throw new HttpException(400, "Email already exists");
    }
    // Hash the password before saving
    const hashedPassword = await bycrypt.hash(userData.password, 10);
    const userToCreate = {
      ...userData,
      password: hashedPassword,
    };
    const createdUser = await userRepository.create(userToCreate as any);
    return createdUser;
  }

  async loginUser(loginData: LoginUserDto) {
    const user = await userRepository.findByEmail(loginData.email);
    console.log(user);
    if (!user) {
      throw new HttpException(400, "Invalid email or password");
    }
    console.log(user);
    const isPasswordValid = await bycrypt.compare(
      loginData.password,
      user.password,
    ); // compare hashed password
    if (!isPasswordValid) {
      throw new HttpException(400, "Invalid email or password");
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      }, // payload
      SECRET_KEY,
      { expiresIn: "30d" },
    );
    return { user, token };
  }
}
