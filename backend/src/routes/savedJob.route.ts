import { Router } from "express";
import { SavedJobController } from "../controllers/savedJob.controller";
import { authorizedMiddleware } from "../middleware/authorized.middleware";

const router = Router();
const savedJobController = new SavedJobController();

router.use(authorizedMiddleware);

router.post("/", savedJobController.saveJob);
router.get("/", savedJobController.getSavedJobs);
router.delete("/:jobPostingId", savedJobController.unsaveJob);

export default router;
