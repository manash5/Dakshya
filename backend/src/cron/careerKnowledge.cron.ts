import cron from "node-cron";
import { CareerKnowledgeService } from "../services/careerKnowledge.service";

const careerKnowledgeService = new CareerKnowledgeService();

// A CareerKnowledge doc older than this is considered stale and gets
// regenerated from Gemini again (roadmap, salary, market trend, etc. drift
// over time even if the job role itself hasn't changed).
const OUTDATED_THRESHOLD_DAYS = 30;

// Every Sunday at 03:00 server time.
export function scheduleCareerKnowledgeRefresh() {
  cron.schedule("0 3 * * 0", async () => {
    console.log(`[career-knowledge-cron] refresh started at ${new Date().toISOString()}`);
    try {
      await careerKnowledgeService.checkAndRefreshOutdatedKnowledge(OUTDATED_THRESHOLD_DAYS);
      console.log("[career-knowledge-cron] refresh completed");
    } catch (error) {
      console.error("[career-knowledge-cron] refresh failed", error);
    }
  });
}
