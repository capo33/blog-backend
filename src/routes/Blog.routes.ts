import { Router } from "express";

import { auth } from "../middlewares/auth";
import upload from "../middlewares/multerMiddleware";
import * as blogController from "../controllers/BlogControllers";

const router: Router = Router();

router.get("/search", blogController.getBlogsBySearch);
router.get("/featured", blogController.getFeaturedBlogs);
router.get("/related", blogController.getRelatedBlogs);
router.get("/tag/:tag", blogController.getBlogsByTag);
router.get("/", blogController.getBlogs);
router.get("/:id", blogController.getBlog);

router.post("/", auth, upload.single("file"), blogController.createBlog);
router.put("/:id", auth, upload.single("file"), blogController.updateBlog);
router.patch("/like/:id", auth, blogController.likeBlog);
router.delete("/:id", auth, blogController.deleteBlog);

export default router;
