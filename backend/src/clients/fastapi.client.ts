import axios from "axios";

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
}

export const fastApiClient = new FastApiClient();
