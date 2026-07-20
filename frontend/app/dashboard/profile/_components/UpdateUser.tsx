"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { handleUpdateProfile } from "@/lib/actions/auth-action";
import { useAuth } from "@/lib/context/AuthContext";
import { StaggerGroup, StaggerItem } from "@/app/dashboard/_components/AnimatedSection";
import type { JobRole } from "@/lib/api/onboarding";

import AccountSettingsCard from "./AccountSettingsCard";
import CareerGoalsCard, { type RoadmapSnapshot } from "./CareerGoalsCard";
import ProfileFooter from "./ProfileFooter";
import ProfileHeader from "./ProfileHeader";
import SecurityCard from "./SecurityCard";
import { updateUserSchema, type UpdateUserData } from "./profile-form";
import { type ProfileUser, resolveProfileImageSrc } from "./profile-types";

export default function UpdateUserForm({
    user,
    jobRoles,
    roadmapSnapshots,
}: {
    user: ProfileUser;
    jobRoles: JobRole[];
    roadmapSnapshots: RoadmapSnapshot[];
}) {
    const methods = useForm<UpdateUserData>({
        resolver: zodResolver(updateUserSchema),
        values: {
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            email: user?.email || "",
            username: user?.username || "",
            phoneNumber: user?.phoneNumber || "",
            targetRoles: user?.targetRoles || [],
            currentSemester: user?.currentSemester,
        },
    });

    const [error, setError] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const { checkAuth } = useAuth();

    // The header reads AuthContext, which only loads the user_data cookie once
    // on mount — re-run checkAuth after a save so it picks up the new cookie.
    const syncHeaderProfile = async () => {
        await checkAuth();
        router.refresh();
    };

    const resolvedImage = previewImage || resolveProfileImageSrc(user?.profilePicture);
    const profileScore = Math.round(
        (([user?.firstName, user?.lastName, user?.email, user?.username, user?.phoneNumber, resolvedImage].filter(Boolean).length / 6) * 100),
    );

    const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.username || "Your profile";
    const subtitle = [user?.email, user?.username ? `@${user.username}` : null].filter(Boolean).join(" · ");

    const handleImageChange = (file: File | undefined, onChange: (file: File | undefined) => void) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);

            const currentValues = methods.getValues();
            const formData = new FormData();
            formData.append("firstName", currentValues.firstName);
            formData.append("lastName", currentValues.lastName);
            formData.append("email", currentValues.email);
            formData.append("username", currentValues.username);

            const phoneNumber = currentValues.phoneNumber?.trim();
            if (phoneNumber) {
                formData.append("phoneNumber", phoneNumber);
            }

            formData.append("profilePicture", file);

            void handleUpdateProfile(formData)
                .then((response) => {
                    if (!response.success) {
                        throw new Error(response.message || "Image upload failed");
                    }

                    onChange(undefined);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                    }

                    toast.success("Profile image uploaded successfully");
                    void syncHeaderProfile();
                })
                .catch((submitError: unknown) => {
                    const message = submitError instanceof Error ? submitError.message : "Image upload failed";
                    toast.error(message);
                    setError(message);
                });
        } else {
            setPreviewImage(null);
        }

        onChange(file);
    };

    const handleDismissImage = (onChange?: (file: File | undefined) => void) => {
        setPreviewImage(null);
        onChange?.(undefined);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const onSubmit = async (data: UpdateUserData) => {
        setError(null);

        try {
            const formData = new FormData();
            formData.append("firstName", data.firstName);
            formData.append("lastName", data.lastName);
            formData.append("email", data.email);
            formData.append("username", data.username);

            const phoneNumber = data.phoneNumber?.trim();
            if (phoneNumber) {
                formData.append("phoneNumber", phoneNumber);
            }

            if (data.targetRoles) {
                formData.append("targetRoles", JSON.stringify(data.targetRoles));
            }

            if (data.currentSemester) {
                formData.append("currentSemester", String(data.currentSemester));
            }

            if (data.image) {
                formData.append("profilePicture", data.image);
            }

            const response = await handleUpdateProfile(formData);
            if (!response.success) {
                throw new Error(response.message || "Update profile failed");
            }

            handleDismissImage();
            toast.success("Profile updated successfully");
            await syncHeaderProfile();
        } catch (submitError: unknown) {
            const message = submitError instanceof Error ? submitError.message : "Profile update failed";
            toast.error(message);
            setError(message);
        }
    };

    return (
        <div className="relative isolate px-6 py-6 sm:px-8 lg:px-10 lg:py-8">
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -left-24 top-0 h-72 w-72 rounded-full " />
                <div className="absolute right-0 top-20 h-80 w-80 rounded-full " />
            </div>

            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)} className="mx-auto flex w-full max-w-[1160px] flex-col">
                    <StaggerGroup className="flex flex-col gap-6">
                        <StaggerItem>
                            <ProfileHeader
                                displayName={displayName}
                                subtitle={subtitle || "Profile overview"}
                                profileScore={profileScore}
                                avatarSrc={resolvedImage}
                                previewImage={previewImage}
                                userRole={user?.role}
                                fileInputRef={fileInputRef}
                                onImageChange={handleImageChange}
                                onDismissImage={handleDismissImage}
                                isSubmitting={methods.formState.isSubmitting}
                            />
                        </StaggerItem>

                        {error ? (
                            <StaggerItem className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                {error}
                            </StaggerItem>
                        ) : null}

                        <StaggerItem>
                            <AccountSettingsCard />
                        </StaggerItem>

                        <StaggerItem className="grid gap-6 lg:grid-cols-2">
                            <CareerGoalsCard jobRoles={jobRoles} roadmapSnapshots={roadmapSnapshots} />
                            <SecurityCard />
                        </StaggerItem>

                        <StaggerItem>
                            <ProfileFooter updatedAt={user?.updatedAt} />
                        </StaggerItem>
                    </StaggerGroup>
                </form>
            </FormProvider>
        </div>
    );
}