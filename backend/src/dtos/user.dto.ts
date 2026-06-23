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
    lastName: z.string, 
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