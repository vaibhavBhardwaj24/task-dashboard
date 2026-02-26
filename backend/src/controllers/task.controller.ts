import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/db';

interface AuthRequest extends Request {
    user?: { id: string };
}

const createTaskSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    status: z.enum(['pending', 'in-progress', 'completed']).optional(),
});

const updateTaskSchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    status: z.enum(['pending', 'in-progress', 'completed']).optional(),
});

export const getTasks = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user!.id;
        const { page = '1', limit = '10', status, search } = req.query;

        const pageNumber = parseInt(page as string, 10);
        const pageSize = parseInt(limit as string, 10);
        const skip = (pageNumber - 1) * pageSize;

        const whereClause: any = { userId };

        if (status) {
            whereClause.status = status as string;
        }

        if (search) {
            whereClause.title = { contains: search as string };
        }

        const tasks = await prisma.task.findMany({
            where: whereClause,
            skip,
            take: pageSize,
            orderBy: { createdAt: 'desc' },
        });

        const totalTasks = await prisma.task.count({ where: whereClause });

        res.json({
            tasks,
            pagination: {
                total: totalTasks,
                page: pageNumber,
                limit: pageSize,
                totalPages: Math.ceil(totalTasks / pageSize),
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getTaskById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user!.id;
        const { id } = req.params;

        const task = await prisma.task.findFirst({
            where: { id: id as string, userId },
        });

        if (!task) {
            res.status(404).json({ message: 'Task not found' });
            return;
        }

        res.json(task);
    } catch (error) {
        next(error);
    }
};

export const createTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user!.id;
        const data = createTaskSchema.parse(req.body);

        const task = await prisma.task.create({
            data: { ...data, userId },
        });

        res.status(201).json(task);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ message: 'Validation error', errors: error.flatten().fieldErrors });
            return;
        }
        next(error);
    }
};

export const updateTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user!.id;
        const { id } = req.params;
        const data = updateTaskSchema.parse(req.body);

        const task = await prisma.task.findFirst({ where: { id: id as string, userId } });
        if (!task) {
            res.status(404).json({ message: 'Task not found' });
            return;
        }

        const updatedTask = await prisma.task.update({
            where: { id: id as string },
            data,
        });

        res.json(updatedTask);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ message: 'Validation error', errors: error.flatten().fieldErrors });
            return;
        }
        next(error);
    }
};

export const deleteTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user!.id;
        const { id } = req.params;

        const task = await prisma.task.findFirst({ where: { id: id as string, userId } });
        if (!task) {
            res.status(404).json({ message: 'Task not found' });
            return;
        }

        await prisma.task.delete({ where: { id: id as string } });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const toggleTaskStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user!.id;
        const { id } = req.params;

        const task = await prisma.task.findFirst({ where: { id: id as string, userId } });
        if (!task) {
            res.status(404).json({ message: 'Task not found' });
            return;
        }

        const newStatus = task.status === 'completed' ? 'pending' : 'completed';

        const updatedTask = await prisma.task.update({
            where: { id: id as string },
            data: { status: newStatus },
        });

        res.json(updatedTask);
    } catch (error) {
        next(error);
    }
};
