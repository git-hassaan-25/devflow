import mongoose from 'mongoose';
import Task from '../models/Task.js';
import Project from '../models/Project.js';

const isValidId = (id) => mongoose.isValidObjectId(id);

const userCanAccessProject = (project, userId) =>
  project.owner.equals(userId) || project.members.some((m) => m.equals(userId));

export const createTask = async (req, res, next) => {
  try {
    const { title, description, project: projectId, status, assignee, dueDate } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Task title is required' });
    }
    if (!isValidId(projectId)) {
      return res.status(400).json({ message: 'Valid project id is required' });
    }

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

    const { title, description, status, assignee, dueDate } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (assignee !== undefined) task.assignee = assignee || null;
    if (dueDate !== undefined) task.dueDate = dueDate || null;

    const updated = await task.save();
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
    return res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};
