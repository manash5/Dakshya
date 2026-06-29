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

export const UpdateUserDto = z.object({
    firstName: z.string().optional(),
    lastName: z.string(), 
    phoneNumber: z.string().optional(),      
    profilePicture: z.string().optional(),   
});

export type UpdateUserDto = z.infer<typeof UpdateUserDto>;

export const LoginUserDto = UserSchema.pick({
    email: true, 
    password: true, 
}); 
export type LoginUserDto = z.infer<typeof LoginUserDto> 

export const updateUserDTO = UserSchema.partial();
export type updateUserDTO = z.infer<typeof updateUserDTO>;

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