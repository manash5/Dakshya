import { Router } from "express";
import { SubjectController } from "../controllers/subject.controller";
import { authorizedMiddleware } from "../middleware/authorized.middleware";


const router = Router(); 
const subjectController = new SubjectController(); 

router.use(authorizedMiddleware)

router.get('/:subjectId', subjectController.getSubjectById); 

export default router; 