import { Router } from 'express';
import * as ctrl from '../controllers/task.controller';
import { validate } from '../middleware/validate.middleware';
import { requireAuth } from '../middleware/auth.middleware';
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdParamSchema,
} from '../schemas/task.schema';

const router = Router();

// All task routes require authentication
router.use(requireAuth);

router.get('/', ctrl.getTasks);
router.post('/', validate(createTaskSchema), ctrl.createTask);
router.get('/:id', validate(taskIdParamSchema), ctrl.getTask);
router.patch('/:id', validate(updateTaskSchema), ctrl.updateTask);
router.delete('/:id', validate(taskIdParamSchema), ctrl.deleteTask);
router.patch('/:id/toggle', validate(taskIdParamSchema), ctrl.toggleTask);

export default router;
