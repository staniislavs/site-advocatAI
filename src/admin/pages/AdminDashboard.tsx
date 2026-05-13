import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  TrendingUp, 
  ArrowRight,
  Plus,
  Settings,
  MessageSquare,
  FileText,
  BarChart3,
  Loader2
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  limit, 
  orderBy,
  getDocs
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

const visitData = [
  { name: '01.05', visits: 120, leads: 5 },
  { name: '02.05', visits: 150, leads: 8 },
  { name: '03.05', visits: 180, leads: 12 },
  { name: '04.05', visits: 110, leads: 4 },
  { name: '05.05', visits: 140, leads: 7 },
  { name: '06.05', visits: 210, leads: 15 },
  { name: '07.05', visits: 190, leads: 11 },
];

const categoryData = [
  { name: 'Розлучення', value: 45, color: '#141414' },
  { name: 'Аліменти', value: 25, color: '#141414cc' },
  { name: 'Поділ майна', value: 35, color: '#14141499' },
  { name: 'Опіка', value: 20, color: '#14141466' },
  { name: 'Спадкування', value: 15, color: '#14141433' },
];

const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
  <div className="bg-white p-6 border border-[#141414]/10 group hover:border-[#141414] transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-[#141414]/5 group-hover:bg-[#141414] group-hover:text-white transition-all">
        <Icon size={20} />
      </div>
      {change && (
        <span className={`text-[10px] font-bold uppercase tracking-widest ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend === 'up' ? '↑' : '↓'} {change}
        </span>
      )}
    </div>
    <h3 className="font-serif italic text-[#141414]/50 mb-1">{title}</h3>
    <p className="text-3xl font-mono tracking-tighter font-bold">{value}</p>
  </div>
);

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    newLeads: 0,
    totalLeads: 0,
    scheduledEvents: 0,
    postsCount: 0
  });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Safety timeout for the spinner
    const timer = setTimeout(() => {
      setLoading(p => {
        if (p) console.warn('Dashboard loading timed out, showing partial state.');
        return false;
      });
    }, 8000);

    // New Leads Count
    const unsubscribeLeads = onSnapshot(
      query(collection(db, 'leads'), where('status', '==', 'new')),
      (snapshot) => {
        setStats(prev => ({ ...prev, newLeads: snapshot.size }));
      },
      (error) => {
        if (error.message.includes('offline')) {
          console.warn('Dashboard: Leads onSnapshot offline');
        } else {
          console.error('Error fetching leads:', error);
        }
      }
    );

    // Total Leads for Bar Chart / Stats
    const unsubscribeTotalLeads = onSnapshot(
      collection(db, 'leads'), 
      (snapshot) => {
        setStats(prev => ({ ...prev, totalLeads: snapshot.size }));
      },
      (error) => {
        if (!error.message.includes('offline')) {
          console.error('Error fetching total leads:', error);
        }
      }
    );

    // Posts Count
    const unsubscribePosts = onSnapshot(
      collection(db, 'articles'), 
      (snapshot) => {
        setStats(prev => ({ ...prev, postsCount: snapshot.size }));
      },
      (error) => {
        if (!error.message.includes('offline')) {
          console.error('Error fetching posts count:', error);
        }
      }
    );

    // Recent Activity
    const qRecent = query(collection(db, 'leads'), orderBy('createdAt', 'desc'), limit(5));
    const unsubscribeRecent = onSnapshot(
      qRecent, 
      (snapshot) => {
        clearTimeout(timer);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          time: doc.data().createdAt?.toDate() ? format(doc.data().createdAt.toDate(), 'HH:mm') : '--:--'
        }));
        setRecentLeads(data);
        setLoading(false);
      },
      (error) => {
        clearTimeout(timer);
        if (error.message.includes('offline')) {
          setLoading(false);
        } else {
          console.error('Error fetching recent leads:', error);
        }
      }
    );

    return () => {
      clearTimeout(timer);
      unsubscribeLeads();
      unsubscribeTotalLeads();
      unsubscribePosts();
      unsubscribeRecent();
    };
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif italic text-[#141414]">Дашборд</h1>
          <p className="text-[#141414]/50 font-medium">Контрольно-вимірювальна панель вашого бізнесу</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/admin/settings')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#141414]/10 hover:border-[#141414] transition-all font-medium text-sm"
          >
            <Settings size={16} /> Налаштування
          </button>
          <button 
            onClick={() => navigate('/admin/content?tab=articles&action=new')}
            className="flex items-center gap-2 px-4 py-2 bg-[#141414] text-white hover:bg-[#141414]/90 transition-all font-medium text-sm"
          >
            <Plus size={16} /> Новий пост
          </button>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Нові заявки" value={stats.newLeads} change="+" trend="up" icon={Users} />
        <StatCard title="Заплановані зустр." value="3" change="-" trend="up" icon={Clock} />
        <StatCard title="Всього статтей" value={stats.postsCount} change="real-time" trend="up" icon={FileText} />
        <StatCard title="Всього заявок" value={stats.totalLeads} change="real-time" trend="up" icon={BarChart3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 border border-[#141414]/10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-serif italic text-xl">Статистика відвідувань та заявок</h3>
            <select className="bg-[#141414]/5 border-none text-xs font-bold uppercase tracking-wider px-3 py-1 outline-none">
              <option>Останні 7 днів</option>
              <option>Цей місяць</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={visitData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontFamily: 'monospace', fill: '#14141466' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontFamily: 'monospace', fill: '#14141466' }} 
                />
                <Tooltip 
                  contentStyle={{ border: '1px solid #14141410', borderRadius: 0, fontFamily: 'monospace' }}
                />
                <Line type="monotone" dataKey="visits" stroke="#141414" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: '#141414' }} />
                <Line type="monotone" dataKey="leads" stroke="#14141444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-6 border border-[#141414]/10">
          <h3 className="font-serif italic text-xl mb-8">Запити за послугами</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 500, fill: '#141414' }} 
                  width={100}
                />
                <Tooltip 
                  cursor={{ fill: '#14141405' }}
                  contentStyle={{ border: '1px solid #14141410', borderRadius: 0, fontFamily: 'monospace' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Events List */}
        <div className="bg-white border border-[#141414]/10 overflow-hidden">
          <div className="p-6 border-b border-[#141414]/10 flex items-center justify-between bg-[#141414]/[0.02]">
            <h3 className="font-serif italic text-xl flex items-center gap-2">
              <Clock size={20} /> Останні звернення
            </h3>
            <button 
              onClick={() => navigate('/admin/leads')}
              className="text-[10px] font-bold uppercase tracking-widest hover:underline flex items-center gap-1"
            >
              Всі заявки <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-[#141414]/10">
            {loading ? (
              <div className="p-10 flex justify-center"><Loader2 className="animate-spin opacity-20" /></div>
            ) : recentLeads.length === 0 ? (
              <p className="p-10 text-center text-[#141414]/30 italic font-serif">Жодних звернень поки немає</p>
            ) : (
              recentLeads.map((lead, i) => (
                <div 
                  key={lead.id} 
                  onClick={() => navigate('/admin/leads')}
                  className="p-4 flex items-start gap-4 hover:bg-[#141414]/5 transition-colors group cursor-pointer"
                >
                  <div className="mt-1 p-2 bg-[#141414]/5 group-hover:bg-[#141414] group-hover:text-white transition-all shrink-0">
                    <MessageSquare size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Заявка від {lead.clientName}</p>
                    <p className="text-[10px] font-mono text-[#141414]/40 uppercase tracking-widest">{lead.time} • {lead.serviceType || 'Загальна'}</p>
                  </div>
                  <div className={cn(
                    "text-[8px] font-bold uppercase tracking-widest px-2 py-1",
                    lead.status === 'new' ? "bg-blue-100 text-blue-700" : "bg-[#141414]/5 text-[#141414]/40"
                  )}>
                    {lead.status}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions / Summary */}
        <div className="bg-[#141414] text-white p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <h3 className="font-serif italic text-3xl mb-4">Готові до роботи?</h3>
            <p className="text-white/60 mb-8 max-w-md">
              Наразі у вас {stats.newLeads} необроблених замовлень. 
              Ваш контент оновлювався нещодавно.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 relative z-10">
            <button 
              onClick={() => navigate('/admin/leads')}
              className="p-4 border border-white/20 hover:bg-white hover:text-[#141414] transition-all text-left group"
            >
              <h4 className="font-serif italic text-xl mb-1 flex items-center justify-between">Заявки <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" /></h4>
              <p className="text-[10px] uppercase tracking-wider text-white/50 font-bold font-mono">{stats.newLeads} необроблених</p>
            </button>
            <button 
              onClick={() => navigate('/admin/calendar')}
              className="p-4 border border-white/20 hover:bg-white hover:text-[#141414] transition-all text-left group"
            >
              <h4 className="font-serif italic text-xl mb-1 flex items-center justify-between">Календар <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" /></h4>
              <p className="text-[10px] uppercase tracking-wider text-white/50 font-bold font-mono">Переглянути розклад</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
