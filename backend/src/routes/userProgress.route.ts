import { Router } from "express";
import { UserProgressController } from "../controllers/userProgress.controller";
import { authorizedMiddleware } from "../middleware/authorized.middleware";


const router = Router();

const controller =
  new UserProgressController();

/**
 * User Progress
 */

router.get(
  "/",
  authorizedMiddleware,
  controller.getUserProgress.bind(controller),
);

export default router;