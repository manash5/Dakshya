import { handleGetAllJobPostings } from "@/lib/actions/admin/jobPosting-action";
import JobPostingTable from "./_components/JobPostingTable";

export default async function Page({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const query = await searchParams;
    const page = query.page ? parseInt(query.page as string, 10) : 1;
    const limit = query.limit ? parseInt(query.limit as string, 10) : 10;
    const search = query.search ? (query.search as string) : '';

    const result = await handleGetAllJobPostings({ page, limit, search });

    if (!result.success) {
        throw new Error("Failed to load job postings");
    }

    return (
        <div>
            <JobPostingTable data={result.data} pagination={result.pagination} search={search} />
        </div>
    );
}
