const prisma = require('../config/db');

/**
 * @desc    Get dashboard statistics for the authenticated user
 * @route   GET /api/dashboard
 * @access  Private
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Run all aggregation queries in parallel for performance
    const [
      totalProjects,
      projectsInProgress,
      completedProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      recentProjects,
      recentTasks,
    ] = await Promise.all([
      // Total projects for the user
      prisma.project.count({
        where: { userId },
      }),

      // Projects in progress
      prisma.project.count({
        where: { userId, status: 'IN_PROGRESS' },
      }),

      // Completed projects
      prisma.project.count({
        where: { userId, status: 'COMPLETED' },
      }),

      // Total tasks across all user's projects
      prisma.task.count({
        where: { project: { userId } },
      }),

      // Completed tasks
      prisma.task.count({
        where: { project: { userId }, status: 'COMPLETED' },
      }),

      // Pending tasks
      prisma.task.count({
        where: { project: { userId }, status: 'PENDING' },
      }),

      // In-progress tasks
      prisma.task.count({
        where: { project: { userId }, status: 'IN_PROGRESS' },
      }),

      // 5 most recent projects
      prisma.project.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          _count: { select: { tasks: true } },
        },
      }),

      // 5 most recent tasks
      prisma.task.findMany({
        where: { project: { userId } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          project: { select: { id: true, name: true } },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalProjects,
          projectsInProgress,
          completedProjects,
          totalTasks,
          completedTasks,
          pendingTasks,
          inProgressTasks,
        },
        recentProjects,
        recentTasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };
