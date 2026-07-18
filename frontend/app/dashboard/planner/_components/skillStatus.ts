import { FileText, FolderGit2, MessageSquare, UserCheck } from "lucide-react";
import type { SkillPlannerSkill, SkillSourceTag } from "@/lib/api/skillPlanner";

// Plain-English label + a short one-line explanation of what the status
// means and what to do next, so the badge alone never has to be decoded by
// the user. Shared between the Skill Graph row and the skill detail drawer.
export const STATUS_INFO: Record<
    SkillPlannerSkill["status"],
    { label: string; badge: string; description: string }
> = {
    Locked: {
        label: "Not Started",
        badge: "bg-neutral-100 text-neutral-500",
        description: "No evidence yet — check the Resources tab.",
    },
    Upcoming: {
        label: "Upcoming",
        badge: "bg-[#EAF1FB] text-[#2E6BB8]",
        description: "Comes later in your degree program.",
    },
    Learning: {
        label: "Learning",
        badge: "bg-[#F2F3EE] text-neutral-600",
        description: "Part of your coursework right now.",
    },
    Practiced: {
        label: "Practiced",
        badge: "bg-[#FDF0D5] text-[#B8860B]",
        description: "Tackled in interviews — try a project next.",
    },
    ProjectApplied: {
        label: "Project Applied",
        badge: "bg-[#E4F3E1] text-[#2F5D2A]",
        description: "Applied in a project — test it in an interview.",
    },
    InterviewReady: {
        label: "Interview Ready",
        badge: "bg-[#E9F7CC] text-[#5C8A1C]",
        description: "Scoring well in mock interviews.",
    },
    Mastered: {
        label: "Mastered",
        badge: "bg-[#2F5D2A] text-white",
        description: "Backed by coursework, project, and interviews.",
    },
};

export const SOURCE_LABELS: Record<SkillSourceTag, string> = {
    curriculum: "Degree",
    resume: "Resume",
    project: "Project",
    practice: "Interview",
    selfReported: "Self-reported",
};

export const SOURCE_ICONS: Partial<Record<SkillSourceTag, typeof FileText>> = {
    resume: FileText,
    project: FolderGit2,
    practice: MessageSquare,
    selfReported: UserCheck,
};
