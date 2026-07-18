import cron from "node-cron";
import { JobPostingService } from "../services/jobPosting.service";

const jobPostingService = new JobPostingService();

// Every day at 02:00 server time. Scraping never happens on a user request
// (see jobPosting.service.ts) — this and the admin POST /scrape endpoint are
// the only two ways job postings ever get refreshed.
export function scheduleJobPostingRefresh() {
  cron.schedule("0 2 * * *", async () => {
    console.log(`[job-posting-cron] refresh started at ${new Date().toISOString()}`);
    try {
      const stats = await jobPostingService.scrapeAndStoreAll();
      console.log("[job-posting-cron] refresh completed", stats);
    } catch (error) {
      console.error("[job-posting-cron] refresh failed", error);
    }
  });
}
