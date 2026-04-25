import { Router } from 'express';
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { createTaskSchema, updateTaskSchema } from '../validators/schemas.js';

const router = Router();

router.use(protect);

router
  .route('/')
  .post(validate(createTaskSchema), createTask)
  .get(getTasks);

router
  .route('/:id')
  .get(getTask)
  .put(validate(updateTaskSchema), updateTask)
  .delete(deleteTask);

export default router;
