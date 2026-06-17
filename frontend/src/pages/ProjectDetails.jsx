import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import Spinner, { PageLoader } from '../components/Spinner';
import {
  ArrowLeft,
  Plus,
  Calendar,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  ListTodo,
  Flag,
} from 'lucide-react';

const statusColors = {
  NOT_STARTED: 'bg-surface-500/10 text-surface-400 border-surface-500/20',
  IN_PROGRESS: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  PENDING: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

const priorityColors = {
  LOW: 'bg-surface-500/10 text-surface-400 border-surface-500/20',
  MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  HIGH: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const priorityIcons = {
  LOW: Clock,
  MEDIUM: AlertCircle,
  HIGH: Flag,
};

const emptyTaskForm = {
  name: '',
  description: '',
  priority: 'MEDIUM',
  status: 'PENDING',
  dueDate: '',
};

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Task modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [taskForm, setTaskForm] = useState(emptyTaskForm);
  const [taskErrors, setTaskErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete state
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Task filter state
  const [taskStatusFilter, setTaskStatusFilter] = useState('');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState('');

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await API.get(`/projects/${id}`);
      setProject(response.data.data.project);
    } catch (error) {
      toast.error('Failed to load project details.');
      navigate('/projects');
    } finally {
      setIsLoading(false);
    }
  };

  const validateTaskForm = () => {
    const errors = {};
    if (!taskForm.name.trim()) errors.name = 'Task name is required.';
    if (!taskForm.description.trim()) errors.description = 'Description is required.';
    if (!taskForm.dueDate) errors.dueDate = 'Due date is required.';
    setTaskErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateTask = () => {
    setTaskForm(emptyTaskForm);
    setTaskErrors({});
    setIsEditingTask(false);
    setEditingTaskId(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task) => {
    setTaskForm({
      name: task.name,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    });
    setTaskErrors({});
    setIsEditingTask(true);
    setEditingTaskId(task.id);
    setIsTaskModalOpen(true);
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (!validateTaskForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...taskForm,
        dueDate: new Date(taskForm.dueDate).toISOString(),
        projectId: id,
      };

      if (isEditingTask) {
        const { projectId, ...updatePayload } = payload;
        await API.put(`/tasks/${editingTaskId}`, updatePayload);
        toast.success('Task updated successfully.');
      } else {
        await API.post('/tasks', payload);
        toast.success('Task created successfully.');
      }

      setIsTaskModalOpen(false);
      fetchProject();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.map((e) => e.message).join(', ') ||
        'Operation failed.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!deleteTaskId) return;
    setIsDeleting(true);
    try {
      await API.delete(`/tasks/${deleteTaskId}`);
      toast.success('Task deleted successfully.');
      setDeleteTaskId(null);
      fetchProject();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete task.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleQuickStatusChange = async (taskId, newStatus) => {
    try {
      await API.put(`/tasks/${taskId}`, { status: newStatus });
      toast.success('Task status updated.');
      fetchProject();
    } catch (error) {
      toast.error('Failed to update task status.');
    }
  };

  if (isLoading) return <PageLoader />;
  if (!project) return null;

  // Filter tasks locally on client
  const filteredTasks = (project.tasks || []).filter((task) => {
    if (taskStatusFilter && task.status !== taskStatusFilter) return false;
    if (taskPriorityFilter && task.priority !== taskPriorityFilter) return false;
    return true;
  });

  const completedCount = project.tasks?.filter((t) => t.status === 'COMPLETED').length || 0;
  const totalTasks = project.tasks?.length || 0;
  const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back Link */}
      <Link
        to="/projects"
        className="inline-flex items-center gap-2 text-sm text-surface-400 hover:text-primary-400 transition-colors animate-fade-in"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </Link>

      {/* Project Info Card */}
      <div className="glass-card p-6 animate-slide-up">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">{project.name}</h1>
              <span className={`badge text-[10px] border ${statusColors[project.status]}`}>
                {project.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-surface-400 mb-4">{project.description}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-surface-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(project.startDate).toLocaleDateString()} – {new Date(project.endDate).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1.5">
                <ListTodo className="w-4 h-4" />
                {totalTasks} tasks
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {completedCount} completed
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {totalTasks > 0 && (
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs text-surface-400 mb-2">
              <span>Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-surface-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tasks Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg font-semibold text-surface-100">Tasks</h2>
          <div className="flex items-center gap-3 flex-wrap">
            <select
              className="select-field text-sm py-2 px-3 min-w-[140px]"
              value={taskStatusFilter}
              onChange={(e) => setTaskStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <select
              className="select-field text-sm py-2 px-3 min-w-[140px]"
              value={taskPriorityFilter}
              onChange={(e) => setTaskPriorityFilter(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
            <button onClick={handleCreateTask} className="btn-primary text-sm py-2 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </div>
        </div>

        {/* Task List */}
        {filteredTasks.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <ListTodo className="w-12 h-12 text-surface-600 mx-auto mb-3" />
            <h3 className="text-surface-300 font-medium mb-1">
              {totalTasks === 0 ? 'No tasks yet' : 'No tasks match the filters'}
            </h3>
            <p className="text-surface-500 text-sm">
              {totalTasks === 0 ? 'Add your first task to start tracking progress.' : 'Try adjusting the filters.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task, index) => {
              const PriorityIcon = priorityIcons[task.priority];
              return (
                <div
                  key={task.id}
                  className="glass-card-hover p-4 flex flex-col sm:flex-row sm:items-center gap-3 animate-slide-up"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  {/* Quick status toggle */}
                  <button
                    onClick={() =>
                      handleQuickStatusChange(
                        task.id,
                        task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
                      )
                    }
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                      task.status === 'COMPLETED'
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-surface-500 hover:border-primary-400'
                    }`}
                    title={task.status === 'COMPLETED' ? 'Mark as pending' : 'Mark as completed'}
                  >
                    {task.status === 'COMPLETED' && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </button>

                  {/* Task Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${task.status === 'COMPLETED' ? 'text-surface-500 line-through' : 'text-surface-200'}`}>
                      {task.name}
                    </p>
                    <p className="text-xs text-surface-500 mt-0.5 line-clamp-1">{task.description}</p>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                    <span className={`badge text-[10px] border ${statusColors[task.status]}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                    <span className={`badge text-[10px] border flex items-center gap-1 ${priorityColors[task.priority]}`}>
                      <PriorityIcon className="w-3 h-3" />
                      {task.priority}
                    </span>
                    <span className="text-xs text-surface-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleEditTask(task)}
                      className="p-2 rounded-lg text-surface-400 hover:text-primary-400 hover:bg-primary-500/10 transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTaskId(task.id)}
                      className="p-2 rounded-lg text-surface-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Task Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title={isEditingTask ? 'Edit Task' : 'Create New Task'}
      >
        <form onSubmit={handleSubmitTask} className="space-y-4">
          <div>
            <label htmlFor="task-name" className="label-text">Task Name</label>
            <input
              id="task-name"
              type="text"
              className={`input-field ${taskErrors.name ? 'border-red-500/50' : ''}`}
              placeholder="Enter task name"
              value={taskForm.name}
              onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })}
            />
            {taskErrors.name && <p className="text-red-400 text-xs mt-1">{taskErrors.name}</p>}
          </div>

          <div>
            <label htmlFor="task-description" className="label-text">Description</label>
            <textarea
              id="task-description"
              rows={3}
              className={`input-field resize-none ${taskErrors.description ? 'border-red-500/50' : ''}`}
              placeholder="Describe the task"
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
            />
            {taskErrors.description && <p className="text-red-400 text-xs mt-1">{taskErrors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-priority" className="label-text">Priority</label>
              <select
                id="task-priority"
                className="select-field"
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label htmlFor="task-status" className="label-text">Status</label>
              <select
                id="task-status"
                className="select-field"
                value={taskForm.status}
                onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="task-due-date" className="label-text">Due Date</label>
            <input
              id="task-due-date"
              type="date"
              className={`input-field ${taskErrors.dueDate ? 'border-red-500/50' : ''}`}
              value={taskForm.dueDate}
              onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
            />
            {taskErrors.dueDate && <p className="text-red-400 text-xs mt-1">{taskErrors.dueDate}</p>}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-2">
              {isSubmitting ? <Spinner size="sm" className="text-white" /> : isEditingTask ? 'Save Changes' : 'Create Task'}
            </button>
            <button type="button" onClick={() => setIsTaskModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Task Confirmation */}
      <Modal isOpen={!!deleteTaskId} onClose={() => setDeleteTaskId(null)} title="Delete Task" maxWidth="max-w-sm">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-400" />
          </div>
          <p className="text-surface-300 mb-6">Are you sure you want to delete this task? This action cannot be undone.</p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={handleDeleteTask} disabled={isDeleting} className="btn-danger flex items-center gap-2">
              {isDeleting ? <Spinner size="sm" /> : 'Delete'}
            </button>
            <button onClick={() => setDeleteTaskId(null)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectDetails;
