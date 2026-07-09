import { Router } from "express";
import { UniversityControllers } from "../controllers/university.controller";
import { authorizedMiddleware } from "../middleware/authorized.middleware";
import { CourseController } from "../controllers/course.controller";


const universityController = new UniversityControllers(); 
const courseController = new CourseController(); 
const router = Router();

router.use(authorizedMiddleware); 

router.get('/', universityController.getUniversities)

router.get('/:universityId', universityController.getUniversityById);

router.get('/:universityId/courses', courseController.getCoursesByUniversity)

export default router; 