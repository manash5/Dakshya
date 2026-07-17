import axiosInstance from "./axios-instance";
import { API } from "./endpoints";

export interface PracticeQuestion {
    question: string;
    type: string;
    skills: string[];
    expectedAnswer: string;
    userAnswer: string;
    userCode: string;
    score: number;
    confidenceScore: number;
    feedback: string;
}

export interface PracticeAttemptJobRole {
    _id: string;
    title: string;
    category: string;
}

export interface PracticeAttempt {
    _id: string;
    userId: string;
    jobRoleId: PracticeAttemptJobRole;
    skill: string | null;
    skills: string[];
    difficulty: "Beginner" | "Intermediate" | "Advanced";
    mode: "Oral" | "Coding" | "Mixed";
    questionCount: number;
    startedAt: string;
    completedAt: string | null;
    duration: number | null;
    overallScore: number | null;
    technicalScore: number | null;
    communicationScore: number | null;
    feedback: string;
    recommendations: string[];
    questions: PracticeQuestion[];
    createdAt: string;
    updatedAt: string;
}

export const startAttempt = async (data: {
    jobRoleId: string;
    skill?: string;
    skills?: string[];
    difficulty: "Beginner" | "Intermediate" | "Advanced";
    mode: "Oral" | "Coding" | "Mixed";
    questionCount: number;
}) => {
    try {
        const response = await axiosInstance.post(API.PRACTICE_ATTEMPT.START, data);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || "Failed to start practice attempt");
    }
};

export const getAttemptHistory = async (params: {
    page?: number;
    limit?: number;
    jobRoleId?: string;
    skill?: string;
    mode?: string;
    difficulty?: string;
}) => {
    try {
        const response = await axiosInstance.get(API.PRACTICE_ATTEMPT.GET_ALL, { params });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || "Failed to fetch practice attempt history");
    }
};

export const getAttemptById = async (id: string) => {
    try {
        const response = await axiosInstance.get(API.PRACTICE_ATTEMPT.GET_BY_ID(id));
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || "Failed to fetch practice attempt");
    }
};

export const submitAnswer = async (
    id: string,
    data: { questionIndex: number; userAnswer?: string; userCode?: string | null },
) => {
    try {
        const response = await axiosInstance.put(API.PRACTICE_ATTEMPT.SUBMIT_ANSWER(id), data);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || "Failed to submit answer");
    }
};

export const completeAttempt = async (
    id: string,
    data: { feedback?: string; recommendations?: string[] } = {},
) => {
    try {
        const response = await axiosInstance.put(API.PRACTICE_ATTEMPT.COMPLETE(id), data);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || "Failed to complete practice attempt");
    }
};

export const transcribeAudio = async (formData: FormData) => {
    try {
        const response = await axiosInstance.post(API.PRACTICE_ATTEMPT.TRANSCRIBE, formData, {
            headers: {
                "Content-Type": "multipart/form-data", // for multer
            },
        });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || "Failed to transcribe audio");
    }
};
