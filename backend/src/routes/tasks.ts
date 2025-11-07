import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import * as tasksController from '../controllers/tasksController';

const router = Router();
router.use(authenticate);

router.post('/', tasksController.create);
router.put('/:id', tasksController.update);
router.put('/:id/move', tasksController.move);

export default router;
