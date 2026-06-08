import { UserService } from "../services/user.service";
import { HttpException } from "../exceptions/http-exceptions";
import { z } from "zod";
import { CreateUserDto, LoginUserDto } from "../dtos/user.dto";
import { ApiResponseHelper } from "../utils/api-response";
import { Request, Response } from "express";

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
}
