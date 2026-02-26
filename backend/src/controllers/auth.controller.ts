import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/db';

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

const generateAccessToken = (userId: string) => {
    return jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET as string, { expiresIn: '15m' });
};

const generateRefreshToken = (userId: string) => {
    return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '7d' });
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = registerSchema.parse(req.body);

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: { email, password: hashedPassword },
        });

        res.status(201).json({ message: 'User registered successfully', userId: user.id });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ message: 'Validation error', errors: error.flatten().fieldErrors });
            return;
        }
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        await prisma.refreshToken.create({
            data: { token: refreshToken, userId: user.id },
        });

        res.json({ accessToken, refreshToken });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ message: 'Validation error', errors: error.flatten().fieldErrors });
            return;
        }
        next(error);
    }
};

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { token } = req.body;
        if (!token) {
            res.status(400).json({ message: 'Refresh token is required' });
            return;
        }

        const storedToken = await prisma.refreshToken.findUnique({ where: { token } });
        if (!storedToken) {
            res.status(401).json({ message: 'Invalid refresh token' });
            return;
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as { id: string };
            const accessToken = generateAccessToken(decoded.id);
            res.json({ accessToken });
        } catch (error) {
            // If token expired or invalid, remove it from DB
            await prisma.refreshToken.delete({ where: { token } });
            res.status(401).json({ message: 'Invalid or expired refresh token' });
            return;
        }
    } catch (error) {
        next(error);
    }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { token } = req.body;
        if (!token) {
            res.status(400).json({ message: 'Refresh token is required' });
            return; // Required here
        }

        await prisma.refreshToken.deleteMany({ where: { token } });
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
};
