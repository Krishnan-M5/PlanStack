import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import Spinner, { PageLoader } from '../components/Spinner';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  ListTodo,
  Trash2,
  Edit3,
  ArrowRight,
  FolderKanban,
  X,
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'NOT_STARTED', label: 'Not Started' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
];

const statusColors = {
  NOT_STARTED: 'bg-surface-500/10 text-surface-400 border-surface-500/20',
  IN_PROGRESS: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const emptyForm = {
  name: '',
  description: '',
  status: 'NOT_STARTED',
  startDate: '',
  endDate: '',
};

const Projects = () => {
  const toast = useToast();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [search, statusFilter]);

  const fetchProjects = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const response = await API.get('/projects', { params });
      setProjects(response.data.data.projects);
    } catch (error) {
      toast.error('Failed to fetch projects.');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Project name is required.';
    if (!formData.description.trim()) errors.description = 'Description is required.';
    if (!formData.startDate) errors.startDate = 'Start date is required.';
    if (!formData.endDate) errors.endDate = 'End date is required.';
    if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      errors.endDate = 'End date must be after start date.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = () => {
    setFormData(emptyForm);
    setFormErrors({});
    setIsEditing(false);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (project) => {
    setFormData({
      name: project.name,
      description: project.description,
      status: project.status,
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
    });
    setFormErrors({});
    setIsEditing(true);
    setEditingId(project.id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };

      if (isEditing) {
        await API.put(`/projects/${editingId}`, payload);
        toast.success('Project updated successfully.');
      } else {
        await API.post('/projects', payload);
        toast.success('Project created successfully.');
      }

      setIsModalOpen(false);
      fetchProjects();
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

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await API.delete(`/projects/${deleteId}`);
      toast.success('Project deleted successfully.');
      setDeleteId(null);
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete project.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Projects</h1>
          <p className="text-surface-400 mt-1">Manage and track your project portfolio.</p>
        </div>
        <button onClick={handleCreate} className="btn-primary flex items-center gap-2 self-start">
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 animate-slide-up">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <input
            type="text"
            placeholder="Search projects..."
            className="input-field pl-11"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <select
            className="select-field pl-11 pr-10 min-w-[180px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="glass-card p-12 text-center animate-fade-in">
          <FolderKanban className="w-14 h-14 text-surface-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-300 mb-2">No projects found</h3>
          <p className="text-surface-500 text-sm mb-6">
            {search || statusFilter ? 'Try adjusting your filters.' : 'Create your first project to get started!'}
          </p>
          {!search && !statusFilter && (
            <button onClick={handleCreate} className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className="glass-card-hover p-5 flex flex-col gap-4 animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Top */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/projects/${project.id}`}
                    className="text-base font-semibold text-surface-100 hover:text-primary-400 transition-colors truncate block"
                  >
                    {project.name}
                  </Link>
                  <p className="text-sm text-surface-400 mt-1 line-clamp-2">{project.description}</p>
                </div>
                <span className={`badge text-[10px] flex-shrink-0 border ${statusColors[project.status]}`}>
                  {project.status.replace('_', ' ')}
                </span>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 text-xs text-surface-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(project.startDate).toLocaleDateString()} – {new Date(project.endDate).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <ListTodo className="w-3.5 h-3.5" />
                  {project._count?.tasks || 0} tasks
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-surface-700/30">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(project)}
                    className="p-2 rounded-lg text-surface-400 hover:text-primary-400 hover:bg-primary-500/10 transition-all"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(project.id)}
                    className="p-2 rounded-lg text-surface-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <Link
                  to={`/projects/${project.id}`}
                  className="text-sm text-primary-400 hover:text-primary-300 font-medium flex items-center gap-1 transition-colors"
                >
                  View <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Project' : 'Create New Project'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="project-name" className="label-text">Project Name</label>
            <input
              id="project-name"
              type="text"
              className={`input-field ${formErrors.name ? 'border-red-500/50' : ''}`}
              placeholder="Enter project name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {formErrors.name && <p className="text-red-400 text-xs mt-1">{formErrors.name}</p>}
          </div>

          <div>
            <label htmlFor="project-description" className="label-text">Description</label>
            <textarea
              id="project-description"
              rows={3}
              className={`input-field resize-none ${formErrors.description ? 'border-red-500/50' : ''}`}
              placeholder="Describe your project"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            {formErrors.description && <p className="text-red-400 text-xs mt-1">{formErrors.description}</p>}
          </div>

          <div>
            <label htmlFor="project-status" className="label-text">Status</label>
            <select
              id="project-status"
              className="select-field"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="project-start-date" className="label-text">Start Date</label>
              <input
                id="project-start-date"
                type="date"
                className={`input-field ${formErrors.startDate ? 'border-red-500/50' : ''}`}
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
              {formErrors.startDate && <p className="text-red-400 text-xs mt-1">{formErrors.startDate}</p>}
            </div>
            <div>
              <label htmlFor="project-end-date" className="label-text">End Date</label>
              <input
                id="project-end-date"
                type="date"
                className={`input-field ${formErrors.endDate ? 'border-red-500/50' : ''}`}
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
              {formErrors.endDate && <p className="text-red-400 text-xs mt-1">{formErrors.endDate}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-2">
              {isSubmitting ? <Spinner size="sm" className="text-white" /> : isEditing ? 'Save Changes' : 'Create Project'}
            </button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Project" maxWidth="max-w-sm">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-400" />
          </div>
          <p className="text-surface-300 mb-2">Are you sure you want to delete this project?</p>
          <p className="text-surface-500 text-sm mb-6">All associated tasks will also be permanently deleted.</p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={handleDelete} disabled={isDeleting} className="btn-danger flex items-center gap-2">
              {isDeleting ? <Spinner size="sm" /> : 'Delete'}
            </button>
            <button onClick={() => setDeleteId(null)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Projects;
