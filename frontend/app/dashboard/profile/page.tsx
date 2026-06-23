import { getUserData } from "@/lib/actions/auth-action";
import { notFound } from "next/navigation";
import UpdateForm from "./_components/UpdateUser";

export default async function Page() {
    const userData = await getUserData();
    if (!userData.success) {
        throw new Error(userData.message 
            || "Failed to fetch user data");
    }
    if (!userData.data) {
        notFound();
    }
    return (
        <div className="bg-[#F7F8F5]">
            <UpdateForm user={userData.data} />
        </div>
    );
}