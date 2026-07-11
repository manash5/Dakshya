import { Router } from "express";
import { AdminCareerKnowledgeController } from "../../controllers/admin/careerKnowledge.controller";
import { adminMiddleware, authorizedMiddleware } from "../../middleware/authorized.middleware";


const router = Router(); 
const adminCareerKnowledgeController = new AdminCareerKnowledgeController(); 

router.use(authorizedMiddleware, adminMiddleware); 

router.post('/:jobRoleId', adminCareerKnowledgeController.generateCareerKnowledge); 
router.put('/:jobRoleId', adminCareerKnowledgeController.regenerateCareerKnowledge); 
router.delete('/:jobRoleId', adminCareerKnowledgeController.deleteCareerKnowledge); 
router.get('/', adminCareerKnowledgeController.getPaginatedDashboardList); 
router.get('/:id', adminCareerKnowledgeController.getSingleCareerKnowledge); 

export default router; 