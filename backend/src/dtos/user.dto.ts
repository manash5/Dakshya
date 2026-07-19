import { UserSchema } from '../types/user.types';
import { z } from 'zod';


export const CreateUserDto = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.email(),
    username: z.string().min(3),
    password: z.string().min(6),
    phoneNumber: z.string().optional(),      
    profilePicture: z.string().optional(),   
});

export type CreateUserDto = z.infer<typeof CreateUserDto>; 


export const LoginUserDto = UserSchema.pick({
    email: true, 
    password: true, 
}); 
export type LoginUserDto = z.infer<typeof LoginUserDto> 


export const UpdateUserDto = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  username: z.string().min(3).optional(),
  password: z.string().min(6).optional(),
  phoneNumber: z.string().optional(),
  profilePicture: z.string().optional(),

  currentSemester: z.coerce.number().int().min(1).max(8).optional(),

  targetRoles: z.preprocess((value) => {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return [value];
      }
    }
    return value;
  }, z.array(z.string())).optional(),
});

export type UpdateUserDto = z.infer<typeof UpdateUserDto>;

export const UpdatePasswordDto = z.object({
    currentPassword: z.string().min(6, "Current password must be at least 6 characters long"),
    newPassword: z.string().min(6, "New password must be at least 6 characters long"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters long")
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirm password must match",
    path: ["confirmPassword"]
});
export type UpdatePasswordDTO = z.infer<typeof UpdatePasswordDto>;


export const CreateUserDtoAdmin = UserSchema.pick({
    firstName: true,
    lastName: true,
    email: true,
    username: true,
    password: true,
    role: true, 
    phoneNumber: true,      
    profilePicture: true,   
});
export type CreateUserDtoAdmin = z.infer<typeof CreateUserDtoAdmin>;

export const CompleteOnboardingDto = z.object({

    age: z.number().int().positive(),

    universityId: z.string(),

    courseId: z.string(),

    currentSemester: z.number().int().min(1).max(8),

    targetRoles: z.array(z.string()).min(1)

});

export type CompleteOnboardingDto =
    z.infer<typeof CompleteOnboardingDto>;


export const UpdateUserAdminDto = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  username: z.string().min(3).optional(),
  password: z.string().min(6).optional(),
  phoneNumber: z.string().optional(),
  profilePicture: z.string().optional(),

  age: z.coerce.number().int().positive().optional(),

  role: z.enum(["admin", "user"]).optional(),

  universityId: z.string().optional(),

  courseId: z.string().optional(),

  currentSemester: z.coerce.number().int().min(1).max(8).optional(),

  targetRoles: z.array(z.string()).optional(),

  onboardingCompleted: z.boolean().optional(),
});

export type UpdateUserAdminDto =
  z.infer<typeof UpdateUserAdminDto>;

  export const RegisterWithEmailDto = z.object({
  email: z.email(),
  firstName: z.string(),
  lastName: z.string(),
  username: z.string().min(3),
});
export type RegisterWithEmailDto = z.infer<typeof RegisterWithEmailDto>;

export const ForgotPasswordDto = z.object({
  email: z.email(),
});
export type ForgotPasswordDto = z.infer<typeof ForgotPasswordDto>;

export const ResetPasswordDto = z
  .object({
    token: z.string(),
    newPassword: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirm password must match",
    path: ["confirmPassword"],
  });
export type ResetPasswordDto = z.infer<typeof ResetPasswordDto>;


export const GoogleLoginDto = z.object({
  idToken: z.string(),
});
export type GoogleLoginDto = z.infer<typeof GoogleLoginDto>;