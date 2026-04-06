import express from "express"
import {
  createProjectController,
  deleteProjectController,
  getProject,
  getProjects,
} from "../controllers/projectController.js"
import { verifyToken } from "../middleware/authMiddleware.js"

const router = express.Router()

router.get("/", verifyToken, getProjects)
router.get("/:id", verifyToken, getProject)
router.post("/", verifyToken, createProjectController)
router.delete("/:id", verifyToken, deleteProjectController)

export default router
