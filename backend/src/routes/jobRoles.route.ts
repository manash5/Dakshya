import { Router } from "express";
import { JobRoleController } from "../controllers/jobRole.controller";
import { authorizedMiddleware } from "../middleware/authorized.middleware";

const router = Router(); 
const jobRoleController = new JobRoleController(); 

router.use(authorizedMiddleware); 

router.get('/', jobRoleController.getJobRoles); 
router.get('/:jobRoleId', jobRoleController.getJobRoleById); 

export default router; 