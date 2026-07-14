import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller";
import { authorizedMiddleware } from "../middleware/authorized.middleware";

const router = Router();
const controller = new DashboardController();

router.use(authorizedMiddleware);

router.get("/career", controller.getCareerDashboard.bind(controller));

export default router;
