"use server";
import { revalidatePath } from "next/cache";
import { getAllUsers, createUser, deleteUser, getUserById, updateUser, updateUserPassword } from "@/lib/api/admin/user";

export const handleCreateUser = async (data: any) => {
    try {
        const result = await createUser(data);
        if (result.success) {
            revalidatePath("/admin/users"); // Revalidate the users page after successful creation
            return { success: true, message: result.message, data: result.data };
        }
        return { success: false, message: result.message || 'User creation failed' };
    } catch (error: any) {
        return { success: false, message: error?.message || 'User creation failed' };
    }
}
export const handleGetAllUsers = async ({ page, limit, search }: { page?: number, limit?: number, search?: string }) => {
    try {
        const currentPage = page ? page > 0 ? page : 1 : 1;
        const currentLimit = limit ? limit > 0 ? limit : 10 : 10;
        const currentSearch = search || "";
        const result = await getAllUsers({ page: currentPage, limit: currentLimit, search: currentSearch });
        if (result.success) {
            return { success: true, message: result.message, data: result.data, pagination: result.meta }; // meta returned from api contains pagination info
        }
        return { success: false, message: result.message || 'Failed to fetch users' };
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to fetch users' };
    }
}

export const handleGetUserById = async (id: string) => {
    try {
        const result = await getUserById(id);
        if (result.success) {
            return { success: true, message: result.message, data: result.data };
        }
        return { success: false, message: result.message || 'Failed to fetch user' };
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to fetch user' };
    }
}

export const handleUpdateUser = async (id: string, data: any) => {
    try {
        const result = await updateUser(id, data);
        if (result.success) {
            revalidatePath("/admin/users");
            return { success: true, message: result.message, data: result.data };
        }
        return { success: false, message: result.message || 'Failed to update user' };
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to update user' };
    }
}

export const handleUpdateUserPassword = async (id: string, data: any) => {
    try {
        const result = await updateUserPassword(id, data);
        if (result.success) {
            revalidatePath("/admin/users");
            return { success: true, message: result.message, data: result.data };
        }
        return { success: false, message: result.message || 'Failed to update user password' };
    }
    catch (error: any) {
        return { success: false, message: error?.message || 'Failed to update user password' };
    }
}

export const handleDeleteUser = async (id: string) => {
    try {
        const result = await deleteUser(id);
        if (result.success) {
            revalidatePath("/admin/users");
            return { success: true, message: result.message };
        }
        return { success: false, message: result.message || 'Failed to delete user' };
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to delete user' };
    }
}