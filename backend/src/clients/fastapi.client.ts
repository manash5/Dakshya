import axios from "axios";

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
}

export const fastApiClient = new FastApiClient();