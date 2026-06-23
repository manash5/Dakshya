"use server";  // from frontend server
import { LoginFormValues, SignUpFormValues } from "@/app/(auth)/_components/schema";
import { register, login, whoami, profileUpdate } from "@/lib/api/auth";
import { setUserInfoCookie, setTokenCookie } from "../cookies";
import { revalidatePath } from "next/cache";

export async function registerUser(data: SignUpFormValues) {
    try {
        const result = await register(data);
        // how to send data to component
        if (result.success) {
            return {
                success: true, data: result.data,
                message: result.message || 'Registration successful'
            };
        }
        return {
            success: false, message: result.message
                || 'Registration failed'
        };
    } catch (error: any) {
        return { success: false, message: error.message || 'Registration failed' };
    }
}
export async function loginUser(data: LoginFormValues) {
    try {
        const result = await login(data);
        // how to send data to component
        if (result.success) {
            // cookie implementation 
            const user = result.data?.user;
            const token = result.data?.token;
            await setUserInfoCookie(user);
            await setTokenCookie(token);

            return {
                success: true, data: result.data,
                message: result.message || 'Login successful'
            };
        }
        return {
            success: false, message: result.message
                || 'Login failed'
        };
    } catch (error: any) {
        return { success: false, message: error.message || 'Login failed' };
    }
}

export async function getUserData() {
    try {
        const result = await whoami();
        // how to send data to component
        if (result.success) {
            return {
                success: true, data: result.data,
                message: result.message || 'Fetch user info successful'
            };
        }
        return {
            success: false, message: result.message
                || 'Fetch user info failed'
        };
    } catch (error: any) {
        return { success: false, message: error.message || 'Fetch user info failed' };
    }
}


export async function handleUpdateProfile(data: FormData) {
    try {
        const result = await profileUpdate(data);
        if (result.success) {
            revalidatePath("/dashboard/profile");
            return {
                success: true, data: result.data,
                message: result.message || 'Profile update successful'
            };
        }
        return {
            success: false, message: result.message
                || 'Profile update failed'
        };
    } catch (error: any) {
        return { success: false, message: error.message || 'Profile update failed' };
    }
} 