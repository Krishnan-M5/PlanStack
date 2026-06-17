const prisma = require('../config/db');

/**
 * @desc    Get all projects for the authenticated user (with search & filter)
 * @route   GET /api/projects?search=...&status=...
 * @access  Private
 */
const getProjects = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const userId = req.user.id;

    const whereClause = {
      userId, // Multi-tenant isolation: only the user's own projects
    };

    // Server-side text search on name and description
    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Status filter
    if (status) {
      whereClause.status = status;
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: { projects, count: projects.length },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single project by ID (owner validation enforced)
 * @route   GET /api/projects/:id
 * @access  Private
 */
const getProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = await prisma.project.findFirst({
      where: {
        id,
        userId, // Ensure the project belongs to the authenticated user
      },
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { tasks: true },
        },
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you do not have access to it.',
      });
    }

    res.status(200).json({
      success: true,
      data: { project },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new project
 * @route   POST /api/projects
 * @access  Private
 */
const createProject = async (req, res, next) => {
  try {
    const { name, description, status, startDate, endDate } = req.body;
    const userId = req.user.id;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        status: status || 'NOT_STARTED',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        userId,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully.',
      data: { project },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing project (owner validation enforced)
 * @route   PUT /api/projects/:id
 * @access  Private
 */
const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const existingProject = await prisma.project.findFirst({
      where: { id, userId },
    });

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you do not have access to it.',
      });
    }

    const updateData = {};
    const { name, description, status, startDate, endDate } = req.body;

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);

    const project = await prisma.project.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      message: 'Project updated successfully.',
      data: { project },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a project (owner validation enforced, cascades tasks)
 * @route   DELETE /api/projects/:id
 * @access  Private
 */
const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify ownership before deletion
    const existingProject = await prisma.project.findFirst({
      where: { id, userId },
    });

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you do not have access to it.',
      });
    }

    await prisma.project.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Project and all associated tasks deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProjects, getProject, createProject, updateProject, deleteProject };
