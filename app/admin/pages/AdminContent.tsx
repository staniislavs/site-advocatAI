import React, { useState } from 'react';
import {
  FileText,
  Layout,
  MessageSquare,
  HelpCircle
} from 'lucide-react';
import { AdminServices } from './AdminServices';
import { AdminArticles } from './AdminArticles';
import { AdminReviews } from './AdminReviews';
import { AdminFAQ } from './AdminFAQ';
import { AdminHomeContent } from './AdminHomeContent';
import { cn } from '../../lib/utils';

const tabs = [
  { id: 'home', label: 'Головна', icon: Layout },
  { id: 'services', label: 'Послуги', icon: Layout },
  { id: 'articles', label: 'Статті', icon: FileText },
  { id: 'reviews', label: 'Відгуки', icon: MessageSquare },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
];

export const AdminContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <AdminHomeContent />;
      case 'services': return <AdminServices />;
      case 'articles': return <AdminArticles />;
      case 'reviews': return <AdminReviews />;
      case 'faq': return <AdminFAQ />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif italic text-[#141414]">Керування контентом</h1>
          <p className="text-[#141414]/50 font-medium">Редагування основних розділів сайту</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-[#141414]/10 bg-white px-2 md:px-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 md:px-6 py-4 font-bold uppercase tracking-widest text-[9px] md:text-[10px] transition-all relative border-b-2",
              activeTab === tab.id 
                ? "border-[#141414] text-[#141414]" 
                : "border-transparent text-[#141414]/40 hover:text-[#141414]/60"
            )}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminContent;
