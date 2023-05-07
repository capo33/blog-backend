import { Router } from "express";
import * as userController from "../controllers/AuthController";
import { auth } from "../middlewares/auth";

const router: Router = Router();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile", auth, userController.getProfile);
router.put("/update-profile", auth, userController.updateProfile);
router.put("/update-password", auth, userController.updatePassword);

export default router;
