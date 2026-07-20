"use server";
import { LoginFormValues, SignUpFormValues } from "@/app/(auth)/_components/schema";
import { register, login, whoami, profileUpdate, changePassword, forgotPassword, resetPassword } from "@/lib/api/auth";
import { setUserInfoCookie, setTokenCookie } from "../cookies";
import { revalidatePath } from "next/cache";
import { googleLogin } from "@/lib/api/auth";

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
            // Keep the cookie AuthContext reads (see checkAuth in
            // AuthContext.tsx) in sync with what just got saved, so header
            // avatars/names reflect the change without needing a fresh login.
            if (result.data) {
                await setUserInfoCookie(result.data);
            }
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

export async function changePasswordAction(data: { currentPassword: string; newPassword: string }) {
    try {
        const result = await changePassword(data);
        if (result.success) {
            return {
                success: true, data: result.data,
                message: result.message || 'Password changed successfully'
            };
        }
        return {
            success: false, message: result.message
                || 'Password change failed'
        };
    } catch (error: any) {
        return { success: false, message: error.message || 'Password change failed' };
    }
}



export async function googleLoginAction(idToken: string) {
    try {
        const result = await googleLogin(idToken);
        if (result.success) {
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
                || 'Google login failed'
        };
    } catch (error: any) {
        return { success: false, message: error.message || 'Google login failed' };
    }
}


export async function forgotPasswordAction(data: { email: string }) {
    try {
        const result = await forgotPassword(data);
        if (result.success) {
            return {
                success: true, data: result.data,
                message: result.message || 'Reset link sent'
            };
        }
        return {
            success: false, message: result.message
                || 'Failed to send reset link'
        };
    } catch (error: any) {
        return { success: false, message: error.message || 'Failed to send reset link' };
    }
}

export async function resetPasswordAction(data: { token: string; newPassword: string; confirmPassword: string }) {
    try {
        const result = await resetPassword(data);
        if (result.success) {
            return {
                success: true, data: result.data,
                message: result.message || 'Password reset successful'
            };
        }
        return {
            success: false, message: result.message
                || 'Failed to reset password'
        };
    } catch (error: any) {
        return { success: false, message: error.message || 'Failed to reset password' };
    }
}