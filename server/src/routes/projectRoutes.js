import { Router } from 'express';
import {
  createProject,
  getMyProjects,
  getProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { createProjectSchema, updateProjectSchema } from '../validators/schemas.js';

const router = Router();

router.use(protect);

router
  .route('/')
  .post(validate(createProjectSchema), createProject)
  .get(getMyProjects);

router
  .route('/:id')
  .get(getProject)
  .put(validate(updateProjectSchema), updateProject)
  .delete(deleteProject);

export default router;