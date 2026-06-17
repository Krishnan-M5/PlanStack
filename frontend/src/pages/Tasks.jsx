import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import { PageLoader } from '../components/Spinner';
import {
  Search,
  Filter,
  Calendar,
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertCircle,
  Flag,
  ListTodo,
} from 'lucide-react';

const statusColors = {
  PENDING: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  IN_PROGRESS: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
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

const Tasks = () => {
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [search, statusFilter, priorityFilter, projectFilter]);

  const fetchProjects = async () => {
    try {
      const response = await API.get('/projects');
      setProjects(response.data.data.projects);
    } catch {
      // silently fail, projects list is supplementary
    }
  };

  const fetchTasks = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (projectFilter) params.projectId = projectFilter;
      const response = await API.get('/tasks', { params });
      setTasks(response.data.data.tasks);
    } catch (error) {
      toast.error('Failed to fetch tasks.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickStatusChange = async (taskId, newStatus) => {
    try {
      await API.put(`/tasks/${taskId}`, { status: newStatus });
      toast.success('Task status updated.');
      fetchTasks();
    } catch {
      toast.error('Failed to update task status.');
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl md:text-3xl font-bold text-white">All Tasks</h1>
        <p className="text-surface-400 mt-1">View and filter tasks across all your projects.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 animate-slide-up flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            className="input-field pl-11"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <select
            className="select-field pl-11 pr-10 min-w-[160px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div className="relative">
          <Flag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <select
            className="select-field pl-11 pr-10 min-w-[160px]"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        <div className="relative">
          <FolderKanban className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <select
            className="select-field pl-11 pr-10 min-w-[180px]"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Task Count */}
      <div className="text-sm text-surface-500 animate-fade-in">
        Showing <span className="text-surface-300 font-semibold">{tasks.length}</span> task{tasks.length !== 1 ? 's' : ''}
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="glass-card p-12 text-center animate-fade-in">
          <ListTodo className="w-14 h-14 text-surface-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-300 mb-2">No tasks found</h3>
          <p className="text-surface-500 text-sm">
            {search || statusFilter || priorityFilter || projectFilter
              ? 'Try adjusting your filters.'
              : 'Create tasks from your project pages.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task, index) => {
            const PriorityIcon = priorityIcons[task.priority];
            const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';

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
                  <div className="flex items-center gap-2 mt-1">
                    <Link
                      to={`/projects/${task.project?.id}`}
                      className="text-xs text-primary-400/70 hover:text-primary-400 transition-colors flex items-center gap-1"
                    >
                      <FolderKanban className="w-3 h-3" />
                      {task.project?.name}
                    </Link>
                  </div>
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
                  <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-400' : 'text-surface-500'}`}>
                    <Calendar className="w-3 h-3" />
                    {new Date(task.dueDate).toLocaleDateString()}
                    {isOverdue && <span className="text-[10px] font-bold uppercase ml-1">Overdue</span>}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Tasks;
