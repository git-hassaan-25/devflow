import mongoose from 'mongoose';
import Project from '../models/Project.js';

const isValidId = (id) => mongoose.isValidObjectId(id);

export const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      members: [],
    });

    return res.status(201).json(project);
  } catch (err) {
    next(err);
  }
};

export const getMyProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    })
      .populate('owner', 'name email')
      .sort({ updatedAt: -1 });

    return res.json(projects);
  } catch (err) {
    next(err);
  }
};

export const getProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid project id' });
    }

    const project = await Project.findById(id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isOwner = project.owner._id.equals(req.user._id);
    const isMember = project.members.some((m) => m._id.equals(req.user._id));
    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'Forbidden: not a member of this project' });
    }

    return res.json(project);
  } catch (err) {
    next(err);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid project id' });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!project.owner.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden: only the owner can update' });
    }

    const { name, description } = req.body;
    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;

    const updated = await project.save();
    return res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid project id' });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!project.owner.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden: only the owner can delete' });
    }

    await project.deleteOne();
    return res.json({ message: 'Project deleted' });
  } catch (err) {
    next(err);
  }
};