import { Router } from "express";
import { SkillPlannerController } from "../controllers/skillPlanner.controller";
import { authorizedMiddleware } from "../middleware/authorized.middleware";

const router = Router();
const controller = new SkillPlannerController();

router.use(authorizedMiddleware);

router.get("/:jobRoleId", controller.getSkillPlanner.bind(controller));

export default router;
