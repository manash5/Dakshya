import {
  House,
  BriefcaseBusiness,
  User,
  University,
  GraduationCap,
  BookText,
  Trophy,
  FolderKanban,
  Sparkles,
  LucideIcon,
} from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  description?: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    name: "home",
    href: "/admin",
    icon: House,
    description: "Dashboard overview",
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: User,
    description: "Manage accounts, roles and access.",
  },
  {
    name: "university",
    href: "/admin/university",
    icon: University,
    description: "Manage universities",
  },
  {
    name: "Course",
    href: "/admin/course",
    icon: GraduationCap,
    description: "Manage courses",
  },
  {
    name: "Subject",
    href: "/admin/subject",
    icon: BookText,
    description: "Manage subjects",
  },
  {
    name: "Jobs",
    href: "/admin/jobRole",
    icon: BriefcaseBusiness,
    description: "Create, edit and publish job posts.",
  },
  {
    name: "Job Postings",
    href: "/admin/job-postings",
    icon: BriefcaseBusiness,
    description: "Scrape, edit and manage job postings.",
  },
  {
    name: "Opportunities",
    href: "/admin/opportunities",
    icon: Trophy,
    description: "Scrape, edit and manage opportunities.",
  },
  {
    name: "Projects",
    href: "/admin/project",
    icon: FolderKanban,
    description: "Create, edit and manage practice projects.",
  },
  {
    name: "Career Knowledge",
    href: "/admin/career-knowledge",
    icon: Sparkles,
    description: "Generate and regenerate AI career knowledge per role.",
  },
];

// Filter items to show in cards (exclude home)
export const CARD_ITEMS = NAV_ITEMS.filter((item) => item.href !== "/admin");
