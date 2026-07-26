import React from 'react';
import { User } from '../types';
import { Newspaper, Search, MessageSquare, Briefcase, User as UserIcon, Shield } from 'lucide-react';

interface MobileNavBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  unreadMessageCount?: number;
  language: 'en' | 'bn';
  isAdminMode?: boolean;
  hasActiveExecutives?: boolean;
}

export default function MobileNavBar({
  activeTab,
  setActiveTab,
  currentUser,
  unreadMessageCount = 0,
  language,
  isAdminMode = false,
  hasActiveExecutives = true,
}: MobileNavBarProps) {
  // If in admin mode, show minimal admin navigation bar
  if (isAdminMode) {
    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-neutral-900 border-t border-neutral-800 px-2 py-2 shadow-2xl flex justify-around items-center text-white" id="mobile-admin-bar">
        <button
          onClick={() => setActiveTab('admin')}
          className={`flex flex-col items-center justify-center space-y-1 px-4 py-1.5 rounded-xl font-mono text-[11px] font-bold ${
            activeTab === 'admin' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400'
          }`}
        >
          <Shield className="h-5 w-5" />
          <span>অ্যাডমিন প্যানেল</span>
        </button>
      </div>
    );
  }

  // If guest, show Home, Executives (if active), and Register/Login (Hide Chat and Find Matches)
  if (!currentUser) {
    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 px-2 py-2 shadow-2xl flex justify-around items-center w-full" id="mobile-bottom-guest-nav">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all shrink-0 ${
            activeTab === 'home' ? 'text-neutral-950 font-bold bg-neutral-100' : 'text-neutral-500 font-medium'
          }`}
        >
          <Newspaper className="h-5 w-5" />
          <span className="text-[10px] font-mono mt-0.5 leading-none">{language === 'en' ? 'Home' : 'হোম'}</span>
        </button>

        {hasActiveExecutives && (
          <button
            onClick={() => setActiveTab('executives')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all shrink-0 ${
              activeTab === 'executives' ? 'text-neutral-950 font-bold bg-neutral-100' : 'text-neutral-500 font-medium'
            }`}
          >
            <Briefcase className="h-5 w-5" />
            <span className="text-[10px] font-mono mt-0.5 leading-none">{language === 'en' ? 'Executives' : 'এক্সিকিউটিভ'}</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('register')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all shrink-0 ${
            activeTab === 'register' ? 'text-red-700 font-bold bg-red-50' : 'text-neutral-500 font-medium'
          }`}
        >
          <UserIcon className="h-5 w-5" />
          <span className="text-[10px] font-mono mt-0.5 leading-none">{language === 'en' ? 'Register / Login' : 'রেজিস্ট্রেশন / লগইন'}</span>
        </button>
      </div>
    );
  }

  // Logged in user persistent smartphone navbar
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-neutral-200/90 px-1 py-1.5 shadow-2xl flex justify-around items-center w-full" id="mobile-bottom-user-nav">
      
      {/* 1. Timeline */}
      <button
        onClick={() => setActiveTab('feed')}
        className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
          activeTab === 'feed' ? 'text-neutral-950 font-bold bg-neutral-100/90' : 'text-neutral-500 font-medium hover:text-neutral-800'
        }`}
        id="mobile-nav-feed"
      >
        <Newspaper className={`h-5 w-5 ${activeTab === 'feed' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className="text-[9px] font-mono mt-0.5 leading-none">{language === 'en' ? 'Timeline' : 'টাইমলাইন'}</span>
      </button>

      {/* 2. Find Matches */}
      <button
        onClick={() => setActiveTab('search')}
        className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
          activeTab === 'search' ? 'text-neutral-950 font-bold bg-neutral-100/90' : 'text-neutral-500 font-medium hover:text-neutral-800'
        }`}
        id="mobile-nav-search"
      >
        <Search className={`h-5 w-5 ${activeTab === 'search' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className="text-[9px] font-mono mt-0.5 leading-none">{language === 'en' ? 'Matches' : 'ম্যাচ খুঁজুন'}</span>
      </button>

      {/* 3. Chat Box */}
      <button
        onClick={() => setActiveTab('chat')}
        className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all relative cursor-pointer shrink-0 ${
          activeTab === 'chat' ? 'text-neutral-950 font-bold bg-neutral-100/90' : 'text-neutral-500 font-medium hover:text-neutral-800'
        }`}
        id="mobile-nav-chat"
      >
        <div className="relative">
          <MessageSquare className={`h-5 w-5 ${activeTab === 'chat' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          {unreadMessageCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full font-mono animate-pulse">
              {unreadMessageCount}
            </span>
          )}
        </div>
        <span className="text-[9px] font-mono mt-0.5 leading-none">{language === 'en' ? 'Chat' : 'চ্যাট'}</span>
      </button>

      {/* 4. Executives (Conditional) */}
      {hasActiveExecutives && (
        <button
          onClick={() => setActiveTab('executives')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
            activeTab === 'executives' ? 'text-neutral-950 font-bold bg-neutral-100/90' : 'text-neutral-500 font-medium hover:text-neutral-800'
          }`}
          id="mobile-nav-executives"
        >
          <Briefcase className={`h-5 w-5 ${activeTab === 'executives' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[9px] font-mono mt-0.5 leading-none">{language === 'en' ? 'Executives' : 'এক্সিকিউটিভ'}</span>
        </button>
      )}

      {/* 5. My Profile */}
      <button
        onClick={() => setActiveTab('profile')}
        className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
          activeTab === 'profile' ? 'text-neutral-950 font-bold bg-neutral-100/90' : 'text-neutral-500 font-medium hover:text-neutral-800'
        }`}
        id="mobile-nav-profile"
      >
        <UserIcon className={`h-5 w-5 ${activeTab === 'profile' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className="text-[9px] font-mono mt-0.5 leading-none">{language === 'en' ? 'Profile' : 'প্রোফাইল'}</span>
      </button>
    </div>
  );
}
