import { scheduleJobPostingRefresh } from "./jobPosting.cron";
import { scheduleCareerKnowledgeRefresh } from "./careerKnowledge.cron";
import { scheduleOpportunityRefresh } from "./opportunity.cron";

// Single place to register every scheduled job — call this once from the
// entry point after the DB connection is up. Add new cron/*.ts files here
// as more "re-run this periodically" needs come up.
export function registerCronJobs() {
  scheduleJobPostingRefresh();
  scheduleCareerKnowledgeRefresh();
  scheduleOpportunityRefresh();
}
