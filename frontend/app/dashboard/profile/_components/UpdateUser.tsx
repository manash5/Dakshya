"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { useRef, useState } from "react";
import { toast } from "react-toastify";

import { handleUpdateProfile } from "@/lib/actions/auth-action";

import AccountSettingsCard from "./AccountSettingsCard";
import ProfileHeader from "./ProfileHeader";
import ProfileSideCards from "./ProfileSideCards";
import { updateUserSchema, type UpdateUserData } from "./profile-form";
import { type ProfileUser, resolveProfileImageSrc } from "./profile-types";

export default function UpdateUserForm({ user }: { user: ProfileUser }) {
    const methods = useForm<UpdateUserData>({
        resolver: zodResolver(updateUserSchema),
        values: {
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            email: user?.email || "",
            username: user?.username || "",
            phoneNumber: user?.phoneNumber || "",
        },
    });

    const [error, setError] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [mockInterviewsEnabled, setMockInterviewsEnabled] = useState(true);
    const [jobMatchesEnabled, setJobMatchesEnabled] = useState(true);
    const [roadmapUpdatesEnabled, setRoadmapUpdatesEnabled] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

            if (data.image) {
                formData.append("profilePicture", data.image);
            }

            const response = await handleUpdateProfile(formData);
            if (!response.success) {
                throw new Error(response.message || "Update profile failed");
            }

            handleDismissImage();
            toast.success("Profile updated successfully");
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
                <form onSubmit={methods.handleSubmit(onSubmit)} className="mx-auto flex w-full max-w-[1160px] flex-col gap-6">
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

                    {error ? (
                        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                            {error}
                        </div>
                    ) : null}

                    <AccountSettingsCard />

                    <ProfileSideCards
                        profileScore={profileScore}
                        twoFactorEnabled={twoFactorEnabled}
                        setTwoFactorEnabled={setTwoFactorEnabled}
                        mockInterviewsEnabled={mockInterviewsEnabled}
                        setMockInterviewsEnabled={setMockInterviewsEnabled}
                        jobMatchesEnabled={jobMatchesEnabled}
                        setJobMatchesEnabled={setJobMatchesEnabled}
                        roadmapUpdatesEnabled={roadmapUpdatesEnabled}
                        setRoadmapUpdatesEnabled={setRoadmapUpdatesEnabled}
                        updatedAt={user?.updatedAt}
                    />
                </form>
            </FormProvider>
        </div>
    );
}