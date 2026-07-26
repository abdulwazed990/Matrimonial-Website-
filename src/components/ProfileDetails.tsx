import React, { useState } from 'react';
import { User, Post, Story } from '../types';
import { calculateMatchScore } from '../utils/matching';
import { 
  Heart, CheckCircle, ShieldAlert, ShieldCheck, Key, Phone, Users, MapPin, 
  MessageSquare, Briefcase, GraduationCap, Scale, Lock, Image as ImageIcon,
  Clock, Plus, Upload, UserCheck, ThumbsUp
} from 'lucide-react';
import { MEMBERSHIP_PACKAGES } from '../data';

interface ProfileDetailsProps {
  language: 'en' | 'bn';
  currentUser: User | null;
  targetUser: User;
  allUsers?: User[];
  posts: Post[];
  stories: Story[];
  onToggleFollow: (userId: string) => void;
  onSendInterest: (userId: string) => void;
  setActiveTab: (tab: string) => void;
  onOpenVipUpgradeModal?: (currentPackageId: string) => void;
  onOpenDirectChat?: (user: User) => void;
  onUploadToGallery?: (photoUrl: string) => void;
  onSelectProfileById?: (profileId: string) => void;
  onReportUser?: (reportedUserId: string, reasonPreset: string, additionalDetails?: string, screenshots?: string[]) => void;
}

