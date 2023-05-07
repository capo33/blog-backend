import { Router } from "express";
import * as blogController from "../controllers/BlogControllers";
import { auth, admin } from "../middlewares/auth";
import upload from "../middlewares/multerMiddleware";

const router: Router = Router();

router.get("/", blogController.getBlogs);
router.get("/featured", blogController.getFeaturedBlogs);
router.get("/:id", blogController.getBlog);
router.post("/", auth, upload.single('file'), blogController.createBlog);
router.put("/:id", auth, upload.single("file"), blogController.updateBlog);

export default router;
