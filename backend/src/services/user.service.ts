import { UserMongoRepository } from "../repository/user.repository";
import {
  CompleteOnboardingDto,
  CreateUserDto,
  LoginUserDto,
  UpdateUserDto,
  UpdateUserAdminDto,
  RegisterWithEmailDto,
} from "../dtos/user.dto";
import { HttpException } from "../exceptions/http-exceptions";
import bcrypt from "bcryptjs";
import { IUser } from "../models/user.model";
// jwt for taken generation
import jwt from "jsonwebtoken";
import { JWT_KEY } from "../config/constant";
import { UpdateQuery } from "mongoose";
import { UserProgressService } from "./userProgress.service";
import {
  generateResetToken,
  generateTempPassword,
} from "../utils/password.util";
import { mailService } from "./mail.service";
import { authService } from "./auth.service";

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
    if (!user.password) {
      throw new HttpException(
        400,
        "This account uses Google Sign-In. Please log in with Google.",
      );
    }
    const isPasswordValid = await bcrypt.compare(
      loginData.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new HttpException(400, "Invalid email or password");
    }

    if (user.role == "user") {
      if (user.onboardingCompleted) {
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
    const wasOnboarded = user.onboardingCompleted;

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

    // UserProgress tracks student career readiness — it has no meaning for
    // admin accounts, and admin CRUD on a user must never depend on it
    // existing. Gate every sync call on the (post-update) role so editing
    // an admin never touches this subsystem at all.
    if (updatedUser.role === "user") {
      if (
        updateData.currentSemester !== undefined &&
        updateData.currentSemester !== previousSemester
      ) {
        await userProgressService.changeCurrentSemester(
          id,
          updateData.currentSemester,
        );
      }

      const newRoles = (updateData.targetRoles ?? []).map((role) =>
        role.toString(),
      );
      const targetRolesChanged =
        !!updateData.targetRoles &&
        (newRoles.length !== previousTargetRoles.length ||
          newRoles.some((role) => !previousTargetRoles.includes(role)));

      // Admins can flip onboardingCompleted directly (bypassing the real
      // onboarding flow, which is what initializeUserProgress normally
      // does) — if that just happened, make sure the progress doc actually
      // gets created instead of leaving the account onboarded-but-broken.
      const justOnboarded =
        updateData.onboardingCompleted === true && !wasOnboarded;

      if (targetRolesChanged || justOnboarded) {
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
    await userProgressService.initializeUserProgress(
      id,
      onboardingData.currentSemester,
    );
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

  async registerWithEmail(data: RegisterWithEmailDto) {
    const existingUserByEmail = await userRepository.findByEmail(data.email);
    if (existingUserByEmail) {
      throw new HttpException(400, "Email already exists");
    }
    const existingUserByUsername = await userRepository.findByUsername(
      data.username,
    );
    if (existingUserByUsername) {
      throw new HttpException(400, "Username already exists");
    }

    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const createdUser = await userRepository.create({
      ...data,
      password: hashedPassword,
      mustChangePassword: true,
    } as any);

    await mailService.sendTempPassword(data.email, tempPassword);
    return createdUser;
  }

  async forgotPassword(email: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) return;

    const token = generateResetToken();
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await userRepository.update(user._id.toString(), {
      resetPasswordToken: token,
      resetPasswordExpires: expires,
    });

    const resetLink = `${process.env.APP_URL}/reset-password?token=${token}`;
    await mailService.sendResetLink(email, resetLink);
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await userRepository.findByResetToken(token);
    if (!user) {
      throw new HttpException(400, "Invalid or expired token");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userRepository.update(user._id.toString(), {
      password: hashedPassword,
      mustChangePassword: false,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    });
  }


  async loginWithGoogle(idToken: string) {
    const googleData = await authService.verifyGoogleToken(idToken);

    let user = await userRepository.findByGoogleId(googleData.googleId);

    if (!user) {
      const existingByEmail = await userRepository.findByEmail(
        googleData.email,
      );

      if (existingByEmail) {
        user = await userRepository.update(existingByEmail._id.toString(), {
          googleId: googleData.googleId,
        });
      } else {
        // 👇 NEW — generate + hash a temp password for brand-new Google users
        const tempPassword = generateTempPassword();
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        const baseUsername = googleData.email.split("@")[0];
        user = await userRepository.create({
          email: googleData.email,
          firstName: googleData.firstName,
          lastName: googleData.lastName,
          username: `${baseUsername}_${Date.now()}`,
          googleId: googleData.googleId,
          password: hashedPassword, // 👈 NEW
          mustChangePassword: true, // 👈 changed from false
        } as any);

        // 👇 NEW — email it to them
        await mailService.sendTempPassword(googleData.email, tempPassword);
      }
    }

    if (!user) {
      throw new HttpException(500, "Failed to create or find user");
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_KEY,
      { expiresIn: "30d" },
    );

    return { user, token, mustChangePassword: user.mustChangePassword };
  }
}
