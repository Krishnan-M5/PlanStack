const express = require('express');
const router = express.Router();

// Middleware
const authenticate = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

// Controllers
const { register, login, googleLogin, getMe, logout } = require('../controllers/auth.controller');
const { getProjects, getProject, createProject, updateProject, deleteProject } = require('../controllers/project.controller');
const { getTasks, getTask, createTask, updateTask, deleteTask } = require('../controllers/task.controller');
const { getDashboardStats } = require('../controllers/dashboard.controller');

// Validation Schemas
const { registerSchema, loginSchema } = require('../validations/auth.validation');
const { createProjectSchema, updateProjectSchema, projectQuerySchema } = require('../validations/project.validation');
const { createTaskSchema, updateTaskSchema, taskQuerySchema } = require('../validations/task.validation');

// ─── Auth Routes (Public) ───────────────────────────────────────────────────

router.post('/auth/register', validate(registerSchema), register);
router.post('/auth/login', validate(loginSchema), login);
router.post('/auth/logout', authenticate, logout);
router.post('/auth/google', googleLogin);
router.get('/auth/me', authenticate, getMe);

// ─── Dashboard Routes (Private) ─────────────────────────────────────────────

router.get('/dashboard', authenticate, getDashboardStats);

// ─── Project Routes (Private) ───────────────────────────────────────────────

router.get('/projects', authenticate, validate(projectQuerySchema, 'query'), getProjects);
router.get('/projects/:id', authenticate, getProject);
router.post('/projects', authenticate, validate(createProjectSchema), createProject);
router.put('/projects/:id', authenticate, validate(updateProjectSchema), updateProject);
router.delete('/projects/:id', authenticate, deleteProject);

// ─── Task Routes (Private) ──────────────────────────────────────────────────

router.get('/tasks', authenticate, validate(taskQuerySchema, 'query'), getTasks);
router.get('/tasks/:id', authenticate, getTask);
router.post('/tasks', authenticate, validate(createTaskSchema), createTask);
router.put('/tasks/:id', authenticate, validate(updateTaskSchema), updateTask);
router.delete('/tasks/:id', authenticate, deleteTask);

module.exports = router;
