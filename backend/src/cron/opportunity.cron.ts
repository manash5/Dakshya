import cron from "node-cron";
import { OpportunityService } from "../services/opportunity.service";

const opportunityService = new OpportunityService();

// Every day at 03:00 server time (an hour after the job-posting refresh, so
// they don't compete for the same headless-browser resources). Scraping
// never happens on a user request — this and the admin POST /scrape
// endpoint are the only two ways opportunities ever get refreshed.
export function scheduleOpportunityRefresh() {
  cron.schedule("0 3 * * *", async () => {
    console.log(`[opportunity-cron] refresh started at ${new Date().toISOString()}`);
    try {
      const stats = await opportunityService.scrapeAndStoreAll();
      console.log("[opportunity-cron] refresh completed", stats);
    } catch (error) {
      console.error("[opportunity-cron] refresh failed", error);
    }
  });
}