export default function ProfileDetails({
  language,
  currentUser,
  targetUser,
  allUsers = [],
  posts,
  stories,
  onToggleFollow,
  onSendInterest,
  setActiveTab,
  onOpenVipUpgradeModal,
  onOpenDirectChat,
  onUploadToGallery,
  onSelectProfileById,
  onReportUser,
}: ProfileDetailsProps) {
  const [profileTab, setProfileTab] = useState<'about' | 'posts' | 'gallery' | 'network' | 'interests'>('about');

  // Report Modal States
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>('ভুয়া প্রোফাইল');
  const [reportDetails, setReportDetails] = useState<string>('');
  const [reportScreenshots, setReportScreenshots] = useState<string[]>([]);
  const [reportSuccessMsg, setReportSuccessMsg] = useState<string>('');

  const REPORT_PRESETS = [
    'ভুয়া প্রোফাইল',
    'ভুয়া ছবি ব্যবহার',
    'প্রতারণার চেষ্টা',
    'অশালীন আচরণ',
    'হয়রানি',
    'স্প্যাম',
    'ভুল তথ্য প্রদান',
    'একাধিক অ্যাকাউন্ট ব্যবহার',
    'অনুপযুক্ত পোস্ট বা ছবি',
    'অন্যান্য',
  ];

  const isOwnProfile = currentUser?.id === targetUser.id;
  const isFollowing = currentUser?.following.includes(targetUser.id) || false;
  const hasSentInterest = currentUser?.interestsSent.includes(targetUser.id) || false;
  const isPending = currentUser?.status === 'pending';

  // Calculate compatibility if looking at someone else
  const matchResult = currentUser && !isOwnProfile ? calculateMatchScore(currentUser, targetUser) : null;

  // STRICT VIP LOCKING: Only 500 BDT VIP members can view contact numbers
  const isContactUnlocked = isOwnProfile || currentUser?.packageId === 'vip';
  const isContactLocked = !isContactUnlocked;

  // Calculate top-up amount for popup message
  const userPkg = MEMBERSHIP_PACKAGES.find((p) => p.id === currentUser?.packageId) || MEMBERSHIP_PACKAGES[0];
  const userPaidAmount = userPkg.price;
  const topUpRequired = Math.max(0, 500 - userPaidAmount);

  const [showVipPopup, setShowVipPopup] = useState(false);

  // Filter posts created by this target user
  const userPosts = posts.filter(p => p.userId === targetUser.id);
  const userStories = stories.filter(s => s.userId === targetUser.id);

  const text = {
    bio: language === 'en' ? 'Personal Bio' : 'পরিচিতি বিবরণ',
    pref: language === 'en' ? 'Ideal Partner Preferences' : 'কাঙ্ক্ষিত পাত্র/পাত্রীর যোগ্যতা',
    gallery: language === 'en' ? 'Photo Gallery' : 'ফটো গ্যালারি',
    details: language === 'en' ? 'Personal & Family Parameters' : 'ব্যক্তিগত ও পারিবারিক তথ্য',
    sendInterest: language === 'en' ? 'Send Interest' : 'আগ্রহ প্রকাশ করুন',
    interestSent: language === 'en' ? 'Interest Sent' : 'আগ্রহ পাঠানো হয়েছে',
    follow: language === 'en' ? 'Follow' : 'ফলো করুন',
    following: language === 'en' ? 'Following' : 'ফলো করছেন',
    unlockBtn: language === 'en' ? 'Upgrade to VIP to Unlock Numbers' : 'নাম্বার আনলক করতে VIP Membership প্রয়োজন',
    compatibility: language === 'en' ? 'AI Compatibility Match' : 'এআই ম্যাচমেকার সামঞ্জস্য',
    inbox: language === 'en' ? 'Inbox' : 'ইনবক্স',
  };

  const [showPendingNotice, setShowPendingNotice] = useState(false);

  const handleInterestClick = () => {
    if (isPending) {
      setShowPendingNotice(true);
      return;
    }
    onSendInterest(targetUser.id);
  };

  const handleFollowClick = () => {
    if (isPending) {
      setShowPendingNotice(true);
      return;
    }
    onToggleFollow(targetUser.id);
  };

  const handleInboxClick = () => {
    if (isPending) {
      setShowPendingNotice(true);
      return;
    }
    if (onOpenDirectChat) {
      onOpenDirectChat(targetUser);
    } else {
      setActiveTab('chat');
    }
  };

  const handleUnlockClick = () => {
    setShowVipPopup(true);
  };

  const handleFileUploadToGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && onUploadToGallery) {
        onUploadToGallery(event.target.result as string);
        alert('ছবিটি আপনার ফটো গ্যালারিতে আপলোড করা হয়েছে!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleReportScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setReportScreenshots((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveReportScreenshot = (index: number) => {
    setReportScreenshots((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (onReportUser) {
      onReportUser(targetUser.id, selectedReason, reportDetails, reportScreenshots);
    }
    setReportSuccessMsg('আপনার রিপোর্টটি সফলভাবে গ্রহণ করা হয়েছে। অ্যাডমিন টিম দ্রুত এটি খতিয়ে দেখবে।');
    setTimeout(() => {
      setShowReportModal(false);
      setReportSuccessMsg('');
      setReportDetails('');
      setReportScreenshots([]);
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10 space-y-6" id={`profile-details-viewport-${targetUser.profileId}`}>
      
      {/* 1. COVER PHOTO & AVATAR BANNER */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 overflow-hidden shadow-xs relative" id="profile-banner-block">
        <div className="h-44 sm:h-64 bg-neutral-100 relative">
          <img 
            src={targetUser.coverPhoto} 
            alt="" 
            className="w-full h-full object-cover filter brightness-90"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="px-6 pb-6 relative">
          {/* Overlapping Avatar */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-3 sm:space-y-0 sm:space-x-4 text-center sm:text-left">
              <img
                src={targetUser.profilePicture}
                alt={targetUser.name}
                className="w-28 sm:w-36 h-28 sm:h-36 rounded-full object-cover border-4 border-white shadow-sm relative z-10 animate-fade-in"
                referrerPolicy="no-referrer"
              />
              <div className="pb-2 space-y-1">
                <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 font-serif flex items-center justify-center sm:justify-start space-x-2">
                  <span>{targetUser.name}</span>
                  {targetUser.status === 'verified' && (
                    <span className="bg-neutral-900 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-neutral-950 flex items-center space-x-1 font-mono">
                      <CheckCircle className="h-3.5 w-3.5 text-white" />
                      <span>Verified</span>
                    </span>
                  )}
                </h2>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-neutral-400 font-mono">
                  <span className="text-neutral-900 font-bold">{targetUser.profileId}</span>
                  <span>•</span>
                  <span>{targetUser.gender}</span>
                  <span>•</span>
                  <span className="flex items-center space-x-1 font-semibold text-neutral-700">
                    <MapPin className="h-3.5 w-3.5 text-neutral-900" />
                    <span>{targetUser.district}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons (Follow, Interest, Inbox) */}
            {!isOwnProfile && currentUser && (
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <button
                  onClick={handleFollowClick}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer font-mono ${
                    isFollowing
                      ? 'bg-neutral-100 border-neutral-300 text-neutral-900'
                      : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  }`}
                  id="profile-follow-action-button"
                >
                  <span>{isFollowing ? text.following : text.follow}</span>
                </button>

                <button
                  onClick={handleInterestClick}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer font-mono ${
                    hasSentInterest
                      ? 'bg-neutral-100 text-neutral-900 border border-neutral-200'
                      : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                  }`}
                  id="profile-interest-action-button"
                >
                  <Heart className={`h-3.5 w-3.5 ${hasSentInterest ? 'fill-neutral-900 text-neutral-900' : 'text-white'}`} />
                  <span>{hasSentInterest ? text.interestSent : text.sendInterest}</span>
                </button>

                {/* INBOX BUTTON */}
                <button
                  onClick={handleInboxClick}
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer font-mono shadow-xs"
                  id="profile-inbox-action-button"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{text.inbox}</span>
                </button>

                {/* REPORT PROFILE BUTTON */}
                <button
                  onClick={() => setShowReportModal(true)}
                  className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer font-mono"
                  id="profile-report-action-button"
                  title="রিপোর্ট করুন"
                >
                  <ShieldAlert className="h-3.5 w-3.5 text-amber-700" />
                  <span>রিপোর্ট করুন</span>
                </button>
              </div>
            )}
          </div>

          {/* PROFILE TABS NAVIGATION */}
          <div className="flex items-center space-x-1 border-t border-neutral-100 px-4 overflow-x-auto font-mono text-xs font-bold">
            <button
              onClick={() => setProfileTab('about')}
              className={`py-3 px-4 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                profileTab === 'about'
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              📋 {language === 'en' ? 'Personal Details' : 'ব্যক্তিগত তথ্য'}
            </button>

            <button
              onClick={() => setProfileTab('posts')}
              className={`py-3 px-4 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                profileTab === 'posts'
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              📰 {language === 'en' ? 'Posts & Stories' : 'পোস্ট ও স্টোরি'} ({userPosts.length})
            </button>

            <button
              onClick={() => setProfileTab('gallery')}
              className={`py-3 px-4 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                profileTab === 'gallery'
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              🖼️ {language === 'en' ? 'Photo Gallery' : 'ফটো গ্যালারি'} ({targetUser.galleryPhotos.length})
            </button>

            <button
              onClick={() => setProfileTab('network')}
              className={`py-3 px-4 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                profileTab === 'network'
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              👥 {language === 'en' ? 'Followers' : 'ফলোয়ার্স'} ({targetUser.followers.length})
            </button>
          </div>

        </div>
      </div>

      {/* 2. TABBED CONTENT RENDER */}
      {profileTab === 'about' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: BIO & DETAILED PARAMETERS (Col span 7) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* AI MATCHMAKER COMPATIBILITY BOX */}
            {matchResult && (
              <div className="bg-neutral-50 border border-neutral-200/80 p-5 rounded-2xl shadow-xs space-y-3" id="profile-ai-compatibility-matchbox">
                <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
                  <h3 className="font-bold text-neutral-900 text-sm font-mono flex items-center space-x-1.5 uppercase tracking-wider">
                    <Heart className="h-4 w-4 fill-neutral-900 text-neutral-900" />
                    <span>{text.compatibility}</span>
                  </h3>
                  <span className="font-mono text-sm font-bold text-neutral-900 bg-white px-2.5 py-0.5 rounded-xl border border-neutral-200 shadow-xs">
                    {matchResult.score}% Compatibility
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-serif italic">
                  "{language === 'en' ? matchResult.aiCommentary : matchResult.aiCommentaryBn}"
                </p>
                
                <div className="space-y-1.5 pt-2">
                  {(language === 'en' ? matchResult.reasons : matchResult.reasonsBn).map((r, idx) => (
                    <div key={idx} className="text-xs text-neutral-600 flex items-center space-x-1.5 font-mono">
                      <CheckCircle className="h-4 w-4 text-neutral-900" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MEMBERSHIP STATUS CARD */}
            <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white p-6 rounded-2xl shadow-md space-y-4 font-mono">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="h-5 w-5 text-amber-400" />
                  <h3 className="font-bold text-sm sm:text-base font-serif tracking-wide text-white">
                    মেম্বারশিপ স্ট্যাটাস (Membership Details)
                  </h3>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  targetUser.status === 'verified'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {targetUser.status === 'verified' ? '✅ ভেরিফাইড মেম্বার' : '⏳ ভেরিফিকেশন পেন্ডিং'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
                  <span className="text-[10px] text-neutral-400 block uppercase">প্যাকেজ (Package)</span>
                  <strong className="text-amber-300 text-sm font-bold uppercase">{targetUser.packageId} Plan</strong>
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
                  <span className="text-[10px] text-neutral-400 block uppercase">সক্রিয় তারিখ (Active Date)</span>
                  <strong className="text-white text-xs font-semibold">
                    {targetUser.membershipActiveDate 
                      ? new Date(targetUser.membershipActiveDate).toLocaleDateString('bn-BD')
                      : targetUser.status === 'verified' ? 'আজকে সক্রিয়' : 'পেন্ডিং'}
                  </strong>
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
                  <span className="text-[10px] text-neutral-400 block uppercase">মেয়াদ শেষ (Expiry Date)</span>
                  <strong className="text-white text-xs font-semibold">
                    {targetUser.membershipExpiryDate 
                      ? new Date(targetUser.membershipExpiryDate).toLocaleDateString('bn-BD')
                      : 'অসীম / ১ বছর (1 Year)'}
                  </strong>
                </div>
              </div>
            </div>

            {/* BIO & GENERAL INFO */}
            <div className="bg-white border border-neutral-200/80 p-6 rounded-2xl shadow-xs space-y-4">
              <h3 className="font-bold text-neutral-900 text-sm sm:text-base font-serif flex items-center space-x-1.5">
                <Briefcase className="h-5 w-5 text-neutral-900" />
                <span>{text.bio}</span>
              </h3>
              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-sans font-medium">
                {targetUser.aboutYourself}
              </p>
            </div>

            {/* DETAILED BIO-DATA PARAMETERS */}
            <div className="bg-white border border-neutral-200/80 p-6 rounded-2xl shadow-xs space-y-4">
              <h3 className="font-bold text-neutral-900 text-sm sm:text-base font-serif flex items-center space-x-1.5">
                <GraduationCap className="h-5 w-5 text-neutral-900" />
                <span>{text.details}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium text-neutral-600">
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                  <span className="text-neutral-400 block text-[9px] uppercase font-bold tracking-wider font-mono">Religion & Caste</span>
                  <span className="text-neutral-900 text-sm font-semibold">{targetUser.religion}</span>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                  <span className="text-neutral-400 block text-[9px] uppercase font-bold tracking-wider font-mono">Marital Status</span>
                  <span className="text-neutral-900 text-sm font-semibold">{targetUser.maritalStatus}</span>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                  <span className="text-neutral-400 block text-[9px] uppercase font-bold tracking-wider font-mono">Education Details</span>
                  <span className="text-neutral-900 text-sm font-semibold">{targetUser.education}</span>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                  <span className="text-neutral-400 block text-[9px] uppercase font-bold tracking-wider font-mono">Profession & Career</span>
                  <span className="text-neutral-900 text-sm font-semibold">{targetUser.profession}</span>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                  <span className="text-neutral-400 block text-[9px] uppercase font-bold tracking-wider font-mono">Height & Weight</span>
                  <span className="text-neutral-900 text-sm font-semibold">{targetUser.height} • {targetUser.weight} Kg</span>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                  <span className="text-neutral-400 block text-[9px] uppercase font-bold tracking-wider font-mono">Blood Group</span>
                  <span className="text-neutral-900 text-sm font-mono font-bold">{targetUser.bloodGroup}</span>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                  <span className="text-neutral-400 block text-[9px] uppercase font-bold tracking-wider font-mono">Monthly Income (BDT)</span>
                  <span className="text-neutral-900 text-sm font-mono font-bold">৳{targetUser.monthlyIncome} / Month</span>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                  <span className="text-neutral-400 block text-[9px] uppercase font-bold tracking-wider font-mono">Address</span>
                  <span className="text-neutral-900 text-sm font-semibold">{targetUser.presentAddress}</span>
                </div>
              </div>
            </div>

            {/* PARTNER PREFERENCES SECTION */}
            <div className="bg-white border border-neutral-200/80 p-6 rounded-2xl shadow-xs space-y-4">
              <h3 className="font-bold text-neutral-900 text-sm sm:text-base font-serif flex items-center space-x-1.5">
                <Scale className="h-5 w-5 text-neutral-900" />
                <span>{text.pref}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium text-neutral-600 font-mono">
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                  <span className="text-neutral-400 block text-[9px] uppercase font-bold tracking-wider">Preferred Religion</span>
                  <span className="text-neutral-900 text-sm font-semibold font-sans">{targetUser.partnerPreference.religion}</span>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                  <span className="text-neutral-400 block text-[9px] uppercase font-bold tracking-wider">Preferred Age Group</span>
                  <span className="text-neutral-900 text-sm font-bold">{targetUser.partnerPreference.minAge} - {targetUser.partnerPreference.maxAge} Yrs</span>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                  <span className="text-neutral-400 block text-[9px] uppercase font-bold tracking-wider">Preferred Height</span>
                  <span className="text-neutral-900 text-sm font-semibold font-sans">Min: {targetUser.partnerPreference.minHeight}</span>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                  <span className="text-neutral-400 block text-[9px] uppercase font-bold tracking-wider">Preferred Location</span>
                  <span className="text-neutral-900 text-sm font-semibold font-sans">{targetUser.partnerPreference.district}</span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: CONTACT SECURITY LOCK & GALLERY (Col span 5) */}
          <div className="lg:col-span-5 space-y-8">

            {/* CONTACT INFO LOCKOUT CARD - ONLY VIP CAN SEE NUMBERS */}
            <div className="bg-white border border-neutral-200/80 p-5 rounded-2xl shadow-xs space-y-4" id="contact-info-lockout-card">
              <h4 className="font-bold text-neutral-900 text-xs sm:text-sm font-serif border-b border-neutral-200 pb-2 flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <Phone className="h-4.5 w-4.5 text-neutral-900" />
                  <span>যোগাযোগের তথ্য</span>
                </div>
                {isContactUnlocked ? (
                  <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">👑 VIP Unlocked</span>
                ) : (
                  <span className="text-[10px] font-mono text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-md">🔒 Locked</span>
                )}
              </h4>

              {isContactLocked ? (
                <div className="bg-neutral-50 border border-neutral-200/80 p-4 rounded-xl space-y-3 text-center">
                  <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
                    <Lock className="h-5 w-5" />
                  </div>
                  
                  <div className="space-y-1">
                    <h5 className="font-bold text-xs text-neutral-900 font-mono">মোবাইল ও WhatsApp নম্বর লক করা</h5>
                    <p className="text-[11px] text-neutral-500 leading-relaxed">
                      শুধুমাত্র ৳৫০০ টাকার VIP Verified Membership থেকে কন্টাক্ট নম্বর ও WhatsApp নম্বর সরাসরি দেখা যাবে।
                    </p>
                  </div>

                  <button
                    onClick={handleUnlockClick}
                    className="w-full py-3 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl uppercase tracking-wider shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer font-sans"
                    id="unlock-vip-btn"
                  >
                    <Key className="h-4 w-4" />
                    <span>{text.unlockBtn}</span>
                  </button>
                </div>
              ) : (
                <div className="bg-neutral-50 border border-neutral-200/80 p-4 rounded-xl space-y-3">
                  <div className="text-xs font-mono space-y-2 text-neutral-800 bg-white p-3 rounded-xl border border-neutral-200">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-neutral-400 uppercase font-sans font-bold tracking-wider">Mobile Phone:</span>
                      <span className="font-bold text-neutral-900 text-sm">{targetUser.mobileNumber}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-neutral-400 uppercase font-sans font-bold tracking-wider">WhatsApp:</span>
                      <span className="font-bold text-neutral-900 text-sm">{targetUser.whatsappNumber}</span>
                    </div>
                  </div>

                  {!isOwnProfile && (
                    <a
                      href={`https://wa.me/${targetUser.whatsappNumber.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl uppercase tracking-wider inline-flex items-center justify-center space-x-2 transition-all shadow-xs cursor-pointer font-sans"
                    >
                      <span>💬 WhatsApp-এ মেসেজ পাঠান</span>
                    </a>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* POSTS TAB */}
      {profileTab === 'posts' && (
        <div className="space-y-4 max-w-2xl mx-auto">
          <h3 className="font-bold text-sm text-neutral-900 font-mono uppercase tracking-wider">
            {targetUser.name}-এর প্রকাশিত পোস্টসমূহ
          </h3>

          {userPosts.length === 0 ? (
            <div className="bg-white border border-neutral-200/80 rounded-2xl p-8 text-center text-neutral-500 font-mono text-xs">
              এই সদস্য এখনো কোনো পোস্ট প্রকাশ করেননি।
            </div>
          ) : (
            userPosts.map(post => (
              <div key={post.id} className="bg-white border border-neutral-200/80 p-5 rounded-2xl space-y-3 shadow-xs">
                <div className="flex items-center space-x-3">
                  <img src={post.userAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h5 className="font-bold text-sm text-neutral-900 font-serif">{post.userName}</h5>
                    <p className="text-[10px] text-neutral-400 font-mono">{new Date(post.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed">{post.content}</p>
                {post.image && (
                  <img src={post.image} alt="" className="rounded-xl w-full max-h-80 object-cover" />
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* GALLERY TAB */}
      {profileTab === 'gallery' && (
        <div className="bg-white border border-neutral-200/80 p-6 rounded-2xl shadow-xs space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
            <div>
              <h3 className="font-bold text-neutral-900 text-sm font-mono uppercase tracking-wider">
                {targetUser.name}-এর ফটো গ্যালারি
              </h3>
              <p className="text-xs text-neutral-500 font-mono">মোট {targetUser.galleryPhotos.length} টি ছবি আপলোড করা আছে</p>
            </div>

            {isOwnProfile && (
              <label className="px-4 py-2 bg-neutral-900 text-white font-mono text-xs font-bold rounded-xl flex items-center space-x-1.5 cursor-pointer hover:bg-neutral-800">
                <Upload className="h-4 w-4" />
                <span>নতুন ছবি আপলোড করুন</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileUploadToGallery}
                />
              </label>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <img 
              src={targetUser.profilePicture} 
              alt="" 
              className="w-full h-40 object-cover rounded-2xl border-2 border-neutral-900 shadow-xs" 
            />
            <img 
              src={targetUser.coverPhoto} 
              alt="" 
              className="w-full h-40 object-cover rounded-2xl border border-neutral-200 shadow-xs" 
            />
            {targetUser.galleryPhotos.map((imgUrl, i) => (
              <img 
                key={i} 
                src={imgUrl} 
                alt="" 
                className="w-full h-40 object-cover rounded-2xl border border-neutral-200 hover:ring-2 hover:ring-neutral-900 transition-all shadow-xs" 
              />
            ))}
          </div>
        </div>
      )}

      {/* NETWORK / FOLLOWERS TAB */}
      {profileTab === 'network' && (
        <div className="bg-white border border-neutral-200/80 p-6 rounded-2xl shadow-xs space-y-4">
          <h3 className="font-bold text-neutral-900 text-sm font-mono uppercase tracking-wider">
            ফলোয়ার্স তালিকা ({targetUser.followers.length})
          </h3>

          {targetUser.followers.length === 0 ? (
            <p className="text-xs text-neutral-500 font-mono py-4 text-center">এখনো কোনো ফলোয়ার নেই</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {targetUser.followers.map(fId => {
                const u = allUsers.find(usr => usr.id === fId);
                if (!u) return null;
                return (
                  <div 
                    key={fId} 
                    onClick={() => onSelectProfileById && onSelectProfileById(u.id)}
                    className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-2xl border border-neutral-200/60 cursor-pointer hover:bg-neutral-100"
                  >
                    <img src={u.profilePicture} alt="" className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <h5 className="font-bold text-xs text-neutral-900 font-serif">{u.name}</h5>
                      <p className="text-[10px] text-neutral-400 font-mono">{u.district} • {u.profession}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIP UPGRADE TOP-UP POPUP MODAL */}
      {showVipPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-neutral-200 space-y-6 text-center animate-in zoom-in-95 duration-150">
            
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto ring-8 ring-red-50">
              <Key className="h-8 w-8" />
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-bold text-neutral-900 font-serif">VIP Membership প্রয়োজন</h3>
              <p className="text-sm text-neutral-600 leading-relaxed font-sans">
                নাম্বার আনলক করতে আপনার <strong>VIP Membership</strong> প্রয়োজন।
              </p>
              
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 text-xs text-neutral-700 space-y-2 font-sans">
                <p>
                  আপনি ইতোমধ্যে <strong className="text-neutral-900 font-mono text-sm">৳{userPaidAmount}</strong> টাকার Membership কিনেছেন।
                </p>
                <div className="border-t border-neutral-200 pt-2 text-red-700 font-bold text-sm">
                  VIP Membership সম্পূর্ণ করতে আরও <span className="font-mono text-base">৳{topUpRequired}</span> Top-up করুন।
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowVipPopup(false);
                  if (onOpenVipUpgradeModal) {
                    onOpenVipUpgradeModal(currentUser?.packageId || 'basic');
                  } else {
                    setActiveTab('pricing');
                  }
                }}
                className="w-full py-3.5 bg-red-700 hover:bg-red-800 text-white font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer font-sans"
                id="modal-confirm-topup-btn"
              >
                ৳{topUpRequired} Top-up করে VIP আনলক করুন
              </button>
              
              <button
                onClick={() => setShowVipPopup(false)}
                className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs rounded-xl transition-all cursor-pointer font-sans"
              >
                পরে করবো
              </button>
            </div>

          </div>
        </div>
      )}

      {/* REPORT PROFILE MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute top-4 right-4 h-9 w-9 bg-neutral-100 hover:bg-neutral-200 rounded-full flex items-center justify-center text-neutral-600 font-bold cursor-pointer"
            >
              ✕
            </button>

            <div className="space-y-1.5 border-b border-neutral-100 pb-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-full text-xs font-bold font-mono">
                <ShieldAlert className="h-4 w-4 text-amber-700" />
                <span>রিপোর্ট পেশ করুন</span>
              </div>
              <h3 className="text-xl font-bold font-serif text-neutral-900">
                "{targetUser.name}" ({targetUser.profileId})-এর বিরুদ্ধে অভিযোগ
              </h3>
              <p className="text-xs text-neutral-500">
                আপনার অভিযোগ গোপন রাখা হবে এবং অ্যাডমিন টিম তা খতিয়ে দেখে কঠোর ব্যবস্থা নেবে।
              </p>
            </div>

            {reportSuccessMsg ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-center space-y-2">
                <p className="font-bold text-sm">{reportSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-5">
                
                {/* 1. PRESET REASON SELECTION */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-800 block font-mono">
                    অভিযোগের প্রাথমিক কারণ নির্বাচন করুন *
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {REPORT_PRESETS.map((preset) => (
                      <button
                        type="button"
                        key={preset}
                        onClick={() => setSelectedReason(preset)}
                        className={`px-3 py-2 text-xs font-semibold rounded-xl text-left border transition-all cursor-pointer font-sans ${
                          selectedReason === preset
                            ? 'bg-red-50 border-red-500 text-red-900 font-bold'
                            : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. ADDITIONAL DETAILS TEXT BOX */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-800 block font-mono">
                    বিস্তারিত লিখুন (Additional Details)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="ঘটনার বিবরণ বা সুনির্দিষ্ট অভিযোগ এখানে স্পষ্টভাবে লিখুন..."
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-2xl p-3 text-xs text-neutral-900 focus:outline-none focus:border-red-700 focus:bg-white font-sans"
                  />
                </div>

                {/* 3. SCREENSHOT UPLOAD */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-800 block font-mono">
                    প্রমাণ হিসেবে Screenshot / ছবি যুক্ত করুন (একাধিক আপলোড সম্ভব)
                  </label>
                  
                  <label className="flex items-center justify-center space-x-2 p-3 bg-neutral-50 hover:bg-neutral-100 border border-dashed border-neutral-300 rounded-2xl cursor-pointer transition-colors text-xs text-neutral-700 font-medium">
                    <Upload className="h-4 w-4 text-neutral-500" />
                    <span>গ্যালারি থেকে স্ক্রিনশট নির্বাচন করুন</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleReportScreenshotUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Screenshot Previews */}
                  {reportScreenshots.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 pt-1">
                      {reportScreenshots.map((src, idx) => (
                        <div key={idx} className="relative rounded-xl overflow-hidden border border-neutral-300 aspect-square group">
                          <img src={src} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveReportScreenshot(idx)}
                            className="absolute top-1 right-1 bg-red-700 text-white p-1 rounded-full text-[10px] opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* SUBMIT BUTTONS */}
                <div className="flex justify-end space-x-3 pt-3 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="py-2.5 px-5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-xl font-mono cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 px-6 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-xl font-mono uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center space-x-1.5"
                  >
                    <ShieldAlert className="h-4 w-4" />
                    <span>অভিযোগ জমা দিন</span>
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

      {/* PENDING VERIFICATION NOTICE POPUP MODAL */}
      {showPendingNotice && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" id="profile-pending-notice-modal">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl text-center relative animate-in fade-in zoom-in-95 duration-200">
            <div className="h-16 w-16 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto border-2 border-amber-300 shadow-sm">
              <ShieldCheck className="h-9 w-9 text-amber-700 animate-pulse" />
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
