import { Router } from "express";
import { AdminUniversityController } from "../../controllers/admin/university.controller";
import { adminMiddleware, authorizedMiddleware } from "../../middleware/authorized.middleware";


const adminUniversityController = new AdminUniversityController(); 
const router =  Router(); 

router.use(authorizedMiddleware, adminMiddleware); 

router.post('/', adminUniversityController.createUniversity)
router.put('/:universityId', adminUniversityController.updateUniversity)
router.delete('/:universityId', adminUniversityController.deleteUniversity)
router.get('/', adminUniversityController.getAllUniversitiesPaginated)
router.get('/:universityId', adminUniversityController.getUniversitiesById)

export default router; 