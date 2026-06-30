
import { handleGetAllUsers } from "@/lib/actions/admin/user-action";
import UserTable from "./_components/UserTable";
export default async function Page({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    // get the search params
    const query = await searchParams;
    const page = query.page ? parseInt(query.page as string, 10) : 1;
    const limit = query.limit ? parseInt(query.limit as string, 10) : 10;
    const search = query.search ? (query.search as string) : '';
    // call action to get all users with the search params
    const result = await handleGetAllUsers({ page, limit, search });

    if (!result.success) {
        throw new Error("Failed to load users");
    }

    return (
        <div>
            <UserTable data={result.data} pagination={result.pagination} search={search} />
        </div>
    );
}