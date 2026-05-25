import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Enter a valid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
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
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
        confirmPassword: z
            .string()
            .min(8, "Confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type SignUpFormValues = z.infer<typeof signupSchema>;


export const forgotPasswordSchema = z.object({
    email: z
    .string()
    .trim()
    .email("Enter a valid email address")
})

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
    .object({
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
        confirmPassword: z
            .string()
            .min(8, "Confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

