import { handleGetAllSubjects } from "@/lib/actions/admin/subject-action";
import SubjectTable from "./_components/SubjectTable";

export default async function Page({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const query = await searchParams;
    const page = query.page ? parseInt(query.page as string, 10) : 1;
    const limit = query.limit ? parseInt(query.limit as string, 10) : 10;
    const search = query.search ? (query.search as string) : '';

    const result = await handleGetAllSubjects({ page, limit, search });

    if (!result.success) {
        throw new Error("Failed to load subjects");
    }

    return (
        <div>
            <SubjectTable data={result.data} pagination={result.pagination} search={search} />
        </div>
    );
}
