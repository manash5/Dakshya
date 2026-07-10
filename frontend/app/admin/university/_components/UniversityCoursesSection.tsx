"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { handleGetCoursesByUniversity } from "@/lib/actions/admin/course-action";
import { handleGetSubjectsByCourse } from "@/lib/actions/admin/subject-action";

interface UniversityCoursesSectionProps {
    universityId: string;
}

function groupSubjectsBySemester(subjects: any[]) {
    const grouped = new Map<number, any[]>();
    for (const subject of subjects) {
        const semester = subject.semester ?? 0;
        if (!grouped.has(semester)) grouped.set(semester, []);
        grouped.get(semester)!.push(subject);
    }
    return Array.from(grouped.entries()).sort(([a], [b]) => a - b);
}

export default function UniversityCoursesSection({ universityId }: UniversityCoursesSectionProps) {
    const [expanded, setExpanded] = useState(false);
    const [courses, setCourses] = useState<any[] | null>(null);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [subjects, setSubjects] = useState<any[] | null>(null);
    const [error, setError] = useState("");
    const [isPending, startTransition] = useTransition();
    const [subjectsPending, startSubjectsTransition] = useTransition();

    const loadCourses = () => {
        setError("");
        startTransition(async () => {
            const result = await handleGetCoursesByUniversity(universityId, { page: 1, limit: 100 });
            if (!result.success) {
                setError(result.message || "Failed to load courses");
                setCourses([]);
                return;
            }
            setCourses(result.data ?? []);
        });
    };

    const toggleSection = () => {
        const next = !expanded;
        setExpanded(next);
        if (next && courses === null) {
            loadCourses();
        }
    };

    const selectCourse = (courseId: string) => {
        if (selectedCourseId === courseId) {
            setSelectedCourseId(null);
            setSubjects(null);
            return;
        }

        setSelectedCourseId(courseId);
        setSubjects(null);
        startSubjectsTransition(async () => {
            const result = await handleGetSubjectsByCourse(courseId, { page: 1, limit: 200 });
            if (!result.success) {
                setError(result.message || "Failed to load subjects");
                setSubjects([]);
                return;
            }
            setSubjects(result.data ?? []);
        });
    };

    return (
        <div className="mt-8 rounded-xl border border-gray-200">
            <button
                type="button"
                onClick={toggleSection}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
            >
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-700">
                        View Courses
                    </h3>
                    <p className="mt-0.5 text-xs text-gray-400">
                        Courses and subjects linked to this university
                    </p>
                </div>
                <span className="text-gray-400">{expanded ? "▲" : "▼"}</span>
            </button>

            {expanded && (
                <div className="border-t border-gray-100 px-5 py-4">
                    {error && (
                        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">
                            {error}
                        </div>
                    )}

                    {isPending && (
                        <p className="text-sm text-gray-500">Loading courses...</p>
                    )}

                    {!isPending && courses !== null && courses.length === 0 && (
                        <p className="text-sm text-gray-500">
                            No courses found for this university.{" "}
                            <Link href="/admin/course/create" className="font-medium text-[#5a7a1e] hover:underline">
                                Add a course
                            </Link>
                        </p>
                    )}

                    {!isPending && courses && courses.length > 0 && (
                        <div className="space-y-2">
                            {courses.map((course) => {
                                const isSelected = selectedCourseId === course._id;
                                return (
                                    <div
                                        key={course._id}
                                        className="rounded-lg border border-gray-100 bg-gray-50"
                                    >
                                        <div className="flex items-center justify-between gap-3 px-4 py-3">
                                            <button
                                                type="button"
                                                onClick={() => selectCourse(course._id)}
                                                className="flex flex-1 items-center justify-between text-left"
                                            >
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{course.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {course.degree} · {course.durationInSemesters} semesters
                                                    </p>
                                                </div>
                                                <span className="text-xs text-gray-400">
                                                    {isSelected ? "▲" : "▼"}
                                                </span>
                                            </button>
                                            <Link
                                                href={`/admin/course/${course._id}/edit`}
                                                className="shrink-0 text-xs font-bold uppercase tracking-widest text-gray-400 transition-colors hover:text-gray-900"
                                            >
                                                Edit
                                            </Link>
                                        </div>

                                        {isSelected && (
                                            <div className="border-t border-gray-100 px-4 py-3">
                                                {subjectsPending && (
                                                    <p className="text-xs text-gray-500">Loading subjects...</p>
                                                )}

                                                {!subjectsPending && subjects && subjects.length === 0 && (
                                                    <p className="text-xs text-gray-500">No subjects for this course.</p>
                                                )}

                                                {!subjectsPending && subjects && subjects.length > 0 && (
                                                    <div className="space-y-4">
                                                        {groupSubjectsBySemester(subjects).map(([semester, semesterSubjects]) => (
                                                            <div key={semester}>
                                                                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
                                                                    Semester {semester}
                                                                </p>
                                                                <div className="overflow-x-auto rounded-lg border border-gray-100 bg-white">
                                                                    <table className="w-full text-left text-xs">
                                                                        <thead className="border-b border-gray-100 bg-gray-50 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                                                                            <tr>
                                                                                <th className="px-3 py-2">Code</th>
                                                                                <th className="px-3 py-2">Name</th>
                                                                                <th className="px-3 py-2">Credits</th>
                                                                                <th className="px-3 py-2 text-right">Actions</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {semesterSubjects.map((subject) => (
                                                                                <tr
                                                                                    key={subject._id}
                                                                                    className="border-b border-gray-50 last:border-0"
                                                                                >
                                                                                    <td className="px-3 py-2 font-medium text-gray-900">
                                                                                        {subject.code}
                                                                                    </td>
                                                                                    <td className="px-3 py-2 text-gray-600">
                                                                                        {subject.name}
                                                                                    </td>
                                                                                    <td className="px-3 py-2 text-gray-500">
                                                                                        {subject.credits}
                                                                                    </td>
                                                                                    <td className="px-3 py-2 text-right">
                                                                                        <Link
                                                                                            href={`/admin/subject/${subject._id}/edit`}
                                                                                            className="text-[10px] font-bold uppercase tracking-widest text-gray-400 transition-colors hover:text-gray-900"
                                                                                        >
                                                                                            Edit
                                                                                        </Link>
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
