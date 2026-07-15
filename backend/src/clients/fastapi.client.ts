import axios from "axios";
import { HttpException } from "../exceptions/http-exceptions";

export interface ScrapedJob {
    title: string;
    company: string;
    location: string;
    salary: string;
    experience: string | null;
    employmentType: string | null;
    requiredSkills: string[];
    description: string;
    applyLink: string;
    source: string;
    postedDate: string | null;
}

export interface ScrapeStats {
    startedAt: string;
    completedAt: string;
    durationSeconds: number;
    sourcesAttempted: string[];
    sourcesSucceeded: string[];
    sourcesFailed: Record<string, string>;
    totalScraped: number;
}

export interface ScrapeResponse {
    jobs: ScrapedJob[];
    stats: ScrapeStats;
}

export interface ScrapedOpportunity {
    title: string;
    organizer: string;
    category: string | null;
    location: string;
    eventDate: string | null;
    description: string;
    registrationLink: string;
    source: string;
    postedDate: string | null;
}

export interface OpportunityScrapeResponse {
    opportunities: ScrapedOpportunity[];
    stats: ScrapeStats;
}

export interface ResumeProject {
    title: string;
    description: string;
    technologies: string[];
}

export interface ResumeExperience {
    title: string;
    company: string;
    duration: string;
    description: string;
}

export interface ResumeEducation {
    institution: string;
    degree: string;
    fieldOfStudy: string | null;
    duration: string | null;
}

export interface ResumeComparison {
    improvements: string[];
    regressions: string[];
    newSkills: string[];
    summary: string;
}

export interface PreviousResumeSummary {
    skills: string[];
    strengths: string[];
    weaknesses: string[];
    atsScore: number;
}

export interface ResumeAnalysisAiResult {
    candidateNameOnResume: string | null;
    identityMatch: boolean;
    identityReason: string;
    skills: string[];
    projects: ResumeProject[];
    experience: ResumeExperience[];
    education: ResumeEducation[];
    strengths: string[];
    weaknesses: string[];
    atsScore: number;
    recommendations: string[];
    comparison: ResumeComparison | null;
}

export interface GeneratedInterviewQuestion {
    question: string;
    type: string;
    skills: string[];
}

export interface GenerateInterviewQuestionsResult {
    questions: GeneratedInterviewQuestion[];
}

export interface EvaluateAnswerResult {
    technicalScore: number;
    confidenceScore: number;
    feedback: string;
    idealAnswer: string;
}

export class FastApiClient {
    private baseUrl = process.env.FASTAPI_URL ?? "http://localhost:8000";

    async generateCareerKnowledge(jobRole: string) {
        const response = await axios.post(
            `${this.baseUrl}/api/v1/career-knowledge/generate`,
            { jobRole }
        );
        return response.data;
    }

    // Adding this method to support the path used in your regenerate method
    async regenerateCareerKnowledge(jobRole: string) {
        const response = await axios.post(
            `${this.baseUrl}/api/v1/career-knowledge/generate`,
            { jobRole }
        );
        return response.data;
    }

    // Always a full scrape now — no per-role targeting. Every source has no
    // working per-role search anyway, so scraping used to mean re-fetching
    // identical data once per JobRole for nothing. Express stores
    // everything returned and matches jobs to roles at query time instead
    // (see jobPosting.repository.ts). The 2-minute timeout is a backstop —
    // ai-services itself bounds each source to 45s internally — so a
    // hung FastAPI process can't hang this call indefinitely.
    async scrapeJobPostings(
        options?: { sources?: string[]; poolSizePerSource?: number }
    ): Promise<ScrapeResponse> {
        const response = await axios.post(
            `${this.baseUrl}/api/v1/job-postings/scrape`,
            options ?? {},
            { timeout: 120_000 }
        );
        return response.data;
    }

