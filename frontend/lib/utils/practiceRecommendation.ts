import type { SkillPlannerSkill } from "@/lib/api/skillPlanner";

export interface RecommendedSkillItem {
  skill: SkillPlannerSkill;
  questionCount: number;
}

export interface PracticeRecommendation {
  items: RecommendedSkillItem[];
  totalQuestions: number;
  estimatedMinutes: number;
}

const MAX_RECOMMENDED_SKILLS = 3;
const TARGET_TOTAL_QUESTIONS = 12;
const MINUTES_PER_QUESTION = 1.5;

// Real weakest-skills-first recommendation, distinct from
// SkillPlannerSkill[]'s own sort order (which prioritizes display/status,
// not "what's most worth practicing right now" -- see skillPlanner.service.ts's
// STATUS_DISPLAY_PRIORITY comment). Only considers skills with some real
// evidence (excludes Locked, nothing to practice yet) that aren't already
// Mastered.
export function buildPracticeRecommendation(skills: SkillPlannerSkill[]): PracticeRecommendation {
  const candidates = [...skills]
    .filter((s) => s.status !== "Locked" && s.status !== "Mastered")
    .sort((a, b) => b.gapPercent - a.gapPercent)
    .slice(0, MAX_RECOMMENDED_SKILLS);

  if (candidates.length === 0) {
    return { items: [], totalQuestions: 0, estimatedMinutes: 0 };
  }

  const totalGap = candidates.reduce((sum, s) => sum + s.gapPercent, 0) || candidates.length;
  const items = candidates.map((skill) => {
    const share = skill.gapPercent / totalGap;
    const questionCount = Math.max(2, Math.round(TARGET_TOTAL_QUESTIONS * share));
    return { skill, questionCount };
  });

  const totalQuestions = items.reduce((sum, i) => sum + i.questionCount, 0);
  const estimatedMinutes = Math.round(totalQuestions * MINUTES_PER_QUESTION);

  return { items, totalQuestions, estimatedMinutes };
}
