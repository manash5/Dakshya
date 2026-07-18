"use server";

import axios from "axios";
import { getTokenCookie, getUserInfoCookie, setUserInfoCookie } from "@/lib/cookies";
import {
    fetchUniversities,
    fetchCoursesByUniversity,
    fetchJobRoles,
} from "@/lib/api/onboarding";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8088";

export interface OnboardingPayload {
    age: number;
    universityId: string;
    courseId: string;
    currentSemester: number;
    targetRoles: string[];
}

export async function submitOnboarding(
    payload: OnboardingPayload
): Promise<
    | { success: true; user: any }
    | { success: false; message: string }
> {
    try {
        const token = await getTokenCookie();
        if (!token) {
            return { success: false, message: "Session expired. Please log in again." };
        }

        const res = await axios.post(
            `${BASE_URL}/api/v1/auth/onboarding`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        ) 

        const updatedUser = res.data?.data ?? res.data?.user ?? res.data;

        // Refresh the user_data cookie so client state reflects onboardingCompleted: true
        // without requiring a fresh login.
        const existing = await getUserInfoCookie();
        await setUserInfoCookie({ ...existing, ...updatedUser, onboardingCompleted: true });

        return { success: true, user: updatedUser };
    } catch (error: any) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to complete onboarding",
        };
    }
}

// The onboarding overlay is a client component and can't safely call
// lib/api/onboarding.ts's axiosInstance-backed functions itself (its cookie
// interceptor relies on a "use server" cookie read) — these just move that
// call server-side, same signatures, so the overlay's existing try/catch
// keeps working unchanged.
export async function getUniversities() {
    return await fetchUniversities();
}

export async function getCoursesByUniversity(universityId: string) {
    return await fetchCoursesByUniversity(universityId);
}

export async function getJobRoles() {
    return await fetchJobRoles();
}