    // Same shape as scrapeJobPostings: one call scrapes every configured
    // opportunity source (hackathons, workshops, competitions), Express
    // stores everything returned. The sources launch a real headless
    // browser (see nepvents.py, hackathon_com.py on the ai-services side),
    // so this gets a longer timeout than the job-posting call.
    async scrapeOpportunities(
        options?: { sources?: string[]; maxItemsPerSource?: number }
    ): Promise<OpportunityScrapeResponse> {
        const response = await axios.post(
            `${this.baseUrl}/api/v1/opportunities/scrape`,
            options ?? {},
            { timeout: 120_000 }
        );
        return response.data;
    }

    // Uses the global fetch/FormData/Blob (Node 18+) instead of axios for
    // this one call -- axios's Node adapter can't encode a spec-compliant
    // multipart body from a Buffer without pulling in the `form-data`
    // package, and fetch already supports it with nothing extra to install.
    async analyzeResume(
        fileBuffer: Buffer,
        fileName: string,
        candidateFullName: string,
        previousSummary?: PreviousResumeSummary | null
    ): Promise<ResumeAnalysisAiResult> {
        // Buffer's underlying ArrayBufferLike can be a SharedArrayBuffer,
        // which BlobPart's type doesn't accept -- slice() copies into a
        // real ArrayBuffer, satisfying the type and avoiding any aliasing
        // with the original buffer.
        const arrayBuffer = fileBuffer.buffer.slice(
            fileBuffer.byteOffset,
            fileBuffer.byteOffset + fileBuffer.byteLength
        ) as ArrayBuffer;

        const form = new FormData();
        form.append(
            "file",
            new Blob([arrayBuffer], { type: "application/pdf" }),
            fileName
        );
        form.append("candidateFullName", candidateFullName);
        if (previousSummary) {
            form.append("previousAnalysis", JSON.stringify(previousSummary));
        }

        const response = await fetch(
            `${this.baseUrl}/api/v1/resume-analysis/analyze`,
            {
                method: "POST",
                body: form,
            }
        );

        if (!response.ok) {
            const detail = await response.text();
            throw new HttpException(
                response.status,
                `Resume analysis failed: ${detail}`
            );
        }

        return await response.json();
    }

    async generateInterviewQuestions(
        jobRole: string,
        difficulty: "Beginner" | "Intermediate" | "Advanced",
        mode: "Oral" | "Coding" | "Mixed",
        questionCount: number
    ): Promise<GenerateInterviewQuestionsResult> {
        const response = await axios.post(
            `${this.baseUrl}/api/v1/interview/generate-questions`,
            { jobRole, difficulty, mode, questionCount }
        );
        return response.data;
    }

    async evaluateInterviewAnswer(
        question: string,
        questionType: string,
        jobRole: string,
        difficulty: "Beginner" | "Intermediate" | "Advanced",
        userAnswer?: string | null,
        userCode?: string | null
    ): Promise<EvaluateAnswerResult> {
        const response = await axios.post(`${this.baseUrl}/api/v1/interview/evaluate`, {
            question,
            questionType,
            jobRole,
            difficulty,
            userAnswer: userAnswer ?? null,
            userCode: userCode ?? null,
        });
        return response.data;
    }

    // Same fetch/FormData approach as analyzeResume, for the same reason --
    // a spec-compliant multipart body without pulling in `form-data`.
    async transcribeAudio(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
        const arrayBuffer = fileBuffer.buffer.slice(
            fileBuffer.byteOffset,
            fileBuffer.byteOffset + fileBuffer.byteLength
        ) as ArrayBuffer;

        const form = new FormData();
        form.append("file", new Blob([arrayBuffer], { type: mimeType }), fileName);

        const response = await fetch(`${this.baseUrl}/api/v1/interview/transcribe`, {
            method: "POST",
            body: form,
        });

        if (!response.ok) {
            const detail = await response.text();
            throw new HttpException(response.status, `Transcription failed: ${detail}`);
        }

        const data = (await response.json()) as { transcription: string };
        return data.transcription;
    }
}

export const fastApiClient = new FastApiClient();
