import { Router } from "express";
import { ProjectController } from "../controllers/project.controller";
import { authorizedMiddleware } from "../middleware/authorized.middleware";

const router = Router();
const projectController = new ProjectController();

router.use(authorizedMiddleware);

router.get("/", projectController.getProjects);
router.get("/:id", projectController.getProjectById);

export default router;
