import { useState, useContext, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  CalendarOff,
  Settings,
  Menu,
  X,
  LogOut,
  Shield,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard',       path: '/admin/dashboard',   icon: LayoutDashboard },
  { label: 'Teachers',        path: '/admin/teachers',    icon: Users },
  { label: 'Attendance Logs', path: '/admin/attendance',  icon: ClipboardList },
  { label: 'Leaves',          path: '/admin/leaves',      icon: CalendarOff },
  { label: 'Settings',        path: '/admin/settings',    icon: Settings },
];

export default function AdminLayout() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Live clock
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  const formattedDate = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const SidebarContent = ({ onNavigate }) => (
    <nav className="flex flex-col gap-1 px-2.5">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150
              ${isActive
                ? 'bg-[#003E78]/10 text-[#003E78] font-semibold'
                : 'text-[#475569] hover:bg-gray-100 hover:text-[#0f172a]'
              }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className={`whitespace-nowrap transition-opacity duration-200 ${!sidebarOpen && !mobileOpen ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
              {item.label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#F7FAFC] flex">
      {/* ─── Desktop Sidebar ─────────────────────────────────────────────── */}
      <aside
        className={`hidden md:flex flex-col bg-white border-r border-[#e2e8f0] transition-all duration-300 ease-in-out shrink-0 ${
          sidebarOpen ? 'w-56' : 'w-[64px]'
        }`}
      >
        {/* Brand */}
        <div className="h-14 flex items-center px-3 border-b border-[#e2e8f0] shrink-0 overflow-hidden">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <img src="/icms-logo.png" alt="ICMS Education System" className="h-7 w-auto object-contain" />
              <span className="text-[10px] uppercase tracking-wider font-bold bg-[#a5361b]/10 text-[#a5361b] px-1.5 py-0.5 rounded">
                Admin
              </span>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="w-8 h-8 rounded-lg bg-white border border-[#e2e8f0] overflow-hidden flex items-center justify-start p-0.5 shadow-2xs" title="ICMS Admin Portal">
                <img src="/icms-logo.png" alt="ICMS" className="h-6 max-w-none" />
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <div className="flex-1 py-3 overflow-y-auto">
          <SidebarContent />
        </div>

        {/* User info */}
        <div className="p-2.5 border-t border-[#e2e8f0]">
          <NavLink
            to="/admin/profile"
            title="View Profile & Change Password"
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-colors group ${
                isActive ? 'bg-[#003E78]/10 text-[#003E78]' : 'bg-[#F7FAFC] hover:bg-gray-100'
              } ${!sidebarOpen ? 'justify-center' : ''}`
            }
          >
            <div className="w-7 h-7 rounded-full bg-[#003E78] flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className={`transition-opacity duration-200 ${!sidebarOpen ? 'hidden' : 'block'}`}>
              <p className="text-xs font-semibold text-[#0f172a] truncate max-w-[110px] group-hover:text-[#003E78]">{user?.name}</p>
              <p className="text-[10px] text-[#94a3b8]">{user?.employeeId}</p>
            </div>
          </NavLink>
        </div>
      </aside>

      {/* ─── Mobile Drawer Overlay ───────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-60 h-full bg-white shadow-xl flex flex-col">
            <div className="h-14 flex items-center justify-between px-3.5 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2">
                <img src="/icms-logo.png" alt="ICMS Education System" className="h-6 w-auto object-contain" />
                <span className="text-[10px] uppercase tracking-wider font-bold bg-[#a5361b]/10 text-[#a5361b] px-1.5 py-0.5 rounded">
                  Admin
                </span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-[#475569]" />
              </button>
            </div>
            <div className="flex-1 py-3 overflow-y-auto">
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </div>
          </aside>
        </div>
      )}

      {/* ─── Main Content Area ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-14 bg-white border-b border-[#e2e8f0] flex items-center justify-between px-3 sm:px-5 shrink-0 shadow-2xs">
          <div className="flex items-center gap-2.5">
            {/* Hamburger */}
            <button
              onClick={() => {
                if (window.innerWidth < 768) {
                  setMobileOpen(!mobileOpen);
                } else {
                  setSidebarOpen(!sidebarOpen);
                }
              }}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-[#475569]" />
            </button>
            <span className="font-semibold text-[#0f172a] text-sm sm:text-base tracking-tight">
              Admin Portal
            </span>
          </div>
          <div className="flex items-center gap-2.5 sm:gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-semibold text-[#0f172a]">{formattedDate}</p>
              <p className="text-[10px] text-[#94a3b8]">{formattedTime}</p>
            </div>
            <span className="text-xs sm:text-sm font-semibold text-[#0f172a] hidden md:block">{user?.name}</span>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 hover:border-red-300 border border-red-200 transition-colors shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-3 sm:p-4 md:p-5 overflow-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
