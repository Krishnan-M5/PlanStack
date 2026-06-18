import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  LogOut,
  Menu,
  X,
  Layers,
  User,
  AlertTriangle,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/tasks', label: 'Tasks', icon: ListTodo },
];

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface-900 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-surface-950/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface-950/90 backdrop-blur-xl border-r border-surface-800/50 
          transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-surface-800/50">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">PlanStack</h1>
              <p className="text-[10px] text-surface-500 uppercase tracking-widest font-semibold">Management</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto lg:hidden p-1 rounded-lg hover:bg-surface-800 transition-colors"
            >
              <X className="w-5 h-5 text-surface-400" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20 shadow-sm'
                      : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* User Section */}
          <div className="px-3 pb-4 mt-auto">
            <div className="glass-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-surface-100 truncate">{user?.fullName}</p>
                  <p className="text-xs text-surface-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                  text-red-400 bg-red-500/5 border border-red-500/10
                  hover:bg-red-500/10 hover:border-red-500/20 transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar (Mobile) */}
        <header className="lg:hidden sticky top-0 z-30 bg-surface-900/80 backdrop-blur-xl border-b border-surface-800/50 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl hover:bg-surface-800 transition-colors"
            >
              <Menu className="w-5 h-5 text-surface-300" />
            </button>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary-400" />
              <span className="font-bold text-white">PlanStack</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-surface-950/70 backdrop-blur-sm"
            onClick={() => setShowLogoutModal(false)}
          />
          <div className="relative glass-card p-6 w-full max-w-sm animate-slide-up text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Sign Out?</h3>
            <p className="text-surface-400 text-sm mb-6">
              Are you sure you want to sign out? You'll need to log in again to access your projects.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="btn-secondary flex-1"
              >
                Stay
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold
                  bg-red-500 text-white hover:bg-red-600 active:scale-[0.98]
                  transition-all duration-200 shadow-lg shadow-red-500/25"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
