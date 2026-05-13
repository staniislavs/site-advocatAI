import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Calendar, 
  Image as ImageIcon, 
  BarChart3, 
  Mail, 
  Search, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Bell,
  User,
  ShieldCheck,
  Stethoscope,
  Zap,
  WifiOff
} from 'lucide-react';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { cn } from '../../lib/utils';

const sidebarItems = [
  { id: 'dashboard', label: 'Дашборд', icon: LayoutDashboard, path: '/admin' },
  { id: 'leads', label: 'Заявки', icon: Users, path: '/admin/leads' },
  { id: 'content', label: 'Контент', icon: FileText, path: '/admin/content' },
  { id: 'calendar', label: 'Календар', icon: Calendar, path: '/admin/calendar' },
  { id: 'connections', label: 'Підключення', icon: Zap, path: '/admin/connections' },
  { id: 'media', label: 'Медіа', icon: ImageIcon, path: '/admin/media' },
  { id: 'analytics', label: 'Аналітика', icon: BarChart3, path: '/admin/analytics' },
  { id: 'email', label: 'Email', icon: Mail, path: '/admin/email' },
  { id: 'seo', label: 'SEO', icon: Search, path: '/admin/seo' },
  { id: 'settings', label: 'Налаштування', icon: Settings, path: '/admin/settings' },
];

export const AdminLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/admin/login');
        return;
      }

      // Check role
      try {
        // Use Promise.race for a timeout on the admin check
        const adminCheckPromise = getDoc(doc(db, 'admins', user.uid));
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Admin check timeout')), 5000)
        );

        const adminDoc = await Promise.race([adminCheckPromise, timeoutPromise]) as any;

        if (adminDoc.exists() || user.email === 'bogdashkina.lawyer@gmail.com') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          await signOut(auth);
          navigate('/admin/login', { state: { error: 'У вас немає прав доступу до адмін-панелі.' } });
        }
      } catch (error: any) {
        if (error.message && (error.message.includes('offline') || error.message.includes('timeout'))) {
          console.warn('Admin status check: Client is offline or timeout, allowing access if it might be valid.');
          setIsAdmin(true); 
        } else {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      }
    });

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/admin/login');
  };

  if (isAdmin === null) return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#57575711] gap-4">
      <Zap className="animate-pulse text-[#141414]/10 mb-4" size={48} />
      <div className="text-center space-y-2">
        <p className="font-serif italic text-[#141414]/60">Авторизація...</p>
        {!isOnline && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Вибачте, ви офлайн</p>}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#E4E3E0] text-[#141414] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-white border-r border-[#141414]/10 transition-all duration-300 flex flex-col z-50",
          isCollapsed ? "w-20" : "w-64",
          "hidden md:flex"
        )}
      >
        <div className="p-6 border-bottom border-[#141414]/10 flex items-center justify-between">
          {!isCollapsed && <span className="font-serif italic font-bold text-xl uppercase tracking-wider">Адмін</span>}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-[#141414]/5 rounded transition-colors"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {sidebarItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                "flex items-center px-6 py-3 transition-all duration-200 group",
                location.pathname === item.path 
                  ? "bg-[#141414] text-white" 
                  : "text-[#141414]/60 hover:bg-[#141414]/5 hover:text-[#141414]"
              )}
            >
              <item.icon size={20} className={cn(location.pathname === item.path ? "text-white" : "text-inherit")} />
              {!isCollapsed && <span className="ml-4 font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-[#141414]/10">
          <button 
            onClick={handleLogout}
            className={cn(
              "flex items-center w-full px-4 py-3 text-[#141414]/60 hover:text-red-600 hover:bg-red-50 rounded transition-all duration-200",
              isCollapsed ? "justify-center" : ""
            )}
          >
            <LogOut size={20} />
            {!isCollapsed && <span className="ml-4 font-medium">Вихід</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 w-64 bg-white z-50 transform transition-transform duration-300 md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 flex items-center justify-between border-b border-[#141414]/10">
          <span className="font-serif italic font-bold text-xl uppercase tracking-wider">Адмін</span>
          <button onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <nav className="py-4">
          {sidebarItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center px-6 py-4 transition-all duration-200",
                location.pathname === item.path 
                  ? "bg-[#141414] text-white" 
                  : "text-[#141414]/60 hover:bg-[#141414]/5 hover:text-[#141414]"
              )}
            >
              <item.icon size={20} />
              <span className="ml-4 font-medium">{item.label}</span>
            </Link>
          ))}
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-6 py-4 text-[#141414]/60 hover:text-red-600 transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="ml-4 font-medium">Вихід</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#141414]/10 flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 md:hidden mr-2"
            >
              <Menu size={24} />
            </button>
            <h2 className="font-serif italic text-lg text-[#141414]">Адвокат Дар'я Богдашкіна</h2>
          </div>
          
          <div className="flex items-center gap-4">
            {!isOnline && (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full animate-pulse">
                <WifiOff size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Офлайн</span>
              </div>
            )}
            <button className="p-2 text-[#141414]/60 hover:text-[#141414] transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm" />
            </button>
            <div className="h-8 w-px bg-[#141414]/10 hidden sm:block" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-[#141414]">{auth.currentUser?.email?.split('@')[0]}</p>
                <p className="text-[10px] uppercase tracking-wider text-[#141414]/40 font-bold">Адміністратор</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-[#141414] flex items-center justify-center text-white font-serif">
                {auth.currentUser?.email?.[0].toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
