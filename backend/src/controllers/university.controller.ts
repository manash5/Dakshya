import { request } from "http";
import { UniversityService } from "../services/university.service";
import { ApiResponseHelper } from "../utils/api-response";
import { Request, Response } from "express";


const universityService = new UniversityService(); 


export class UniversityControllers {
    async getUniversities(req: Request, res: Response){
        try{
            const universities = await universityService.getAllUniversities(); 

            return ApiResponseHelper.success(
                res, 
                universities, 
                200, 
                "Universities fetched successfully"
            )
        } catch (e: Error | unknown | any){
            return ApiResponseHelper.error(
                res, 
                e?.message || "Failed to load universities", 
                e.status || 500 
            )
        }
    }


    async getUniversityById(req: Request, res: Response){
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