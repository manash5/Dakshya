import { UserController } from "../controllers/user.controller";
import { Router } from "express";
import { authorizedMiddleware } from '../middleware/authorized.middleware';
import { uploads } from "../middleware/upload.middleware";



const userController = new UserController();
const router = Router();

router.post("/register", userController.createUser);
router.post("/login",  userController.loginUser); 

router.put(
    "/update",
    authorizedMiddleware, 
    uploads.single("profilePicture"), 
    userController.updateUser
);

router.get("/whoami", 
    authorizedMiddleware, 
    userController.whoami
);

router.get(
    "/getProfile",
    authorizedMiddleware, 
    userController.getUser
);

router.put("/change-password", authorizedMiddleware, userController.changePassword);

export default router;