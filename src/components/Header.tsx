import React, { useState } from 'react';
import { User, Notification } from '../types';
import { Heart, Bell, User as UserIcon, Shield, Globe, LogOut, CheckCircle, Award, Settings, Edit3, MessageSquare } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];
  language: 'en' | 'bn';
  setLanguage: (lang: 'en' | 'bn') => void;
  notifications: Notification[];
  markNotificationsAsRead: () => void;
  isAdminMode: boolean;
  setIsAdminMode: (admin: boolean) => void;
  onOpenLoginModal?: () => void;
  unreadMessageCount?: number;
  hasActiveExecutives?: boolean;
}

export default function Header({
  activeTab,
  setActiveTab,
  currentUser,
  setCurrentUser,
  users,
  language,
  setLanguage,
  notifications,
  markNotificationsAsRead,
  isAdminMode,
  setIsAdminMode,
  onOpenLoginModal,
  unreadMessageCount = 0,
  hasActiveExecutives = true,
}: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadNotifications = notifications.filter((n) => !n.read);

  const handleAdminToggle = () => {
    setIsAdminMode(true);
    setCurrentUser(null);
    setActiveTab('admin');
    setShowUserMenu(false);
  };

  const text = {
    title: language === 'en' ? 'BibahoBondhon' : 'বিবাহবন্ধন',
    subtitle: language === 'en' ? 'Matrimony Bangladesh' : 'ম্যাট্রিমোনি বাংলাদেশ',
    home: language === 'en' ? 'Home' : 'হোম',
    feed: language === 'en' ? 'Timeline' : 'টাইমলাইন',
    search: language === 'en' ? 'Search Matches' : 'ম্যাচ খুঁজুন',
    chat: language === 'en' ? 'Chat Box' : 'চ্যাট বক্স',
    executives: language === 'en' ? 'Executives' : 'এক্সিকিউটিভ',
    admin: language === 'en' ? 'Admin Panel' : 'অ্যাডমিন প্যানেল',
    register: language === 'en' ? 'Register Now' : 'নিবন্ধন করুন',
    pendingLabel: language === 'en' ? 'Pending Approval' : 'অনুমোদনের অপেক্ষায়',
    verifiedLabel: language === 'en' ? 'Verified Account' : 'ভেরিফাইড অ্যাকাউন্ট',
    notificationsTitle: language === 'en' ? 'Notifications' : 'নোটিফিকেশন',
    emptyNotifications: language === 'en' ? 'No new notifications' : 'কোনো নতুন নোটিফিকেশন নেই',
    switchUser: language === 'en' ? 'Switch Account (Demo)' : 'অ্যাকাউন্ট পরিবর্তন',
    adminMode: language === 'en' ? 'Admin Portal' : 'অ্যাডমিন পোর্টাল',
    guestUser: language === 'en' ? 'Guest Visitor' : 'অতিথি ভিজিটর',
    logout: language === 'en' ? 'Logout' : 'লগআউট',
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200/50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          
          {/* Logo Brand */}
          <div 
            onClick={() => {
              if (isAdminMode) {
                setActiveTab('admin');
              } else {
                setActiveTab(currentUser ? 'feed' : 'home');
              }
            }}
            className="flex items-center space-x-2.5 cursor-pointer group"
            id="app-header-logo"
          >
            <div className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white transform group-hover:scale-105 transition-transform duration-200">
              <Heart className="h-5 sm:h-6 w-5 sm:w-6 fill-red-600 text-red-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 font-serif">
                {text.title}
              </h1>
              <p className="text-[9px] sm:text-[10px] text-amber-700 font-semibold tracking-widest uppercase font-mono">
                {text.subtitle}
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
            {!isAdminMode ? (
              currentUser ? (
                <>
                  <button
                    onClick={() => setActiveTab('feed')}
                    className={`px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      activeTab === 'feed'
                        ? 'bg-neutral-900 text-white shadow-sm'
                        : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
                    }`}
                    id="nav-feed"
                  >
                    {text.feed}
                  </button>
                  <button
                    onClick={() => setActiveTab('search')}
                    className={`px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      activeTab === 'search'
                        ? 'bg-neutral-900 text-white shadow-sm'
                        : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
                    }`}
                    id="nav-search"
                  >
                    {text.search}
                  </button>
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 relative flex items-center space-x-1 ${
                      activeTab === 'chat'
                        ? 'bg-neutral-900 text-white shadow-sm'
                        : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
                    }`}
                    id="nav-chat"
                  >
                    <span>{text.chat}</span>
                    {unreadMessageCount > 0 && (
                      <span className="ml-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono animate-pulse">
                        {unreadMessageCount}
                      </span>
                    )}
                  </button>
                  {hasActiveExecutives && (
                    <button
                      onClick={() => setActiveTab('executives')}
                      className={`px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                        activeTab === 'executives'
                          ? 'bg-neutral-900 text-white shadow-sm'
                          : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
                      }`}
                      id="nav-executives"
                    >
                      {text.executives}
                    </button>
                  )}
                </>
              ) : activeTab === 'register' ? (
                /* Pure registration header without Home or extraneous navigation */
                <div className="flex items-center space-x-2 text-xs font-mono font-bold text-neutral-800 bg-neutral-100 px-3.5 py-1.5 rounded-xl border border-neutral-200">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                  <span>{language === 'en' ? 'Official Registration Portal' : 'অফিসিয়াল সদস্য নিবন্ধন পোর্টাল'}</span>
                </div>
              ) : (
                <button
                  onClick={() => setActiveTab('home')}
                  className={`px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    activeTab === 'home'
                      ? 'bg-neutral-900 text-white shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
                  }`}
                  id="nav-home"
                >
                  {text.home}
                </button>
              )
            ) : (
              <button
                onClick={() => setActiveTab('admin')}
                className="px-3.5 lg:px-4 py-2 rounded-lg text-sm font-semibold text-amber-900 bg-amber-50 border border-amber-200/50 shadow-sm flex items-center space-x-1.5"
                id="nav-admin"
              >
                <Shield className="h-4 w-4" />
                <span>{text.admin}</span>
              </button>
            )}
          </nav>

          {/* Action Area (Lang, Notification, Swapper, Reg button) */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Language Selector */}
            {activeTab !== 'home' && (
              <button
                onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
                className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all duration-150 flex items-center space-x-1"
                title="Change Language"
                id="lang-toggle-button"
              >
                <Globe className="h-4 sm:h-5 w-4 sm:w-5" />
                <span className="text-xs font-bold uppercase font-mono">{language === 'en' ? 'বাংলা' : 'EN'}</span>
              </button>
            )}

            {/* Notifications Dropdown */}
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    if (!showNotifications) markNotificationsAsRead();
                  }}
                  className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all duration-150 relative"
                  id="notification-bell-button"
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotifications.length > 0 && (
                    <span className="absolute top-1 right-1 h-3.5 w-3.5 bg-red-600 text-white rounded-full text-[8px] flex items-center justify-center font-bold font-mono">
                      {unreadNotifications.length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-lg border border-neutral-200/80 py-2 z-50">
                    <div className="px-4 py-2 border-b border-neutral-100 flex justify-between items-center">
                      <h3 className="font-semibold text-neutral-900 text-sm">{text.notificationsTitle}</h3>
                      {unreadNotifications.length > 0 && (
                        <span className="text-xs bg-red-50 text-red-700 px-2.5 py-0.5 rounded-full font-semibold font-mono">
                          {unreadNotifications.length} NEW
                        </span>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-neutral-400">{text.emptyNotifications}</div>
                      ) : (
                        notifications.map((n) => (
                          <div 
                            key={n.id} 
                            className={`px-4 py-3 border-b border-neutral-100 hover:bg-neutral-50 transition-all duration-150 flex flex-col ${
                              !n.read ? 'bg-neutral-50/50' : ''
                            }`}
                          >
                            <span className="font-semibold text-[9px] text-red-700 uppercase tracking-wider mb-0.5 font-mono">
                              {n.type}
                            </span>
                            <span className="font-semibold text-xs sm:text-sm text-neutral-900">
                              {language === 'en' ? n.title : n.titleBn}
                            </span>
                            <p className="text-xs text-neutral-600 mt-1">
                              {language === 'en' ? n.content : n.contentBn}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Avatar or Register Button */}
            {currentUser ? (
              <div className="relative">
                <div 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 cursor-pointer bg-neutral-50 hover:bg-neutral-100 p-1 pr-2.5 rounded-full border border-neutral-200 transition-all duration-150"
                  id="header-profile-avatar-block"
                >
                  <div className="relative">
                    <img
                      src={currentUser.profilePicture}
                      alt={currentUser.name}
                      className="h-8 sm:h-9 w-8 sm:w-9 rounded-full object-cover ring-1 ring-neutral-200"
                      referrerPolicy="no-referrer"
                    />
                    {currentUser.status === 'verified' ? (
                      <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-1 ring-white" />
                    ) : (
                      <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-amber-500 ring-1 ring-white animate-pulse" />
                    )}
                  </div>
                  <div className="hidden sm:block text-left max-w-[90px]">
                    <p className="text-xs font-semibold text-neutral-900 truncate">{currentUser.name}</p>
                    <p className="text-[9px] text-red-700 font-mono font-bold uppercase tracking-wide">
                      {currentUser.packageId}
                    </p>
                  </div>
                  <span className="text-[10px] text-neutral-400">▼</span>
                </div>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-neutral-200/80 p-3 z-50 animate-in fade-in zoom-in-95 duration-150" id="facebook-profile-menu-dropdown">
                    {/* User Info Header Card */}
                    <div 
                      onClick={() => {
                        setActiveTab('profile');
                        setShowUserMenu(false);
                      }}
                      className="flex items-center space-x-3 p-2.5 rounded-xl hover:bg-neutral-100/80 cursor-pointer transition-colors border border-neutral-100/80 shadow-2xs mb-2"
                    >
                      <img
                        src={currentUser.profilePicture}
                        alt={currentUser.name}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-neutral-200"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-neutral-900 truncate">{currentUser.name}</h4>
                        <p className="text-[11px] text-neutral-500 font-medium">
                          {language === 'en' ? 'See your profile' : 'প্রোফাইল সংশোধন ও দেখুন'}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-neutral-200/60 my-1.5" />

                    <div className="space-y-0.5">
                      {/* 1. Edit Profile */}
                      <button
                        onClick={() => {
                          setActiveTab('edit-profile');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold text-neutral-800 hover:bg-neutral-100/80 transition-all cursor-pointer font-sans"
                        id="menu-edit-profile-btn"
                      >
                        <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700">
                          <Edit3 className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-semibold">{language === 'en' ? 'Edit Profile' : 'Edit Profile'}</span>
                      </button>

                      {/* 3. Membership */}
                      <button
                        onClick={() => {
                          setActiveTab('pricing');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold text-neutral-800 hover:bg-neutral-100/80 transition-all cursor-pointer font-sans"
                        id="menu-membership-btn"
                      >
                        <div className="w-8 h-8 rounded-full bg-red-50 text-red-700 flex items-center justify-center">
                          <Award className="h-4 w-4" />
                        </div>
                        <div className="flex-1 text-left">
                          <span className="text-sm font-semibold block">{language === 'en' ? 'Membership' : 'Membership'}</span>
                          <span className="text-[10px] text-red-700 font-mono font-bold uppercase">{currentUser.packageId} Plan</span>
                        </div>
                      </button>

                      <div className="border-t border-neutral-200/60 my-1.5" />

                      {/* 4. Logout */}
                      <button
                        onClick={() => {
                          setCurrentUser(null);
                          setActiveTab('home');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-all cursor-pointer font-sans"
                        id="menu-logout-btn"
                      >
                        <div className="w-8 h-8 rounded-full bg-red-100/80 flex items-center justify-center text-red-600">
                          <LogOut className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-semibold">{language === 'en' ? 'Logout' : 'Logout'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : !isAdminMode ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    if (onOpenLoginModal) onOpenLoginModal();
                    else setActiveTab('login');
                  }}
                  className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all duration-150 border border-neutral-300 font-mono cursor-pointer"
                  id="header-login-button"
                >
                  {language === 'en' ? 'Login' : 'লগইন'}
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all duration-150 border border-red-700 font-mono cursor-pointer"
                  id="header-register-now-button"
                >
                  {text.register}
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsAdminMode(false);
                  setCurrentUser(null);
                  setActiveTab('home');
                }}
                className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all duration-150 flex items-center space-x-1 text-xs font-bold"
                id="header-logout-admin-button"
              >
                <LogOut className="h-4 w-4" />
                <span>{text.logout}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
