import { z } from "zod";
import { CourseSchema } from '../types/course.types';


export const CreateCourseDto = CourseSchema.extend({

    universityId: z.string()
        .regex(/^[0-9a-fA-F]{24}$/),

    name: z.string()
        .min(3)
        .max(100)
        .trim(),

    degree: z.enum([
        "Bachelor",
        "Master"
    ]),

    durationInSemesters: z.number()
        .int()
        .min(1)
        .max(12),

    description: z.string()
        .min(10)
        .max(1000),

    isActive: z.boolean().optional(),
});

export type CreateCourseDto =
    z.infer<typeof CreateCourseDto>;

export const UpdateCourseDto =
    CreateCourseDto.partial();

export type UpdateCourseDto =
    z.infer<typeof UpdateCourseDto>;