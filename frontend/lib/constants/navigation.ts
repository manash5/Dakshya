import {
  House,
  BriefcaseBusiness,
  User,
  University,
  GraduationCap,
  BookText,
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
];

// Filter items to show in cards (exclude home)
export const CARD_ITEMS = NAV_ITEMS.filter((item) => item.href !== "/admin");
