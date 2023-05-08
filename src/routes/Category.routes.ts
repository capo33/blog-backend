import { Router } from "express";

import { auth ,admin} from "../middlewares/auth";
 import * as categoryController from "../controllers/CategoryController";

const router: Router = Router();

router.get("/", categoryController.getCategories);
router.get("/:slug", categoryController.getCategory);
router.post("/", auth, admin, categoryController.createCategory);
router.put("/:id", auth, admin, categoryController.updateCategory);
router.delete("/:id", auth, admin, categoryController.deleteCategory);

export default router;