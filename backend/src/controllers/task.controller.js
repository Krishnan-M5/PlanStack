const prisma = require('../config/db');

/**
 * Helper: Verifies that a project belongs to the authenticated user.
 * Returns the project if valid, or null if not found / not owned.
 */
const verifyProjectOwnership = async (projectId, userId) => {
  return prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
    },
    select: { id: true },
  });
};

/**
 * @desc    Get all tasks for the authenticated user (with search, filter by status/priority/project)
 * @route   GET /api/tasks?search=...&status=...&priority=...&projectId=...
 * @access  Private
 */
const getTasks = async (req, res, next) => {
  try {
    const { search, status, priority, projectId } = req.query;
    const userId = req.user.id;

    const whereClause = {
      project: {
        userId, // Multi-tenant: only tasks belonging to user's projects
      },
    };

    // Filter by specific project
    if (projectId) {
      whereClause.projectId = projectId;
    }

    // Server-side text search
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

    // Priority filter
    if (priority) {
      whereClause.priority = priority;
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        project: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: { tasks, count: tasks.length },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single task by ID (validates ownership through project)
 * @route   GET /api/tasks/:id
 * @access  Private
 */
const getTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const task = await prisma.task.findFirst({
      where: {
        id,
        project: {
          userId, // Ensure the task's project belongs to the user
        },
      },
      include: {
        project: {
          select: { id: true, name: true },
        },
      },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or you do not have access to it.',
      });
    }

    res.status(200).json({
      success: true,
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new task (validates project ownership)
 * @route   POST /api/tasks
 * @access  Private
 */
const createTask = async (req, res, next) => {
  try {
    const { name, description, priority, status, dueDate, projectId } = req.body;
    const userId = req.user.id;

    // Verify that the target project belongs to the authenticated user
    const project = await verifyProjectOwnership(projectId, userId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you do not have access to it. Cannot create task.',
      });
    }

    const task = await prisma.task.create({
      data: {
        name,
        description,
        priority: priority || 'MEDIUM',
        status: status || 'PENDING',
        dueDate: new Date(dueDate),
        projectId,
      },
      include: {
        project: {
          select: { id: true, name: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a task (validates ownership through project)
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify the task exists and belongs to a project owned by the user
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        project: {
          userId,
        },
      },
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or you do not have access to it.',
      });
    }

    const updateData = {};
    const { name, description, priority, status, dueDate } = req.body;

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) updateData.status = status;
    if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        project: {
          select: { id: true, name: true },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a task (validates ownership through project)
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify the task exists and belongs to a project owned by the user
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        project: {
          userId,
        },
      },
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or you do not have access to it.',
      });
    }

    await prisma.task.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask };
