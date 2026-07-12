import { z } from "zod";

export const IdParamDto = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
});

export type IdParamDto = z.infer<typeof IdParamDto>;

export const PaginationDto = z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().trim().optional(),
});

export type PaginationDto = z.infer<typeof PaginationDto>;