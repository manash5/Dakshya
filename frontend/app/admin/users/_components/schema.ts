import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const base = {
    firstName: z.string("Must be a valid string").min(2, { message: "Minimum 2 characters" }),
    lastName: z.string("Must be a valid string").min(2, { message: "Minimum 2 characters" }),
    email: z.email({ message: "Invalid email address" }),
    username: z.string("Must be a valid string").min(3, { message: "Minimum 3 characters" }),
    role: z.enum(["user", "admin"]),
};

const imageField = z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, { message: "Max file size is 5MB" })
    .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), {
        message: "Only .jpg, .jpeg, .png and .webp formats are supported",
    });

// create posts JSON (no image — matches CreateUserDTO), requires a password
export const createUserSchema = z.object({
    ...base,
    password: z.string("Must be a valid string").min(6, { message: "Minimum 6 characters" }),
    image: imageField,
});
export type CreateUserFormData = z.infer<typeof createUserSchema>;

// edit mirrors update-profile: multipart with optional image, no password
export const editUserSchema = z.object({
    ...base,
    image: z
        .instanceof(File)
        .optional()
        .refine((file) => !file || file.size <= MAX_FILE_SIZE, { message: "Max file size is 5MB" })
        .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), {
            message: "Only .jpg, .jpeg, .png and .webp formats are supported",
        }),
});
export type EditUserFormData = z.infer<typeof editUserSchema>;