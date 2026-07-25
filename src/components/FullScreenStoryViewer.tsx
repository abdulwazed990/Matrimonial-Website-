import React, { useState, useEffect, useRef } from 'react';
import { Story, User, StoryReaction } from '../types';
import SafeImage from './SafeImage';
import { 
  X, MapPin, Music, Heart, Send, Eye, Trash2, 
  Volume2, VolumeX, Pause, Play, Sparkles, ChevronLeft, ChevronRight, MessageCircle
} from 'lucide-react';

interface FullScreenStoryViewerProps {
  language: 'en' | 'bn';
  stories: Story[];
  initialStoryId: string;
  currentUser: User | null;
  users: User[];
  onClose: () => void;
  onDeleteStory?: (storyId: string) => void;
  onReactStory?: (storyId: string, type: 'like' | 'love' | 'heart' | 'clap') => void;
  onSendReply?: (targetUserId: string, message: string, storyUrl?: string) => void;
  onViewStory?: (storyId: string) => void;
  onSelectProfileById?: (profileId: string) => void;
}

export default function FullScreenStoryViewer({
  language,
  stories,
  initialStoryId,
  currentUser,
  users,
  onClose,
  onDeleteStory,
  onReactStory,
  onSendReply,
  onViewStory,
  onSelectProfileById,
}: FullScreenStoryViewerProps) {
  // Group stories by userId preserving order
  const userStoryGroups = React.useMemo(() => {
    const groups: { userId: string; userName: string; userAvatar: string; stories: Story[] }[] = [];
    stories.forEach((s) => {
      let group = groups.find((g) => g.userId === s.userId);
      if (!group) {
        group = {
          userId: s.userId,
          userName: s.userName,
          userAvatar: s.userAvatar,
          stories: [],
        };
        groups.push(group);
      }
      group.stories.push(s);
    });
    return groups;
  }, [stories]);

  // Find initial indices
  const findInitialIndices = () => {
    for (let uIdx = 0; uIdx < userStoryGroups.length; uIdx++) {
      const sIdx = userStoryGroups[uIdx].stories.findIndex((s) => s.id === initialStoryId);
      if (sIdx !== -1) {
        return { userIdx: uIdx, storyIdx: sIdx };
      }
    }
    return { userIdx: 0, storyIdx: 0 };
  };

  const initial = findInitialIndices();
  const [currentUserIndex, setCurrentUserIndex] = useState<number>(initial.userIdx);
  const [currentStoryIndex, setCurrentStoryIndex] = useState<number>(initial.storyIdx);

  // Viewer State
  const [progress, setProgress] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [replyText, setReplyText] = useState<string>('');
  const [showViewersSheet, setShowViewersSheet] = useState<boolean>(false);
  const [flyingEmojis, setFlyingEmojis] = useState<{ id: number; emoji: string; left: number }[]>([]);
  const [deletingConfirm, setDeletingConfirm] = useState<boolean>(false);
  const [replySuccessMessage, setReplySuccessMessage] = useState<string | null>(null);

  // Audio & Gesture References
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const currentUserGroup = userStoryGroups[currentUserIndex] || userStoryGroups[0];
  const activeStory: Story | undefined = currentUserGroup?.stories[currentStoryIndex];

  const STORY_DURATION_MS = 5000; // 5 seconds per story

  // Trigger onViewStory when story opens
  useEffect(() => {
    if (activeStory && onViewStory) {
      onViewStory(activeStory.id);
    }
    setProgress(0);
  }, [currentUserIndex, currentStoryIndex, activeStory]);

  // Handle Music Audio Playback
  useEffect(() => {
    if (activeStory?.music?.audioUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(activeStory.music.audioUrl);
      audio.loop = true;
      audio.muted = isMuted;
      audioRef.current = audio;

      if (!isPaused) {
        audio.play().catch(() => {});
      }

      return () => {
        audio.pause();
        audioRef.current = null;
      };
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    }
  }, [activeStory?.id, isMuted]);

  // Pause / Resume Audio when holding or pausing
  useEffect(() => {
    if (audioRef.current) {
      if (isPaused) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
    }
  }, [isPaused]);

  // Main Story Progress Bar Timer (60 FPS smooth requestAnimationFrame)
  useEffect(() => {
    if (!activeStory || isPaused || showViewersSheet) return;

    let startTime = performance.now() - (progress / 100) * STORY_DURATION_MS;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const newProgress = Math.min(100, (elapsed / STORY_DURATION_MS) * 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        handleNextStory();
      } else {
        animFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [currentUserIndex, currentStoryIndex, isPaused, showViewersSheet, activeStory]);

  // Navigation Logic
  const handleNextStory = () => {
    if (currentStoryIndex < currentUserGroup.stories.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
      setProgress(0);
    } else if (currentUserIndex < userStoryGroups.length - 1) {
      setCurrentUserIndex((prev) => prev + 1);
      setCurrentStoryIndex(0);
      setProgress(0);
    } else {
      // All stories completed
      onClose();
    }
  };

  const handlePrevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
      setProgress(0);
    } else if (currentUserIndex > 0) {
      const prevUserIdx = currentUserIndex - 1;
      setCurrentUserIndex(prevUserIdx);
      setCurrentStoryIndex(userStoryGroups[prevUserIdx].stories.length - 1);
      setProgress(0);
    } else {
      setProgress(0); // Restart current story
    }
  };

  const handleNextUser = () => {
    if (currentUserIndex < userStoryGroups.length - 1) {
      setCurrentUserIndex((prev) => prev + 1);
      setCurrentStoryIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrevUser = () => {
    if (currentUserIndex > 0) {
      setCurrentUserIndex((prev) => prev - 1);
      setCurrentStoryIndex(0);
      setProgress(0);
    }
  };

  // Screen Click Area Handler (Left 30% = prev, Right 70% = next)
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If target is inside interactive controls, ignore container tap
    const target = e.target as HTMLElement;
    if (target.closest('.interactive-control')) return;

    const screenWidth = window.innerWidth;
    const clickX = e.clientX;

    if (clickX < screenWidth * 0.3) {
      handlePrevStory();
    } else {
      handleNextStory();
    }
  };

  // Touch Swipe Gesture Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;

    const diffX = e.changedTouches[0].clientX - touchStartXRef.current;
    const diffY = e.changedTouches[0].clientY - touchStartYRef.current;

    // Swipe horizontally if horizontal movement is larger than vertical
    if (Math.abs(diffX) > 60 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        handleNextUser();
      } else {
        handlePrevUser();
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  // Emoji Reactions
  const triggerEmojiAnimation = (emoji: string) => {
    const newEmoji = {
      id: Date.now() + Math.random(),
      emoji,
      left: Math.random() * 60 + 20, // 20% to 80% screen width
    };
    setFlyingEmojis((prev) => [...prev, newEmoji]);

    setTimeout(() => {
      setFlyingEmojis((prev) => prev.filter((item) => item.id !== newEmoji.id));
    }, 1500);

    if (activeStory && onReactStory) {
      const type = emoji === '❤️' ? 'love' : 'like';
      onReactStory(activeStory.id, type);
    }
  };

  // Send Reply
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeStory) return;

    if (onSendReply) {
      onSendReply(activeStory.userId, replyText.trim(), activeStory.image);
    }

    setReplyText('');
    setReplySuccessMessage(language === 'en' ? 'Reply sent to inbox!' : 'ইনবক্সে উত্তর পাঠানো হয়েছে!');
    setTimeout(() => setReplySuccessMessage(null), 2500);
  };

  if (!activeStory) return null;

  const isStoryOwner = currentUser?.id === activeStory.userId;

  return (
    <div 
      className="fixed inset-0 z-50 bg-neutral-950 flex items-center justify-center select-none overflow-hidden font-sans"
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Ambient Background Glow from Story Image */}
      <div 
        className="absolute inset-0 opacity-30 blur-3xl scale-125 bg-center bg-cover transition-all duration-700"
        style={{ backgroundImage: `url(${activeStory.image})` }}
      />

      {/* Main Full Screen Story Frame Container */}
      <div 
        onClick={handleContainerClick}
        className="relative w-full max-w-md h-full md:h-[94vh] md:max-h-[850px] md:rounded-3xl overflow-hidden bg-black flex flex-col justify-between shadow-2xl border border-neutral-800/80"
      >
        {/* ======================================================== */}
        {/* TOP SEGMENTED PROGRESS BARS & USER HEADER                */}
        {/* ======================================================== */}
        <div className="absolute top-0 left-0 right-0 z-30 p-3 pt-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent space-y-2.5">
          {/* Segmented Progress Bars */}
          <div className="flex space-x-1.5 px-1">
            {currentUserGroup.stories.map((s, idx) => {
              let fillPercentage = 0;
              if (idx < currentStoryIndex) {
                fillPercentage = 100;
              } else if (idx === currentStoryIndex) {
                fillPercentage = progress;
              }

              return (
                <div key={s.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden backdrop-blur-xs">
                  <div 
                    className="h-full bg-white transition-all duration-75 ease-linear rounded-full"
                    style={{ width: `${fillPercentage}%` }}
                  />
                </div>
              );
            })}
          </div>

          {/* User Profile Bar */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2.5">
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSelectProfileById) {
                    onClose();
                    onSelectProfileById(activeStory.userId);
                  }
                }}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400 cursor-pointer shrink-0 shadow-md interactive-control"
              >
                <SafeImage src={activeStory.userAvatar} alt={activeStory.userName} fallbackText={activeStory.userName} className="w-full h-full object-cover" />
              </div>

              <div>
                <div className="flex items-center space-x-1.5">
                  <span 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectProfileById) {
                        onClose();
                        onSelectProfileById(activeStory.userId);
                      }
                    }}
                    className="font-bold text-sm text-white font-serif hover:underline cursor-pointer drop-shadow-md interactive-control"
                  >
                    {activeStory.userName}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-[10px] text-white/80 font-mono">
                  <span>{new Date(activeStory.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

                  {activeStory.location && (
                    <span className="flex items-center space-x-0.5 text-rose-300 font-bold bg-rose-950/60 px-1.5 py-0.2 rounded-full border border-rose-500/30">
                      <MapPin className="h-3 w-3" />
                      <span>{activeStory.location}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Top Right Controls (Mute, Trash, Close) */}
            <div className="flex items-center space-x-1.5 interactive-control">
              {activeStory.music && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMuted(!isMuted);
                  }}
                  className="p-2 text-white/90 hover:text-white bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md transition-colors"
                >
                  {isMuted ? <VolumeX className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5 text-purple-300 animate-pulse" />}
                </button>
              )}

              {isStoryOwner && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletingConfirm(true);
                  }}
                  className="p-2 text-red-400 hover:text-red-200 bg-red-950/60 rounded-full backdrop-blur-md border border-red-500/30 transition-colors"
                  title="স্টোরি ডিলিট করুন"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="p-2 text-white/90 hover:text-white bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Music Ticker Badge (if story has attached music) */}
          {activeStory.music && (
            <div className="mx-1 px-3 py-1.5 bg-black/60 backdrop-blur-md border border-purple-500/40 rounded-full text-white flex items-center justify-between text-xs font-mono shadow-lg">
              <div className="flex items-center space-x-2 overflow-hidden">
                <Music className="h-3.5 w-3.5 text-purple-400 animate-spin shrink-0" style={{ animationDuration: '4s' }} />
                <div className="truncate text-[11px]">
                  <span className="font-bold text-purple-200">{activeStory.music.title}</span>
                  <span className="text-neutral-400 font-sans ml-1"> - {activeStory.music.artist}</span>
                </div>
              </div>
              <span className="text-[10px] bg-purple-900/80 text-purple-200 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ml-2">🎵 audio</span>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* CENTER MEDIA DISPLAY AREA                                */}
        {/* ======================================================== */}
        <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
          <SafeImage 
            src={activeStory.image} 
            alt="Story content" 
            className="w-full h-full object-contain pointer-events-none" 
          />

          {/* Side Nav Arrows (Desktop helper) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrevStory();
            }}
            className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-all opacity-60 hover:opacity-100 interactive-control"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNextStory();
            }}
            className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-all opacity-60 hover:opacity-100 interactive-control"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Flying Emoji Animations */}
          {flyingEmojis.map((item) => (
            <div
              key={item.id}
              className="absolute bottom-20 text-3xl animate-bounce duration-1000 pointer-events-none transition-all"
              style={{
                left: `${item.left}%`,
                animation: 'flyUp 1.2s ease-out forwards',
              }}
            >
              {item.emoji}
            </div>
          ))}

          {/* Reply Success Toast */}
          {replySuccessMessage && (
            <div className="absolute top-28 bg-emerald-600 text-white text-xs font-bold font-mono px-4 py-2 rounded-full shadow-2xl border border-emerald-400 animate-in fade-in zoom-in duration-200">
              ✓ {replySuccessMessage}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* BOTTOM REACTION & REPLY FOOTER                           */}
        {/* ======================================================== */}
        <div className="absolute bottom-0 left-0 right-0 z-30 p-4 pb-6 bg-gradient-to-t from-black via-black/80 to-transparent space-y-3">
          
          {/* Quick Reaction Emojis Bar */}
          {!isStoryOwner && (
            <div className="flex items-center justify-center space-x-3 interactive-control">
              {['❤️', '🔥', '👏', '😍', '💍', '✨'].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerEmojiAnimation(emoji);
                  }}
                  className="p-2 bg-white/10 hover:bg-white/25 rounded-full text-xl backdrop-blur-md transition-transform active:scale-125 shadow-md border border-white/15 cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Reply Box or Story Owner Viewers Bar */}
          <div className="interactive-control">
            {isStoryOwner ? (
              /* Story Owner Viewers Counter Button */
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowViewersSheet(true);
                }}
                className="w-full py-3 bg-neutral-900/90 hover:bg-neutral-800 text-white rounded-2xl border border-neutral-700 font-mono text-xs font-bold flex items-center justify-between px-4 shadow-xl cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-emerald-400" />
                  <span>{language === 'en' ? 'Story Viewers' : 'কে কে দেখেছেন'} ({activeStory.viewedBy?.length || 0})</span>
                </div>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40">
                  {language === 'en' ? 'View Details' : 'তালিকা দেখুন ➔'}
                </span>
              </button>
            ) : (
              /* Direct Reply Input Form for Viewers */
              <form onSubmit={handleSendReply} className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder={language === 'en' ? 'Send direct message reply...' : 'সরাসরি ইনবক্সে বার্তা পাঠান...'}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onFocus={() => setIsPaused(true)}
                  onBlur={() => setIsPaused(false)}
                  className="flex-1 bg-white/15 border border-white/20 rounded-full px-4 py-2.5 text-xs text-white placeholder-white/60 focus:outline-none focus:border-amber-400 backdrop-blur-md"
                />

                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="p-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-neutral-950 rounded-full font-bold transition-all shadow-lg shrink-0 cursor-pointer"
                >
                  <Send className="h-4 w-4 fill-neutral-950" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* STORY VIEWERS BOTTOM SHEET (FOR STORY OWNER ONLY)        */}
        {/* ======================================================== */}
        {showViewersSheet && isStoryOwner && (
          <div 
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-x-0 bottom-0 z-40 bg-neutral-900/95 backdrop-blur-xl rounded-t-3xl border-t border-neutral-800 p-5 space-y-4 max-h-[60%] overflow-y-auto animate-in slide-in-from-bottom duration-250 text-white font-sans interactive-control"
          >
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <div className="flex items-center space-x-2 font-mono">
                <Eye className="h-5 w-5 text-emerald-400" />
                <h4 className="font-bold text-sm text-white">
                  {language === 'en' ? 'Story Viewers' : 'কে কে স্টোরি দেখেছেন'} ({activeStory.viewedBy?.length || 0})
                </h4>
              </div>

              <button
                type="button"
                onClick={() => setShowViewersSheet(false)}
                className="p-1 text-neutral-400 hover:text-white rounded-full bg-neutral-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Viewer Members List */}
            <div className="space-y-2">
              {(!activeStory.viewedBy || activeStory.viewedBy.length === 0) ? (
                <div className="text-center py-6 text-neutral-500 font-mono text-xs space-y-1">
                  <Eye className="h-8 w-8 mx-auto opacity-40 text-neutral-400" />
                  <p>এখনো কোনো সদস্য আপনার এই স্টোরিটি দেখেননি।</p>
                </div>
              ) : (
                activeStory.viewedBy.map((vId) => {
                  const viewer = users.find((u) => u.id === vId);
                  if (!viewer) return null;

                  return (
                    <div
                      key={vId}
                      onClick={() => {
                        setShowViewersSheet(false);
                        onClose();
                        if (onSelectProfileById) onSelectProfileById(viewer.id);
                      }}
                      className="flex items-center justify-between p-2.5 bg-neutral-800/60 hover:bg-neutral-800 rounded-2xl border border-neutral-700/60 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-neutral-600 shrink-0">
                          <SafeImage src={viewer.profilePicture} alt={viewer.name} fallbackText={viewer.name} className="w-full h-full object-cover" />
                        </div>

                        <div>
                          <h5 className="text-xs font-bold font-serif text-white">{viewer.name}</h5>
                          <p className="text-[10px] text-neutral-400 font-mono">{viewer.profession} • {viewer.district}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] bg-emerald-950 text-emerald-300 font-bold font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
                          ✓ দেখা হয়েছে
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* DELETE CONFIRMATION MODAL                                */}
        {/* ======================================================== */}
        {deletingConfirm && (
          <div 
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 text-center interactive-control"
          >
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-xs w-full space-y-4 shadow-2xl">
              <div className="w-12 h-12 bg-red-950 text-red-400 rounded-full flex items-center justify-center mx-auto border border-red-500/40">
                <Trash2 className="h-6 w-6" />
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-white font-serif text-base">স্টোরি ডিলিট করবেন?</h4>
                <p className="text-xs text-neutral-400 font-sans">
                  এই স্টোরিটি আপনার প্রোফাইল থেকে স্থায়ীভাবে মুছে ফেলা হবে।
                </p>
              </div>

              <div className="flex justify-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingConfirm(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold rounded-xl font-mono cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onDeleteStory && activeStory) {
                      onDeleteStory(activeStory.id);
                      setDeletingConfirm(false);
                      onClose();
                    }
                  }}
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl font-mono shadow-lg cursor-pointer"
                >
                  হ্যাঁ, ডিলিট করুন
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Embedded CSS for keyframe animations */}
      <style>{`
        @keyframes flyUp {
          0% {
            transform: translateY(0) scale(0.8);
            opacity: 1;
          }
          100% {
            transform: translateY(-280px) scale(1.6);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
