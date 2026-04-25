import mongoose from 'mongoose';
import Project from '../models/Project.js';

const isValidId = (id) => mongoose.isValidObjectId(id);

export const createProject = async (req, res, next) => {
  try {
    // req.validated is already parsed & validated by middleware
    const { name, description } = req.validated;

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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const filter = {
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    };

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .populate('owner', 'name email')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      Project.countDocuments(filter),
    ]);

    return res.json({
      projects,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
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

    // req.validated contains only parsed & validated fields
    const { name, description } = req.validated;
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