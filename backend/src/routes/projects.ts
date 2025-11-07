import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import * as projectsController from '../controllers/projectsController';

const router = Router();

router.use(authenticate);

router.get('/', projectsController.list);
router.post('/', projectsController.create);
router.get('/:id', projectsController.getOne);

export default router;
