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

router.post(
    "/onboarding",
    authorizedMiddleware,
    userController.completeOnboarding
);

router.post("/register-email", userController.registerWithEmail); 
router.post("/login", userController.loginUser);

router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);

router.post("/google", userController.googleLogin);

export default router;