import axios from "axios";

import { HttpException } from "../exceptions/http-exceptions";

import {
    CareerKnowledgeMongoRepository
} from "../repository/careerKnowledge.repository";

import {
    JobRoleMongoRepository
} from "../repository/jobRole.repository";

import {
    CreateCareerKnowledgeDto,
    UpdateCareerKnowledgeDto,
} from "../dtos/careerKnowledge.dto";
import { fastApiClient } from "../clients/fastapi.client";

const careerRepository = new CareerKnowledgeMongoRepository();
const jobRoleRepository = new JobRoleMongoRepository();

export class CareerKnowledgeService {

    private fastApiUrl =
        process.env.FASTAPI_SERVICE_URL ??
        "http://localhost:8000";

    async getCareerKnowledgeByJobRole(jobRoleId: string) {

        const knowledge =
            await careerRepository.findByJobRoleId(jobRoleId);

        if (!knowledge) {
            throw new HttpException(
                404,
                "Career knowledge not found"
            );
        }

        return knowledge;
    }

    async getAllCareerKnowledgePaginated(
        page?: string,
        limit?: string,
        search?: string,
        difficulty?: "Beginner" | "Intermediate" | "Advanced"
    ) {

        const currentPage =
            page && parseInt(page) > 0
                ? parseInt(page)
                : 1;

        const currentLimit =
            limit && parseInt(limit) > 0
                ? parseInt(limit)
                : 10;

        const result =
            await careerRepository.getAllPaginated(
                currentPage,
                currentLimit,
                search,
                difficulty
            );

        return {
            data: result.data,
            pagination: {
                page: currentPage,
                limit: currentLimit,
                totalPages: Math.ceil(
                    result.total / currentLimit
                ),
                total: result.total,
            },
        };
    }

    async generateCareerKnowledge(jobRoleId: string) {

        const existing =
            await careerRepository.findByJobRoleId(jobRoleId);

        if (existing) {
            throw new HttpException(
                400,
                "Career knowledge already exists."
            );
        }

        const jobRole =
            await jobRoleRepository.findById(jobRoleId);

        if (!jobRole) {
            throw new HttpException(
                404,
                "Job role not found"
            );
        }

        const ai = await fastApiClient.generateCareerKnowledge(jobRole.title);


        const payload: CreateCareerKnowledgeDto = {

            jobRoleId,

            careerDescription: ai.careerDescription,

            requiredSkills: ai.requiredSkills,

            tools: ai.tools,

            frameworks: ai.frameworks,

            certifications: ai.certifications,

            roadmap: ai.roadmap,

            projects: ai.projects,

            interviewGuide: ai.interviewGuide,

            learningResources: ai.learningResources,

            salary: ai.salary,

            difficulty: ai.difficulty,

            futureDemand: ai.futureDemand,

            marketTrend: {
                trend: ai.marketTrend?.trend ?? "Stable",
                updatedAt: new Date(),
            },

            estimatedCompletionMonths:
                ai.estimatedCompletionMonths,

        };

        return await careerRepository.create(payload);
    }

    async regenerateCareerKnowledge(jobRoleId: string) {

        const existing =
            await careerRepository.findByJobRoleId(jobRoleId);

        if (!existing) {
            throw new HttpException(
                404,
                "Career knowledge not found"
            );
        }

        const jobRole =
            await jobRoleRepository.findById(jobRoleId);

        if (!jobRole) {
            throw new HttpException(
                404,
                "Job role not found"
            );
        }

        await careerRepository.updateByJobRoleId(
            jobRoleId,
            {
                isUpdating: true,
            } as UpdateCareerKnowledgeDto
        );

        try {

            const ai = await fastApiClient.generateCareerKnowledge(jobRole.title);

            const payload: UpdateCareerKnowledgeDto = {

                careerDescription:
                    ai.careerDescription,

                requiredSkills:
                    ai.requiredSkills,

                tools:
                    ai.tools,

                frameworks:
                    ai.frameworks,

                certifications:
                    ai.certifications,

                roadmap:
                    ai.roadmap,

                projects:
                    ai.projects,

                interviewGuide:
                    ai.interviewGuide,

                learningResources:
                    ai.learningResources,

                salary:
                    ai.salary,

                difficulty:
                    ai.difficulty,

                futureDemand:
                    ai.futureDemand,

                marketTrend: {
                    trend:
                        ai.marketTrend?.trend ??
                        "Stable",

                    updatedAt:
                        new Date(),
                },

                estimatedCompletionMonths:
                    ai.estimatedCompletionMonths,

                isUpdating: false,
            };

            return await careerRepository.updateByJobRoleId(
                jobRoleId,
                payload
            );

        } catch (error: any) {

            await careerRepository.updateByJobRoleId(
                jobRoleId,
                {
                    isUpdating: false,
                } as UpdateCareerKnowledgeDto
            );

            throw new HttpException(
                500,
                error.message
            );
        }
    }

    async deleteCareerKnowledgeByJobRole(jobRoleId: string) {

        const deleted =
            await careerRepository.deleteByJobRoleId(jobRoleId);

        if (!deleted) {
            throw new HttpException(
                404,
                "Career knowledge not found"
            );
        }

        return true;
    }

    async checkAndRefreshOutdatedKnowledge(days: number) {

        const outdated =
            await careerRepository.findOutdatedKnowledge(days);

        for (const knowledge of outdated) {

            await this.regenerateCareerKnowledge(
                knowledge.jobRoleId.toString()
            );

        }
    }
}