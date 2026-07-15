import { z } from "zod";

export const PracticeQuestionSchema = z.object({
  question: z.string(),
  // Freeform (not a fixed enum) since question categories vary by mode/AI
  // generation (e.g. "technical", "behavioral", "coding", "system-design").
  type: z.string(),
  // 1-3 skills/technologies this question tests, tagged by FastAPI at
  // generation time. Empty for attempts generated before this field existed.
  skills: z.array(z.string()).default([]),
  // Filled in at generation time for oral/theory questions where FastAPI can
  // draft one up front; coding questions instead have this filled in after
  // evaluation (see evaluate's idealAnswer), since a good implementation
  // depends on the language/approach the candidate actually attempted.
  expectedAnswer: z.string().default(""),
  userAnswer: z.string().default(""),
  // Only meaningful for coding questions -- kept separate from userAnswer
  // (the verbal explanation) so both are available on review instead of one
  // overwriting the other.
  userCode: z.string().default(""),
  // Technical correctness, from FastAPI's evaluate endpoint.
  score: z.number().min(0).max(100).default(0),
  // How clear/confident the verbal explanation was -- a separate axis from
  // technical correctness. Averaged across questions into the attempt's
  // communicationScore at completion time.
  confidenceScore: z.number().min(0).max(100).default(0),
  feedback: z.string().default(""),
});

export const PracticeAttemptSchema = z.object({
  userId: z.string(),
  jobRoleId: z.string(),
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
