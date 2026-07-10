"use server";

import { getTokenCookie } from "@/lib/cookies";
import {
    generateUniversityCourses,
    GenerateCoursesResponse,
} from "@/lib/api/ai/course-generator";

function normalizeToken(token: string): string {
    return token.replace(/^Bearer\s+/i, "").trim();
}

export async function handleGenerateUniversityCourses(payload: {
    universityId: string;
    website: string;
}): Promise<
    | { success: true; data: GenerateCoursesResponse }
    | { success: false; code: string; message: string }
> {
    try {
        const rawToken = await getTokenCookie();
        if (!rawToken) {
            return {
                success: false,
                code: "auth",
                message: "Your session may have expired. Please log in again and retry the course sync.",
            };
        }

        const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8088";

        const data = await generateUniversityCourses({
            universityId: payload.universityId,
            website: payload.website,
            token: normalizeToken(rawToken),
            courseApiUrl: `${BACKEND_BASE_URL}/api/v1/admin/course`,  
            subjectApiUrl: `${BACKEND_BASE_URL}/api/v1/admin/subject`, 
        });

        return { success: true, data };
    } catch (error: any) {
        return {
            success: false,
            code: error?.code || "unknown",
            message: error?.message || "Course sync failed",
        };
    }
}
