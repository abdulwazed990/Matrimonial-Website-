import React, { useState, useRef } from 'react';
import { User, Post, Story, Comment } from '../types';
import SafeImage from './SafeImage';
import FullScreenStoryViewer from './FullScreenStoryViewer';
import { BANGLADESH_LOCATIONS, MUSIC_CATALOG } from '../data';
import { 
  Heart, ThumbsUp, MessageCircle, Share2, Send, Plus, Lock, Clock, 
  CheckCircle2, ShieldAlert, Eye, Image as ImageIcon, Sparkles, X, 
  Video, UserCheck, Flame, ChevronRight, Upload, MoreVertical,
  Edit, Trash2, AlertTriangle, ShieldCheck, MapPin, Music, Play, Pause,
  Disc, Camera, Search, Briefcase, Settings, Edit3, Award, MessageSquare,
  CornerDownRight, Smile, User as UserIcon
} from 'lucide-react';

interface TimelineProps {
  language: 'en' | 'bn';
  currentUser: User | null;
  users: User[];
  posts: Post[];
  stories: Story[];
  onAddPost: (
    content: string, 
    image?: string, 
    location?: string, 
    music?: { id?: string; title: string; artist: string; audioUrl?: string; coverUrl?: string }
  ) => void;
  onEditPost?: (
    postId: string, 
    content: string, 
    image?: string, 
    location?: string, 
    music?: { id?: string; title: string; artist: string; audioUrl?: string; coverUrl?: string }
  ) => void;
  onDeletePost?: (postId: string) => void;
  onAddStory: (
    image: string, 
    location?: string, 
    music?: { id?: string; title: string; artist: string; audioUrl?: string; coverUrl?: string }
  ) => void;
  onDeleteStory?: (storyId: string) => void;
  onDeleteAllStories?: () => void;
  onToggleLike: (postId: string, reactionType: 'like' | 'love') => void;
  onAddComment: (postId: string, commentText: string, parentCommentId?: string) => void;
  onSharePost?: (postId: string) => void;
  onReactStory?: (storyId: string, type: 'like' | 'love') => void;
  onViewStory?: (storyId: string) => void;
  onSelectProfileById: (profileId: string) => void;
  onOpenDirectChat?: (user: User) => void;
  onUploadToGallery?: (photoUrl: string) => void;
  onOpenCreatePost?: () => void;
  setActiveTab?: (tab: string) => void;
}

