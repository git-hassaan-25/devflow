import mongoose from 'mongoose';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { emitToProject } from '../socket.js';

const isValidId = (id) => mongoose.isValidObjectId(id);

const userCanAccessProject = (project, userId) =>
  project.owner.equals(userId) || project.members.some((m) => m.equals(userId));

export const createTask = async (req, res, next) => {
  try {
    // req.validated is already parsed & validated by middleware
    const { title, description, project: projectId, status, assignee, dueDate } = req.validated;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (!userCanAccessProject(project, req.user._id)) {
      return res.status(403).json({ message: 'Forbidden: not a member of this project' });
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      status,
      assignee: assignee || null,
      dueDate: dueDate || null,
      createdBy: req.user._id,
    });

    emitToProject(projectId, 'task:created', task);
    return res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

export const getTasks = async (req, res, next) => {
  try {
    const { project: projectId } = req.query;

    if (!isValidId(projectId)) {
      return res.status(400).json({ message: 'Valid ?project=<id> query param is required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (!userCanAccessProject(project, req.user._id)) {
      return res.status(403).json({ message: 'Forbidden: not a member of this project' });
    }

    const tasks = await Task.find({ project: projectId })
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: 1 });

    return res.json(tasks);
  } catch (err) {
    next(err);
  }
};

export const getTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid task id' });
    }

    const task = await Task.findById(id)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    if (!project || !userCanAccessProject(project, req.user._id)) {
      return res.status(403).json({ message: 'Forbidden: not a member of this project' });
    }

    return res.json(task);
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid task id' });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    if (!project || !userCanAccessProject(project, req.user._id)) {
      return res.status(403).json({ message: 'Forbidden: not a member of this project' });
    }

    // req.validated contains only parsed & validated fields
    const { title, description, status, assignee, dueDate } = req.validated;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (assignee !== undefined) task.assignee = assignee || null;
    if (dueDate !== undefined) task.dueDate = dueDate || null;

    const updated = await task.save();
    emitToProject(task.project.toString(), 'task:updated', updated);
    return res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid task id' });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    if (!project || !userCanAccessProject(project, req.user._id)) {
      return res.status(403).json({ message: 'Forbidden: not a member of this project' });
    }

    await task.deleteOne();
    emitToProject(task.project.toString(), 'task:deleted', { _id: id });
    return res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};
