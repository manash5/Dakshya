import {z} from 'zod'; 

export const UserSchema = z.object({
    firstName: z.string(), 
    lastName: z.string(), 
    email: z.email(), 
    username: z.string().min(3), 
    password: z.string().min(6), 
    role: z.enum(['admin', 'user']).default("user"),
    phoneNumber: z.string().optional(),        
    profilePicture: z.string().optional(),    
})
export type UserType = z.infer<typeof UserSchema>;  