export default function Timeline({
  language,
  currentUser,
  users,
  posts,
  stories,
  onAddPost,
  onEditPost,
  onDeletePost,
  onAddStory,
  onDeleteStory,
  onDeleteAllStories,
  onToggleLike,
  onAddComment,
  onSharePost,
  onReactStory,
  onViewStory,
  onSelectProfileById,
  onOpenDirectChat,
  onUploadToGallery,
  onOpenCreatePost,
  setActiveTab,
}: TimelineProps) {
  // Comment state maps
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [replyInputs, setReplyInputs] = useState<{ [commentId: string]: string }>({});
  const [activeReplyBoxId, setActiveReplyBoxId] = useState<string | null>(null);

  // Story & Audio states
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const storyFileInputRef = useRef<HTMLInputElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Story Creation extra fields & editor
  const [pendingStoryImage, setPendingStoryImage] = useState<string | null>(null);
  const [showStoryEditorModal, setShowStoryEditorModal] = useState(false);
  const [storyCaption, setStoryCaption] = useState<string>('');
  const [storyLocation, setStoryLocation] = useState('');
  const [storyMusic, setStoryMusic] = useState<{ id?: string; title: string; artist: string; audioUrl?: string; coverUrl?: string } | null>(null);

  // Reaction viewers & post options
  const [viewingReactionsPost, setViewingReactionsPost] = useState<Post | null>(null);
  const [activePostMenuId, setActivePostMenuId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editPostContent, setEditPostContent] = useState('');
  const [editPostImage, setEditPostImage] = useState('');

  // Delete modals
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [deletingStoryId, setDeletingStoryId] = useState<string | null>(null);
  const [showDeleteAllStoriesModal, setShowDeleteAllStoriesModal] = useState(false);
  const [showPendingNotice, setShowPendingNotice] = useState(false);

  const isPending = currentUser?.status === 'pending';

  // Helper: Relative Bangladesh Local Time calculation
  const getRelativeBangladeshTime = (timestampIso: string) => {
    const timeMs = new Date(timestampIso).getTime();
    const nowMs = Date.now();
    const diffSec = Math.floor((nowMs - timeMs) / 1000);

    if (diffSec < 60) return language === 'en' ? 'Just now' : 'এইমাত্র';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return language === 'en' ? `${diffMin}m ago` : `${diffMin} মিনিট আগে`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return language === 'en' ? `${diffHr}h ago` : `${diffHr} ঘণ্টা আগে`;

    // Bangladesh timezone date format
    const options: Intl.DateTimeFormatOptions = { 
      timeZone: 'Asia/Dhaka', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(timestampIso).toLocaleString(language === 'en' ? 'en-US' : 'bn-BD', options);
  };

  // 1. FILTER STORIES: STRICT 24-HOUR VALIDITY
  const now = Date.now();
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  const activeStories = stories.filter(s => {
    const storyTime = new Date(s.timestamp).getTime();
    return (now - storyTime) <= TWENTY_FOUR_HOURS;
  });

  // 2. CHRONOLOGICAL SORT POSTS: NEWEST FIRST
  const sortedPosts = [...posts].sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  // Online members
  const onlineUsers = users.filter(u => u.id !== currentUser?.id && u.status === 'verified');

  // Audio player toggle
  const togglePlayAudio = (id: string, audioUrl?: string) => {
    if (!audioUrl) return;
    if (playingAudioId === id) {
      if (audioRef.current) audioRef.current.pause();
      setPlayingAudioId(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.play().catch(e => console.log('Audio playback exception:', e));
      audio.onended = () => setPlayingAudioId(null);
      setPlayingAudioId(id);
    }
  };

  const handleStoryTrigger = () => {
    if (isPending) {
      setShowPendingNotice(true);
      return;
    }
    storyFileInputRef.current?.click();
  };

  const handleDirectStoryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const url = event.target.result as string;
        setPendingStoryImage(url);
        setStoryCaption('');
        setStoryLocation('');
        setStoryMusic(null);
        setShowStoryEditorModal(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePublishStory = () => {
    if (!pendingStoryImage) return;
    onAddStory(pendingStoryImage, storyLocation || undefined, storyMusic || undefined);
    setShowStoryEditorModal(false);
    setPendingStoryImage(null);
  };

  const handleCommentSubmit = (postId: string) => {
    const text = commentInputs[postId] || '';
    if (!text.trim()) return;
    if (isPending) {
      setShowPendingNotice(true);
      return;
    }
    onAddComment(postId, text);
    setCommentInputs({ ...commentInputs, [postId]: '' });
  };

  const handleReplySubmit = (postId: string, parentCommentId: string) => {
    const text = replyInputs[parentCommentId] || '';
    if (!text.trim()) return;
    if (isPending) {
      setShowPendingNotice(true);
      return;
    }
    onAddComment(postId, text, parentCommentId);
    setReplyInputs({ ...replyInputs, [parentCommentId]: '' });
    setActiveReplyBoxId(null);
  };

  const handleOpenStoryModal = (s: Story) => {
    setActiveStory(s);
    if (onViewStory) onViewStory(s.id);
    if (s.music?.audioUrl) {
      togglePlayAudio(`story-music-${s.id}`, s.music.audioUrl);
    }
  };

  const text = {
    whatOnMind: language === 'en' ? 'What is on your mind, ' : 'আপনার মনে কী আছে, ',
    postNow: language === 'en' ? 'Post Now' : 'পোস্ট লিখুন',
    addStory: language === 'en' ? 'Add 24h Story' : 'স্টোরি যোগ করুন',
    onlineNow: language === 'en' ? 'Online Members' : 'অনলাইনে সক্রিয় সদস্য',
    like: language === 'en' ? 'Like' : 'লাইক',
    love: language === 'en' ? 'Love' : 'লাভ',
    comment: language === 'en' ? 'Comment' : 'কমেন্ট',
    share: language === 'en' ? 'Share' : 'শেয়ার',
    reply: language === 'en' ? 'Reply' : 'উত্তর দিন',
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6" id="facebook-style-timeline-root">
      
      {/* ========================================================================= */}
      {/* 1. LEFT COLUMN: PROFILE SUMMARY & QUICK NAVIGATION (FACEBOOK WEB STYLE) */}
      {/* ========================================================================= */}
      <div className="lg:col-span-3 space-y-4 sm:space-y-5">
        {currentUser && (
          <div className="bg-white border border-neutral-200/80 rounded-2xl shadow-2xs p-4 sm:p-5 space-y-4" id="left-sidebar-card">
            
            {/* User Avatar & Name */}
            <div 
              onClick={() => onSelectProfileById(currentUser.id)}
              className="flex items-center space-x-3.5 p-2 rounded-xl hover:bg-neutral-50 cursor-pointer transition-all border border-transparent hover:border-neutral-200 group"
            >
              <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-neutral-200 group-hover:scale-105 transition-transform shrink-0">
                <SafeImage
                  src={currentUser.profilePicture}
                  alt={currentUser.name}
                  gender={currentUser.gender}
                  fallbackText={currentUser.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-neutral-950 font-serif text-sm truncate group-hover:underline">{currentUser.name}</h4>
                <p className="text-[10px] text-red-700 font-mono font-bold uppercase tracking-wider">{currentUser.profileId}</p>
              </div>
            </div>

            {/* Pending Alert */}
            {isPending && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-1 text-center text-red-900 font-mono text-[11px] font-bold" id="pending-status-alert">
                <ShieldAlert className="h-4 w-4 text-red-600 mx-auto animate-bounce" />
                <p>{language === 'en' ? "Payment Verification Pending" : "পেমেন্ট পাওয়ার পর অ্যাডমিন দ্রুত অ্যাকাউন্ট সক্রিয় করবেন।"}</p>
              </div>
            )}

            {/* Navigation Shortcuts */}
            <div className="space-y-1 pt-2 border-t border-neutral-100 font-mono text-xs">
              
              {/* Write Post Shortcut */}
              <button
                onClick={() => {
                  if (onOpenCreatePost) onOpenCreatePost();
                  else if (setActiveTab) setActiveTab('create-post');
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold flex items-center justify-between transition-all cursor-pointer shadow-2xs"
              >
                <div className="flex items-center space-x-2">
                  <Edit3 className="h-4 w-4 text-amber-400" />
                  <span>{language === 'en' ? 'Create New Post' : 'নতুন পোস্ট লিখুন'}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-neutral-400" />
              </button>

              {/* My Profile */}
              <button
                onClick={() => onSelectProfileById(currentUser.id)}
                className="w-full text-left px-3 py-2 rounded-xl text-neutral-800 hover:bg-neutral-100 font-semibold flex items-center space-x-2.5 cursor-pointer transition-colors"
              >
                <UserIcon className="h-4 w-4 text-neutral-600" />
                <span>{language === 'en' ? 'My Profile' : 'আমার প্রোফাইল'}</span>
              </button>

              {/* Find Matches */}
              <button
                onClick={() => setActiveTab && setActiveTab('search')}
                className="w-full text-left px-3 py-2 rounded-xl text-neutral-800 hover:bg-neutral-100 font-semibold flex items-center space-x-2.5 cursor-pointer transition-colors"
              >
                <Search className="h-4 w-4 text-neutral-600" />
                <span>{language === 'en' ? 'Find Matches' : 'পাত্র/পাত্রী খুঁজুন'}</span>
              </button>

              {/* Messages */}
              <button
                onClick={() => setActiveTab && setActiveTab('chat')}
                className="w-full text-left px-3 py-2 rounded-xl text-neutral-800 hover:bg-neutral-100 font-semibold flex items-center space-x-2.5 cursor-pointer transition-colors"
              >
                <MessageSquare className="h-4 w-4 text-neutral-600" />
                <span>{language === 'en' ? 'Chat Box' : 'চ্যাট বক্স'}</span>
              </button>

              {/* Executives */}
              <button
                onClick={() => setActiveTab && setActiveTab('executives')}
                className="w-full text-left px-3 py-2 rounded-xl text-neutral-800 hover:bg-neutral-100 font-semibold flex items-center space-x-2.5 cursor-pointer transition-colors"
              >
                <Briefcase className="h-4 w-4 text-neutral-600" />
                <span>{language === 'en' ? 'Matchmaking Executives' : 'এক্সিকিউটিভ সার্ভিস'}</span>
              </button>

            </div>

            {/* Followers / Following stats */}
            <div className="grid grid-cols-2 gap-2 text-center pt-3 border-t border-neutral-100 text-xs font-mono">
              <div className="p-2 bg-neutral-50 rounded-xl border border-neutral-100">
                <span className="block font-extrabold text-neutral-900">{currentUser.followers?.length || 0}</span>
                <span className="text-neutral-400 text-[9px] uppercase font-bold">Followers</span>
              </div>
              <div className="p-2 bg-neutral-50 rounded-xl border border-neutral-100">
                <span className="block font-extrabold text-neutral-900">{currentUser.following?.length || 0}</span>
                <span className="text-neutral-400 text-[9px] uppercase font-bold">Following</span>
              </div>
            </div>

          </div>
        )}
      </div>


      {/* ========================================================================= */}
      {/* 2. CENTER COLUMN: STORIES TRAY, COMPOSER BAR & TIMELINE FEED             */}
      {/* ========================================================================= */}
      <div className="lg:col-span-6 space-y-5">
        
        {/* STORY TRAY (STRICT 24H VALIDITY & BANGLADESH TIME DISPLAY) */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-3 sm:p-4 shadow-2xs" id="stories-tray-panel">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-800 flex items-center space-x-1.5">
              <Sparkles className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span>{language === 'en' ? '24h Stories' : '২৪ ঘণ্টার স্টোরি'}</span>
            </h3>
            
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono text-neutral-400 font-semibold">
                {activeStories.length} {language === 'en' ? 'Active' : 'টি সক্রিয়'}
              </span>

              {currentUser && stories.some(s => s.userId === currentUser.id) && (
                <button
                  type="button"
                  onClick={() => setShowDeleteAllStoriesModal(true)}
                  className="text-[10px] bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-lg font-mono font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3 w-3 text-red-600" />
                  <span>মুছুন</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3 overflow-x-auto pb-1 scrollbar-none">
            {/* Hidden Input for Direct Story Upload */}
            <input 
              ref={storyFileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleDirectStoryUpload}
            />

            {/* Create Story card */}
            {currentUser && (
              <div 
                onClick={handleStoryTrigger}
                className="relative w-28 sm:w-32 h-40 sm:h-44 rounded-2xl border-2 border-dashed border-neutral-300 overflow-hidden shadow-2xs hover:border-neutral-900 transition-all cursor-pointer group shrink-0 flex flex-col justify-between bg-neutral-900"
              >
                <div className="absolute inset-0 opacity-60 group-hover:opacity-80 transition-opacity">
                  <SafeImage
                    src={currentUser.profilePicture}
                    alt={currentUser.name}
                    gender={currentUser.gender}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="relative z-10 p-2">
                  <span className="h-8 w-8 bg-white text-neutral-950 rounded-full flex items-center justify-center font-bold text-xs shadow-md">
                    <Plus className="h-5 w-5" />
                  </span>
                </div>
                <div className="relative z-10 p-2 text-center bg-neutral-950/85">
                  <p className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">
                    {text.addStory}
                  </p>
                </div>
              </div>
            )}

            {/* Active stories within 24 hours */}
            {activeStories.map((s) => (
              <div
                key={s.id}
                onClick={() => handleOpenStoryModal(s)}
                className="relative w-28 sm:w-32 h-40 sm:h-44 rounded-2xl overflow-hidden shadow-2xs hover:scale-102 transition-all cursor-pointer group shrink-0 flex flex-col justify-between border-2 border-neutral-900 bg-neutral-950"
              >
                <div className="absolute inset-0">
                  <SafeImage
                    src={s.image}
                    alt={s.userName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-transparent to-neutral-950/40"></div>
                
                <div className="relative z-10 p-2 flex justify-between items-start">
                  <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden shrink-0">
                    <SafeImage
                      src={s.userAvatar}
                      alt={s.userName}
                      fallbackText={s.userName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="relative z-10 p-2 space-y-0.5">
                  <p className="text-[10px] font-bold text-white truncate font-mono">{s.userName}</p>
                  <p className="text-[9px] text-amber-300 font-mono font-semibold">
                    {getRelativeBangladeshTime(s.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>


        {/* CREATE POST TRIGGER BAR (FACEBOOK WEB STYLE) */}
        {currentUser && (
          <div className="bg-white border border-neutral-200/80 rounded-2xl shadow-2xs p-4 space-y-3" id="facebook-post-composer-trigger">
            <div className="flex items-center space-x-3">
              <div 
                onClick={() => onSelectProfileById(currentUser.id)}
                className="w-10 h-10 rounded-full overflow-hidden ring-1 ring-neutral-200 shrink-0 cursor-pointer hover:opacity-90"
              >
                <SafeImage
                  src={currentUser.profilePicture}
                  alt={currentUser.name}
                  gender={currentUser.gender}
                  fallbackText={currentUser.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Input Placeholder Button that opens Dedicated Create Post Page */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenCreatePost) onOpenCreatePost();
                  else if (setActiveTab) setActiveTab('create-post');
                }}
                className="flex-1 bg-neutral-100/80 hover:bg-neutral-200/70 border border-neutral-200 rounded-full px-4 py-2.5 text-left text-xs sm:text-sm text-neutral-500 font-sans cursor-pointer transition-all truncate"
              >
                {text.whatOnMind} {currentUser.name}?
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onOpenCreatePost) onOpenCreatePost();
                  else if (setActiveTab) setActiveTab('create-post');
                }}
                className="px-4 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white font-bold rounded-xl text-xs font-mono uppercase tracking-wider cursor-pointer shadow-2xs hidden sm:flex items-center space-x-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{text.postNow}</span>
              </button>
            </div>

            {/* Quick Action Badges */}
            <div className="border-t border-neutral-100 pt-2.5 flex items-center justify-around text-xs font-mono font-bold text-neutral-700">
              <button
                type="button"
                onClick={() => {
                  if (onOpenCreatePost) onOpenCreatePost();
                  else if (setActiveTab) setActiveTab('create-post');
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer text-emerald-700"
              >
                <ImageIcon className="h-4 w-4" />
                <span>{language === 'en' ? 'Photo/Gallery' : 'ফটো/গ্যালারি'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onOpenCreatePost) onOpenCreatePost();
                  else if (setActiveTab) setActiveTab('create-post');
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer text-red-600"
              >
                <MapPin className="h-4 w-4" />
                <span>{language === 'en' ? 'Location' : 'লোকেশন'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onOpenCreatePost) onOpenCreatePost();
                  else if (setActiveTab) setActiveTab('create-post');
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer text-purple-600"
              >
                <Music className="h-4 w-4" />
                <span>{language === 'en' ? 'Music' : 'মিউজিক'}</span>
              </button>
            </div>
          </div>
        )}


        {/* TIMELINE FEED POSTS (ALWAYS NEWEST FIRST) */}
        <div className="space-y-5" id="timeline-posts-feed">
          {sortedPosts.map((post) => {
            const hasLiked = currentUser ? post.likes.includes(currentUser.id) : false;
            const hasLoved = currentUser ? post.loves.includes(currentUser.id) : false;
            const totalReactions = post.likes.length + post.loves.length;
            const isMyPost = currentUser?.id === post.userId;

            return (
              <div 
                key={post.id} 
                className="bg-white border border-neutral-200/80 rounded-2xl shadow-2xs p-4 sm:p-5 space-y-3.5 relative"
                id={`post-card-${post.id}`}
              >
                {/* Header Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      onClick={() => onSelectProfileById(post.userId)}
                      className="w-10 h-10 rounded-full overflow-hidden cursor-pointer hover:opacity-90 ring-1 ring-neutral-200 shrink-0"
                    >
                      <SafeImage
                        src={post.userAvatar}
                        alt={post.userName}
                        gender={post.userGender}
                        fallbackText={post.userName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span 
                          onClick={() => onSelectProfileById(post.userId)}
                          className="font-bold text-sm text-neutral-950 font-serif hover:underline cursor-pointer"
                        >
                          {post.userName}
                        </span>
                        {post.userBadge === 'vip' && <span className="text-[9px] bg-neutral-950 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wide font-mono">👑 VIP</span>}
                        {post.userBadge === 'premium' && <span className="text-[9px] bg-neutral-100 text-neutral-800 border border-neutral-200 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide font-mono">💎 Pre</span>}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-neutral-500 font-medium font-mono mt-0.5">
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-neutral-400" />
                          <span>{getRelativeBangladeshTime(post.timestamp)}</span>
                        </span>
                        
                        {post.location && (
                          <span className="flex items-center space-x-0.5 text-red-600 font-bold bg-red-50 px-1.5 py-0.2 rounded border border-red-200/60">
                            <MapPin className="h-3 w-3" />
                            <span>{post.location}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Options Menu for Post Owner */}
                  {isMyPost && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setActivePostMenuId(activePostMenuId === post.id ? null : post.id)}
                        className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {activePostMenuId === post.id && (
                        <div className="absolute right-0 top-8 w-44 bg-white border border-neutral-200 rounded-2xl shadow-xl z-20 py-1.5 space-y-0.5 animate-in fade-in duration-150">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPost(post);
                              setEditPostContent(post.content);
                              setEditPostImage(post.image || '');
                              setActivePostMenuId(null);
                            }}
                            className="w-full text-left px-3.5 py-2 text-xs font-bold font-mono text-neutral-700 hover:bg-neutral-100 flex items-center space-x-2 cursor-pointer"
                          >
                            <Edit className="h-3.5 w-3.5 text-neutral-500" />
                            <span>এডিট করুন</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDeletingPostId(post.id);
                              setActivePostMenuId(null);
                            }}
                            className="w-full text-left px-3.5 py-2 text-xs font-bold font-mono text-red-600 hover:bg-red-50 flex items-center space-x-2 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-600" />
                            <span>ডিলিট করুন</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Caption Body */}
                <p className="text-xs sm:text-sm text-neutral-900 leading-relaxed font-sans font-medium whitespace-pre-line">
                  {post.content}
                </p>

                {/* Attached Music Player Bar */}
                {post.music && (
                  <div className="p-3 bg-neutral-900 text-white rounded-2xl border border-neutral-800 shadow-sm flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="relative w-9 h-9 rounded-xl bg-neutral-800 overflow-hidden shrink-0 flex items-center justify-center">
                        <Disc className="h-5 w-5 text-purple-400 animate-spin" style={{ animationDuration: '4s' }} />
                      </div>
                      <div className="truncate space-y-0.5">
                        <h6 className="text-xs font-bold text-white font-mono truncate">{post.music.title}</h6>
                        <p className="text-[10px] text-purple-200 font-mono truncate">{post.music.artist}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => togglePlayAudio(`post-music-${post.id}`, post.music?.audioUrl)}
                      className="px-3 py-1.5 bg-white text-neutral-950 hover:bg-neutral-200 rounded-xl font-mono text-[11px] font-bold flex items-center space-x-1 shrink-0 transition-all cursor-pointer"
                    >
                      {playingAudioId === `post-music-${post.id}` ? (
                        <>
                          <Pause className="h-3 w-3 fill-neutral-950" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3 fill-neutral-950" />
                          <span>Play</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Attached Photo */}
                {post.image && (
                  <div className="rounded-2xl overflow-hidden max-h-[550px] bg-neutral-900/5 border border-neutral-200/60 flex items-center justify-center">
                    <SafeImage src={post.image} alt="Post content" className="w-full h-auto max-h-[550px] object-contain rounded-2xl" />
                  </div>
                )}

                {/* Reactions Count */}
                <div className="flex justify-between items-center text-xs text-neutral-500 border-b border-neutral-100 pb-2.5 font-mono">
                  <div 
                    onClick={() => setViewingReactionsPost(post)}
                    className="flex items-center space-x-3 cursor-pointer hover:underline"
                  >
                    {totalReactions > 0 ? (
                      <span className="flex items-center space-x-1 font-bold text-neutral-950">
                        {post.likes.length > 0 && <ThumbsUp className="h-3.5 w-3.5 fill-neutral-950 text-neutral-950" />}
                        {post.loves.length > 0 && <Heart className="h-3.5 w-3.5 fill-red-600 text-red-600" />}
                        <span>{totalReactions} {language === 'en' ? 'Reactions' : 'টি প্রতিক্রিয়া'}</span>
                      </span>
                    ) : (
                      <span className="text-neutral-400 text-[11px]">{language === 'en' ? 'Be the first to react' : 'প্রথম প্রতিক্রিয়া জানান'}</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 text-[11px]">
                    <span>{post.comments.length} Comments</span>
                    <span>•</span>
                    <span>{post.shares} Shares</span>
                  </div>
                </div>

                {/* Action Buttons: Like, Love, Comment, Share */}
                <div className="grid grid-cols-4 gap-1 border-b border-neutral-100 pb-2 text-xs font-semibold text-neutral-600 font-mono">
                  <button
                    onClick={() => onToggleLike(post.id, 'like')}
                    className={`py-2 rounded-xl flex items-center justify-center space-x-1 hover:bg-neutral-100 transition-all cursor-pointer ${
                      hasLiked ? 'text-neutral-950 font-bold bg-neutral-100' : ''
                    }`}
                  >
                    <ThumbsUp className={`h-4 w-4 ${hasLiked ? 'fill-neutral-950' : ''}`} />
                    <span>{text.like}</span>
                  </button>

                  <button
                    onClick={() => onToggleLike(post.id, 'love')}
                    className={`py-2 rounded-xl flex items-center justify-center space-x-1 hover:bg-neutral-100 transition-all cursor-pointer ${
                      hasLoved ? 'text-red-600 font-bold bg-red-50' : ''
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${hasLoved ? 'fill-red-600 text-red-600' : ''}`} />
                    <span>{text.love}</span>
                  </button>

                  <button
                    onClick={() => {
                      const inputEl = document.getElementById(`comment-input-${post.id}`);
                      if (inputEl) inputEl.focus();
                    }}
                    className="py-2 rounded-xl flex items-center justify-center space-x-1 hover:bg-neutral-100 transition-all text-neutral-600 cursor-pointer"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>{text.comment}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onSharePost) onSharePost(post.id);
                      else alert('পোস্টটি আপনার ওয়ালে শেয়ার করা হয়েছে!');
                    }}
                    className="py-2 rounded-xl flex items-center justify-center space-x-1 hover:bg-neutral-100 transition-all text-neutral-600 cursor-pointer"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>{text.share}</span>
                  </button>
                </div>


                {/* COMMENTS AND REPLIES SECTION (LIVE UPDATES) */}
                <div className="space-y-3 pt-1">
                  
                  {/* Top-Level Comment Composer */}
                  {currentUser && (
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-1 ring-neutral-200">
                        <SafeImage src={currentUser.profilePicture} alt={currentUser.name} gender={currentUser.gender} fallbackText={currentUser.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex bg-neutral-100/80 border border-neutral-200 rounded-2xl px-3.5 py-1.5 items-center">
                        <input
                          id={`comment-input-${post.id}`}
                          type="text"
                          placeholder={language === 'en' ? "Write a comment..." : "একটি মতামত বা বার্তা লিখুন..."}
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCommentSubmit(post.id);
                          }}
                          className="flex-1 bg-transparent border-none text-xs text-neutral-950 focus:outline-none font-sans"
                        />
                        <button 
                          onClick={() => handleCommentSubmit(post.id)}
                          className="text-neutral-900 hover:text-neutral-700 ml-1.5 cursor-pointer p-1"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Render Existing Comments & Nested Replies */}
                  {post.comments.length > 0 && (
                    <div className="space-y-3 bg-neutral-50/60 p-3 sm:p-4 rounded-2xl border border-neutral-100/90 max-h-80 overflow-y-auto">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="space-y-2">
                          
                          {/* Main Comment Bubble */}
                          <div className="flex items-start space-x-2.5 text-xs">
                            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-0.5 ring-1 ring-neutral-200">
                              <SafeImage src={comment.userAvatar} alt={comment.userName} fallbackText={comment.userName} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                              <div className="bg-white p-3 rounded-2xl border border-neutral-200/70 shadow-2xs space-y-0.5">
                                <span className="font-bold text-neutral-950 block font-serif">{comment.userName}</span>
                                <p className="text-neutral-800 leading-relaxed font-sans font-medium">{comment.content}</p>
                              </div>

                              {/* Comment Meta Action bar */}
                              <div className="flex items-center space-x-3 mt-1 ml-1 text-[10px] font-mono text-neutral-400 font-bold">
                                <span>{getRelativeBangladeshTime(comment.timestamp)}</span>
                                <button
                                  type="button"
                                  onClick={() => setActiveReplyBoxId(activeReplyBoxId === comment.id ? null : comment.id)}
                                  className="text-neutral-700 hover:text-neutral-950 cursor-pointer hover:underline"
                                >
                                  {text.reply}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Nested Replies List */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="pl-9 space-y-2 border-l-2 border-neutral-200 ml-4 pt-1">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="flex items-start space-x-2 text-xs">
                                  <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 mt-0.5 ring-1 ring-neutral-200">
                                    <SafeImage src={reply.userAvatar} alt={reply.userName} fallbackText={reply.userName} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="flex-1 bg-white p-2.5 rounded-2xl border border-neutral-200/60 shadow-2xs space-y-0.5">
                                    <span className="font-bold text-neutral-950 block font-serif text-[11px]">{reply.userName}</span>
                                    <p className="text-neutral-800 leading-normal font-sans text-xs">{reply.content}</p>
                                    <p className="text-[9px] font-mono text-neutral-400 font-bold pt-0.5">{getRelativeBangladeshTime(reply.timestamp)}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Inline Reply Input Box */}
                          {activeReplyBoxId === comment.id && currentUser && (
                            <div className="pl-9 flex items-center space-x-2 pt-1">
                              <CornerDownRight className="h-4 w-4 text-neutral-400 shrink-0" />
                              <div className="flex-1 flex bg-white border border-neutral-300 rounded-xl px-3 py-1 items-center">
                                <input
                                  type="text"
                                  placeholder={`${comment.userName}-কে উত্তর দিন...`}
                                  value={replyInputs[comment.id] || ''}
                                  onChange={(e) => setReplyInputs({ ...replyInputs, [comment.id]: e.target.value })}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleReplySubmit(post.id, comment.id);
                                  }}
                                  className="flex-1 bg-transparent border-none text-xs text-neutral-950 focus:outline-none font-sans"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleReplySubmit(post.id, comment.id)}
                                  className="text-neutral-950 hover:text-neutral-700 ml-1 cursor-pointer font-mono font-bold text-[10px] bg-neutral-100 px-2 py-0.5 rounded-md"
                                >
                                  সেন্ড
                                </button>
                              </div>
                            </div>
                          )}

                        </div>
                      ))}
                    </div>
                  )}

                </div>

              </div>
            );
          })}
        </div>

      </div>


      {/* ========================================================================= */}
      {/* 3. RIGHT COLUMN: USER MENU, SETTINGS & EXTRA FEATURES (FACEBOOK WEB STYLE)*/}
      {/* ========================================================================= */}
      <div className="lg:col-span-3 space-y-5">
        
        {/* ONLINE MEMBERS LIST WITH DIRECT CHAT TRIGGER */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-2xs space-y-3" id="online-users-panel">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-800 flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{text.onlineNow}</span>
            </h3>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold">
              {onlineUsers.length} Online
            </span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-none">
            {onlineUsers.map(u => (
              <div 
                key={u.id}
                onClick={() => {
                  if (onOpenDirectChat) onOpenDirectChat(u);
                  else onSelectProfileById(u.id);
                }}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 cursor-pointer transition-all border border-transparent hover:border-neutral-200"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="relative w-8 h-8 shrink-0">
                    <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-neutral-200">
                      <SafeImage src={u.profilePicture} alt={u.name} gender={u.gender} fallbackText={u.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                  </div>
                  <div className="truncate">
                    <h5 className="text-xs font-bold text-neutral-950 font-serif leading-none truncate">{u.name}</h5>
                    <p className="text-[10px] text-neutral-400 font-mono mt-0.5 truncate">{u.district}</p>
                  </div>
                </div>

                <button className="text-[10px] font-mono font-bold text-neutral-950 bg-neutral-100 hover:bg-neutral-950 hover:text-white px-2 py-1 rounded-lg transition-all cursor-pointer shrink-0">
                  Chat
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* USER MENU & EXTRA FEATURES CARD */}
        {currentUser && (
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-2xs space-y-3" id="extra-features-widget">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-800 pb-2 border-b border-neutral-100">
              {language === 'en' ? 'Quick Options & Settings' : 'অতিরিক্ত মেনু ও সেটিংস'}
            </h3>

            <div className="space-y-1 font-mono text-xs">
              <button
                onClick={() => setActiveTab && setActiveTab('edit-profile')}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-100 text-neutral-800 font-semibold flex items-center space-x-2 cursor-pointer transition-colors"
              >
                <Edit3 className="h-4 w-4 text-neutral-600" />
                <span>{language === 'en' ? 'Edit Profile Details' : 'প্রোফাইল সম্পাদন করুন'}</span>
              </button>

              <button
                onClick={() => setActiveTab && setActiveTab('settings')}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-100 text-neutral-800 font-semibold flex items-center space-x-2 cursor-pointer transition-colors"
              >
                <Settings className="h-4 w-4 text-neutral-600" />
                <span>{language === 'en' ? 'Account Settings' : 'অ্যাকাউন্ট সেটিংস'}</span>
              </button>

              <button
                onClick={() => setActiveTab && setActiveTab('pricing')}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-50 text-red-800 font-semibold flex items-center space-x-2 cursor-pointer transition-colors"
              >
                <Award className="h-4 w-4 text-red-600" />
                <span>{language === 'en' ? 'Membership Upgrade' : 'মেম্বারশিপ আপগ্রেড'}</span>
              </button>
            </div>
          </div>
        )}

      </div>


      {/* ========================================================================= */}
      {/* MODALS & OVERLAYS                                                         */}
      {/* ========================================================================= */}

      {/* FULL SCREEN STORY VIEWER */}
      {activeStory && (
        <FullScreenStoryViewer
          language={language}
          stories={stories}
          initialStoryId={activeStory.id}
          currentUser={currentUser}
          users={users}
          onClose={() => {
            setActiveStory(null);
            if (audioRef.current) audioRef.current.pause();
          }}
          onReactStory={(id, type) => {
            if (onReactStory) {
              const mappedType = (type === 'heart' || type === 'love') ? 'love' : 'like';
              onReactStory(id, mappedType);
            }
          }}
          onDeleteStory={(id) => {
            if (onDeleteStory) onDeleteStory(id);
            setActiveStory(null);
          }}
          onSelectProfileById={onSelectProfileById}
        />
      )}

      {/* EDIT POST MODAL */}
      {editingPost && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-neutral-200">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-950 font-serif text-base flex items-center space-x-2">
                <Edit className="h-4 w-4 text-neutral-700" />
                <span>পোস্ট সম্পাদন (Edit Post)</span>
              </h3>
              <button onClick={() => setEditingPost(null)} className="text-neutral-400 hover:text-neutral-950 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (editingPost && onEditPost) {
                  onEditPost(editingPost.id, editPostContent, editPostImage || undefined);
                  setEditingPost(null);
                }
              }} 
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="text-xs font-bold font-mono text-neutral-700">পোস্টের বিষয়বস্তু:</label>
                <textarea
                  rows={4}
                  value={editPostContent}
                  onChange={(e) => setEditPostContent(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs sm:text-sm font-sans focus:outline-none focus:border-neutral-950"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold font-mono text-neutral-700">ছবির লিংক (Image URL):</label>
                <input
                  type="url"
                  value={editPostImage}
                  onChange={(e) => setEditPostImage(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl font-mono cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl font-mono cursor-pointer"
                >
                  সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE POST CONFIRMATION MODAL */}
      {deletingPostId && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-neutral-200 text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-neutral-950 font-serif text-lg">পোস্ট মুছে ফেলতে চান?</h3>
              <p className="text-xs text-neutral-500 font-sans leading-relaxed">
                আপনি কি নিশ্চিত যে এই পোস্টটি স্থায়ীভাবে মুছে ফেলতে চান?
              </p>
            </div>

            <div className="flex justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingPostId(null)}
                className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl font-mono cursor-pointer"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deletingPostId && onDeletePost) onDeletePost(deletingPostId);
                  setDeletingPostId(null);
                }}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl font-mono cursor-pointer shadow-sm"
              >
                হ্যাঁ, ডিলিট করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STORY EDITOR MODAL */}
      {showStoryEditorModal && pendingStoryImage && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-neutral-200">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-950 font-serif text-base flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-amber-500 fill-amber-500" />
                <span>২৪ ঘণ্টার স্টোরি প্রকাশ (Publish Story)</span>
              </h3>
              <button onClick={() => setShowStoryEditorModal(false)} className="text-neutral-400 hover:text-neutral-950 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden h-72 bg-neutral-950 border border-neutral-800 flex items-center justify-center">
              <img src={pendingStoryImage} alt="" className="w-full h-full object-cover" />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setShowStoryEditorModal(false)}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl font-mono cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handlePublishStory}
                className="px-5 py-2 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl font-mono cursor-pointer shadow-md"
              >
                প্রকাশ করুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
