import axios from "axios";

export interface ScrapeRoleTarget {
    jobRoleId: string;
    jobRoleTitle: string;
    // Cached similar-titles from a previous run, if we have them — lets
    // ai-services skip the Gemini keyword-generation call entirely.
    keywords?: string[];
}

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

export interface RoleScrapeResult {
    jobRoleId: string;
    jobs: ScrapedJob[];
    stats: {
        startedAt: string;
        completedAt: string;
        durationSeconds: number;
        sourcesAttempted: string[];
        sourcesSucceeded: string[];
        sourcesFailed: Record<string, string>;
        totalScraped: number;
        matchedCount: number;
    };
    keywords: string[];
    error: string | null;
}

export interface ScrapeResponse {
    results: RoleScrapeResult[];
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

    // roles is a batch — one call scrapes every role at once, whether it's
    // a single admin-triggered role or the full active JobRole list on cron.
    async scrapeJobPostings(
        roles: ScrapeRoleTarget[],
        options?: {
            sources?: string[];
            maxJobsPerRole?: number;
            useAiMatching?: boolean;
        }
    ): Promise<ScrapeResponse> {
        const response = await axios.post(
            `${this.baseUrl}/api/v1/job-postings/scrape`,
            { roles, ...options }
        );
        return response.data;
    }
}

export const fastApiClient = new FastApiClient();