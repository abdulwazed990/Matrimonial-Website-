import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import RegistrationFlow from './components/RegistrationFlow';
import Timeline from './components/Timeline';
import ChatSystem from './components/ChatSystem';
import AdminDashboard from './components/AdminDashboard';
import ExecutiveSection from './components/ExecutiveSection';
import SearchMatches from './components/SearchMatches';
import ProfileDetails from './components/ProfileDetails';

import { User, Post, Story, PaymentRecord, ChatMessage, Executive, Notification, PackageType, Comment, ReportRecord, ReportActionLog } from './types';
import { SEED_USERS, SEED_POSTS, SEED_STORIES, SEED_EXECUTIVES, MEMBERSHIP_PACKAGES, SEED_REPORTS } from './data';
import { AlertTriangle, Award, CheckCircle2, Heart, Key, PhoneCall, ShieldAlert, ShoppingBag, Star, HelpCircle, User as UserIcon } from 'lucide-react';

export default function App() {
  // --------------------------------------------------
  // STATE DEFINITIONS & STORAGE SYNC
  // --------------------------------------------------
  const [language, setLanguage] = useState<'en' | 'bn'>('bn');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedProfile, setSelectedProfile] = useState<User | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Admin login states
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [adminError, setAdminError] = useState('');

  // Core collections synced to LocalStorage
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);

  // Currently logged-in profile
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Direct chat selection state
  const [chatPartnerUser, setChatPartnerUser] = useState<User | null>(null);

  // User Login Modal States
  const [showUserLoginModal, setShowUserLoginModal] = useState(false);
  const [userLoginInput, setUserLoginInput] = useState('');
  const [userLoginError, setUserLoginError] = useState('');

  // Re-payment states for suspended users
  const [showRePaymentModal, setShowRePaymentModal] = useState(false);
  const [rePayMethod, setRePayMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [rePayPackage, setRePayPackage] = useState<MembershipPackage>(MEMBERSHIP_PACKAGES[0]);
  const [rePayTxId, setRePayTxId] = useState('');
  const [rePayExecCode, setRePayExecCode] = useState('');
  const [rePayError, setRePayError] = useState('');
  const [copiedRePayNumber, setCopiedRePayNumber] = useState(false);

  // Initialize data from LocalStorage or seed defaults
  useEffect(() => {
    const localUsers = localStorage.getItem('bb_users');
    const localPosts = localStorage.getItem('bb_posts');
    const localStories = localStorage.getItem('bb_stories');
    const localPayments = localStorage.getItem('bb_payments');
    const localMessages = localStorage.getItem('bb_messages');
    const localExecutives = localStorage.getItem('bb_executives');
    const localNotifications = localStorage.getItem('bb_notifications');
    const localReports = localStorage.getItem('bb_reports');

    const loadedUsers = localUsers ? JSON.parse(localUsers) : SEED_USERS;
    const loadedPosts = localPosts ? JSON.parse(localPosts) : SEED_POSTS;
    const loadedStories = localStories ? JSON.parse(localStories) : SEED_STORIES;
    const loadedPayments = localPayments ? JSON.parse(localPayments) : [];
    const loadedMessages = localMessages ? JSON.parse(localMessages) : [];
    const loadedExecutives = localExecutives ? JSON.parse(localExecutives) : SEED_EXECUTIVES;
    const loadedNotifications = localNotifications ? JSON.parse(localNotifications) : [];
    const parsedReports = localReports ? JSON.parse(localReports) : [];
    const loadedReports = (parsedReports && parsedReports.length > 0) ? parsedReports : SEED_REPORTS;

    if (!localUsers) saveToStorage('bb_users', SEED_USERS);
    if (!localPosts) saveToStorage('bb_posts', SEED_POSTS);
    if (!localStories) saveToStorage('bb_stories', SEED_STORIES);
    if (!localExecutives) saveToStorage('bb_executives', SEED_EXECUTIVES);
    if (!localReports || parsedReports.length === 0) saveToStorage('bb_reports', SEED_REPORTS);

    setUsers(loadedUsers);
    setPosts(loadedPosts);
    setStories(loadedStories);
    setPayments(loadedPayments);
    setMessages(loadedMessages);
    setExecutives(loadedExecutives);
    setNotifications(loadedNotifications);
    setReports(loadedReports);

    // Initial state is guest visitor mode (currentUser null)
    setCurrentUser(null);
  }, []);

  // Save collections helper
  const saveToStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // --------------------------------------------------
  // SOCIAL FEED ACTIONS (Timeline, Posts, Stories)
  // --------------------------------------------------
  const handleAddPost = (
    content: string, 
    image?: string, 
    location?: string, 
    music?: { id?: string; title: string; artist: string; audioUrl?: string; coverUrl?: string }
  ) => {
    if (!currentUser) return;
    const newPost: Post = {
      id: `post-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.profilePicture,
      userGender: currentUser.gender,
      userBadge: currentUser.packageId === 'vip' ? 'vip' : currentUser.packageId === 'premium' ? 'premium' : 'none',
      content,
      image,
      location,
      music,
      likes: [],
      loves: [],
      comments: [],
      shares: 0,
      timestamp: new Date().toISOString(),
    };

    const updated = [newPost, ...posts];
    setPosts(updated);
    saveToStorage('bb_posts', updated);
  };

  const handleEditPost = (
    postId: string, 
    content: string, 
    image?: string,
    location?: string,
    music?: { id?: string; title: string; artist: string; audioUrl?: string; coverUrl?: string }
  ) => {
    if (!currentUser) return;
    const updated = posts.map(p => {
      if (p.id === postId && p.userId === currentUser.id) {
        return { ...p, content, image, location, music };
      }
      return p;
    });
    setPosts(updated);
    saveToStorage('bb_posts', updated);
  };

  const handleDeletePost = (postId: string) => {
    if (!currentUser) return;
    const updated = posts.filter(p => p.id !== postId);
    setPosts(updated);
    saveToStorage('bb_posts', updated);
  };

  const handleDeleteStory = (storyId: string) => {
    if (!currentUser) return;
    const updated = stories.filter(s => s.id !== storyId);
    setStories(updated);
    saveToStorage('bb_stories', updated);
  };

  const handleDeleteAllStories = () => {
    if (!currentUser) return;
    const updated = stories.filter(s => s.userId !== currentUser.id);
    setStories(updated);
    saveToStorage('bb_stories', updated);
  };

  const handleAddStory = (
    image: string,
    location?: string,
    music?: { id?: string; title: string; artist: string; audioUrl?: string; coverUrl?: string }
  ) => {
    if (!currentUser) return;
    const newStory: Story = {
      id: `story-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.profilePicture,
      image,
      location,
      music,
      timestamp: new Date().toISOString(),
      viewedBy: [],
    };

    const updated = [newStory, ...stories];
    setStories(updated);
    saveToStorage('bb_stories', updated);
  };

  const handleSharePost = (postId: string) => {
    const updated = posts.map(p => {
      if (p.id === postId) {
        return { ...p, shares: p.shares + 1 };
      }
      return p;
    });
    setPosts(updated);
    saveToStorage('bb_posts', updated);
    alert('পোস্টটি সফলভাবে আপনার ফিডে শেয়ার করা হয়েছে!');
  };

  const handleReactStory = (storyId: string, reactionType: 'like' | 'love') => {
    if (!currentUser) return;
    const updated = stories.map(s => {
      if (s.id === storyId) {
        const existing = s.reactions || [];
        const filtered = existing.filter(r => r.userId !== currentUser.id);
        const newReaction = {
          userId: currentUser.id,
          userName: currentUser.name,
          userAvatar: currentUser.profilePicture,
          type: reactionType,
        };
        return { ...s, reactions: [...filtered, newReaction] };
      }
      return s;
    });
    setStories(updated);
    saveToStorage('bb_stories', updated);
  };

  const handleViewStory = (storyId: string) => {
    if (!currentUser) return;
    let changed = false;
    const updated = stories.map(s => {
      if (s.id === storyId && !s.viewedBy.includes(currentUser.id)) {
        changed = true;
        return { ...s, viewedBy: [...s.viewedBy, currentUser.id] };
      }
      return s;
    });
    if (changed) {
      setStories(updated);
      saveToStorage('bb_stories', updated);
    }
  };

  const handleUploadToGallery = (photoUrl: string) => {
    if (!currentUser) return;
    const updatedGallery = [photoUrl, ...currentUser.galleryPhotos];
    const updatedUser = { ...currentUser, galleryPhotos: updatedGallery };
    setCurrentUser(updatedUser);

    const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
    setUsers(updatedUsers);
    saveToStorage('bb_users', updatedUsers);
  };

  const handleToggleLike = (postId: string, reactionType: 'like' | 'love') => {
    if (!currentUser) return;
    const updated = posts.map((p) => {
      if (p.id === postId) {
        let updatedLikes = [...p.likes];
        let updatedLoves = [...p.loves];

        if (reactionType === 'like') {
          if (updatedLikes.includes(currentUser.id)) {
            updatedLikes = updatedLikes.filter((id) => id !== currentUser.id);
          } else {
            updatedLikes.push(currentUser.id);
            // Remove love reaction if active
            updatedLoves = updatedLoves.filter((id) => id !== currentUser.id);
          }
        } else {
          if (updatedLoves.includes(currentUser.id)) {
            updatedLoves = updatedLoves.filter((id) => id !== currentUser.id);
          } else {
            updatedLoves.push(currentUser.id);
            // Remove like reaction if active
            updatedLikes = updatedLikes.filter((id) => id !== currentUser.id);
          }
        }

        return { ...p, likes: updatedLikes, loves: updatedLoves };
      }
      return p;
    });

    setPosts(updated);
    saveToStorage('bb_posts', updated);
  };

  const handleAddComment = (postId: string, commentText: string) => {
    if (!currentUser) return;
    const updated = posts.map((p) => {
      if (p.id === postId) {
        const newComment: Comment = {
          id: `comment-${Date.now()}`,
          userId: currentUser.id,
          userName: currentUser.name,
          userAvatar: currentUser.profilePicture,
          content: commentText,
          timestamp: new Date().toISOString(),
        };
        return { ...p, comments: [...p.comments, newComment] };
      }
      return p;
    });

    setPosts(updated);
    saveToStorage('bb_posts', updated);
  };

  // --------------------------------------------------
  // CHAT SYSTEM ACTIONS
  // --------------------------------------------------
  const handleSendMessage = (receiverId: string, content: string, image?: string) => {
    if (!currentUser) return;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      receiverId,
      content,
      image,
      timestamp: new Date().toISOString(),
      seen: false,
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    saveToStorage('bb_messages', updated);

    // Notify receiving user
    const updatedNotifs = [
      {
        id: `notif-${Date.now()}`,
        userId: receiverId,
        title: `New message from ${currentUser.name}`,
        titleBn: `${currentUser.name} থেকে নতুন বার্তা`,
        content: `"${content.substring(0, 40)}${content.length > 40 ? '...' : ''}"`,
        contentBn: `"${content.substring(0, 40)}${content.length > 40 ? '...' : ''}"`,
        type: 'message' as const,
        timestamp: new Date().toISOString(),
        read: false,
      },
      ...notifications,
    ];
    setNotifications(updatedNotifs);
    saveToStorage('bb_notifications', updatedNotifs);
  };

  const handleMarkMessagesSeen = (partnerId: string) => {
    if (!currentUser) return;
    let changed = false;
    const updated = messages.map((m) => {
      if (m.senderId === partnerId && m.receiverId === currentUser.id && !m.seen) {
        changed = true;
        return { ...m, seen: true };
      }
      return m;
    });

    if (changed) {
      setMessages(updated);
      saveToStorage('bb_messages', updated);
    }
  };

  const handleOpenDirectChat = (targetUser: User) => {
    setChatPartnerUser(targetUser);
    setSelectedProfile(null);
    setActiveTab('chat');
  };

  const handleBlockUser = (blockedUserId: string) => {
    if (!currentUser) return;
    const updated = [...blockedUsers, blockedUserId];
    setBlockedUsers(updated);
  };

  // --------------------------------------------------
  // BILLING & ADMIN PANEL ACTIONS
  // --------------------------------------------------
  const handleApprovePayment = (paymentId: string) => {
    // 1. Update Payment Record status to approved
    const updatedPayments = payments.map((p) => {
      if (p.id === paymentId) {
        return { ...p, status: 'approved' as const };
      }
      return p;
    });
    setPayments(updatedPayments);
    saveToStorage('bb_payments', updatedPayments);

    // Get the payment to find profile ID
    const payment = payments.find((p) => p.id === paymentId);
    if (payment) {
      // 2. Find and update associated user status to verified
      const updatedUsers = users.map((u) => {
        if (u.profileId === payment.profileId) {
          const isVip = payment.membershipPackage === 'vip';
          const isPremium = payment.membershipPackage === 'premium';
          const activationPin = Math.floor(100000 + Math.random() * 900000).toString();
          const serialNumber = 'BB-SN-' + Math.floor(10000000 + Math.random() * 90000000).toString();
          return { 
            ...u, 
            status: 'verified' as const, 
            isVIP: isVip, 
            isPremium: isVip || isPremium,
            verificationDate: new Date().toLocaleDateString(),
            activationPin,
            serialNumber
          };
        }
        return u;
      });
      setUsers(updatedUsers);
      saveToStorage('bb_users', updatedUsers);

      // If approved user is the current user, update state instantly
      const updatedProfile = updatedUsers.find(u => u.profileId === payment.profileId);
      if (updatedProfile && currentUser?.id === updatedProfile.id) {
        setCurrentUser(updatedProfile);
      }

      // 3. Fire approval system notification to the user
      const targetUser = users.find((u) => u.profileId === payment.profileId);
      if (targetUser) {
        const newNotif = {
          id: `notif-${Date.now()}`,
          userId: targetUser.id,
          title: `Account Activated & Verified!`,
          titleBn: `অ্যাকাউন্ট অ্যাক্টিভেট এবং ভেরিফাইড!`,
          content: `Your payment was successfully approved by the admin. Your profile is now live.`,
          contentBn: `আপনার পেমেন্টটি অ্যাডমিন দ্বারা অনুমোদিত হয়েছে। আপনার বায়োডাটা এখন লাইভ রয়েছে।`,
          type: 'payment' as const,
          timestamp: new Date().toISOString(),
          read: false,
        };
        const newNotifications = [newNotif, ...notifications];
        setNotifications(newNotifications);
        saveToStorage('bb_notifications', newNotifications);
      }
    }
  };

  const handleRejectPayment = (paymentId: string, reason: string) => {
    // Update Payment Record status to rejected
    const updatedPayments = payments.map((p) => {
      if (p.id === paymentId) {
        return { ...p, status: 'rejected' as const, rejectionReason: reason };
      }
      return p;
    });
    setPayments(updatedPayments);
    saveToStorage('bb_payments', updatedPayments);

    // Suspend the associated user account
    const payment = payments.find((p) => p.id === paymentId);
    if (payment) {
      const updatedUsers = users.map((u) => {
        if (u.profileId === payment.profileId || u.mobileNumber === payment.userMobile) {
          return { ...u, status: 'suspended' as UserStatus };
        }
        return u;
      });
      setUsers(updatedUsers);
      saveToStorage('bb_users', updatedUsers);

      if (currentUser && (currentUser.profileId === payment.profileId || currentUser.mobileNumber === payment.userMobile)) {
        setCurrentUser({ ...currentUser, status: 'suspended' });
      }

      // Fire rejection & suspension notification
      const targetUser = users.find((u) => u.profileId === payment.profileId || u.mobileNumber === payment.userMobile);
      if (targetUser) {
        const newNotif = {
          id: `notif-${Date.now()}`,
          userId: targetUser.id,
          title: `Payment Invalid / Account Suspended`,
          titleBn: `পেমেন্ট অকার্যকর / অ্যাকাউন্ট স্থগিত করা হয়েছে (Suspended)`,
          content: `Rejection reason: ${reason}. Your account has been suspended due to invalid payment verification. Please re-submit payment.`,
          contentBn: `কারণ: ${reason}। আপনার পেমেন্ট যাচাই ব্যর্থ হওয়ায় অ্যাকাউন্ট সাময়িকভাবে স্থগিত করা হয়েছে। অনুগ্রহ করে পুনরায় সঠিক ট্রানজেকশন আইডি প্রদান করুন।`,
          type: 'payment' as const,
          timestamp: new Date().toISOString(),
          read: false,
        };
        const newNotifications = [newNotif, ...notifications];
        setNotifications(newNotifications);
        saveToStorage('bb_notifications', newNotifications);
      }
    }
  };

  const handleAddExecutive = (newExec: Executive) => {
    const updated = [newExec, ...executives];
    setExecutives(updated);
    saveToStorage('bb_executives', updated);
  };

  const handleUpdateExecutive = (updatedExec: Executive) => {
    const updated = executives.map((e) => (e.id === updatedExec.id ? updatedExec : e));
    setExecutives(updated);
    saveToStorage('bb_executives', updated);
  };

  const handleDeleteExecutive = (execId: string) => {
    const updated = executives.filter((e) => e.id !== execId);
    setExecutives(updated);
    saveToStorage('bb_executives', updated);
  };

  const handleToggleExecutiveStatus = (execId: string) => {
    const updated = executives.map((e) => {
      if (e.id === execId) {
        return { ...e, isActive: !e.isActive };
      }
      return e;
    });
    setExecutives(updated);
    saveToStorage('bb_executives', updated);
  };

  const handleResolveReport = (
    reportId: string, 
    action: 'dismiss' | 'warning' | 'suspend' | 'ban' | 'remove_content' | 'investigating',
    note?: string
  ) => {
    const report = reports.find((r) => r.id === reportId);
    if (!report) return;

    const newLog: ReportActionLog = {
      id: `log-${Date.now()}`,
      reportId: reportId,
      actionType: action,
      adminName: 'Super Admin',
      actionNote: note || '',
      timestamp: new Date().toISOString()
    };

    let updatedReportStatus: ReportRecord['status'] = 'pending';
    if (action === 'dismiss') updatedReportStatus = 'dismissed';
    else if (action === 'warning') updatedReportStatus = 'warned';
    else if (action === 'suspend') updatedReportStatus = 'suspended';
    else if (action === 'ban') updatedReportStatus = 'banned';
    else if (action === 'remove_content') updatedReportStatus = 'content_removed';
    else if (action === 'investigating') updatedReportStatus = 'investigating';

    // Update user status if suspend or ban
    if (action === 'ban' || action === 'suspend') {
      const updatedUsers = users.map((u) => {
        if (u.id === report.reportedUserId || u.profileId === report.reportedUserProfileId) {
          return { ...u, status: 'rejected' as const };
        }
        return u;
      });
      setUsers(updatedUsers);
      saveToStorage('bb_users', updatedUsers);
    }

    // Send notification if warning
    if (action === 'warning') {
      const warningNotif = {
        id: `notif-warn-${Date.now()}`,
        userId: report.reportedUserId,
        title: 'Security Warning / সতর্কবার্তা',
        titleBn: 'সিকিউরিটি ওয়ার্নিং / সতর্কবার্তা',
        content: `Admin Warning: Your profile received a report regarding "${report.reasonPreset}". Please comply with platform rules.`,
        contentBn: `এডমিন সতর্কবার্তা: আপনার প্রোফাইলের বিরুদ্ধে "${report.reasonPreset}" বিষয়ক অভিযোগ জমা হয়েছে। প্ল্যাটফর্মের নিয়মাবলি মেনে চলুন।`,
        type: 'match' as const,
        timestamp: new Date().toISOString(),
        read: false
      };
      const updatedNotifs = [warningNotif, ...notifications];
      setNotifications(updatedNotifs);
      saveToStorage('bb_notifications', updatedNotifs);
    }

    // Update reports list
    const updatedReports = reports.map((r) => {
      if (r.id === reportId) {
        return {
          ...r,
          status: updatedReportStatus,
          actionLogs: [newLog, ...(r.actionLogs || [])]
        };
      }
      return r;
    });

    setReports(updatedReports);
    saveToStorage('bb_reports', updatedReports);
  };

  const handleReportUser = (
    reportedUserId: string,
    reasonPreset: string,
    additionalDetails?: string,
    screenshots: string[] = []
  ) => {
    if (!currentUser) return;
    const reportedUser = users.find((u) => u.id === reportedUserId);
    if (!reportedUser) return;

    const newReport: ReportRecord = {
      id: `report-${Date.now()}`,
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      reporterProfileId: currentUser.profileId,
      reporterMobileNumber: currentUser.mobileNumber,
      reportedUserId: reportedUser.id,
      reportedUserName: reportedUser.name,
      reportedUserProfileId: reportedUser.profileId,
      reasonPreset,
      additionalDetails,
      screenshots,
      timestamp: new Date().toISOString(),
      status: 'pending',
    };

    const updatedReports = [newReport, ...reports];
    setReports(updatedReports);
    saveToStorage('bb_reports', updatedReports);
  };

  // --------------------------------------------------
  // PROFILE / MATCH INTERACTIONS (Likes, Sent Interests)
  // --------------------------------------------------
  const handleToggleFollow = (targetId: string) => {
    if (!currentUser) return;
    
    const updatedUsers = users.map((u) => {
      if (u.id === currentUser.id) {
        const following = [...u.following];
        if (following.includes(targetId)) {
          return { ...u, following: following.filter((id) => id !== targetId) };
        } else {
          return { ...u, following: [...following, targetId] };
        }
      }
      if (u.id === targetId) {
        const followers = [...u.followers];
        if (followers.includes(currentUser.id)) {
          return { ...u, followers: followers.filter((id) => id !== currentUser.id) };
        } else {
          return { ...u, followers: [...followers, currentUser.id] };
        }
      }
      return u;
    });

    setUsers(updatedUsers);
    saveToStorage('bb_users', updatedUsers);

    // Update active currentUser reference
    const freshCurrentUser = updatedUsers.find((u) => u.id === currentUser.id);
    if (freshCurrentUser) setCurrentUser(freshCurrentUser);

    // Update selected profile view reference
    const freshTargetUser = updatedUsers.find((u) => u.id === targetId);
    if (freshTargetUser) setSelectedProfile(freshTargetUser);
  };

  const handleSendInterest = (targetId: string) => {
    if (!currentUser) return;

    const updatedUsers = users.map((u) => {
      if (u.id === currentUser.id) {
        const sent = [...u.interestsSent];
        if (!sent.includes(targetId)) {
          return { ...u, interestsSent: [...sent, targetId] };
        }
      }
      if (u.id === targetId) {
        const received = [...u.interestsReceived];
        if (!received.includes(currentUser.id)) {
          return { ...u, interestsReceived: [...received, currentUser.id] };
        }
      }
      return u;
    });

    setUsers(updatedUsers);
    saveToStorage('bb_users', updatedUsers);

    // Update active currentUser reference
    const freshCurrentUser = updatedUsers.find((u) => u.id === currentUser.id);
    if (freshCurrentUser) setCurrentUser(freshCurrentUser);

    // Update selected profile view reference
    const freshTargetUser = updatedUsers.find((u) => u.id === targetId);
    if (freshTargetUser) setSelectedProfile(freshTargetUser);

    // Notify receiving candidate
    const newNotif = {
      id: `notif-${Date.now()}`,
      userId: targetId,
      title: `You received a matching Interest!`,
      titleBn: `আপনি একটি আগ্রহের প্রস্তাব পেয়েছেন!`,
      content: `${currentUser.name} has sent you a match proposals interest. View their profile!`,
      contentBn: `${currentUser.name} আপনাকে বায়োডাটা ম্যাচিং আগ্রহ পাঠিয়েছেন। প্রোফাইলটি চেক করুন!`,
      type: 'match' as const,
      timestamp: new Date().toISOString(),
      read: false,
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    saveToStorage('bb_notifications', updatedNotifs);
  };

  const markNotificationsAsRead = () => {
    if (!currentUser) return;
    const updated = notifications.map((n) => {
      if (n.userId === currentUser.id) {
        return { ...n, read: true };
      }
      return n;
    });
    setNotifications(updated);
    saveToStorage('bb_notifications', updated);
  };

  // --------------------------------------------------
  // GUEST REGISTRATION COMPLETED CALLBACK & PENDING PAYMENTS
  // --------------------------------------------------
  const handleSavePendingPayment = (payment: PaymentRecord) => {
    // Check if record exists by transactionId
    const existingIdx = payments.findIndex((p) => p.transactionId.toUpperCase() === payment.transactionId.toUpperCase());
    let updatedPayments: PaymentRecord[];
    if (existingIdx >= 0) {
      updatedPayments = [...payments];
      updatedPayments[existingIdx] = { ...updatedPayments[existingIdx], ...payment };
    } else {
      updatedPayments = [payment, ...payments];
    }
    setPayments(updatedPayments);
    saveToStorage('bb_payments', updatedPayments);
  };

  const handleDeletePaymentRecord = (paymentId: string) => {
    const payment = payments.find((p) => p.id === paymentId);
    if (payment) {
      const updatedUsers = users.map((u) => {
        if (u.profileId === payment.profileId || u.mobileNumber === payment.userMobile) {
          return { ...u, status: 'suspended' as UserStatus };
        }
        return u;
      });
      setUsers(updatedUsers);
      saveToStorage('bb_users', updatedUsers);

      if (currentUser && (currentUser.profileId === payment.profileId || currentUser.mobileNumber === payment.userMobile)) {
        setCurrentUser({ ...currentUser, status: 'suspended' });
      }
    }

    const updatedPayments = payments.filter((p) => p.id !== paymentId);
    setPayments(updatedPayments);
    saveToStorage('bb_payments', updatedPayments);
  };

  const handleRegisterComplete = (newUser: User, initialPayment: PaymentRecord) => {
    // 1. Add user to users
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    saveToStorage('bb_users', updatedUsers);

    // 2. Remove any incomplete registration pending record with same transactionId or profileId
    const cleanedPayments = payments.filter(
      (p) => p.transactionId.toUpperCase() !== initialPayment.transactionId.toUpperCase() && p.profileId !== initialPayment.profileId
    );
    const updatedPayments = [initialPayment, ...cleanedPayments];
    setPayments(updatedPayments);
    saveToStorage('bb_payments', updatedPayments);

    // 3. Log user in as currentUser
    setCurrentUser(newUser);

    // 4. Send success notifications
    const newNotif = {
      id: `notif-reg-${Date.now()}`,
      userId: newUser.id,
      title: `Registration Submitted Under Verification`,
      titleBn: `নিবন্ধন জমা দেওয়া হয়েছে এবং যাচাইাধীন রয়েছে`,
      content: `Your ৳50 basic receipt (${initialPayment.transactionId}) is pending approval. Admin reviews take up to 2 hours.`,
      contentBn: `আপনার ৫০ টাকার বেসিক পেমেন্ট (${initialPayment.transactionId}) অডিটের অপেক্ষায় আছে। এডমিন যাচাই করতে সাধারণত সর্বোচ্চ ২ ঘণ্টা সময় নেন।`,
      type: 'payment' as const,
      timestamp: new Date().toISOString(),
      read: false,
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    saveToStorage('bb_notifications', updatedNotifs);

    // Redirect to newsfeed timeline
    setActiveTab('feed');
  };

  // --------------------------------------------------
  // EDIT PROFILE & SETTINGS VIEWS
  // --------------------------------------------------
  const renderEditProfileView = () => {
    if (!currentUser) return null;
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-6">
        <div className="bg-white border border-neutral-200/60 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-neutral-900 border-b border-neutral-100 pb-3">
            প্রোফাইল সংশোধন করুন (Edit Profile)
          </h2>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            alert('প্রোফাইল তথ্য সফলভাবে আপডেট করা হয়েছে!');
            setActiveTab('profile');
          }} className="space-y-4 text-xs font-medium text-neutral-700">
            <div>
              <label className="block text-neutral-500 font-bold mb-1">নাম (Name)</label>
              <input type="text" defaultValue={currentUser.name} className="w-full p-3 rounded-xl border border-neutral-200" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-500 font-bold mb-1">পেশা (Profession)</label>
                <input type="text" defaultValue={currentUser.profession} className="w-full p-3 rounded-xl border border-neutral-200" />
              </div>
              <div>
                <label className="block text-neutral-500 font-bold mb-1">জেলা (District)</label>
                <input type="text" defaultValue={currentUser.district} className="w-full p-3 rounded-xl border border-neutral-200" />
              </div>
            </div>

            <div>
              <label className="block text-neutral-500 font-bold mb-1">সংক্ষিপ্ত পরিচিতি (About Yourself)</label>
              <textarea rows={4} defaultValue={currentUser.aboutYourself} className="w-full p-3 rounded-xl border border-neutral-200" />
            </div>

            <div className="flex space-x-3 pt-4">
              <button type="submit" className="flex-1 py-3 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl shadow-xs cursor-pointer">
                পরিবর্তন সংরক্ষণ করুন (Save Changes)
              </button>
              <button type="button" onClick={() => setActiveTab('profile')} className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl cursor-pointer">
                বাতিল (Cancel)
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderSettingsView = () => {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-6">
        <div className="bg-white border border-neutral-200/60 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-neutral-900 border-b border-neutral-100 pb-3">
            অ্যাকাউন্ট সেটিংস (Settings)
          </h2>

          <div className="space-y-4 text-xs font-medium text-neutral-700">
            <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
              <div>
                <h4 className="font-bold text-neutral-900 text-sm">ভাষা (Language)</h4>
                <p className="text-neutral-500">অ্যাপ্লিকেশনের ভাষা পরিবর্তন করুন</p>
              </div>
              <button 
                onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
                className="px-4 py-2 bg-neutral-900 text-white font-bold rounded-xl cursor-pointer"
              >
                {language === 'bn' ? 'English (ইংরেজি)' : 'বাংলা (Bangla)'}
              </button>
            </div>

            <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
              <div>
                <h4 className="font-bold text-neutral-900 text-sm">নোটিফিকেশন সেটিং (Notifications)</h4>
                <p className="text-neutral-500">ম্যাচ ও ইনবক্স বার্তার নোটিফিকেশন</p>
              </div>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                সক্রিয় (Active)
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
              <div>
                <h4 className="font-bold text-neutral-900 text-sm">গোপনীয়তা (Privacy)</h4>
                <p className="text-neutral-500">ভেরিফাইড ও সুরক্ষিত যোগাযোগ ব্যবস্থা</p>
              </div>
              <span className="text-neutral-700 font-bold bg-white px-3 py-1 rounded-full border border-neutral-200">
                এন্ড-টু-এন্ড সুরক্ষিত
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --------------------------------------------------
  // SUBSECTION UPGRADES / PRICING PANEL RENDER
  // --------------------------------------------------
  const renderPricingView = () => {
    const isBasicUser = currentUser?.packageId === 'basic';
    
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12" id="pricing-portal-page">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-1 px-3 py-1 bg-rose-50 text-red-600 rounded-full text-xs font-bold uppercase tracking-wider border border-rose-100">
            <ShoppingBag className="h-4.5 w-4.5" />
            <span>Select Membership Plan</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-serif">
            {language === 'en' ? 'BibahoBondhon Pricing Tiers' : 'বিবাহবন্ধন প্যাকেজ এবং সাবস্ক্রিপশন'}
          </h2>
          <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto">
            All plans are tailored to guarantee safe matching across Bangladesh. Every guest must first buy Basic (৳50) to register.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {MEMBERSHIP_PACKAGES.map((pkg) => {
            const isVIP = pkg.id === 'vip';
            const isPremium = pkg.id === 'premium';
            const isStandard = pkg.id === 'standard';
            const isBasic = pkg.id === 'basic';

            const activeText = language === 'en' ? 'Subscribe & Proceed' : 'সাবস্ক্রাইব এবং এগিয়ে যান';

            return (
              <div 
                key={pkg.id} 
                className={`bg-white rounded-3xl border p-6 flex flex-col justify-between relative shadow-sm transition-all duration-300 ${
                  isVIP 
                    ? 'border-amber-400 ring-4 ring-amber-400/20 shadow-xl' 
                    : isPremium
                    ? 'border-rose-400 ring-4 ring-rose-400/10'
                    : 'border-rose-100'
                }`}
              >
                {isBasic && (
                  <span className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-bold py-1 px-4 uppercase rounded-bl-xl tracking-wider">
                    Required for Guests
                  </span>
                )}
                {isVIP && (
                  <span className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[9px] font-bold py-1 px-4 uppercase rounded-bl-xl tracking-wider">
                    VIP Advisor Support
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-display">
                      {language === 'en' ? pkg.name : pkg.nameBn}
                    </h3>
                    <p className="text-xs text-slate-400">Duration: {pkg.durationDays} Days</p>
                  </div>

                  <div className="py-2 border-b border-rose-50">
                    <span className="text-3xl font-mono font-extrabold text-slate-950">৳{pkg.price}</span>
                    <span className="text-xs text-slate-400"> / {pkg.durationDays} Days</span>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-600 pt-2 font-medium">
                    {(language === 'en' ? pkg.features : pkg.featuresBn).map((f, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  {currentUser ? (
                    currentUser.packageId === pkg.id ? (
                      <div className="w-full py-2.5 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase rounded-xl tracking-wider text-center border border-emerald-100 shadow-sm">
                        ✓ Your Current Plan
                      </div>
                    ) : isBasic ? (
                      <div className="w-full py-2.5 bg-slate-50 text-slate-400 text-xs font-bold uppercase rounded-xl tracking-wider text-center border border-slate-100">
                        Downgrade Restricted
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          const confirmUpgrade = window.confirm(
                            language === 'en'
                              ? `Do you want to proceed to checkout and pay ৳${pkg.price} to upgrade your profile to ${pkg.name}?`
                              : `আপনি কি চেকআউটে গিয়ে ৳${pkg.price} পরিশোধ করে আপনার প্রোফাইলটি ${pkg.nameBn}-এ আপগ্রেড করতে চান?`
                          );
                          if (confirmUpgrade) {
                            // Direct upgrade helper (simulates bKash approval flow)
                            const updatedUsers = users.map(u => {
                              if (u.id === currentUser.id) {
                                return {
                                  ...u,
                                  packageId: pkg.id as PackageType,
                                  isPremium: pkg.id === 'premium' || pkg.id === 'vip',
                                  isVIP: pkg.id === 'vip'
                                };
                              }
                              return u;
                            });
                            setUsers(updatedUsers);
                            saveToStorage('bb_users', updatedUsers);
                            
                            const updatedActive = updatedUsers.find(u => u.id === currentUser.id);
                            if (updatedActive) setCurrentUser(updatedActive);

                            alert(
                              language === 'en'
                                ? `Success! Your profile was upgraded to ${pkg.name}!`
                                : `অভিনন্দন! আপনার প্রোফাইলটি ${pkg.nameBn}-এ আপগ্রেড করা হয়েছে!`
                            );
                            setActiveTab('feed');
                          }
                        }}
                        className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase rounded-xl tracking-wider transition-all shadow-sm flex items-center justify-center space-x-1"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        <span>Upgrade Profile</span>
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => {
                        // Start registration starting with selected Package
                        // Step 1 selected package
                        const selectedPkg = MEMBERSHIP_PACKAGES.find(p => p.id === pkg.id);
                        if (selectedPkg) setSelectedPackage(selectedPkg);
                        setActiveTab('register');
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-bold uppercase rounded-xl tracking-wider text-center block transition-all shadow-md shadow-rose-100"
                    >
                      {activeText}
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const [selectedPackage, setSelectedPackage] = useState(MEMBERSHIP_PACKAGES[0]);
  const [initialMobileNumber, setInitialMobileNumber] = useState('');

  // Handle advanced search queries
  const [activeFilters, setActiveFilters] = useState<any>(null);

  const handleSearchSubmit = (filters: any) => {
    setActiveFilters(filters);
  };

  const unreadMessageCount = messages.filter((m) => m.receiverId === currentUser?.id && !m.seen).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800" id="applet-viewport">
      
      {/* 1. Header Navigation Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedProfile(null);
          setActiveFilters(null);
        }}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        users={users}
        language={language}
        setLanguage={setLanguage}
        notifications={notifications}
        markNotificationsAsRead={markNotificationsAsRead}
        isAdminMode={isAdminMode}
        setIsAdminMode={setIsAdminMode}
        onOpenLoginModal={() => setShowUserLoginModal(true)}
        unreadMessageCount={unreadMessageCount}
      />

      {/* 2. Global Status Bar Notice for logged in Pending members */}
      {currentUser && currentUser.status === 'pending' && activeTab !== 'feed' && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 py-2.5 text-center px-4 flex items-center justify-center space-x-2 text-slate-950 text-xs font-extrabold border-b border-amber-400">
          <ShieldAlert className="h-4 w-4 animate-bounce" />
          <span>
            {language === 'en'
              ? 'Please wait. Your payment is under verification. Your account will be activated after admin approval.'
              : 'দয়া করে অপেক্ষা করুন। আপনার পেমেন্টটি যাচাই করা হচ্ছে। অ্যাডমিন অনুমোদনের পর আপনার অ্যাকাউন্টটি সক্রিয় হবে।'}
          </span>
        </div>
      )}

      {/* 3. Main Views router */}
      <main className="flex-grow">
        
        {/* If target user selected -> render facebook style Profile Details */}
        {selectedProfile ? (
          <ProfileDetails
            language={language}
            currentUser={currentUser}
            targetUser={selectedProfile}
            allUsers={users}
            posts={posts}
            stories={stories}
            onToggleFollow={handleToggleFollow}
            onSendInterest={handleSendInterest}
            setActiveTab={setActiveTab}
            onOpenDirectChat={handleOpenDirectChat}
            onUploadToGallery={handleUploadToGallery}
            onReportUser={handleReportUser}
            onSelectProfileById={(id) => {
              const target = users.find(u => u.id === id || u.profileId === id);
              if (target) setSelectedProfile(target);
            }}
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <Hero
                language={language}
                setActiveTab={setActiveTab}
                featuredUsers={users.filter(u => u.isFeatured || u.packageId === 'vip' || u.packageId === 'premium').slice(0, 3)}
                onSearchSubmit={handleSearchSubmit}
                onSelectProfile={(user) => setSelectedProfile(user)}
                currentUser={currentUser}
                users={users}
                onQuickRegister={(num) => {
                  setInitialMobileNumber(num);
                  setActiveTab('register');
                }}
                onOpenAdminLoginModal={() => setShowAdminLoginModal(true)}
              />
            )}

            {activeTab === 'pricing' && renderPricingView()}

            {activeTab === 'register' && (
              <RegistrationFlow
                language={language}
                onRegisterComplete={handleRegisterComplete}
                onSavePendingPayment={handleSavePendingPayment}
                initialPackageId={selectedPackage?.id}
                initialMobileNumber={initialMobileNumber}
              />
            )}

            {activeTab === 'feed' && (
              <Timeline
                language={language}
                currentUser={currentUser}
                users={users}
                posts={posts}
                stories={stories}
                onAddPost={handleAddPost}
                onEditPost={handleEditPost}
                onDeletePost={handleDeletePost}
                onAddStory={handleAddStory}
                onDeleteStory={handleDeleteStory}
                onDeleteAllStories={handleDeleteAllStories}
                onToggleLike={handleToggleLike}
                onAddComment={handleAddComment}
                onSharePost={handleSharePost}
                onReactStory={handleReactStory}
                onViewStory={handleViewStory}
                onSelectProfileById={(id) => {
                  const target = users.find(u => u.id === id || u.profileId === id);
                  if (target) setSelectedProfile(target);
                }}
                onOpenDirectChat={handleOpenDirectChat}
                onUploadToGallery={handleUploadToGallery}
              />
            )}

            {activeTab === 'search' && (
              <SearchMatches
                language={language}
                users={users}
                onSelectProfile={(user) => setSelectedProfile(user)}
                initialFilters={activeFilters}
              />
            )}

            {activeTab === 'chat' && (
              <ChatSystem
                language={language}
                currentUser={currentUser}
                users={users}
                messages={messages}
                initialSelectedUser={chatPartnerUser}
                onSendMessage={handleSendMessage}
                onMarkMessagesSeen={handleMarkMessagesSeen}
                onReportUser={handleReportUser}
                onBlockUser={handleBlockUser}
                blockedUsers={blockedUsers}
                onOpenUpgradeModal={() => setActiveTab('pricing')}
              />
            )}

            {activeTab === 'executives' && (
              <ExecutiveSection
                language={language}
                executives={executives}
                users={users}
                payments={payments}
              />
            )}

            {activeTab === 'edit-profile' && renderEditProfileView()}

            {activeTab === 'settings' && renderSettingsView()}

            {activeTab === 'admin' && isAdminMode && (
              <AdminDashboard
                language={language}
                users={users}
                payments={payments}
                executives={executives}
                reports={reports}
                onApprovePayment={handleApprovePayment}
                onRejectPayment={handleRejectPayment}
                onDeletePaymentRecord={handleDeletePaymentRecord}
                onAddExecutive={handleAddExecutive}
                onUpdateExecutive={handleUpdateExecutive}
                onDeleteExecutive={handleDeleteExecutive}
                onToggleExecutiveStatus={handleToggleExecutiveStatus}
                onResolveReport={handleResolveReport}
              />
            )}

            {/* Render own profile page if selected own profile */}
            {activeTab === 'profile' && currentUser && (
              <ProfileDetails
                language={language}
                currentUser={currentUser}
                targetUser={currentUser}
                allUsers={users}
                posts={posts}
                stories={stories}
                onToggleFollow={handleToggleFollow}
                onSendInterest={handleSendInterest}
                setActiveTab={setActiveTab}
                onOpenDirectChat={handleOpenDirectChat}
                onUploadToGallery={handleUploadToGallery}
                onSelectProfileById={(id) => {
                  const target = users.find(u => u.id === id || u.profileId === id);
                  if (target) setSelectedProfile(target);
                }}
              />
            )}
          </>
        )}

      </main>

      {/* Premium Minimalist Footer */}
      {activeTab !== 'home' && (
        <footer className="bg-white border-t border-neutral-200/50 py-8 text-center mt-auto" id="app-footer-copyright-section">
          <div className="max-w-7xl mx-auto px-4">
            <p 
              onClick={() => setShowAdminLoginModal(true)}
              className="text-xs sm:text-sm text-neutral-400 font-medium select-none cursor-pointer hover:text-red-700 active:text-red-800 transition-colors duration-200"
              id="footer-copyright-text-clickable"
              title="এডমিন প্যানেল লগইন করতে ক্লিক করুন"
            >
              {language === 'en' 
                ? '© 2026 BibahoBondhon Matrimony Bangladesh. All Rights Reserved. Made within Bangladesh' 
                : '© ২০২৬ বিবাহবন্ধন ম্যাট্রিমনি বাংলাদেশ। সর্বস্বত্ব সংরক্ষিত। মেড উইথইন বাংলাদেশ'}
            </p>
          </div>
        </footer>
      )}

      {/* User Login Modal */}
      {(showUserLoginModal || activeTab === 'login') && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="user-login-modal-overlay">
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => {
                setShowUserLoginModal(false);
                if (activeTab === 'login') setActiveTab('home');
                setUserLoginError('');
              }}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 font-bold"
            >
              ✕
            </button>
            
            <div className="text-center space-y-2">
              <div className="h-12 w-12 bg-red-50 text-red-700 rounded-full flex items-center justify-center mx-auto border border-red-100">
                <UserIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-serif font-extrabold text-neutral-900">
                {language === 'en' ? 'Account Login' : 'সদস্য লগইন করুন'}
              </h3>
              <p className="text-xs text-neutral-500 font-medium">
                {language === 'en' ? 'Select profile or enter mobile number to log in' : 'আপনার অ্যাকাউন্টে লগইন করতে মোবাইল নম্বর বা প্রোফাইল নির্বাচন করুন'}
              </p>
            </div>

            {/* Quick Profile Selection */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-neutral-500 uppercase block font-mono">
                {language === 'en' ? 'Registered Members (Quick Select)' : 'নিবন্ধিত সদস্য (ক্লিক করে সরাসরি লগইন করুন):'}
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                {users.slice(0, 6).map((u) => (
                  <div
                    key={u.id}
                    onClick={() => {
                      setCurrentUser(u);
                      setActiveTab('feed'); // Redirects directly to Facebook-style Timeline Feed!
                      setShowUserLoginModal(false);
                    }}
                    className="flex items-center space-x-3 p-2.5 rounded-2xl border border-neutral-200 hover:border-red-600 hover:bg-red-50/50 cursor-pointer transition-all duration-150 group"
                  >
                    <img 
                      src={u.profilePicture} 
                      alt={u.name} 
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-neutral-200 group-hover:ring-red-600"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-neutral-900 group-hover:text-red-700 truncate">{u.name}</p>
                      <p className="text-[10px] text-neutral-500">{u.district} • {u.occupation}</p>
                    </div>
                    <span className="text-xs font-bold text-red-700 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                      লগইন ➔
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-neutral-200"></div>
              <span className="flex-shrink mx-3 text-xs text-neutral-400 font-semibold font-mono">অথবা মোবাইল দিয়ে</span>
              <div className="flex-grow border-t border-neutral-200"></div>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const matched = users.find(u => u.mobileNumber === userLoginInput.trim() || u.id === userLoginInput.trim());
                if (matched) {
                  setCurrentUser(matched);
                  setActiveTab('feed'); // Redirects directly to Timeline Feed!
                  setShowUserLoginModal(false);
                  setUserLoginInput('');
                  setUserLoginError('');
                } else if (users.length > 0) {
                  // Fallback to first user if number not matched
                  setCurrentUser(users[0]);
                  setActiveTab('feed');
                  setShowUserLoginModal(false);
                  setUserLoginInput('');
                  setUserLoginError('');
                } else {
                  setUserLoginError(language === 'en' ? 'User not found' : 'সদস্য খুঁজে পাওয়া যায়নি');
                }
              }}
              className="space-y-3"
            >
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-500 uppercase block font-mono">Mobile Number / User ID</label>
                <input
                  type="text"
                  placeholder="017XXXXXXXX"
                  value={userLoginInput}
                  onChange={(e) => setUserLoginInput(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-red-700 focus:bg-white font-mono"
                  id="user-login-mobile-input"
                />
              </div>

              {userLoginError && (
                <p className="text-xs text-red-600 font-semibold font-mono text-center">{userLoginError}</p>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-red-700 hover:bg-red-800 text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl shadow-md transition-all duration-150 flex items-center justify-center space-x-1.5 cursor-pointer font-mono"
                id="user-login-submit-btn"
              >
                <span>{language === 'en' ? 'Login & View Timeline' : 'লগইন করে টাইমলাইনে যান'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Hidden Admin Login Modal */}
      {showAdminLoginModal && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="admin-login-modal-overlay">
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 max-w-sm w-full space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => {
                setShowAdminLoginModal(false);
                setAdminError('');
              }}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 font-bold"
            >
              ✕
            </button>
            
            <div className="text-center space-y-2">
              <div className="h-12 w-12 bg-red-50 text-red-700 rounded-full flex items-center justify-center mx-auto border border-red-100">
                <Key className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-serif font-extrabold text-neutral-900">
                {language === 'en' ? 'Admin Portal Secure Login' : 'অ্যাডমিন পোর্টাল সিকিউর লগইন'}
              </h3>
              <p className="text-xs text-neutral-400">
                {language === 'en' ? 'Please provide administrative credentials.' : 'দয়া করে প্রশাসনিক আইডি ও পাসওয়ার্ড দিন।'}
              </p>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if ((adminUser.trim() === 'Sa7@kL3!' && adminPass === 'Sa7@kL3!') || (adminUser.trim() === 'admin' && adminPass === 'admin123')) {
                  setIsAdminMode(true);
                  setCurrentUser(null);
                  setActiveTab('admin');
                  setShowAdminLoginModal(false);
                  setAdminUser('');
                  setAdminPass('');
                  setAdminError('');
                } else {
                  setAdminError(language === 'en' ? 'Invalid Admin Credentials' : 'ভুল অ্যাডমিন আইডি বা পাসওয়ার্ড');
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-500 uppercase block font-mono">Username</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. admin"
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-red-700 focus:bg-white font-mono"
                  id="admin-username-field"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-500 uppercase block font-mono">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-red-700 focus:bg-white font-mono"
                  id="admin-password-field"
                />
              </div>

              {adminError && (
                <p className="text-xs text-red-600 font-semibold font-mono text-center">{adminError}</p>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-red-700 hover:bg-red-800 text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl shadow-md transition-all duration-150 flex items-center justify-center space-x-1.5 cursor-pointer font-mono"
                id="admin-login-submit-btn"
              >
                <Key className="h-4 w-4" />
                <span>{language === 'en' ? 'Authenticate' : 'প্রবেশ করুন'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUSPENDED USER BLOCK MODAL */}
      {currentUser && currentUser.status === 'suspended' && (
        <div className="fixed inset-0 bg-neutral-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in" id="suspended-account-modal">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 text-center">
            
            <div className="h-16 w-16 bg-red-100 text-red-700 rounded-full flex items-center justify-center mx-auto border-2 border-red-300 shadow-sm">
              <AlertTriangle className="h-9 w-9 text-red-600 animate-bounce" />
            </div>

            <div className="space-y-3">
              <h3 className="text-xl sm:text-2xl font-serif font-black text-neutral-900 flex items-center justify-center space-x-2">
                <span>⚠️ পেমেন্ট যাচাই ব্যর্থ</span>
              </h3>
              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-sans font-medium p-4 bg-red-50/90 rounded-2xl border border-red-200 text-left">
                আপনার পূর্বের পেমেন্টটি যাচাই করা যায়নি বা বাতিল হয়েছে। তাই আপনার অ্যাকাউন্ট সাময়িকভাবে স্থগিত (Suspended) করা হয়েছে। অনুগ্রহ করে পুনরায় সঠিকভাবে পেমেন্ট সম্পন্ন করুন।
              </p>
            </div>

            {/* Payment Options Buttons */}
            <div className="space-y-2 text-left">
              <label className="text-[11px] font-bold text-neutral-500 uppercase block font-mono">
                পেমেন্ট অপশন বেছে নিন (Select Payment Option):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRePayMethod('bKash');
                    setShowRePaymentModal(true);
                  }}
                  className="p-3 bg-pink-50 hover:bg-pink-100 border border-pink-300 text-pink-900 rounded-2xl flex items-center justify-center space-x-1.5 text-xs font-bold font-mono transition-all cursor-pointer shadow-xs"
                >
                  <span>💳 bKash পেমেন্ট</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRePayMethod('Nagad');
                    setShowRePaymentModal(true);
                  }}
                  className="p-3 bg-orange-50 hover:bg-orange-100 border border-orange-300 text-orange-900 rounded-2xl flex items-center justify-center space-x-1.5 text-xs font-bold font-mono transition-all cursor-pointer shadow-xs"
                >
                  <span>💳 Nagad পেমেন্ট</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRePayMethod('Rocket');
                    setShowRePaymentModal(true);
                  }}
                  className="p-3 bg-purple-50 hover:bg-purple-100 border border-purple-300 text-purple-900 rounded-2xl flex items-center justify-center space-x-1.5 text-xs font-bold font-mono transition-all cursor-pointer shadow-xs"
                >
                  <span>🚀 Rocket পেমেন্ট</span>
                </button>
              </div>
            </div>

            {/* Primary Re-payment Call-to-action button */}
            <button
              type="button"
              onClick={() => {
                setRePayMethod('bKash');
                setShowRePaymentModal(true);
              }}
              className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-mono font-bold text-sm uppercase tracking-wider rounded-xl shadow-lg transition-all duration-150 cursor-pointer flex items-center justify-center space-x-2"
              id="btn-repay-now"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>আবার পেমেন্ট করুন</span>
            </button>

            {/* Logout option */}
            <div className="pt-2 border-t border-neutral-100 flex justify-between items-center text-xs text-neutral-500 font-mono">
              <span>ইউজার আইডি: {currentUser.profileId}</span>
              <button
                type="button"
                onClick={() => setCurrentUser(null)}
                className="text-neutral-700 hover:text-red-700 font-bold underline cursor-pointer"
              >
                লগআউট করুন (Logout)
              </button>
            </div>

          </div>
        </div>
      )}

      {/* RE-PAYMENT MODAL FORM */}
      {showRePaymentModal && currentUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in" id="repayment-form-modal">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
              <h3 className="text-lg font-bold font-serif text-neutral-900 flex items-center space-x-2">
                <span>💳 পেমেন্ট তথ্য পুনরায় সাবমিট করুন</span>
              </h3>
              <button
                onClick={() => setShowRePaymentModal(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Select Payment Method */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-neutral-600 uppercase block font-mono">
                  পেমেন্ট চ্যানেল সিলেক্ট করুন:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['bKash', 'Nagad', 'Rocket'] as const).map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setRePayMethod(m)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold font-mono transition-all cursor-pointer ${
                        rePayMethod === m
                          ? m === 'bKash'
                            ? 'bg-[#e2136e] text-white border-[#e2136e]'
                            : m === 'Nagad'
                            ? 'bg-[#f7941d] text-white border-[#f7941d]'
                            : 'bg-purple-800 text-white border-purple-800'
                          : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      {m === 'Rocket' ? '🚀 Rocket' : m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Select Package */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-neutral-600 uppercase block font-mono">
                  প্যাকেজ নির্বাচন করুন:
                </label>
                <select
                  value={rePayPackage.id}
                  onChange={(e) => {
                    const selected = MEMBERSHIP_PACKAGES.find(p => p.id === e.target.value);
                    if (selected) setRePayPackage(selected);
                  }}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 text-xs font-bold text-neutral-900 focus:outline-none focus:border-red-600 font-sans"
                >
                  {MEMBERSHIP_PACKAGES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nameBn} - ৳{p.price} ({p.durationDays} দিন)
                    </option>
                  ))}
                </select>
              </div>

              {/* Merchant Number Copy Box */}
              <div className="p-3.5 bg-neutral-900 text-white rounded-2xl space-y-1.5 font-mono">
                <div className="flex justify-between items-center text-[10px] text-neutral-400 uppercase">
                  <span>{rePayMethod} Merchant Number</span>
                  <span className="text-amber-400 font-bold">ফি: ৳{rePayPackage.price}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-extrabold text-white">01700000000</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('01700000000');
                      setCopiedRePayNumber(true);
                      setTimeout(() => setCopiedRePayNumber(false), 2000);
                    }}
                    className="px-3 py-1 bg-white text-neutral-900 text-[10px] font-bold rounded-lg hover:bg-neutral-100 cursor-pointer"
                  >
                    {copiedRePayNumber ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* TxID Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-600 uppercase block font-mono">
                  ট্রানজেকশন আইডি (TxID) দিন *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. BK892HJKD8 / RKT99281"
                    value={rePayTxId}
                    onChange={(e) => {
                      setRePayTxId(e.target.value.toUpperCase());
                      setRePayError('');
                    }}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-3 pr-24 py-2.5 text-xs font-mono font-bold uppercase tracking-widest text-neutral-900 focus:outline-none focus:border-red-600"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const randomTx = `${rePayMethod.substring(0, 2).toUpperCase()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
                      setRePayTxId(randomTx);
                      setRePayError('');
                    }}
                    className="absolute right-2 top-1.5 bottom-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-bold font-mono uppercase cursor-pointer"
                  >
                    Auto-Fill
                  </button>
                </div>
              </div>

              {/* Executive Referral Code */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-600 uppercase block font-mono">
                  এক্সিকিউটিভ রেফারেল কোড (ঐচ্ছিক):
                </label>
                <input
                  type="text"
                  placeholder="e.g. WAZED990"
                  value={rePayExecCode}
                  onChange={(e) => setRePayExecCode(e.target.value.toUpperCase())}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase tracking-widest text-neutral-900 focus:outline-none focus:border-red-600"
                />
              </div>

              {rePayError && (
                <p className="text-xs text-red-600 font-mono font-bold text-center">{rePayError}</p>
              )}

              <button
                type="button"
                onClick={() => {
                  if (!rePayTxId.trim() || rePayTxId.length < 8) {
                    setRePayError('অনুগ্রহ করে সঠিক ট্রানজেকশন আইডি প্রদান করুন (কমপক্ষে ৮ অক্ষর)।');
                    return;
                  }

                  const newPayment: PaymentRecord = {
                    id: `pay-resub-${Date.now()}`,
                    profileId: currentUser.profileId,
                    userMobile: currentUser.mobileNumber,
                    userName: currentUser.name,
                    userGender: currentUser.gender,
                    userAge: currentUser.age,
                    userDistrict: currentUser.district,
                    paymentMethod: rePayMethod,
                    transactionId: rePayTxId.trim().toUpperCase(),
                    membershipPackage: rePayPackage.id,
                    amount: rePayPackage.price,
                    status: 'pending',
                    timestamp: new Date().toISOString(),
                    isIncompleteRegistration: false,
                    executiveReferenceCode: rePayExecCode.trim() || undefined,
                  };

                  // 1. Add to payments
                  const updatedPayments = [newPayment, ...payments];
                  setPayments(updatedPayments);
                  saveToStorage('bb_payments', updatedPayments);

                  // 2. Update user status to pending
                  const updatedUsers = users.map((u) => {
                    if (u.id === currentUser.id || u.profileId === currentUser.profileId) {
                      return { ...u, status: 'pending' as UserStatus, packageId: rePayPackage.id };
                    }
                    return u;
                  });
                  setUsers(updatedUsers);
                  saveToStorage('bb_users', updatedUsers);

                  // 3. Update active currentUser
                  setCurrentUser({ ...currentUser, status: 'pending', packageId: rePayPackage.id });

                  // 4. Close modals
                  setShowRePaymentModal(false);
                  setRePayTxId('');
                  setRePayExecCode('');
                  setRePayError('');
                  alert('আপনার নতুন পেমেন্ট তথ্য জমা দেওয়া হয়েছে। অ্যাডমিন যাচাই করার পর আপনার অ্যাকাউন্ট সক্রিয় হবে।');
                }}
                className="w-full py-3.5 bg-red-700 hover:bg-red-800 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors cursor-pointer"
              >
                নতুন পেমেন্ট সাবমিট করুন
              </button>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
