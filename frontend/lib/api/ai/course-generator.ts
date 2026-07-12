import aiAxiosInstance from "../ai-axios-instance";
import { AI_API } from "../ai-endpoints";

export interface SubjectExtract {
    semester: number;
    code: string;
    name: string;
    credits: number;
    description: string;
    skills: string[];
}

export interface CourseExtract {
    name: string;
    degree: string;
    durationInSemesters: number;
    description: string;
    subjects: SubjectExtract[];
}

export interface SubjectResult {
    input: SubjectExtract;
    status: "created" | "failed" | string;
    subjectId: string | null;
    error: string | null;
}

export interface CourseResult {
    input: CourseExtract;
    status: "created" | "failed" | string;
    courseId: string | null;
    error: string | null;
    subjects: SubjectResult[];
}

export interface GenerateCoursesResponse {
    website: string;
    pagesCrawled: string[];
    coursesFound: number;
    subjectsFound: number;
    results: CourseResult[];
}

export type GenerateCoursesErrorCode =
    | "misconfigured"
    | "auth"
    | "extraction"
    | "network"
    | "unknown";

export class GenerateCoursesError extends Error {
    code: GenerateCoursesErrorCode;
    status?: number;

    constructor(message: string, code: GenerateCoursesErrorCode, status?: number) {
        super(message);
        this.name = "GenerateCoursesError";
        this.code = code;
        this.status = status;
    }
}

function mapGenerateCoursesError(error: any): GenerateCoursesError {
    if (!error?.response) {
        const isTimeout =
            error?.code === "ECONNABORTED" || error?.message?.includes("timeout");
        return new GenerateCoursesError(
            isTimeout
                ? "The course sync timed out. You can add courses manually or try again later."
                : "Could not reach the course sync service. Check that it is running and try again.",
            "network"
        );
    }

    const status = error.response.status as number;
    const detail =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Course sync failed";

    if (status === 400) {
        return new GenerateCoursesError(
            "The course sync service is misconfigured. Contact your administrator.",
            "misconfigured",
            status
        );
    }

    if (status === 401 || status === 403) {
        return new GenerateCoursesError(
            "Your session may have expired. Please log in again and retry the course sync.",
            "auth",
            status
        );
    }

    if (status === 502) {
        return new GenerateCoursesError(
            "Couldn't automatically detect courses from this website. You can add courses manually.",
            "extraction",
            status
        );
    }

    return new GenerateCoursesError(
        typeof detail === "string" ? detail : "Course sync failed",
        "unknown",
        status
    );
}

export const generateUniversityCourses = async (payload: {
    universityId: string;
    website: string;
    token: string;
    courseApiUrl: string; 
    subjectApiUrl: string; 
}): Promise<GenerateCoursesResponse> => {
    try {
        const response = await aiAxiosInstance.post<GenerateCoursesResponse>(
            AI_API.COURSE_GENERATOR.GENERATE_UNIVERSITY_COURSES,
            payload
        );
        return response.data;
    } catch (error: any) {
        throw mapGenerateCoursesError(error);
    }
};
