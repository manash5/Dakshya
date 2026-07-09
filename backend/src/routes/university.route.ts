import { Router } from "express";
import { UniversityControllers } from "../controllers/university.controller";
import { authorizedMiddleware } from "../middleware/authorized.middleware";


const universityController = new UniversityControllers(); 
const router = Router();

router.use(authorizedMiddleware); 

router.get('/', universityController.getUniversities)

router.get('/:universityId', universityController.getUniversityById);

export default router; 