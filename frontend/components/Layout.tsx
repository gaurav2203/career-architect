import React from 'react';
import { LayoutDashboard, FileText, Briefcase, Mail, User, Settings, LogOut } from 'lucide-react';
import { AppRoute } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentRoute, onNavigate }) => {
  const navItems = [
    { id: AppRoute.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: AppRoute.RESUME, label: 'Resume Builder', icon: FileText },
    { id: AppRoute.PORTFOLIO, label: 'Portfolio Generator', icon: User },
    { id: AppRoute.COVER_LETTER, label: 'Cover Letter', icon: Briefcase },
    { id: AppRoute.EMAIL, label: 'Email Automation', icon: Mail },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            CareerArchitect
          </h1>
          <p className="text-xs text-slate-500 mt-1">AI-Powered Career OS</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center space-x-3 px-4 py-3 text-slate-600">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
              JD
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">John Doe</p>
              <p className="text-xs text-slate-400 truncate">Free Plan</p>
            </div>
            <Settings size={16} className="text-slate-400 cursor-pointer hover:text-slate-600" />
          </div>
        </div>
      </aside>

      {/* Mobile Header (visible only on small screens) */}
      <div className="md:hidden fixed top-0 w-full bg-white border-b border-slate-200 z-20 flex items-center justify-between p-4">
         <span className="font-bold text-indigo-600">CareerArchitect</span>
         <button className="text-slate-500">Menu</button>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-6 md:p-12 mt-14 md:mt-0 overflow-y-auto h-screen">
        <div className="max-w-6xl mx-auto">
            {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
