import { UserMongoRepository } from "../repository/user.repository";
import {
  CompleteOnboardingDto,
  CreateUserDto,
  LoginUserDto,
  UpdateUserDto,
  UpdateUserAdminDto,
} from "../dtos/user.dto";
import { HttpException } from "../exceptions/http-exceptions";
import bcrypt from "bcryptjs";
import { IUser } from "../models/user.model";
// jwt for taken generation
import jwt from "jsonwebtoken";
import { JWT_KEY } from "../config/constant";
import { UpdateQuery } from "mongoose";
import { UserProgressService } from "./userProgress.service";

const userRepository = new UserMongoRepository();
const userProgressService = new UserProgressService();
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

    if(user.role == 'user'){
      if (user.onboardingCompleted){

        await userProgressService.checkForKnowledgeUpdates(user._id.toString());
      }
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

  async updateUser(id: string, updateData: UpdateUserDto): Promise<IUser> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new HttpException(404, "user not found");
    }

    const previousSemester = user.currentSemester;
    const previousTargetRoles = user.targetRoles.map((role) => role.toString());

    if (updateData.email && updateData.email !== user.email) {
      const existingUserByEmail = await userRepository.findByEmail(
        updateData.email,
      );
      if (existingUserByEmail) {
        throw new HttpException(400, "Email already exists");
      }
    }
    if (updateData.username && updateData.username !== user.username) {
      const existingUserByUsername = await userRepository.findByUsername(
        updateData.username,
      );
      if (existingUserByUsername) {
        throw new HttpException(400, "Username already exists");
      }
    }
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    const updatedUser = await userRepository.update(id, updateData);
    if (!updatedUser) {
      throw new HttpException(404, "user not found");
    }

    if (
      updateData.currentSemester !== undefined &&
      updateData.currentSemester !== previousSemester
    ) {
      await userProgressService.changeCurrentSemester(
        id,
        updateData.currentSemester,
      );
      await userProgressService.refreshAcademicProgress(id);
    }

    if (updateData.targetRoles) {
      const newRoles = updateData.targetRoles.map((role) => role.toString());

      const changed =
        newRoles.length !== previousTargetRoles.length ||
        newRoles.some((role) => !previousTargetRoles.includes(role));

      if (changed) {
        await userProgressService.syncTargetRoles(id);
        await userProgressService.refreshAcademicProgress(id);
      }
    }

    return updatedUser;
  }

  async updateUserByAdmin(
    id: string,
    updateData: UpdateUserAdminDto,
  ): Promise<IUser> {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new HttpException(404, "User not found");
    }

    const previousSemester = user.currentSemester;
    const previousTargetRoles = user.targetRoles.map((role) => role.toString());
    const previousUniversity = user.universityId?.toString();
    const previousCourse = user.courseId?.toString();

    if (updateData.email && updateData.email !== user.email) {
      const existingUserByEmail = await userRepository.findByEmail(
        updateData.email,
      );

      if (existingUserByEmail) {
        throw new HttpException(400, "Email already exists");
      }
    }

    if (updateData.username && updateData.username !== user.username) {
      const existingUserByUsername = await userRepository.findByUsername(
        updateData.username,
      );

      if (existingUserByUsername) {
        throw new HttpException(400, "Username already exists");
      }
    }

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedUser = await userRepository.update(id, updateData);

    if (!updatedUser) {
      throw new HttpException(404, "User not found");
    }

    if (
      updateData.currentSemester !== undefined &&
      updateData.currentSemester !== previousSemester
    ) {
      await userProgressService.changeCurrentSemester(
        id,
        updateData.currentSemester,
      );
    }
    console.log(id)

    if (updateData.targetRoles) {
      const newRoles = updateData.targetRoles.map((role) => role.toString());

      const changed =
        newRoles.length !== previousTargetRoles.length ||
        newRoles.some((role) => !previousTargetRoles.includes(role));

      if (changed) {
        await userProgressService.syncTargetRoles(id);
      }
    }

    // const academicChanged =
    //   (updateData.universityId &&
    //     updateData.universityId !== previousUniversity) ||
    //   (updateData.courseId && updateData.courseId !== previousCourse);

    // if (academicChanged) {
    //   await userProgressService.refreshAcademicProgress(id);
    // }

    return updatedUser;
  }

  async completeOnboarding(
    id: string,
    onboardingData: CompleteOnboardingDto,
  ): Promise<IUser> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new HttpException(404, "user not found");
    }
    if (user.onboardingCompleted) {
      throw new HttpException(400, "Onboarding already completed");
    }
    const updatedUser = await userRepository.update(id, {
      ...onboardingData,
      onboardingCompleted: true,
    });
    if (!updatedUser) {
      throw new HttpException(404, "user not found");
    }
    await userProgressService.initializeUserProgress(id);
    await userProgressService.syncTargetRoles(id);

    await userProgressService.refreshAcademicProgress(id);
    return updatedUser;
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
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

  async getAllUserPaginated(page?: string, limit?: string, search?: string) {
    const currentPage = page && parseInt(page) > 0 ? parseInt(page) : 1;
    const currentLimit = limit && parseInt(limit) > 0 ? parseInt(limit) : 10;
    const currentSearch = search && search.trim() !== "" ? search : undefined;

    const { data, total } = await userRepository.getAllPaginated(
      currentPage,
      currentLimit,
      currentSearch,
    );
    const totalPages = Math.ceil(total / currentLimit);
    const pagination = {
      page: currentPage,
      limit: currentLimit,
      totalPages: totalPages,
      total: total,
    };
    return { data, pagination };
  }

  async deleteUser(id: string): Promise<boolean> {
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw new HttpException(404, "User not found");
    }
    const deleted = await userRepository.delete(id);
    if (!deleted) {
      throw new HttpException(500, "Failed to delete user");
    }
    return deleted;
  }

  async getUserById(id: string): Promise<IUser | null> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new HttpException(404, "User not found");
    }
    return user;
  }

  async checkPassword(
    userId: string,
    currentPassword: string,
  ): Promise<boolean> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new HttpException(404, "User not found");
    }
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new HttpException(400, "Current password is incorrect");
    }
    return isPasswordValid;
  }
}
