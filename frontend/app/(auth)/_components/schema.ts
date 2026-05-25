import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Enter a valid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;


export const signupSchema = z
    .object({
        fullName: z
            .string()
            .trim()
            .min(2, "Enter your full name"),
        username: z
            .string()
            .trim()
            .min(3, "Enter your username"),
        email: z
            .string()
            .trim()
            .email("Enter a valid email address"),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters"),
        confirmPassword: z
            .string()
            .min(8, "Confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type SignUpFormValues = z.infer<typeof signupSchema>;