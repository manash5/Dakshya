import { Router } from "express";
import { JobPostingController } from "../controllers/jobPosting.controller";
import { authorizedMiddleware } from "../middleware/authorized.middleware";

const router = Router();
const jobPostingController = new JobPostingController();

router.use(authorizedMiddleware);

router.get('/', jobPostingController.getJobPostings);
router.get('/:id', jobPostingController.getJobPostingById);

export default router;
