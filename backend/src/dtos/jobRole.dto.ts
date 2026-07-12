import { z } from "zod";
import { JobRoleSchema } from "../types/jobRole.types";

export const CreateJobRoleDto = JobRoleSchema.extend({

    title: z.string()
        .min(3)
        .max(100)
        .trim(),

    category: z.string()
        .min(3)
        .max(50)
        .trim(),

    description: z.string()
        .min(10)
        .max(1000),

    icon: z.string().optional(),

    isActive: z.boolean().optional(),
});

export type CreateJobRoleDto =
    z.infer<typeof CreateJobRoleDto>;

export const UpdateJobRoleDto =
    CreateJobRoleDto.partial();

export type UpdateJobRoleDto =
    z.infer<typeof UpdateJobRoleDto>;