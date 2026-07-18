import { Router } from "express";
import { AdminJobPostingController } from "../../controllers/admin/jobPosting.controller";
import { adminMiddleware, authorizedMiddleware } from "../../middleware/authorized.middleware";

const router = Router();
const adminJobPostingController = new AdminJobPostingController();

router.use(authorizedMiddleware, adminMiddleware);

router.post('/scrape', adminJobPostingController.scrapeJobPostings);
router.put('/:id', adminJobPostingController.updateJobPosting);
router.delete('/:id', adminJobPostingController.deleteJobPosting);

export default router;
