import { Router } from "express";
import { CourseController } from "../controllers/course.controller";
import { authorizedMiddleware } from "../middleware/authorized.middleware";
import { SubjectController } from '../controllers/subject.controller';

const router = Router(); 
const courseController = new CourseController(); 
const subjectController = new SubjectController(); 

router.use(authorizedMiddleware); 

router.get('/:courseId', courseController.getCourseById); 

router.get('/:courseId/subjects', subjectController.getSubjectsByCourse)

export default router; 