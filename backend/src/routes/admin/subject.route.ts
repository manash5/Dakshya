import { Router } from "express";
import { AdminSubjectController } from "../../controllers/admin/subject.controller";
import { adminMiddleware, authorizedMiddleware } from "../../middleware/authorized.middleware";


const router = Router(); 
const adminSubjectController = new AdminSubjectController(); 

router.use(authorizedMiddleware, adminMiddleware); 

router.post('/', adminSubjectController.createSubject); 
router.put('/:subjectId', adminSubjectController.updateSubject); 
router.delete('/:subjectId', adminSubjectController.deleteSubject); 
router.get('/', adminSubjectController.getAllSubjectsPaginated); 
router.get('/:subjectId', adminSubjectController.getSubjectById); 


export default router; 