import { Router } from "express";
import { PracticeAttemptController } from "../controllers/practiceAttempt.controller";
import { authorizedMiddleware } from "../middleware/authorized.middleware";
import { audioUpload } from "../middleware/upload.middleware";

const router = Router();
const practiceAttemptController = new PracticeAttemptController();

router.use(authorizedMiddleware);

router.post("/", practiceAttemptController.startAttempt);
router.post("/transcribe", audioUpload, practiceAttemptController.transcribe);
router.get("/", practiceAttemptController.getHistory);
router.get("/:id", practiceAttemptController.getById);
router.put("/:id/answer", practiceAttemptController.submitAnswer);
router.put("/:id/complete", practiceAttemptController.completeAttempt);
router.delete("/:id", practiceAttemptController.deleteAttempt);

export default router;
