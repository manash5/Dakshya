import { Request, Response } from "express";
import { ApiResponseHelper } from "../../utils/api-response";
import {
  CreateUniversityDto,
  UpdateUniversityDto,
} from "../../dtos/university.dto";
import { z } from "zod";
import { UniversityService } from "../../services/university.service";

const universityService = new UniversityService();

interface QueryParams {
    page?: string;
    limit?: string;
    search?: string;
}

export class AdminUniversityController {
  async createUniversity(req: Request, res: Response) {
    try {
      const payload = { ...req.body };
      const universityData = CreateUniversityDto.safeParse(payload);

      if (!universityData.success) {
        return ApiResponseHelper.error(
          res,
          z.prettifyError(universityData.error),
          400,
        );
      }

      const university = await universityService.createUniversity(
        universityData.data,
      );

      return ApiResponseHelper.success(
        res,
        university,
        200,
        "University added succesfully",
      );
    } catch (e: Error | unknown | any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Internal Server Error",
        e.status || 500,
      );
    }
  }

  async updateUniversity(req: Request, res: Response) {
    try {
      const universityId = req.params.universityId as string;

      const payload = { ...req.body };

      const universityData = UpdateUniversityDto.safeParse(payload);

      if (!universityData.success) {
        return ApiResponseHelper.error(
          res,
          z.prettifyError(universityData.error),
          400,
        );
      }

      const updateUniversity = await universityService.updateUniversity(
        universityId,
        universityData.data,
      );

      return ApiResponseHelper.success(
        res,
        updateUniversity,
        200,
        "University updated successfully",
      );
    } catch (e: Error | any | unknown) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to update the university",
        e.status || 500,
      );
    }
  }

  async deleteUniversity(req: Request, res: Response){
    try{
        const universityId = req.params.universityId as string

        const deleted = await universityService.deleteUniversity(universityId); 

        if(!deleted){
            return ApiResponseHelper.error(res, "University not found", 404 )
        }

        return ApiResponseHelper.success(res, null, 200, "University deleted successfully")

    } catch(e: Error | any | unknown){
        return ApiResponseHelper.error(
            res, 
            e?.message || "Failed to delete university", 
            e.status || 500
        )
    }
  }

  async getAllUniversitiesPaginated(req: Request, res: Response){
        try{
            const {page, limit, search}: QueryParams = req.query; 
            const {data, pagination}  = await universityService.getAllUniversitiesPaginated(page, limit, search); 


            return ApiResponseHelper.success(
                res, 
                data, 
                200, 
                "Universities fetched successfully", 
                pagination
            )
        } catch (e: Error | unknown | any){
            return ApiResponseHelper.error(
                res, 
                e?.message || "Failed to load universities", 
                e.status || 500 
            )
        }
    }


    async getUniversitiesById(req: Request, res: Response){
        try{
           const universityId = req.params.universityId; 
           const university = await universityService.getUniversityById(universityId as string); 
           return ApiResponseHelper.success(
            res, 
            university, 
            200,
            "University fetched successfully"
           )

        } catch (e: Error | unknown | any){
            return ApiResponseHelper.error(
                res, 
                e?.message || "Failed to load universities", 
                e.status || 500 
            )
        }
    }
}
