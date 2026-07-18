import { handleGetAllCareerKnowledgeAdmin } from "@/lib/actions/admin/careerKnowledge-action";
import { getJobRoles } from "@/lib/actions/onboarding-action";
import CareerKnowledgeTable, { type CareerKnowledgeRow } from "./_components/CareerKnowledgeTable";

export default async function Page() {
    const [jobRoles, knowledgeResult] = await Promise.all([
        getJobRoles(),
        handleGetAllCareerKnowledgeAdmin({ limit: 100 }),
    ]);

    const knowledgeList: any[] = knowledgeResult.success ? knowledgeResult.data : [];
    const knowledgeByRole = new Map<string, any>(
        knowledgeList.map((k) => [(k.jobRoleId?._id ?? k.jobRoleId) as string, k]),
    );

    const rows: CareerKnowledgeRow[] = jobRoles.map((role) => {
        const knowledge = knowledgeByRole.get(role._id);
        return {
            jobRoleId: role._id,
            jobRoleTitle: role.title,
            category: role.category,
            hasKnowledge: !!knowledge,
            roadmapSteps: knowledge?.roadmap?.length ?? 0,
            difficulty: knowledge?.difficulty ?? null,
            salary: knowledge?.salary
                ? `${knowledge.salary.currency} ${knowledge.salary.min} - ${knowledge.salary.max}`
                : null,
            aiGeneratedDate: knowledge?.aiGeneratedDate ?? null,
            isUpdating: knowledge?.isUpdating ?? false,
        };
    });

    return (
        <div>
            <CareerKnowledgeTable rows={rows} />
        </div>
    );
}
