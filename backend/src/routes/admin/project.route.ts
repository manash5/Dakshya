import { Router } from "express";
import { AdminProjectController } from "../../controllers/admin/project.controller";
import {
  adminMiddleware,
  authorizedMiddleware,
} from "../../middleware/authorized.middleware";

const router = Router();
const adminProjectController = new AdminProjectController();

router.use(authorizedMiddleware, adminMiddleware);

router.post("/", adminProjectController.createProject);
router.put("/:id", adminProjectController.updateProject);
router.delete("/:id", adminProjectController.deleteProject);

export default router;
