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

router.post(
  "/refresh",
  authorizedMiddleware,
  controller.refreshProgress.bind(controller),
);

router.get(
  "/roadmap/:jobRoleId",
  authorizedMiddleware,
  controller.getRoadmapProgress.bind(controller),
);

router.post(
  "/roadmap/:jobRoleId/visit",
  authorizedMiddleware,
  controller.touchRoadmapVisit.bind(controller),
);

export default router;