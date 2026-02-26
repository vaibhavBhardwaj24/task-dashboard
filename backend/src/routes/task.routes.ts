import express from 'express';
import { getTasks, getTaskById, createTask, updateTask, deleteTask, toggleTaskStatus } from '../controllers/task.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

router.use(authenticate);

router.get('/', getTasks);
router.post('/', createTask);
router.get('/:id', getTaskById);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/toggle', toggleTaskStatus);

export default router;
