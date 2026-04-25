import { Router } from 'express';
import {
  createProject,
  getMyProjects,
  getProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router
  .route('/')
  .post(createProject)
  .get(getMyProjects);

router
  .route('/:id')
  .get(getProject)
  .put(updateProject)
  .get(deleteProject);

export default router;