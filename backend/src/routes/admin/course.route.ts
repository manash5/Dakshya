import { Router } from "express";
import { AdminCourseController } from "../../controllers/admin/course.controller";
import { adminMiddleware, authorizedMiddleware } from "../../middleware/authorized.middleware";
import { AdminSubjectController } from '../../controllers/admin/subject.controller';

const router = Router(); 
const adminCourseController = new AdminCourseController(); 
const adminSubjectController = new AdminSubjectController(); 

router.use(authorizedMiddleware, adminMiddleware); 

router.post('/', adminCourseController.createCourse)
router.put('/:courseId', adminCourseController.updateCourse)
router.delete('/:courseId', adminCourseController.deleteCourse)
router.get('/', adminCourseController.getAllCoursesPaginated)
router.get('/:courseId', adminCourseController.getCourseById); 
router.get('/:courseId/subjects', adminSubjectController.getSubjectsByCourse)


export default router; 