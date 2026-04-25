import { z } from 'zod';

/**
 * Auth Schemas
 * Validate user registration and login requests
 */
export const registerSchema = z.object({
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must not exceed 50 characters')
        .trim(),
    email: z
        .string()
        .email('Please provide a valid email')
        .toLowerCase()
        .trim(),
    password: z
        .string()
        .min(6, 'Password must be at least 6 characters')
        .max(100, 'Password must not exceed 100 characters'),
});

export const loginSchema = z.object({
    email: z
        .string()
        .email('Please provide a valid email')
        .toLowerCase()
        .trim(),
    password: z
        .string()
        .min(1, 'Password is required'),
});

/**
 * Project Schemas
 * Validate project creation and updates
 */
export const createProjectSchema = z.object({
    name: z
        .string()
        .min(1, 'Project name is required')
        .max(100, 'Project name must not exceed 100 characters')
        .trim(),
    description: z
        .string()
        .max(1000, 'Description must not exceed 1000 characters')
        .trim()
        .optional()
        .default(''),
});

export const updateProjectSchema = z.object({
    name: z
        .string()
        .min(1, 'Project name must not be empty')
        .max(100, 'Project name must not exceed 100 characters')
        .trim()
        .optional(),
    description: z
        .string()
        .max(1000, 'Description must not exceed 1000 characters')
        .trim()
        .optional(),
});

/**
 * Task Schemas
 * Validate task creation and updates
 */
export const createTaskSchema = z.object({
    title: z
        .string()
        .min(1, 'Task title is required')
        .max(200, 'Task title must not exceed 200 characters')
        .trim(),
    description: z
        .string()
        .max(2000, 'Description must not exceed 2000 characters')
        .trim()
        .optional()
        .default(''),
    project: z
        .string()
        .regex(/^[a-f0-9]{24}$/, 'Project ID must be a valid MongoDB ObjectId'),
    status: z
        .enum(['todo', 'in-progress', 'done'])
        .optional()
        .default('todo'),
    assignee: z
        .string()
        .regex(/^[a-f0-9]{24}$/, 'Assignee ID must be a valid MongoDB ObjectId')
        .optional()
        .nullable(),
    dueDate: z
        .string()
        .datetime()
        .optional()
        .nullable(),
});

export const updateTaskSchema = z.object({
    title: z
        .string()
        .min(1, 'Task title must not be empty')
        .max(200, 'Task title must not exceed 200 characters')
        .trim()
        .optional(),
    description: z
        .string()
        .max(2000, 'Description must not exceed 2000 characters')
        .trim()
        .optional(),
    status: z
        .enum(['todo', 'in-progress', 'done'])
        .optional(),
    assignee: z
        .string()
        .regex(/^[a-f0-9]{24}$/, 'Assignee ID must be a valid MongoDB ObjectId')
        .optional()
        .nullable(),
    dueDate: z
        .string()
        .datetime()
        .optional()
        .nullable(),
});
