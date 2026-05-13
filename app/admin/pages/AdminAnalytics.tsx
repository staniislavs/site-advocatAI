import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MousePointer2, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  Loader2,
  Calendar
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export const AdminAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    visits: 12450,
    conversion: 3.2,
    avgTime: '02:45',
    bounceRate: 42
  });

  const chartData = [
    { name: '01.05', value: 400 },
    { name: '05.05', value: 300 },
    { name: '10.05', value: 600 },
    { name: '15.05', value: 800 },
    { name: '20.05', value: 700 },
    { name: '25.05', value: 1100 },
    { name: '30.05', value: 950 },
  ];

  useEffect(() => {
    // Simulate loading data or fetch from settings/stats collections
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin opacity-20" size={40} /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-serif italic text-[#141414]">Аналітика</h2>
          <p className="text-[#141414]/50 font-medium">Моніторинг відвідуваності та результативності сайту</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-[#141414]/10 text-[10px] font-bold uppercase tracking-widest">
          <Calendar size={14} className="text-gold" /> Останні 30 днів
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Перегляди сторінок', val: stats.visits, change: '+12%', up: true, icon: Users },
          { label: 'Коефіцієнт конверсії', val: `${stats.conversion}%`, change: '+0.4%', up: true, icon: TrendingUp },
          { label: 'Сер. час на сайті', val: stats.avgTime, change: '-5%', up: false, icon: Clock },
          { label: 'Bounce Rate', val: `${stats.bounceRate}%`, change: '+2%', up: false, icon: MousePointer2 },
        ].map((item, i) => (
          <div key={i} className="bg-white border border-[#141414]/10 p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 bg-[#141414]/5 flex items-center justify-center text-[#141414]/40">
                <item.icon size={20} />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-[10px] font-bold",
                item.up ? "text-green-600" : "text-red-500"
              )}>
                {item.change}
                {item.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">{item.label}</p>
              <p className="font-serif italic text-3xl text-[#141414]">{item.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white border border-[#141414]/10 p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-serif italic text-xl">Динаміка відвідуваності</h3>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">
              <span className="flex items-center gap-2"><span className="w-2 h-2 bg-gold rounded-full" /> Унікальні відвідувачі</span>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C4A484" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#C4A484" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#141414" strokeOpacity={0.05} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 700}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 700}}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#141414', 
                    border: 'none', 
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 700
                  }}
                  itemStyle={{ color: '#C4A484' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#C4A484" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Traffic Sources */}
        <div className="bg-[#141414] text-white p-8">
          <h3 className="font-serif italic text-xl mb-8 border-b border-white/10 pb-4">Джерела трафіку</h3>
          <div className="space-y-6">
            {[
              { label: 'Прямі заходи', val: 45, color: 'bg-gold' },
              { label: 'Пошук (Google)', val: 30, color: 'bg-gray-400' },
              { label: 'Соціальні мережі', val: 15, color: 'bg-gray-600' },
              { label: 'Реферали', val: 10, color: 'bg-gray-800' },
            ].map((source, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span>{source.label}</span>
                  <span>{source.val}%</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full", source.color)} 
                    style={{ width: `${source.val}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 p-4 bg-white/5 rounded space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gold italic">Порада системи</h4>
            <p className="text-xs text-white/60 leading-relaxed font-light">
              Рекламна кампанія у Facebook принесла на 20% більше лідів цього місяця. Рекомендуємо збільшити бюджет на оголошення про "Поділ майна".
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default AdminAnalytics;
