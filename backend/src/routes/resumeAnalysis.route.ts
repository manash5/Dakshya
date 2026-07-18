import { Router } from "express";
import { ResumeAnalysisController } from "../controllers/resumeAnalysis.controller";
import { authorizedMiddleware } from "../middleware/authorized.middleware";
import { resumeUpload } from "../middleware/upload.middleware";

const router = Router();
const resumeAnalysisController = new ResumeAnalysisController();

router.use(authorizedMiddleware);

router.post("/", resumeUpload, resumeAnalysisController.analyze);
router.get("/", resumeAnalysisController.getHistory);
router.get("/latest", resumeAnalysisController.getLatest);
router.get("/:id", resumeAnalysisController.getById);
router.delete("/:id", resumeAnalysisController.delete);

export default router;
