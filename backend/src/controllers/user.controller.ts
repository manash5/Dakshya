import { UserService } from "../services/user.service";
import { HttpException } from "../exceptions/http-exceptions";
import { z } from "zod";
import { CreateUserDto, LoginUserDto, UpdatePasswordDto, updateUserDTO } from "../dtos/user.dto";
import { ApiResponseHelper } from "../utils/api-response";
import { Request, Response } from "express";
import { baseUrl } from "../config/constant";

const userService = new UserService();

export class UserController {
  async createUser(req: Request, res: Response) {
    try {
      const parseResult = CreateUserDto.safeParse(req.body);
      if (!parseResult.success) {
        throw new HttpException(400, z.prettifyError(parseResult.error));
      }
      const createdUser = await userService.createUser(parseResult.data);
      return ApiResponseHelper.success(res, createdUser, 201, "User created");
    } catch (e: Error | unknown | any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to create user",
        e.status || 500,
      );
    }
  }

  async loginUser(req: Request, res: Response) {
    try {
      const parseResult = LoginUserDto.safeParse(req.body);
      if (!parseResult.success) {
        throw new HttpException(400, z.prettifyError(parseResult.error));
      }
      const { user, token } = await userService.loginUser(parseResult.data);
      return ApiResponseHelper.success(
        res,
        { user, token },
        200,
        "Login successful",
      );
    } catch (e: Error | unknown | any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to login user",
        e.status || 500,
      );
    }
  }

  async updateUser(req: Request, res: Response) {
        try{
            const userId = req.user?._id;
            const filename = req.file?.filename;
            const parseResult = updateUserDTO.safeParse(req.body);
            if(!parseResult.success){
                throw new HttpException(
                    400, 
                    z.prettifyError(parseResult.error)
                );
            }
            const updateData = {
              ...parseResult.data,
              ...(filename && { profilePicture: `${baseUrl}/uploads/${filename}` })
            }
            const updatedUser = await userService.updateUser(userId, updateData);
            return ApiResponseHelper.success(res, updatedUser,  200, "User updated");
        }catch(e: Error | unknown | any){
            return ApiResponseHelper.error(
                res, 
                e?.message || "Failed to update user", 
                e.status || 500
            );
        }
    }


    async getUser(req: Request, res: Response) {
        try{
            const user = req.user;
            if(!user){
                throw new HttpException(401, "Unauthorized");
            }
            return ApiResponseHelper.success(res, user,  200, "User info retrieved");
        }catch(e: Error | unknown | any){
            return ApiResponseHelper.error(
                res, 
                e?.message || "Failed to get user info", 
                e.status || 500
            );
        }
    }

    async whoami(req: Request, res: Response) {
        try{
            const user = req.user;
            if(!user){
                throw new HttpException(401, "Unauthorized");
            }
            return ApiResponseHelper.success(res, user, 200, "User info retrieved");
        }catch(e: Error | unknown | any){
            return ApiResponseHelper.error(
                res, 
                e?.message || "Failed to get user info", 
                e.status || 500
            );
        }
    }


    async changePassword(req: Request, res: Response) {
      try {
        const userId = req.user?._id;  
        
        const userData = UpdatePasswordDto.safeParse(req.body);
        if (!userData.success) {
          return ApiResponseHelper.error(res, z.prettifyError(userData.error), 400);
        }
        
        const { currentPassword, newPassword } = req.body;

        await userService.changePassword(userId, currentPassword, newPassword);

        return ApiResponseHelper.success(res, null, 200, "Password updated successfully");
      } catch (e: Error | unknown | any) {
          return ApiResponseHelper.error(
              res,
              e?.message || "Failed to change password",
              e.status || 500
          );
      }
    }


    
}
