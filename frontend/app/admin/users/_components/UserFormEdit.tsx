"use client";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "react-toastify";
import { editUserSchema } from "./schema";
import { handleUpdateUser } from "@/lib/actions/admin/user-action";

const fieldClass =
    "h-12 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-colors focus:border-gray-400 focus:bg-white";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-500";
const errClass = "mt-1 block text-sm text-red-500";

export default function UserFormEdit({ user }: { user?: any }) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState("");
    const router = useRouter();

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<any>({
        resolver: zodResolver(editUserSchema),
        defaultValues: {
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            email: user?.email || "",
            username: user?.username || "",
            role: user?.role || "user",
            password: "",
        },
    });

    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (file: File | undefined, onChange: (file: File | undefined) => void) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreviewImage(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setPreviewImage(null);
        }
        onChange(file);
    };

    const handleDismissImage = (onChange?: (file: File | undefined) => void) => {
        setPreviewImage(null);
        onChange?.(undefined);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const onSubmit = (data: any) => {
        setError("");
        startTransition(async () => {
            try {
                const formdata = new FormData();
                formdata.append("firstName", data.firstName || "");
                formdata.append("lastName", data.lastName || "");
                formdata.append("email", data.email || "");
                formdata.append("username", data.username || "");
                formdata.append("role", data.role || "user");
                if (data.image) formdata.append("profileImage", data.image);
                let result = await handleUpdateUser(user._id, formdata);

                if (!result.success) throw new Error(result.message);
                toast.success("User updated successfully");
                router.push("/admin/users");
                router.refresh();
            } catch (err: any) {
                toast.error(err?.message);
                setError(err?.message || "Something went wrong");
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 flex items-start justify-center">
            <div className="w-full max-w-3/4 bg-white rounded-2xl shadow-md p-8">
                <div className="mb-7">
                    <h2 className="text-2xl font-bold text-gray-900">Edit User</h2>
                    <p className="text-sm text-gray-400 mt-0.5">Update account details below</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    {error && (
                        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">
                            {error}
                        </div>
                    )}

                    {/* Avatar */}
                    <div className="mb-6 flex items-center gap-4">
                        {previewImage ? (
                            <div className="relative h-20 w-20 shrink-0">
                                <img
                                    src={previewImage}
                                    alt="Preview"
                                    className="h-20 w-20 rounded-full object-cover ring-2 ring-gray-100"
                                />
                                <Controller
                                    name="image"
                                    control={control}
                                    render={({ field: { onChange } }) => (
                                        <button
                                            type="button"
                                            onClick={() => handleDismissImage(onChange)}
                                            className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow"
                                        >
                                            ✕
                                        </button>
                                    )}
                                />
                            </div>
                        ) : user?.profilePicture ? (
                            <Image
                                src={process.env.NEXT_PUBLIC_API_BASE_URL + user.profilePicture}
                                alt="Profile"
                                width={80}
                                height={80}
                                className="h-20 w-20 rounded-full object-cover ring-2 ring-gray-100 shrink-0"
                            />
                        ) : (
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs text-gray-400">
                                No Image
                            </div>
                        )}

                        <div className="flex-1">
                            <label className={labelClass}>Profile Image</label>
                            <Controller
                                name="image"
                                control={control}
                                render={({ field: { onChange } }) => (
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        onChange={(e) => handleImageChange(e.target.files?.[0], onChange)}
                                        accept=".jpg,.jpeg,.png,.webp"
                                        className="text-sm text-gray-400 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:uppercase file:tracking-widest file:text-gray-600 hover:file:bg-gray-200"
                                    />
                                )}
                            />
                            {errors.image && <span className={errClass}>{errors.image.message as string}</span>}
                        </div>
                    </div>

                    <div className="mb-5">
                        <label className={labelClass}>Email</label>
                        <input type="email" {...register("email")} placeholder="you@example.com" className={fieldClass} />
                        {errors.email && <span className={errClass}>{errors.email.message as string}</span>}
                    </div>

                    <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className={labelClass}>First Name</label>
                            <input type="text" {...register("firstName")} placeholder="Jane" className={fieldClass} />
                            {errors.firstName && <span className={errClass}>{errors.firstName.message as string}</span>}
                        </div>
                        <div>
                            <label className={labelClass}>Last Name</label>
                            <input type="text" {...register("lastName")} placeholder="Doe" className={fieldClass} />
                            {errors.lastName && <span className={errClass}>{errors.lastName.message as string}</span>}
                        </div>
                    </div>

                    <div className="mb-5">
                        <label className={labelClass}>Username</label>
                        <input type="text" {...register("username")} placeholder="janedoe" className={fieldClass} />
                        {errors.username && <span className={errClass}>{errors.username.message as string}</span>}
                    </div>

                    <div className="mb-5">
                        <label className={labelClass}>Role</label>
                        <select {...register("role")} className={fieldClass}>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                        {errors.role && <span className={errClass}>{errors.role.message as string}</span>}
                    </div>

                    <div className="mb-7">
                        <label className={labelClass}>Password</label>
                        <input
                            type="password"
                            {...register("password")}
                            placeholder="••••••••"
                            className={fieldClass}
                        />
                        {errors.password && <span className={errClass}>{errors.password.message as string}</span>}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || isPending}
                        className="flex h-12 w-full items-center justify-center rounded-lg bg-[#5a7a1e] text-xs font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                        {isPending ? "Saving..." : "Save Changes"}
                    </button>
                </form>
            </div>
        </div>
    );
}