import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { connectDB } from '../config/db.js';

const seed = async () => {
    try {
        await connectDB();
        console.log('✓ Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Project.deleteMany({});
        await Task.deleteMany({});
        console.log('✓ Cleared existing data');

        // Create demo user
        const user = await User.create({
            name: 'Demo User',
            email: 'demo@devflow.local',
            password: 'demo123456',
        });
        console.log(`✓ Created user: ${user.email}`);

        // Create demo project
        const project = await Project.create({
            name: 'DevFlow MVP',
            description: 'Building a Kanban board for task management',
            owner: user._id,
            members: [user._id],
        });
        console.log(`✓ Created project: ${project.name}`);

        // Create demo tasks
        const tasks = [
            { title: 'Set up DB connection', status: 'done' },
            { title: 'Implement auth system', status: 'done' },
            { title: 'Build Projects API', status: 'in-progress' },
            { title: 'Create Kanban frontend', status: 'todo' },
            { title: 'Add drag-and-drop', status: 'todo' },
        ];

        for (const taskData of tasks) {
            await Task.create({
                ...taskData,
                project: project._id,
                createdBy: user._id,
            });
        }
        console.log(`✓ Created ${tasks.length} demo tasks`);

        console.log('\n🌱 Seed completed successfully!');
        console.log(`   Login: demo@devflow.local / demo123456`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed failed:', err.message);
        process.exit(1);
    }
};

seed();
