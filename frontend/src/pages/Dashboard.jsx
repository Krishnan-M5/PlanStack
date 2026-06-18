import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/Spinner';
import BookOpenAnimation from '../components/BookOpenAnimation';
import {
  FolderKanban,
  ListTodo,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
  Calendar,
  Quote,
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color, gradient }) => (
  <div className="stat-card animate-slide-up group hover:border-surface-600/50 transition-all duration-300">
    <div className="flex items-center justify-between">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${gradient}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <span className="text-3xl font-bold text-surface-100 group-hover:text-white transition-colors">
        {value}
      </span>
    </div>
    <p className="text-sm text-surface-400 font-medium mt-1">{label}</p>
  </div>
);

const statusColors = {
  NOT_STARTED: 'bg-surface-500/10 text-surface-400',
  IN_PROGRESS: 'bg-amber-500/10 text-amber-400',
  COMPLETED: 'bg-emerald-500/10 text-emerald-400',
  PENDING: 'bg-blue-500/10 text-blue-400',
};

const priorityColors = {
  LOW: 'bg-surface-500/10 text-surface-400',
  MEDIUM: 'bg-amber-500/10 text-amber-400',
  HIGH: 'bg-red-500/10 text-red-400',
};

const Dashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBookAnimation, setShowBookAnimation] = useState(false);
  const [animationDone, setAnimationDone] = useState(false);

  useEffect(() => {
    // Show book animation only once per login session
    const hasSeenAnimation = sessionStorage.getItem('dashboardAnimationShown');
    if (!hasSeenAnimation) {
      setShowBookAnimation(true);
      sessionStorage.setItem('dashboardAnimationShown', 'true');
    } else {
      setAnimationDone(true);
    }
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await API.get('/dashboard');
      setData(response.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnimationComplete = useCallback(() => {
    setAnimationDone(true);
  }, []);

  if (isLoading) return <PageLoader />;

  const stats = data?.stats || {};

  return (
    <>
      {showBookAnimation && <BookOpenAnimation onComplete={handleAnimationComplete} />}
      <div className={`max-w-7xl mx-auto space-y-8 ${showBookAnimation && !animationDone ? 'opacity-0' : ''} ${showBookAnimation && animationDone ? 'content-reveal' : ''}`}>
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          Welcome back, <span className="text-primary-400">{user?.fullName?.split(' ')[0]}</span>
        </h1>
        <p className="text-surface-400 mt-1">Here&apos;s an overview of your projects and tasks.</p>
      </div>

      {/* Motivational Quote */}
      <div className="relative overflow-hidden rounded-2xl border border-surface-700/40 bg-gradient-to-r from-surface-800/60 via-surface-800/40 to-surface-800/60 p-5 animate-slide-up">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary-400 via-primary-500 to-primary-700 rounded-full" />
        <div className="flex items-start gap-4 pl-4">
          <Quote className="w-8 h-8 text-primary-500/30 flex-shrink-0 mt-0.5 rotate-180" />
          <div>
            <p className="text-surface-200 text-sm md:text-base italic leading-relaxed font-medium">
              "You don&apos;t have to be great to start, but you have to start to be great."
            </p>
            <p className="text-primary-400/70 text-xs mt-2 font-semibold tracking-wide uppercase">— Zig Ziglar</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          icon={FolderKanban}
          label="Total Projects"
          value={stats.totalProjects || 0}
          color="text-primary-400"
          gradient="bg-primary-500/10"
        />
        <StatCard
          icon={TrendingUp}
          label="In Progress"
          value={stats.projectsInProgress || 0}
          color="text-amber-400"
          gradient="bg-amber-500/10"
        />
        <StatCard
          icon={ListTodo}
          label="Total Tasks"
          value={stats.totalTasks || 0}
          color="text-blue-400"
          gradient="bg-blue-500/10"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed Tasks"
          value={stats.completedTasks || 0}
          color="text-emerald-400"
          gradient="bg-emerald-500/10"
        />
        <StatCard
          icon={Clock}
          label="Pending Tasks"
          value={stats.pendingTasks || 0}
          color="text-orange-400"
          gradient="bg-orange-500/10"
        />
      </div>

      {/* Recent Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="glass-card p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-surface-100">Recent Projects</h2>
            <Link
              to="/projects"
              className="text-sm text-primary-400 hover:text-primary-300 font-medium flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {data?.recentProjects?.length === 0 ? (
            <div className="text-center py-8">
              <FolderKanban className="w-10 h-10 text-surface-600 mx-auto mb-3" />
              <p className="text-surface-500 text-sm">No projects yet. Create your first one!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data?.recentProjects?.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-800/50 transition-all duration-200 group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-200 group-hover:text-white truncate transition-colors">
                      {project.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`badge text-[10px] ${statusColors[project.status]}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-surface-500">{project._count?.tasks || 0} tasks</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-surface-600 group-hover:text-primary-400 transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Tasks */}
        <div className="glass-card p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-surface-100">Recent Tasks</h2>
            <Link
              to="/tasks"
              className="text-sm text-primary-400 hover:text-primary-300 font-medium flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {data?.recentTasks?.length === 0 ? (
            <div className="text-center py-8">
              <ListTodo className="w-10 h-10 text-surface-600 mx-auto mb-3" />
              <p className="text-surface-500 text-sm">No tasks yet. Add tasks to your projects!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data?.recentTasks?.map((task) => (
                <Link
                  key={task.id}
                  to={`/projects/${task.project?.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-800/50 transition-all duration-200 group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-200 group-hover:text-white truncate transition-colors">
                      {task.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`badge text-[10px] ${statusColors[task.status]}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      <span className={`badge text-[10px] ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                      <span className="text-xs text-surface-500 truncate">{task.project?.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-surface-500 flex-shrink-0">
                    <Calendar className="w-3 h-3" />
                    {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
};

export default Dashboard;
