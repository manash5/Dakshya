import { UserController } from "../controllers/user.controller";
import { Router } from "express";
import { authorizedMiddleware } from '../middleware/authorize.middleware';



const userController = new UserController();
const router = Router();

router.post("/register", userController.createUser);
router.post("/login",  userController.loginUser); 

export default router;