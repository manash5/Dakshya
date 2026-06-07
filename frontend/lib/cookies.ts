"use server";
import { cookies } from "next/headers";
export const setTokenCookie = async (token: string) => {
    const cookieStore = await cookies();
    cookieStore.set("auth_token", token);
}
export const getTokenCookie = async () => {
    const cookieStore = await cookies();
    return cookieStore.get("auth_token")?.value || null;
}
export const setUserInfoCookie = async (userInfo: any) => {
    const cookieStore = await cookies();
    cookieStore.set("user_data", JSON.stringify(userInfo)); // convert obj to string
}
export const getUserInfoCookie = async () => {
    const cookieStore = await cookies();
    const userInfoStr = cookieStore.get("user_data")?.value || null;
    return userInfoStr ? JSON.parse(userInfoStr) : null; // convert string back to obj
}
export const clearAuthCookies = async () => {
    const cookieStore = await cookies();
    cookieStore.delete("auth_token");
    cookieStore.delete("user_data");
}