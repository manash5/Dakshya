import { Router } from "express";
import { AdminJobRoleController } from "../../controllers/admin/jobRole.controller";
import { adminMiddleware, authorizedMiddleware } from "../../middleware/authorized.middleware";

const router = Router(); 
const adminJobRoleController = new AdminJobRoleController(); 

router.use(authorizedMiddleware, adminMiddleware); 

router.post('/', adminJobRoleController.createJobRole)
router.put('/:jobRoleId', adminJobRoleController.updateJobRole)
router.delete('/:jobRoleId', adminJobRoleController.deleteJobRole)
router.get('/', adminJobRoleController.getAllJobRolesPaginated)
router.get('/:jobRoleId', adminJobRoleController.getJobRoleById)

export default router; 