import { Router } from "express";
import * as userController from "../controllers/AuthController";
import { auth, admin } from "../middlewares/auth";

const router: Router = Router();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile", auth, userController.getProfile);
router.get("/users", auth, userController.getUsers);
router.put("/update-profile", auth, admin, userController.updateProfile);
router.put("/update-password", auth, userController.updatePassword);
router.delete("/user", auth, userController.deleteUserByUser);
router.delete("/user/:id", auth, admin, userController.deleteUserByAdmin);

export default router;
