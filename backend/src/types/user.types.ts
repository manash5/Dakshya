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
    age: z.number().int().positive().optional(),
    universityId: z.string().optional(),
    courseId: z.string().optional(),
    currentSemester: z.number().int().min(1).max(8).optional(),
    targetRoles: z.array(z.string()).optional(),
    onboardingCompleted: z.boolean().default(false),
})
export type UserType = z.infer<typeof UserSchema>;  