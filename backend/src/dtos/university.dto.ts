import { z } from "zod";
import { UniversitySchema } from "../types/university.types";

export const CreateUniversityDto = UniversitySchema.extend({
    name: z.string().min(3).max(100).trim(),

    shortName: z.string().min(2).max(10).trim(),

    country: z.string().min(2).max(50).trim(),

    website: z.string().url().optional(),

    logo: z.string().optional(),

    isActive: z.boolean().optional(),
});

export type CreateUniversityDto =
    z.infer<typeof CreateUniversityDto>;

export const UpdateUniversityDto =
    CreateUniversityDto.partial();

export type UpdateUniversityDto =
    z.infer<typeof UpdateUniversityDto>;