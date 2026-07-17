import { z } from "zod";

export const PracticeQuestionSchema = z.object({
  question: z.string(),
  type: z.string(),
  skills: z.array(z.string()).default([]),
  expectedAnswer: z.string().default(""),
  userAnswer: z.string().default(""),
  userCode: z.string().default(""),
  score: z.number().min(0).max(100).default(0),
  confidenceScore: z.number().min(0).max(100).default(0),
  feedback: z.string().default(""),
});

export const PracticeAttemptSchema = z.object({
  userId: z.string(),
  jobRoleId: z.string(),
  // Optional single-skill focus for this attempt -- when set, every
  // generated question was constrained to this skill (see
  // fastApiClient.generateInterviewQuestions). Null/absent for attempts
  // started before this field existed, or for whole-role attempts.
  skill: z.string().trim().min(1).nullable().optional(),
  // Optional multi-skill list for an auto-generated mixed session (e.g. the
  // Practice page's "today's recommendation" spanning several weak skills at
  // once). Mutually exclusive with `skill` -- empty for single-skill and
  // whole-role attempts alike.
  skills: z.array(z.string()).default([]),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  mode: z.enum(["Oral", "Coding", "Mixed"]),
  questionCount: z.number().int().positive(),
  startedAt: z.coerce.date(),
  completedAt: z.coerce.date().nullable().optional(),
  duration: z.number().nonnegative().nullable().optional(),
  overallScore: z.number().min(0).max(100).nullable().optional(),
  technicalScore: z.number().min(0).max(100).nullable().optional(),
  communicationScore: z.number().min(0).max(100).nullable().optional(),
  feedback: z.string().default(""),
  recommendations: z.array(z.string()).default([]),
  questions: z.array(PracticeQuestionSchema).default([]),
});

export type PracticeQuestionType = z.infer<typeof PracticeQuestionSchema>;
export type PracticeAttemptType = z.infer<typeof PracticeAttemptSchema>;
