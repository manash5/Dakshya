import { z } from "zod";
import { SubjectSchema } from "../types/subject.types";

export const CreateSubjectDto = SubjectSchema.extend({

    courseId: z.string()
        .regex(/^[0-9a-fA-F]{24}$/),

    semester: z.number()
        .int()
        .min(1)
        .max(12),

    code: z.string()
        .min(2)
        .max(20)
        .trim(),

    name: z.string()
        .min(3)
        .max(100)
        .trim(),

    credits: z.number()
        .int()
        .positive(),

    description: z.string()
        .min(10)
        .max(1000),

    skills: z.array(
        z.string()
            .trim()
            .min(2)
    ).default([]),
});

export type CreateSubjectDto =
    z.infer<typeof CreateSubjectDto>;

export const UpdateSubjectDto =
    CreateSubjectDto.partial();

export type UpdateSubjectDto =
    z.infer<typeof UpdateSubjectDto>;