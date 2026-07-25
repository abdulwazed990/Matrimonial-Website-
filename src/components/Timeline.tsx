import React, { useState, useRef } from 'react';
import { User, Post, Story, Comment } from '../types';
import SafeImage from './SafeImage';
import FullScreenStoryViewer from './FullScreenStoryViewer';
import { BANGLADESH_LOCATIONS, MUSIC_CATALOG } from '../data';
import { 
  Heart, ThumbsUp, MessageCircle, Share2, Send, Plus, Lock, Clock, 
  CheckCircle2, ShieldAlert, Eye, Image as ImageIcon, Sparkles, X, 
  Video, Smile, UserCheck, Flame, ChevronRight, Upload, MoreVertical,
  Edit, Trash2, AlertTriangle, ShieldCheck, MapPin, Music, Play, Pause,
  Volume2, Search, Disc, Radio, Camera
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
  onAddComment: (postId: string, commentText: string) => void;
  onSharePost?: (postId: string) => void;
  onReactStory?: (storyId: string, type: 'like' | 'love') => void;
  onViewStory?: (storyId: string) => void;
  onSelectProfileById: (profileId: string) => void;
  onOpenDirectChat?: (user: User) => void;
  onUploadToGallery?: (photoUrl: string) => void;
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
}: TimelineProps) {
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState('');
  const [postLocation, setPostLocation] = useState('');
  const [postMusic, setPostMusic] = useState<{ id?: string; title: string; artist: string; audioUrl?: string; coverUrl?: string } | null>(null);

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationTarget, setLocationTarget] = useState<'post' | 'story'>('post');
  const [customLocationInput, setCustomLocationInput] = useState('');

  const [showMusicModal, setShowMusicModal] = useState(false);
  const [musicTarget, setMusicTarget] = useState<'post' | 'story'>('post');
  const [musicSearchQuery, setMusicSearchQuery] = useState('');
  const [musicCategory, setMusicCategory] = useState<string>('all');

  // Story Creation extra fields & editor
  const [pendingStoryImage, setPendingStoryImage] = useState<string | null>(null);
  const [showStoryEditorModal, setShowStoryEditorModal] = useState(false);
  const [storyScale, setStoryScale] = useState<number>(1);
  const [storyRotate, setStoryRotate] = useState<number>(0);
  const [storyCaption, setStoryCaption] = useState<string>('');
  const [storyTextColor, setStoryTextColor] = useState<string>('#ffffff');
  const [storyLocation, setStoryLocation] = useState('');
  const [storyMusic, setStoryMusic] = useState<{ id?: string; title: string; artist: string; audioUrl?: string; coverUrl?: string } | null>(null);
  const [storyPreviewMode, setStoryPreviewMode] = useState<boolean>(false);

  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const storyFileInputRef = useRef<HTMLInputElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [showImageInput, setShowImageInput] = useState(false);
  const [showGalleryPicker, setShowGalleryPicker] = useState(false);
  const [galleryPickTarget, setGalleryPickTarget] = useState<'post' | 'story'>('post');
  
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [showStoryViewersModal, setShowStoryViewersModal] = useState(false);

  // Reaction viewers modal
  const [viewingReactionsPost, setViewingReactionsPost] = useState<Post | null>(null);

  // Post & Story Management Modals
  const [activePostMenuId, setActivePostMenuId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editPostContent, setEditPostContent] = useState('');
  const [editPostImage, setEditPostImage] = useState('');
  const [editPostLocation, setEditPostLocation] = useState('');
  const [editPostMusic, setEditPostMusic] = useState<{ id?: string; title: string; artist: string; audioUrl?: string; coverUrl?: string } | null>(null);
  
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [deletingStoryId, setDeletingStoryId] = useState<string | null>(null);
  const [showDeleteAllStoriesModal, setShowDeleteAllStoriesModal] = useState(false);
  const [showPendingNotice, setShowPendingNotice] = useState(false);

  const isPending = currentUser?.status === 'pending';

  // Toggle Audio Playback
  const togglePlayAudio = (id: string, audioUrl?: string) => {
    if (!audioUrl) return;
    if (playingAudioId === id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingAudioId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.play().catch(e => console.log('Audio playback prevented:', e));
      audio.onended = () => setPlayingAudioId(null);
      setPlayingAudioId(id);
    }
  };

  // 1. FILTER STORIES: 24 HOUR VALIDITY
  const now = Date.now();
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  const activeStories = stories.filter(s => {
    const storyTime = new Date(s.timestamp).getTime();
    return (now - storyTime) <= TWENTY_FOUR_HOURS;
  });

  // 2. CHRONOLOGICAL SORT POSTS: LATEST FIRST
  const sortedPosts = [...posts].sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  // Online members list
  const onlineUsers = users.filter(u => u.id !== currentUser?.id && u.status === 'verified');

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim() && !postImage) return;

    if (isPending) {
      setShowPendingNotice(true);
      return;
    }

    onAddPost(
      postContent, 
      postImage || undefined, 
      postLocation || undefined, 
      postMusic || undefined
    );
    setPostContent('');
    setPostImage('');
    setPostLocation('');
    setPostMusic(null);
    setShowImageInput(false);
  };

  const handleSaveEditPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost || !onEditPost) return;

    onEditPost(
      editingPost.id, 
      editPostContent, 
      editPostImage || undefined,
      editPostLocation || undefined,
      editPostMusic || undefined
    );
    setEditingPost(null);
    setEditPostContent('');
    setEditPostImage('');
    setEditPostLocation('');
    setEditPostMusic(null);
  };

  const handleConfirmDeletePost = () => {
    if (!deletingPostId || !onDeletePost) return;
    onDeletePost(deletingPostId);
    setDeletingPostId(null);
  };

  const handleConfirmDeleteStory = () => {
    if (!deletingStoryId || !onDeleteStory) return;
    onDeleteStory(deletingStoryId);
    setDeletingStoryId(null);
    if (activeStory?.id === deletingStoryId) {
      setActiveStory(null);
    }
  };

  const handleConfirmDeleteAllStories = () => {
    if (!onDeleteAllStories) return;
    onDeleteAllStories();
    setShowDeleteAllStoriesModal(false);
    setActiveStory(null);
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

  const handleActionRestriction = (e: React.MouseEvent) => {
    if (isPending) {
      e.preventDefault();
      e.stopPropagation();
      setShowPendingNotice(true);
    }
  };

  const handleStoryTrigger = () => {
    if (isPending) {
      setShowPendingNotice(true);
      return;
    }
    // Directly open device gallery / camera picker for story
    if (storyFileInputRef.current) {
      storyFileInputRef.current.click();
    } else {
      setGalleryPickTarget('story');
      setShowGalleryPicker(true);
    }
  };

  const handleOpenStoryModal = (s: Story) => {
    setActiveStory(s);
    if (onViewStory) {
      onViewStory(s.id);
    }
    // Auto-play story music if available
    if (s.music?.audioUrl) {
      togglePlayAudio(`story-music-${s.id}`, s.music.audioUrl);
    }
  };

  const handleDirectFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'post' | 'story') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const url = event.target.result as string;
        if (target === 'post') {
          setPostImage(url);
          setShowImageInput(true);
        } else {
          // Open story editor modal for customization
          setPendingStoryImage(url);
          setStoryScale(1);
          setStoryRotate(0);
          setStoryCaption('');
          setStoryTextColor('#ffffff');
          setStoryLocation('');
          setStoryMusic(null);
          setStoryPreviewMode(false);
          setShowStoryEditorModal(true);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const text = {
    homeFeedTitle: language === 'en' ? 'Marriage News Feed' : 'বিবাহবন্ধনে হোম নিউজ ফিড',
    whatOnMind: language === 'en' ? 'Share your thoughts, wedding values, or life goals...' : 'আপনার বিবাহের চিন্তা, জীবনের লক্ষ্য বা সুন্দর কথা লিখুন...',
    sharePost: language === 'en' ? 'Publish Post' : 'পোস্ট প্রকাশ করুন',
    addStory: language === 'en' ? 'Add 24h Story' : 'স্টোরি যোগ করুন',
    onlineNow: language === 'en' ? 'Online Members' : 'অনলাইনে আছেন',
    viewers: language === 'en' ? 'Story Viewers' : 'কে কে দেখেছেন',
    viewersOnlyOwner: language === 'en' ? 'Visible only to you as story creator' : 'শুধুমাত্র আপনি দেখতে পাবেন',
    pickFromGallery: language === 'en' ? 'Choose from My Gallery' : 'গ্যালারি থেকে বেছে নিন',
    uploadNewFile: language === 'en' ? 'Upload Photo / Video' : 'নতুন ছবি / ভিডিও ফাইল আপলোড',
    reactedBy: language === 'en' ? 'Reactions on Post' : 'পোস্টে প্রতিক্রিয়া ব্যক্তকারীগণ',
    like: language === 'en' ? 'Like' : 'লাইক',
    love: language === 'en' ? 'Love' : 'লাভ',
    comment: language === 'en' ? 'Comment' : 'কমেন্ট',
    share: language === 'en' ? 'Share' : 'শেয়ার',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6" id="newsfeed-root-layout">
      
      {/* LEFT COLUMN: PROFILE CARD & SHORTCUTS (Col span 3) */}
      <div className="lg:col-span-3 space-y-6">
        {currentUser ? (
          <div className="bg-white border border-neutral-200/80 rounded-2xl shadow-xs p-5 space-y-4" id="timeline-left-card">
            <div className="text-center space-y-3">
              <div 
                onClick={() => onSelectProfileById(currentUser.id)} 
                className="relative inline-block cursor-pointer group"
              >
                <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-neutral-200 group-hover:opacity-90 mx-auto transition-all">
                  <SafeImage
                    src={currentUser.profilePicture}
                    alt={currentUser.name}
                    gender={currentUser.gender}
                    fallbackText={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {currentUser.status === 'verified' && (
                  <span className="absolute bottom-0 right-1 bg-neutral-900 text-white p-1 rounded-full ring-2 ring-white">
                    <CheckCircle2 className="h-3.5 w-3.5 fill-neutral-950 text-white" />
                  </span>
                )}
              </div>
              <div>
                <h4 
                  onClick={() => onSelectProfileById(currentUser.id)}
                  className="font-bold text-neutral-900 font-serif text-base leading-tight hover:underline cursor-pointer"
                >
                  {currentUser.name}
                </h4>
                <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider font-mono mt-0.5">{currentUser.profileId}</p>
              </div>
            </div>

            {/* Pending Warning */}
            {isPending && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-1.5 text-center text-red-900" id="global-pending-status-alert">
                <ShieldAlert className="h-5 w-5 text-red-600 mx-auto animate-bounce" />
                <p className="text-[11px] font-bold leading-tight font-mono">
                  {language === 'en' 
                    ? "Payment Verification Pending"
                    : "পেমেন্ট পাওয়ার পর অ্যাডমিন অ্যাকাউন্টটি দ্রুত চালু করে দেবেন।"}
                </p>
              </div>
            )}

            {/* Status & Stats */}
            <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-neutral-100 text-xs font-mono">
              <div className="p-2 bg-neutral-50 rounded-xl border border-neutral-100">
                <span className="block font-extrabold text-neutral-900">{currentUser.followers?.length || 0}</span>
                <span className="text-neutral-400 text-[9px] uppercase font-bold tracking-wider">Followers</span>
              </div>
              <div className="p-2 bg-neutral-50 rounded-xl border border-neutral-100">
                <span className="block font-extrabold text-neutral-900">{currentUser.following?.length || 0}</span>
                <span className="text-neutral-400 text-[9px] uppercase font-bold tracking-wider">Following</span>
              </div>
            </div>

            {/* My Gallery & Profile Shortcuts */}
            <div className="space-y-1 pt-2 border-t border-neutral-100 font-mono text-xs">
              <button
                onClick={() => onSelectProfileById(currentUser.id)}
                className="w-full text-left px-3 py-2 rounded-xl text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 font-semibold flex items-center justify-between cursor-pointer"
              >
                <span>👤 {language === 'en' ? 'My Full Profile' : 'আমার সম্পূর্ণ প্রোফাইল'}</span>
                <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
              </button>
              <button
                onClick={() => onSelectProfileById(currentUser.id)}
                className="w-full text-left px-3 py-2 rounded-xl text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 font-semibold flex items-center justify-between cursor-pointer"
              >
                <span>🖼️ {language === 'en' ? 'My Photo Gallery' : 'আমার ফটো গ্যালারি'}</span>
                <span className="text-[10px] bg-neutral-200 text-neutral-800 px-1.5 py-0.5 rounded font-bold">
                  {currentUser.galleryPhotos?.length || 0}
                </span>
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* CENTER COLUMN: STORIES, COMPOSER & FEED (Col span 6) */}
      <div className="lg:col-span-6 space-y-6">
        
        {/* 1. STORIES TRAY (24H EXPIRATION) */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-3.5 shadow-xs" id="stories-tray-panel">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-800 flex items-center space-x-1.5">
              <Sparkles className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span>{language === 'en' ? '24h Expiry Stories' : '২৪ ঘণ্টার স্টোরি ফিড'}</span>
            </h3>
            
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono text-neutral-400 font-semibold">
                {activeStories.length} {language === 'en' ? 'Active' : 'টি স্টোরি আছে'}
              </span>

              {/* Owner Delete All Stories button */}
              {currentUser && stories.some(s => s.userId === currentUser.id) && (
                <button
                  type="button"
                  onClick={() => setShowDeleteAllStoriesModal(true)}
                  className="text-[10px] bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-lg font-mono font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                  title="আমার সব স্টোরি ডিলিট করুন"
                >
                  <Trash2 className="h-3 w-3 text-red-600" />
                  <span>সব স্টোরি ডিলিট</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3 overflow-x-auto pb-1 scrollbar-none">
            {/* Hidden Direct File Upload for Story */}
            <input 
              ref={storyFileInputRef}
              type="file" 
              accept="image/*,video/*" 
              className="hidden" 
              onChange={(e) => handleDirectFileUpload(e, 'story')}
            />

            {/* Create Story card */}
            {currentUser && (
              <div 
                onClick={handleStoryTrigger}
                className="relative w-28 h-40 rounded-2xl border-2 border-dashed border-neutral-300 overflow-hidden shadow-xs hover:border-neutral-900 transition-all cursor-pointer group shrink-0 flex flex-col justify-between bg-neutral-900"
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
                  <span className="h-7 w-7 bg-white text-neutral-950 rounded-full flex items-center justify-center font-bold text-xs shadow-md">
                    <Plus className="h-4.5 w-4.5" />
                  </span>
                </div>
                <div className="relative z-10 p-2 text-center bg-neutral-950/80">
                  <p className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">
                    {text.addStory}
                  </p>
                </div>
              </div>
            )}

            {/* Active stories */}
            {activeStories.map((s) => (
              <div
                key={s.id}
                onClick={() => handleOpenStoryModal(s)}
                className="relative w-28 h-40 rounded-2xl overflow-hidden shadow-xs hover:scale-102 transition-all cursor-pointer group shrink-0 flex flex-col justify-between border-2 border-neutral-900 bg-neutral-950"
              >
                <div className="absolute inset-0">
                  <SafeImage
                    src={s.image}
                    alt={s.userName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-neutral-950/40"></div>
                
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
                  <p className="text-[9px] text-neutral-300 font-mono">
                    {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. COMPOSER WIDGET */}
        {currentUser && (
          <div className="bg-white border border-neutral-200/80 rounded-2xl shadow-xs p-4 sm:p-5 space-y-3" id="feed-composer">
            <form onSubmit={handlePostSubmit} className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden ring-1 ring-neutral-200 shrink-0">
                  <SafeImage
                    src={currentUser.profilePicture}
                    alt={currentUser.name}
                    gender={currentUser.gender}
                    fallbackText={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <textarea
                    rows={2}
                    placeholder={language === 'en' ? `What is on your mind, ${currentUser.name}?` : `${currentUser.name}, আপনার নতুন কিছু পোস্ট করার ইচ্ছা আছে?`}
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-neutral-400 font-sans"
                  />
                </div>
              </div>

              {/* Photo preview or URL input */}
              {postImage && (
                <div className="relative rounded-xl overflow-hidden max-h-48 bg-neutral-100 border border-neutral-200">
                  <SafeImage src={postImage} alt="Post preview" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => setPostImage('')}
                    className="absolute top-2 right-2 bg-neutral-900/80 text-white p-1 rounded-full hover:bg-neutral-950 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Location or Music Attached Chips */}
              {(postLocation || postMusic) && (
                <div className="flex flex-wrap gap-2 pt-1 font-mono text-xs">
                  {postLocation && (
                    <span className="inline-flex items-center space-x-1 px-3 py-1 bg-red-50 text-red-900 border border-red-200 rounded-full font-bold">
                      <MapPin className="h-3.5 w-3.5 text-red-600" />
                      <span>{postLocation}</span>
                      <button type="button" onClick={() => setPostLocation('')} className="ml-1 text-red-500 hover:text-red-900 cursor-pointer">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}

                  {postMusic && (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-purple-50 text-purple-900 border border-purple-200 rounded-full font-bold">
                      <Music className="h-3.5 w-3.5 text-purple-600 animate-pulse" />
                      <span>{postMusic.title} - {postMusic.artist}</span>
                      <button type="button" onClick={() => setPostMusic(null)} className="ml-1 text-purple-500 hover:text-purple-900 cursor-pointer">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}



              <div className="border-t border-neutral-100 pt-3 flex flex-wrap justify-between items-center gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl font-semibold flex items-center space-x-1.5 cursor-pointer font-mono text-[11px]">
                    <Upload className="h-3.5 w-3.5 text-neutral-600" />
                    <span>{text.uploadNewFile}</span>
                    <input 
                      type="file" 
                      accept="image/*,video/*" 
                      className="hidden" 
                      onChange={(e) => handleDirectFileUpload(e, 'post')}
                    />
                  </label>

                  <label className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl font-semibold flex items-center space-x-1.5 cursor-pointer font-mono text-[11px]">
                    <Camera className="h-3.5 w-3.5 text-neutral-600" />
                    <span>ক্যামেরা (Camera)</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment"
                      className="hidden" 
                      onChange={(e) => handleDirectFileUpload(e, 'post')}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setGalleryPickTarget('post');
                      setShowGalleryPicker(true);
                    }}
                    className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl font-semibold flex items-center space-x-1.5 font-mono text-[11px] cursor-pointer"
                  >
                    <ImageIcon className="h-3.5 w-3.5 text-neutral-600" />
                    <span>{text.pickFromGallery}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLocationTarget('post');
                      setShowLocationModal(true);
                    }}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-800 rounded-xl font-semibold flex items-center space-x-1.5 font-mono text-[11px] cursor-pointer border border-red-200/60"
                  >
                    <MapPin className="h-3.5 w-3.5 text-red-600" />
                    <span>লোকেশন যোগ করুন</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMusicTarget('post');
                      setShowMusicModal(true);
                    }}
                    className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-xl font-semibold flex items-center space-x-1.5 font-mono text-[11px] cursor-pointer border border-purple-200/60"
                  >
                    <Music className="h-3.5 w-3.5 text-purple-600" />
                    <span>মিউজিক যোগ করুন</span>
                  </button>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl shadow-xs uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer font-mono"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{text.sharePost}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 3. CHRONOLOGICAL NEWS FEED POSTS */}
        <div className="space-y-6" id="news-feed-posts-list">
          {sortedPosts.map((post) => {
            const hasLiked = currentUser ? post.likes.includes(currentUser.id) : false;
            const hasLoved = currentUser ? post.loves.includes(currentUser.id) : false;
            const totalReactions = post.likes.length + post.loves.length;
            const isMyPost = currentUser?.id === post.userId;

            return (
              <div 
                key={post.id} 
                className="bg-white border border-neutral-200/80 rounded-2xl shadow-xs p-4 sm:p-5 space-y-4 relative"
                id={`timeline-post-${post.id}`}
              >
                {/* Header info */}
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
                          className="font-bold text-sm text-neutral-900 font-serif hover:underline cursor-pointer"
                        >
                          {post.userName}
                        </span>
                        {post.userBadge === 'vip' && <span className="text-[9px] bg-neutral-900 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wide font-mono">👑 VIP</span>}
                        {post.userBadge === 'premium' && <span className="text-[9px] bg-neutral-100 text-neutral-800 border border-neutral-200 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide font-mono">💎 Pre</span>}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-neutral-500 font-medium font-mono mt-0.5">
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-neutral-300" />
                          <span>{new Date(post.timestamp).toLocaleString()}</span>
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
                            className="w-full text-left px-3.5 py-2 text-xs font-bold font-mono text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 flex items-center space-x-2 cursor-pointer"
                          >
                            <Edit className="h-3.5 w-3.5 text-neutral-500" />
                            <span>পোস্ট এডিট করুন</span>
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
                            <span>পোস্ট ডিলিট করুন</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Content body */}
                <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed font-sans font-medium whitespace-pre-line">
                  {post.content}
                </p>

                {/* Attached Music Player Bar */}
                {post.music && (
                  <div className="p-3 bg-gradient-to-r from-purple-900 via-indigo-900 to-neutral-900 text-white rounded-2xl border border-purple-800/50 shadow-md flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="relative w-10 h-10 rounded-xl bg-purple-950 overflow-hidden shrink-0 border border-purple-500/30 flex items-center justify-center">
                        {post.music.coverUrl ? (
                          <img src={post.music.coverUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Disc className="h-6 w-6 text-purple-300 animate-spin" style={{ animationDuration: '4s' }} />
                        )}
                        <span className="absolute inset-0 bg-purple-900/30 flex items-center justify-center">
                          <Music className="h-4 w-4 text-white" />
                        </span>
                      </div>
                      <div className="truncate space-y-0.5">
                        <h6 className="text-xs font-bold text-white font-mono truncate">{post.music.title}</h6>
                        <p className="text-[10px] text-purple-200 font-mono truncate">{post.music.artist}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => togglePlayAudio(`post-music-${post.id}`, post.music?.audioUrl)}
                      className="px-3.5 py-2 bg-white hover:bg-purple-100 text-purple-950 rounded-xl font-mono text-xs font-bold flex items-center space-x-1.5 shrink-0 transition-all cursor-pointer shadow-sm"
                    >
                      {playingAudioId === `post-music-${post.id}` ? (
                        <>
                          <Pause className="h-3.5 w-3.5 fill-purple-950" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5 fill-purple-950" />
                          <span>Play Tune</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Attached Photo */}
                {post.image && (
                  <div className="rounded-2xl overflow-hidden max-h-[600px] bg-neutral-900/5 border border-neutral-200/60 flex items-center justify-center">
                    <SafeImage src={post.image} alt="Post content" className="w-full h-auto max-h-[600px] object-contain rounded-2xl" />
                  </div>
                )}

                {/* Counts bar & Reacted Users viewer trigger */}
                <div className="flex justify-between items-center text-xs text-neutral-500 border-b border-neutral-100 pb-2.5 font-mono">
                  <div 
                    onClick={() => setViewingReactionsPost(post)}
                    className="flex items-center space-x-3 cursor-pointer hover:underline"
                  >
                    {totalReactions > 0 ? (
                      <span className="flex items-center space-x-1 font-bold text-neutral-900">
                        {post.likes.length > 0 && <ThumbsUp className="h-3.5 w-3.5 fill-neutral-900 text-neutral-900" />}
                        {post.loves.length > 0 && <Heart className="h-3.5 w-3.5 fill-red-600 text-red-600" />}
                        <span>{totalReactions} {language === 'en' ? 'Reactions' : 'টি প্রতিক্রিয়া'}</span>
                      </span>
                    ) : (
                      <span className="text-neutral-400 text-[11px]">{language === 'en' ? 'Be the first to react' : 'প্রথম প্রতিক্রিয়া দিন'}</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 text-[11px]">
                    <span>{post.comments.length} Comments</span>
                    <span>•</span>
                    <span>{post.shares} Shares</span>
                  </div>
                </div>

                {/* Action buttons (Like, Love, Comment, Share) */}
                <div className="grid grid-cols-4 gap-1 border-b border-neutral-100 pb-2.5 text-xs font-semibold text-neutral-600 font-mono">
                  <button
                    onClick={(e) => {
                      handleActionRestriction(e);
                      if (!isPending) onToggleLike(post.id, 'like');
                    }}
                    className={`py-2 rounded-lg flex items-center justify-center space-x-1 hover:bg-neutral-100 transition-all cursor-pointer ${
                      hasLiked ? 'text-neutral-950 font-bold bg-neutral-100' : ''
                    }`}
                  >
                    <ThumbsUp className={`h-4 w-4 ${hasLiked ? 'fill-neutral-950' : ''}`} />
                    <span>{text.like}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      handleActionRestriction(e);
                      if (!isPending) onToggleLike(post.id, 'love');
                    }}
                    className={`py-2 rounded-lg flex items-center justify-center space-x-1 hover:bg-neutral-100 transition-all cursor-pointer ${
                      hasLoved ? 'text-red-600 font-bold bg-red-50' : ''
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${hasLoved ? 'fill-red-600 text-red-600' : ''}`} />
                    <span>{text.love}</span>
                  </button>

                  <button
                    onClick={(e) => handleActionRestriction(e)}
                    className="py-2 rounded-lg flex items-center justify-center space-x-1 hover:bg-neutral-100 transition-all text-neutral-600 cursor-pointer"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>{text.comment}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onSharePost) onSharePost(post.id);
                      else alert('পোস্টটি আপনার প্রোফাইল ফিডে শেয়ার করা হয়েছে!');
                    }}
                    className="py-2 rounded-lg flex items-center justify-center space-x-1 hover:bg-neutral-100 transition-all text-neutral-600 cursor-pointer"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>{text.share}</span>
                  </button>
                </div>

                {/* Comment composer */}
                {currentUser && (
                  <div className="flex items-center space-x-2.5 pt-1">
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                      <SafeImage src={currentUser.profilePicture} alt={currentUser.name} gender={currentUser.gender} fallbackText={currentUser.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-1.5 items-center">
                      <input
                        type="text"
                        placeholder={language === 'en' ? "Write a comment..." : "একটি মতামত বা বার্তা লিখুন..."}
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleCommentSubmit(post.id);
                          }
                        }}
                        className="flex-1 bg-transparent border-none text-xs text-neutral-900 focus:outline-none font-sans"
                      />
                      <button 
                        onClick={() => handleCommentSubmit(post.id)}
                        className="text-neutral-900 hover:text-neutral-700 ml-1.5 cursor-pointer"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Comments listing */}
                {post.comments.length > 0 && (
                  <div className="space-y-2.5 pt-2 bg-neutral-50 p-3 rounded-xl border border-neutral-100 max-h-56 overflow-y-auto">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="flex items-start space-x-2.5 text-xs">
                        <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mt-0.5">
                          <SafeImage src={comment.userAvatar} alt={comment.userName} fallbackText={comment.userName} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 bg-white p-2.5 rounded-xl border border-neutral-200/60 shadow-2xs">
                          <span className="font-bold text-neutral-900 block font-serif">{comment.userName}</span>
                          <p className="text-neutral-700 mt-0.5 leading-normal font-sans font-medium">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            );
          })}
        </div>

      </div>

      {/* RIGHT COLUMN: ONLINE USERS & HELPLINE (Col span 3) */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* ONLINE MEMBERS LIST */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-xs space-y-3" id="online-users-widget">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-800 flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{text.onlineNow}</span>
            </h3>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold">
              {onlineUsers.length} Online
            </span>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {onlineUsers.map(u => (
              <div 
                key={u.id}
                onClick={() => {
                  if (onOpenDirectChat) onOpenDirectChat(u);
                  else onSelectProfileById(u.id);
                }}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 cursor-pointer transition-all border border-transparent hover:border-neutral-200"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="relative w-9 h-9 shrink-0">
                    <div className="w-9 h-9 rounded-full overflow-hidden ring-1 ring-neutral-200">
                      <SafeImage src={u.profilePicture} alt={u.name} gender={u.gender} fallbackText={u.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-neutral-900 font-serif leading-none">{u.name}</h5>
                    <p className="text-[10px] text-neutral-400 font-mono mt-0.5">{u.district}</p>
                  </div>
                </div>

                <button className="text-[10px] font-mono font-bold text-neutral-800 bg-neutral-100 hover:bg-neutral-900 hover:text-white px-2 py-1 rounded-lg transition-all cursor-pointer">
                  Chat
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ---------------------------------------------------- */}
      {/* EDIT POST MODAL                                      */}
      {/* ---------------------------------------------------- */}
      {editingPost && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-neutral-200">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-900 font-serif text-base flex items-center space-x-2">
                <Edit className="h-4 w-4 text-neutral-700" />
                <span>পোস্ট সম্পাদন (Edit Post)</span>
              </h3>
              <button onClick={() => setEditingPost(null)} className="text-neutral-400 hover:text-neutral-900 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditPost} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold font-mono text-neutral-700">পোস্টের বিষয়বস্তু:</label>
                <textarea
                  rows={4}
                  value={editPostContent}
                  onChange={(e) => setEditPostContent(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs sm:text-sm font-sans focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold font-mono text-neutral-700">ছবির লিংক (Image URL):</label>
                <input
                  type="url"
                  value={editPostImage}
                  onChange={(e) => setEditPostImage(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 text-xs font-mono focus:outline-none"
                />
              </div>

              {editPostImage && (
                <div className="h-32 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
                  <SafeImage src={editPostImage} alt="Edit preview" className="w-full h-full object-cover" />
                </div>
              )}

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
                  className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl font-mono cursor-pointer"
                >
                  সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* DELETE POST CONFIRMATION MODAL                       */}
      {/* ---------------------------------------------------- */}
      {deletingPostId && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-neutral-200 text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-neutral-900 font-serif text-lg">পোস্ট মুছে ফেলতে চান?</h3>
              <p className="text-xs text-neutral-500 font-sans leading-relaxed">
                আপনি কি নিশ্চিত যে এই পোস্টটি স্থায়ীভাবে ডিলিট করতে চান? এই প্রক্রিয়াটি আর ফিরিয়ে আনা যাবে না।
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
                onClick={handleConfirmDeletePost}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl font-mono cursor-pointer shadow-sm"
              >
                হ্যাঁ, ডিলিট করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* DELETE ALL STORIES CONFIRMATION MODAL                 */}
      {/* ---------------------------------------------------- */}
      {showDeleteAllStoriesModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-neutral-200 text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-neutral-900 font-serif text-lg">সব স্টোরি ডিলিট করবেন?</h3>
              <p className="text-xs text-neutral-500 font-sans leading-relaxed">
                আপনি কি এক ক্লিকে আপনার প্রকাশিত সব স্টোরি মুছে ফেলতে চান?
              </p>
            </div>

            <div className="flex justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteAllStoriesModal(false)}
                className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl font-mono cursor-pointer"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAllStories}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl font-mono cursor-pointer shadow-sm"
              >
                হ্যাঁ, সব ডিলিট করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* FULL SCREEN MODERN STORY VIEWER                     */}
      {/* ---------------------------------------------------- */}
      {activeStory && (
        <FullScreenStoryViewer
          language={language}
          stories={stories}
          initialStoryId={activeStory.id}
          currentUser={currentUser}
          users={users}
          onClose={() => setActiveStory(null)}
          onDeleteStory={(storyId) => {
            if (onDeleteStory) onDeleteStory(storyId);
            setActiveStory(null);
          }}
          onReactStory={onReactStory}
          onSendReply={(targetUserId, messageText) => {
            if (onOpenDirectChat) {
              const targetUser = users.find((u) => u.id === targetUserId);
              if (targetUser) onOpenDirectChat(targetUser);
            }
          }}
          onViewStory={onViewStory}
          onSelectProfileById={onSelectProfileById}
        />
      )}

      {/* DELETE SINGLE STORY CONFIRMATION MODAL */}
      {deletingStoryId && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-neutral-200 text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-neutral-900 font-serif text-lg">স্টোরি ডিলিট করবেন?</h3>
              <p className="text-xs text-neutral-500 font-sans leading-relaxed">
                আপনি কি নিশ্চিত যে এই স্টোরিটি মুছে ফেলতে চান?
              </p>
            </div>

            <div className="flex justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingStoryId(null)}
                className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl font-mono cursor-pointer"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteStory}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl font-mono cursor-pointer shadow-sm"
              >
                হ্যাঁ, ডিলিট করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* GALLERY SELECTOR MODAL FOR POST / STORY               */}
      {/* ---------------------------------------------------- */}
      {showGalleryPicker && currentUser && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-neutral-200">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-900 font-mono text-sm">
                {galleryPickTarget === 'post' ? 'পোস্টে ছবি বেছে নিন' : 'স্টোরিতে ছবি বেছে নিন'}
              </h3>
              <button onClick={() => setShowGalleryPicker(false)} className="text-neutral-400 hover:text-neutral-900 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Gallery photos grid */}
            <div className="space-y-2">
              <p className="text-xs font-mono font-bold text-neutral-500">আপনার গ্যালারিতে সংরক্ষিত ছবিসমূহ:</p>
              
              {(!currentUser.galleryPhotos || currentUser.galleryPhotos.length === 0) ? (
                <div className="text-center p-6 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
                  <p className="text-xs text-neutral-500 font-mono">গ্যালারিতে এখনো কোনো ছবি আপলোড করা হয়নি।</p>
                  <label className="inline-block px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-mono font-bold cursor-pointer">
                    নতুন ফাইল সিলেক্ট করুন
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        setShowGalleryPicker(false);
                        handleDirectFileUpload(e, galleryPickTarget);
                      }}
                    />
                  </label>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto p-1">
                  {currentUser.galleryPhotos.map((img, idx) => (
                    <div key={idx} className="h-24 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-neutral-900 transition-all border border-neutral-200">
                      <SafeImage
                        src={img}
                        alt="Gallery item"
                        onClick={() => {
                          if (galleryPickTarget === 'post') {
                            setPostImage(img);
                            setShowImageInput(true);
                          } else {
                            onAddStory(img);
                          }
                          setShowGalleryPicker(false);
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-neutral-100">
              <label className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-xl font-mono text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer">
                <Upload className="h-4 w-4" />
                <span>মোবাইল গ্যালারি থেকে নতুন ছবি নির্বাচন করুন</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    setShowGalleryPicker(false);
                    handleDirectFileUpload(e, galleryPickTarget);
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* WHO REACTED MODAL                                    */}
      {/* ---------------------------------------------------- */}
      {viewingReactionsPost && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-neutral-200">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-900 font-mono text-sm flex items-center space-x-2">
                <Heart className="h-4 w-4 text-red-600 fill-red-600" />
                <span>{text.reactedBy}</span>
              </h3>
              <button onClick={() => setViewingReactionsPost(null)} className="text-neutral-400 hover:text-neutral-900 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {viewingReactionsPost.likes.map(uId => {
                const u = users.find(usr => usr.id === uId);
                if (!u) return null;
                return (
                  <div 
                    key={uId} 
                    onClick={() => {
                      setViewingReactionsPost(null);
                      onSelectProfileById(u.id);
                    }}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                        <SafeImage src={u.profilePicture} alt={u.name} gender={u.gender} fallbackText={u.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold font-serif text-neutral-900">{u.name}</h5>
                        <p className="text-[10px] text-neutral-400 font-mono">{u.district}</p>
                      </div>
                    </div>
                    <span className="text-xs">👍</span>
                  </div>
                );
              })}

              {viewingReactionsPost.loves.map(uId => {
                const u = users.find(usr => usr.id === uId);
                if (!u) return null;
                return (
                  <div 
                    key={uId} 
                    onClick={() => {
                      setViewingReactionsPost(null);
                      onSelectProfileById(u.id);
                    }}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                        <SafeImage src={u.profilePicture} alt={u.name} gender={u.gender} fallbackText={u.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold font-serif text-neutral-900">{u.name}</h5>
                        <p className="text-[10px] text-neutral-400 font-mono">{u.district}</p>
                      </div>
                    </div>
                    <span className="text-xs">❤️</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* LOCATION SELECTOR MODAL                              */}
      {/* ---------------------------------------------------- */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-neutral-200">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-900 font-serif text-base flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-red-600" />
                <span>লোকেশন নির্বাচন করুন (Select Location)</span>
              </h3>
              <button onClick={() => setShowLocationModal(false)} className="text-neutral-400 hover:text-neutral-900 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-neutral-500 font-sans">বাংলাদেশের প্রধান স্থান বা শহরসমূহ থেকে বেছে নিন অথবা কাস্টম নাম দিন:</p>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="যেমন: Gulshan, Dhaka / Sylhet Sadar..."
                  value={customLocationInput}
                  onChange={(e) => setCustomLocationInput(e.target.value)}
                  className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-sans focus:outline-none focus:border-red-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customLocationInput.trim()) {
                      if (locationTarget === 'post') setPostLocation(customLocationInput.trim());
                      else setStoryLocation(customLocationInput.trim());
                      setCustomLocationInput('');
                      setShowLocationModal(false);
                    }
                  }}
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl text-xs font-mono cursor-pointer"
                >
                  যোগ করুন
                </button>
              </div>

              <div className="max-h-56 overflow-y-auto space-y-1 pt-1 border-t border-neutral-100 pr-1">
                {BANGLADESH_LOCATIONS.map((loc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (locationTarget === 'post') setPostLocation(loc);
                      else setStoryLocation(loc);
                      setShowLocationModal(false);
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-red-50 text-xs font-mono text-neutral-800 flex items-center justify-between cursor-pointer group transition-colors"
                  >
                    <span className="group-hover:text-red-900 group-hover:font-bold">📍 {loc}</span>
                    <span className="text-[10px] text-neutral-400 group-hover:text-red-700">সিলেক্ট</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MUSIC SELECTOR MODAL                                 */}
      {/* ---------------------------------------------------- */}
      {showMusicModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-neutral-200">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-900 font-serif text-base flex items-center space-x-2">
                <Music className="h-4 w-4 text-purple-600" />
                <span>বিবাহবন্ধনে মিউজিক গ্যালারি (Music Catalog)</span>
              </h3>
              <button onClick={() => setShowMusicModal(false)} className="text-neutral-400 hover:text-neutral-900 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Language Category Filter Tabs */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none font-mono text-[11px]">
                {[
                  { id: 'all', label: 'সব গান' },
                  { id: 'bangla', label: 'বাংলা' },
                  { id: 'hindi', label: 'হিন্দি' },
                  { id: 'arabic', label: 'আরবি' },
                  { id: 'english', label: 'ইংরেজি' },
                  { id: 'other', label: 'অন্যান্য' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setMusicCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-bold transition-all cursor-pointer ${
                      musicCategory === cat.id
                        ? 'bg-purple-900 text-white shadow-xs'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search bar */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="গান বা শিল্পীর নাম দিয়ে খুঁজুন (e.g. Sundori Komola)..."
                  value={musicSearchQuery}
                  onChange={(e) => setMusicSearchQuery(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-3 py-2 text-xs font-sans focus:outline-none focus:border-purple-600"
                />
              </div>

              {/* Music List */}
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {MUSIC_CATALOG
                  .filter(m => (musicCategory === 'all' || m.language === musicCategory) && 
                    (m.title.toLowerCase().includes(musicSearchQuery.toLowerCase()) || m.artist.toLowerCase().includes(musicSearchQuery.toLowerCase())))
                  .map((track) => (
                    <div
                      key={track.id}
                      className="p-3 bg-neutral-50 hover:bg-purple-50 border border-neutral-200 hover:border-purple-300 rounded-2xl flex items-center justify-between transition-all group"
                    >
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-xl bg-purple-900 text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                          {track.coverUrl ? (
                            <img src={track.coverUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Disc className="h-5 w-5 text-purple-300 animate-spin" style={{ animationDuration: '6s' }} />
                          )}
                        </div>
                        <div className="truncate">
                          <h6 className="text-xs font-bold text-neutral-900 group-hover:text-purple-950 font-mono truncate">{track.title}</h6>
                          <p className="text-[10px] text-neutral-500 font-mono truncate">{track.artist}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => togglePlayAudio(`catalog-${track.id}`, track.audioUrl)}
                          className="p-2 bg-white hover:bg-purple-100 text-purple-900 border border-neutral-200 rounded-xl cursor-pointer"
                          title="শুনুন"
                        >
                          {playingAudioId === `catalog-${track.id}` ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (musicTarget === 'post') setPostMusic(track);
                            else setStoryMusic(track);
                            setShowMusicModal(false);
                          }}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-mono font-bold cursor-pointer transition-colors"
                        >
                          সিলেক্ট
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* STORY CREATOR & EDITOR MODAL                         */}
      {/* ---------------------------------------------------- */}
      {showStoryEditorModal && pendingStoryImage && (
        <div className="fixed inset-0 z-50 bg-neutral-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 text-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-neutral-800 relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
              <h3 className="font-bold text-white font-serif text-base flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>স্টোরি সাজান (Story Editor)</span>
              </h3>
              <button 
                onClick={() => {
                  setShowStoryEditorModal(false);
                  setPendingStoryImage(null);
                }} 
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Story Canvas Preview */}
            <div className="relative h-80 rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 flex items-center justify-center">
              <div 
                className="w-full h-full flex items-center justify-center transition-all duration-200"
                style={{
                  transform: `scale(${storyScale}) rotate(${storyRotate}deg)`
                }}
              >
                <SafeImage src={pendingStoryImage} alt="Story" className="max-h-full max-w-full object-contain" />
              </div>

              {/* Overlay Caption Text */}
              {storyCaption && (
                <div 
                  className="absolute bottom-10 left-4 right-4 text-center font-bold font-serif text-sm drop-shadow-md p-2 rounded-xl bg-black/40 backdrop-blur-xs"
                  style={{ color: storyTextColor }}
                >
                  {storyCaption}
                </div>
              )}

              {/* Location Badge */}
              {storyLocation && (
                <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold font-mono px-2.5 py-1 rounded-full flex items-center space-x-1 shadow-md">
                  <MapPin className="h-3 w-3" />
                  <span>{storyLocation}</span>
                </div>
              )}

              {/* Music Badge */}
              {storyMusic && (
                <div className="absolute top-3 right-3 bg-purple-600 text-white text-[10px] font-bold font-mono px-2.5 py-1 rounded-full flex items-center space-x-1 shadow-md max-w-[180px] truncate">
                  <Music className="h-3 w-3 animate-spin" />
                  <span className="truncate">{storyMusic.title}</span>
                </div>
              )}
            </div>

            {/* Editing Tools Bar */}
            <div className="space-y-3 font-mono">
              {/* Caption Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-300 block">ক্যাপশন / টেক্সট লিখুন:</label>
                <input
                  type="text"
                  placeholder="স্টোরির ওপর সুন্দর কোনো ক্যাপশন লিখুন..."
                  value={storyCaption}
                  onChange={(e) => setStoryCaption(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Emojis & Stickers */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-neutral-400 font-bold mr-1">ইমোজি / স্টিকার:</span>
                {['💍', '👰', '🤵', '💐', '🌹', '✨', '🎉', '❤️', '📍', '🎵'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setStoryCaption(prev => prev + ' ' + emoji)}
                    className="p-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm transition-transform active:scale-90 cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Zoom & Rotate Controls */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 font-bold block">জুম / সাইজ: {storyScale.toFixed(1)}x</label>
                  <input
                    type="range"
                    min="0.8"
                    max="2.5"
                    step="0.1"
                    value={storyScale}
                    onChange={(e) => setStoryScale(parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 font-bold block">ঘুরান (Rotate):</label>
                  <button
                    type="button"
                    onClick={() => setStoryRotate((storyRotate + 90) % 360)}
                    className="w-full py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-[11px] text-amber-300 font-bold border border-neutral-700 cursor-pointer"
                  >
                    🔄 {storyRotate}° ডিগ্রি ঘোরান
                  </button>
                </div>
              </div>

              {/* Music & Location Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMusicTarget('story');
                    setShowMusicModal(true);
                  }}
                  className="flex-1 py-2 bg-purple-900/60 hover:bg-purple-900 text-purple-200 border border-purple-500/40 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Music className="h-3.5 w-3.5 text-purple-400" />
                  <span>{storyMusic ? storyMusic.title : '🎵 গান যোগ করুন'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLocationTarget('story');
                    setShowLocationModal(true);
                  }}
                  className="flex-1 py-2 bg-red-900/60 hover:bg-red-900 text-red-200 border border-red-500/40 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <MapPin className="h-3.5 w-3.5 text-red-400" />
                  <span>{storyLocation || '📍 লোকেশন যোগ'}</span>
                </button>
              </div>

            </div>

            {/* Submit & Publish Bar */}
            <div className="flex justify-end space-x-2 pt-3 border-t border-neutral-800 font-mono">
              <button
                type="button"
                onClick={() => {
                  setShowStoryEditorModal(false);
                  setPendingStoryImage(null);
                }}
                className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => {
                  if (pendingStoryImage) {
                    onAddStory(pendingStoryImage, storyLocation || undefined, storyMusic || undefined);
                    setShowStoryEditorModal(false);
                    setPendingStoryImage(null);
                  }
                }}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-xl cursor-pointer shadow-lg flex items-center space-x-1.5"
              >
                <Sparkles className="h-4 w-4 fill-neutral-950" />
                <span>স্টোরি প্রকাশ করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PENDING VERIFICATION POPUP MODAL */}
      {showPendingNotice && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" id="timeline-pending-notice-modal">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl text-center relative animate-in fade-in zoom-in-95 duration-200">
            <div className="h-16 w-16 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto border-2 border-amber-300 shadow-sm">
              <Clock className="h-9 w-9 text-amber-700 animate-pulse" />
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-serif font-black text-neutral-900">
                ⏳ আপনার পেমেন্ট যাচাই করা হচ্ছে
              </h3>
              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-sans font-medium p-4 bg-amber-50/80 rounded-2xl border border-amber-200">
                আপনার পেমেন্ট অ্যাডমিনের যাচাইয়ের অপেক্ষায় রয়েছে। পেমেন্ট ভেরিফাই হওয়ার পর আপনার অ্যাকাউন্ট সম্পূর্ণ সক্রিয় হবে এবং তখন আপনি সব ফিচার ব্যবহার করতে পারবেন।
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowPendingNotice(false)}
              className="w-full py-3.5 bg-red-700 hover:bg-red-800 text-white font-mono font-bold text-sm uppercase tracking-wider rounded-xl shadow-md transition-all duration-150 cursor-pointer"
            >
              ঠিক আছে
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
