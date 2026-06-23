import { UserMongoRepository } from "../repository/user.repository";
import { CreateUserDto, LoginUserDto, updateUserDTO } from "../dtos/user.dto";
import { HttpException } from "../exceptions/http-exceptions";
import bcrypt from 'bcryptjs'
import { IUser } from "../models/user.model";
// jwt for taken generation
import jwt from "jsonwebtoken";
import { JWT_KEY } from "../config/constant";

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
    const hashedPassword = await bcrypt.hash(userData.password, 10);
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
    const isPasswordValid = await bcrypt.compare(
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
      JWT_KEY,
      { expiresIn: "30d" },
    );
    return { user, token };
  }

  async updateUser(id: string, updateData: updateUserDTO) {
        const user = await userRepository.findById(id);
        if (!user) {
            throw new HttpException(404, "user not found");
        }
        if(updateData.email && updateData.email !== user.email) {
            const existingUserByEmail = await userRepository.findByEmail(updateData.email);
            if (existingUserByEmail) {
                throw new HttpException(400, "Email already exists");
            }
        }
        if(updateData.username && updateData.username !== user.username) {
            const existingUserByUsername = await userRepository.findByUsername(updateData.username);
            if (existingUserByUsername) {
                throw new HttpException(400, "Username already exists");
            }
        }
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }
        const updatedUser = await userRepository.update(id, updateData);
        return updatedUser;
    }


    async changePassword(userId: string, currentPassword: string, newPassword: string) {
      const user = await userRepository.findById(userId);
      if (!user) {
          throw new HttpException(404, "User not found");
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
          throw new HttpException(400, "Current password is incorrect");
      }

      await this.updateUser(userId, { password: newPassword });
    }
}
