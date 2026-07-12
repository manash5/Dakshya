import axiosInstance from "./axios-instance";
import { API } from "./endpoints";

export interface University {
    _id: string;
    name: string;
}

export interface Course {
    _id: string;
    name: string;
    durationInSemesters: number;
}

export interface JobRole {
    _id: string;
    title: string;
    category: string;
    description: string;
    icon: string | null;
    isActive: boolean;
}

export async function fetchUniversities(): Promise<University[]> {
    const res = await axiosInstance.get(API.UNIVERSITY.GET_ALL);
    return res.data?.data ?? res.data;
}

export async function fetchCoursesByUniversity(universityId: string): Promise<Course[]> {
    const res = await axiosInstance.get(API.UNIVERSITY.GET_COURSES(universityId));
    return res.data?.data ?? res.data;
}

export async function fetchJobRoles(): Promise<JobRole[]> {
    const res = await axiosInstance.get(API.JOB_ROLE.GET_ALL);
    return res.data?.data ?? res.data;
}