import React, { useState, useEffect, useRef } from 'react';
import { User, ChatMessage } from '../types';
import { 
  Flag, Ban, Send, Image as ImageIcon, ShieldAlert, Lock, CheckCheck, Check, 
  Key, X, Smile, ArrowLeft, PhoneCall, Award, MessageSquare 
} from 'lucide-react';
import { MEMBERSHIP_PACKAGES } from '../data';

interface ChatSystemProps {
  language: 'en' | 'bn';
  currentUser: User | null;
  users: User[];
  messages: ChatMessage[];
  initialSelectedUser?: User | null;
  onSendMessage: (receiverId: string, content: string, image?: string) => void;
  onMarkMessagesSeen: (partnerId: string) => void;
  onReportUser: (reportedUserId: string, reason: string) => void;
  onBlockUser: (blockedUserId: string) => void;
  blockedUsers: string[];
  onOpenUpgradeModal?: () => void;
}

const EMOJI_LIST = ['😊', '😂', '❤️', '👰', '🤵', '💍', '💐', '😍', '💖', '👋', '👍', '🙏', '✨', '🌸', '🌹', '🕊️', '🤲', '💯', '🔥', '💬'];

export default function ChatSystem({
  language,
  currentUser,
  users,
  messages,
  initialSelectedUser,
  onSendMessage,
  onMarkMessagesSeen,
  onReportUser,
  onBlockUser,
  blockedUsers,
  onOpenUpgradeModal,
}: ChatSystemProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);
  const [showPhotoAlertModal, setShowPhotoAlertModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter out current user and blocked users, sort by most recent message timestamp
  const chatPartners = users
    .filter((u) => u.id !== currentUser?.id && !blockedUsers.includes(u.id) && u.status === 'verified')
    .sort((a, b) => {
      const lastMsgA = messages
        .filter((m) => (m.senderId === a.id && m.receiverId === currentUser?.id) || (m.senderId === currentUser?.id && m.receiverId === a.id))
        .pop();
      const lastMsgB = messages
        .filter((m) => (m.senderId === b.id && m.receiverId === currentUser?.id) || (m.senderId === currentUser?.id && m.receiverId === b.id))
        .pop();
      const timeA = lastMsgA ? new Date(lastMsgA.timestamp).getTime() : 0;
      const timeB = lastMsgB ? new Date(lastMsgB.timestamp).getTime() : 0;
      return timeB - timeA;
    });

  // Handle setting initial selected user or defaulting
  useEffect(() => {
    if (initialSelectedUser) {
      setSelectedUser(initialSelectedUser);
    }
  }, [initialSelectedUser]);

  // Mark messages as read when active partner changes or new messages arrive
  useEffect(() => {
    if (selectedUser && currentUser) {
      onMarkMessagesSeen(selectedUser.id);
    }
  }, [selectedUser, messages, currentUser]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedUser, typing]);

  const activeMessages = messages.filter(
    (m) =>
      currentUser &&
      selectedUser &&
      ((m.senderId === currentUser.id && m.receiverId === selectedUser.id) ||
        (m.senderId === selectedUser.id && m.receiverId === currentUser.id))
  );

  const getUnreadCount = (partnerId: string) => {
    if (!currentUser) return 0;
    return messages.filter((m) => m.senderId === partnerId && m.receiverId === currentUser.id && !m.seen).length;
  };

  // Contact details restriction: VIP (৳৫০০) only
  const isContactLocked = currentUser?.packageId !== 'vip';

  // Photo sending restriction: Premium (৳৩০০) or VIP (৳৫০০) only
  const canSendPhotos = currentUser?.packageId === 'premium' || currentUser?.packageId === 'vip';

  // Calculate top-up required for VIP upgrade popup
  const userPkg = MEMBERSHIP_PACKAGES.find((p) => p.id === currentUser?.packageId) || MEMBERSHIP_PACKAGES[0];
  const topUpNeeded = Math.max(0, 500 - userPkg.price);

  const filterContactDetails = (text: string): string => {
    const phoneRegex = /(\+88)?(01[3-9]\d{8})|(\b01[3-9]\d{2}-\d{6}\b)/g;
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const telegramRegex = /(t\.me\/\w+)|(telegram\.me\/\w+)|(\btelegram\b)|(\b@\w+)/gi;
    const linkRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;

    let filtered = text;
    filtered = filtered.replace(phoneRegex, '******');
    filtered = filtered.replace(emailRegex, '******');
    filtered = filtered.replace(telegramRegex, '******');
    filtered = filtered.replace(linkRegex, '******');
    
    return filtered;
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputMessage.trim() && !selectedImage) || !currentUser || !selectedUser) return;

    const cleanContent = inputMessage.trim() ? filterContactDetails(inputMessage) : '';

    onSendMessage(selectedUser.id, cleanContent, selectedImage || undefined);
    setInputMessage('');
    setSelectedImage(null);
    setShowEmojiPicker(false);
  };

  const handlePhotoClick = () => {
    if (!canSendPhotos) {
      setShowPhotoAlertModal(true);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleReport = () => {
    if (!selectedUser) return;
    const reason = prompt(
      language === 'en'
        ? 'Enter reason for reporting this profile:'
        : 'এই প্রোফাইলটি রিপোর্ট করার কারণ লিখুন:'
    );
    if (reason) {
      onReportUser(selectedUser.id, reason);
      alert('ধন্যবাদ। প্রোফাইলটি অ্যাডমিন অডিটের আওতায় আনা হয়েছে।');
    }
  };

  const handleBlock = () => {
    if (!selectedUser) return;
    const confirmBlock = window.confirm(`আপনি কি নিশ্চিত যে আপনি ${selectedUser.name}-কে ব্লক করতে চান?`);
    if (confirmBlock) {
      onBlockUser(selectedUser.id);
      setSelectedUser(null);
    }
  };

  const text = {
    chatTitle: language === 'en' ? 'Private Messenger' : 'ইনবক্স মেসেঞ্জার',
    securedLabel: language === 'en' ? 'End-to-End Family Protected' : 'সুরক্ষিত চ্যাট',
    contactDetails: language === 'en' ? 'Contact Details' : 'যোগাযোগের তথ্য',
    inputPlaceholder: language === 'en' ? 'Type a message...' : 'ইনবক্সে নতুন বার্তা লিখুন...',
    filteringNotice: language === 'en' 
      ? 'Sharing phone numbers or emails inside chat is restricted. Transgressions are auto-replaced with ******.'
      : 'চ্যাটে মোবাইল নম্বর বা ইমেইল শেয়ার করা নিষিদ্ধ। লিখলে তা স্বয়ংক্রিয়ভাবে ****** দিয়ে পরিবর্তিত হবে।',
    typingStatus: language === 'en' ? 'typing...' : 'লিখছেন...',
    reportBtn: language === 'en' ? 'Report Profile' : 'রিপোর্ট করুন',
    blockBtn: language === 'en' ? 'Block Profile' : 'ব্লক করুন',
    selectPrompt: language === 'en' ? 'Select a conversation to start chatting' : 'মেসেজ দেখতে বা পাঠাতে একজন সদস্য নির্বাচন করুন',
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8 animate-fade-in" id="chat-system-root">
      <div className="bg-white border border-neutral-200/80 rounded-3xl shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 h-[calc(100vh-140px)] min-h-[580px] sm:h-[650px]">
        
        {/* COLUMN 1: CONVERSATION THREADS LIST (Col span 4 on MD, full on mobile if no active user) */}
        <div className={`md:col-span-4 border-r border-neutral-200/80 flex flex-col h-full bg-neutral-50/50 ${
          selectedUser ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Thread Header */}
          <div className="p-4 border-b border-neutral-200/80 bg-white flex justify-between items-center">
            <div>
              <h3 className="font-bold text-neutral-900 text-base font-serif flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-red-700" />
                <span>{text.chatTitle}</span>
              </h3>
              <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full inline-block mt-1 font-mono uppercase tracking-wider">
                ● {text.securedLabel}
              </span>
            </div>
          </div>

          {/* Threads Scroll List */}
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">
            {chatPartners.length === 0 ? (
              <div className="p-8 text-center text-neutral-400 text-xs font-mono">
                কোনো সক্রিয় চ্যাট থ্রেড নেই
              </div>
            ) : (
              chatPartners.map((partner) => {
                const isSelected = selectedUser?.id === partner.id;
                const unread = getUnreadCount(partner.id);
                const lastMsg = messages
                  .filter((m) => (m.senderId === partner.id && m.receiverId === currentUser?.id) || (m.senderId === currentUser?.id && m.receiverId === partner.id))
                  .pop();

                return (
                  <div
                    key={partner.id}
                    onClick={() => setSelectedUser(partner)}
                    className={`p-3.5 flex items-center space-x-3 cursor-pointer transition-all duration-150 ${
                      isSelected 
                        ? 'bg-neutral-100/90 border-l-4 border-red-700 font-semibold shadow-2xs' 
                        : 'hover:bg-neutral-100/50'
                    }`}
                    id={`chat-partner-thread-${partner.profileId}`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={partner.profilePicture}
                        alt={partner.name}
                        className="w-11 h-11 rounded-full object-cover border border-neutral-200"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" title="Online" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h4 className={`text-xs sm:text-sm truncate font-serif ${unread > 0 ? 'font-black text-neutral-950' : 'font-bold text-neutral-800'}`}>
                          {partner.name}
                        </h4>
                        {lastMsg && (
                          <span className="text-[9px] text-neutral-400 font-mono shrink-0 ml-1">
                            {new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] text-neutral-400 truncate font-mono uppercase tracking-wider">{partner.profession}</p>

                      <div className="flex justify-between items-center mt-1">
                        <p className={`text-[11px] truncate ${unread > 0 ? 'font-bold text-neutral-900 font-sans' : 'text-neutral-500'}`}>
                          {lastMsg ? (lastMsg.image ? '📷 [ছবি]' : lastMsg.content) : 'নতুন চ্যাট শুরু করুন'}
                        </p>
                        {unread > 0 && (
                          <span className="ml-1 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono shrink-0 animate-pulse">
                            {unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMN 2: ACTIVE MESSENGER SCREEN (Col span 8 on MD, full on mobile when user selected) */}
        <div className={`md:col-span-8 lg:col-span-5 flex flex-col h-full bg-white relative ${
          !selectedUser ? 'hidden md:flex' : 'flex'
        }`}>
          {selectedUser ? (
            <>
              {/* Active Messenger Top Header Bar */}
              <div className="px-4 py-3 border-b border-neutral-200/80 flex justify-between items-center bg-white shadow-2xs z-10" id="chat-active-header">
                <div className="flex items-center space-x-3 min-w-0">
                  {/* Mobile Back Button to return to thread list */}
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="md:hidden p-1.5 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 rounded-xl"
                    title="ব্যাক"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>

                  <div className="relative shrink-0">
                    <img
                      src={selectedUser.profilePicture}
                      alt={selectedUser.name}
                      className="w-10 h-10 rounded-full object-cover border border-neutral-200"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-bold text-neutral-900 text-sm font-serif truncate">{selectedUser.name}</h4>
                    <div className="flex items-center space-x-1 text-[10px] font-mono">
                      <span className="text-emerald-700 font-bold">● অনলাইনে আছেন</span>
                      <span className="text-neutral-300">•</span>
                      <span className="text-neutral-500 truncate">{selectedUser.profileId}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  <button 
                    onClick={handleReport}
                    className="p-2 text-neutral-400 hover:text-red-700 hover:bg-neutral-100 rounded-xl transition-all cursor-pointer"
                    title={text.reportBtn}
                    id="chat-report-button"
                  >
                    <Flag className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={handleBlock}
                    className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-all cursor-pointer"
                    title={text.blockBtn}
                    id="chat-block-button"
                  >
                    <Ban className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Security Banner */}
              <div className="px-4 py-2 bg-amber-50/70 border-b border-amber-200/50 text-[10px] text-amber-900 leading-tight flex items-center space-x-2 font-mono shrink-0">
                <ShieldAlert className="h-4 w-4 text-amber-700 shrink-0" />
                <span>{text.filteringNotice}</span>
              </div>

              {/* Messages Viewport */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-neutral-50/30" id="chat-messages-viewport">
                {activeMessages.length === 0 ? (
                  <div className="text-center py-12 text-neutral-400 text-xs font-mono">
                    👋 কথোপকথন শুরু করতে নিচে মেসেজ লিখুন।
                  </div>
                ) : (
                  activeMessages.map((m) => {
                    const isOwn = m.senderId === currentUser?.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] sm:max-w-[70%] rounded-2xl p-3 shadow-2xs space-y-2 ${
                          isOwn
                            ? 'bg-neutral-900 text-white rounded-tr-none'
                            : 'bg-white text-neutral-900 border border-neutral-200/80 rounded-tl-none'
                        }`}>
                          {m.image && (
                            <img
                              src={m.image}
                              alt="Attached"
                              className="rounded-xl max-h-52 object-cover w-full border border-neutral-200/30"
                              referrerPolicy="no-referrer"
                            />
                          )}
                          {m.content && <p className="text-xs sm:text-sm font-medium leading-relaxed font-sans">{m.content}</p>}
                          
                          <div className="flex items-center justify-end space-x-1.5 text-[9px] opacity-80 font-mono pt-0.5">
                            <span>
                              {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isOwn && (
                              <span>
                                {m.seen ? (
                                  <span className="flex items-center space-x-0.5 text-blue-400 font-bold" title="Seen / পঠিত">
                                    <CheckCheck className="h-3 w-3" />
                                    <span>Seen</span>
                                  </span>
                                ) : (
                                  <Check className="h-3 w-3 text-neutral-400" title="Sent / প্রেরিত" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                
                {/* Typing Indicator */}
                {typing && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-neutral-200 text-neutral-600 rounded-2xl rounded-tl-none p-3 text-xs font-mono flex items-center space-x-1.5 shadow-2xs">
                      <span className="animate-bounce text-red-600">●</span>
                      <span className="animate-bounce delay-100 text-red-600">●</span>
                      <span className="animate-bounce delay-200 text-red-600">●</span>
                      <span className="ml-1 text-[11px] font-semibold text-neutral-700">{selectedUser.name} {text.typingStatus}</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Selected image preview strip */}
              {selectedImage && (
                <div className="px-4 py-2 bg-neutral-100 border-t border-neutral-200 flex items-center justify-between shrink-0">
                  <div className="flex items-center space-x-2">
                    <img src={selectedImage} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-neutral-300" referrerPolicy="no-referrer" />
                    <span className="text-xs text-neutral-700 font-bold font-sans">ছবি সংযুক্ত করা হয়েছে</span>
                  </div>
                  <button onClick={() => setSelectedImage(null)} className="p-1 text-neutral-400 hover:text-red-700">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}

              {/* Emoji Picker Popover Grid */}
              {showEmojiPicker && (
                <div className="absolute bottom-20 left-4 bg-white border border-neutral-200 rounded-2xl p-3 shadow-xl z-30 grid grid-cols-5 gap-2 max-w-xs animate-in fade-in zoom-in-95 duration-100">
                  {EMOJI_LIST.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setInputMessage((prev) => prev + emoji)}
                      className="text-lg p-2 hover:bg-neutral-100 rounded-xl transition-all cursor-pointer text-center"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* Message Compose Form */}
              <form onSubmit={handleSend} className="p-3 sm:p-4 border-t border-neutral-200/80 flex items-center space-x-2 bg-white shrink-0">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {/* Emoji Picker Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`p-2.5 rounded-xl transition-all cursor-pointer border ${
                    showEmojiPicker ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border-neutral-200'
                  }`}
                  title="ইমোজি যুক্ত করুন"
                >
                  <Smile className="h-4 w-4" />
                </button>

                {/* Photo Upload Button (Restricted to Premium/VIP) */}
                <button
                  type="button"
                  onClick={handlePhotoClick}
                  className={`p-2.5 rounded-xl transition-all cursor-pointer border ${
                    canSendPhotos 
                      ? 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border-neutral-200' 
                      : 'bg-neutral-50 text-neutral-400 hover:bg-neutral-100 border-neutral-200'
                  }`}
                  title={canSendPhotos ? "ছবি পাঠান" : "ছবি পাঠাতে মেম্বারশিপ প্রয়োজন (৳৩০০ / ৳৫০০)"}
                  id="chat-photo-attachment-btn"
                >
                  <ImageIcon className="h-4 w-4" />
                </button>

                <input
                  type="text"
                  placeholder={text.inputPlaceholder}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 bg-neutral-50 border border-neutral-200/80 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-900 font-medium"
                />

                <button
                  type="submit"
                  disabled={!inputMessage.trim() && !selectedImage}
                  className="p-2.5 bg-red-700 hover:bg-red-800 disabled:opacity-40 text-white rounded-xl shadow-xs transition-all duration-150 cursor-pointer"
                  id="chat-send-submit-button"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-400 space-y-3">
              <div className="w-16 h-16 rounded-full bg-red-50 text-red-700 flex items-center justify-center mx-auto">
                <MessageSquare className="h-8 w-8" />
              </div>
              <p className="text-sm font-semibold text-neutral-600 max-w-xs font-serif">{text.selectPrompt}</p>
            </div>
          )}
        </div>

        {/* COLUMN 3: CONTACT INFORMATION SIDEBAR (Col span 3 on LG, hidden on smaller unless toggled) */}
        <div className="hidden lg:block lg:col-span-3 border-l border-neutral-200/80 p-5 space-y-6 h-full overflow-y-auto bg-neutral-50/30">
          {selectedUser ? (
            <div className="space-y-6 text-center" id="chat-right-profile-details">
              
              {/* Profile Overview Card */}
              <div className="space-y-3">
                <img
                  src={selectedUser.profilePicture}
                  alt={selectedUser.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-sm mx-auto"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="font-bold text-neutral-900 text-sm font-serif">{selectedUser.name}</h4>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-800 bg-neutral-100 px-2.5 py-0.5 rounded-full inline-block mt-1 font-mono">
                    {selectedUser.profession}
                  </span>
                </div>
              </div>

              {/* Bio Data Attributes */}
              <div className="text-left text-xs text-neutral-700 space-y-2.5 border-t border-neutral-200/80 pt-4 font-mono bg-white p-3.5 rounded-2xl border border-neutral-100 shadow-2xs">
                <div><span className="text-neutral-400 font-bold block text-[9px] uppercase">Profile ID</span> {selectedUser.profileId}</div>
                <div><span className="text-neutral-400 font-bold block text-[9px] uppercase">Home District</span> {selectedUser.district}</div>
                <div><span className="text-neutral-400 font-bold block text-[9px] uppercase">Religion</span> {selectedUser.religion}</div>
                <div><span className="text-neutral-400 font-bold block text-[9px] uppercase">Marital Status</span> {selectedUser.maritalStatus}</div>
              </div>

              {/* Contact Unlock Box */}
              <div className="border-t border-neutral-200/80 pt-4 space-y-3">
                <h5 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center justify-center space-x-1 font-mono">
                  <Lock className="h-3.5 w-3.5" />
                  <span>{text.contactDetails}</span>
                </h5>

                {isContactLocked ? (
                  <div className="p-4 bg-amber-50/80 border border-amber-200/60 rounded-2xl text-center space-y-3 shadow-2xs">
                    <Lock className="h-6 w-6 text-amber-800 mx-auto" />
                    <div className="space-y-1">
                      <p className="text-xs text-amber-950 font-bold font-sans">
                        মোবাইল ও WhatsApp নম্বর লক করা রয়েছে
                      </p>
                      <p className="text-[11px] text-amber-800 leading-snug font-sans">
                        নম্বর দেখতে <strong>৳৫০০ VIP Membership</strong> প্রয়োজন।
                      </p>
                      {topUpNeeded > 0 && (
                        <p className="text-[10px] font-bold text-red-700 pt-1 font-mono">
                          (আপনার বর্তমান প্যাকেজ থেকে আরও ৳{topUpNeeded} টপ-আপ করুন)
                        </p>
                      )}
                    </div>
                    <button
                      onClick={onOpenUpgradeModal}
                      className="w-full py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer font-sans"
                    >
                      VIP মেম্বারশিপে আপগ্রেড করুন
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50/80 border border-emerald-200/60 rounded-2xl text-center space-y-3 shadow-2xs">
                    <CheckCheck className="h-6 w-6 text-emerald-600 mx-auto" />
                    <div className="text-left text-xs font-mono space-y-1.5 bg-white p-3 rounded-xl border border-emerald-100 text-neutral-800">
                      <div><span className="text-[9px] text-neutral-400 uppercase block font-sans">Mobile Number:</span> {selectedUser.mobileNumber}</div>
                      <div><span className="text-[9px] text-neutral-400 uppercase block font-sans">WhatsApp Number:</span> {selectedUser.whatsappNumber}</div>
                    </div>

                    <a
                      href={`https://wa.me/${selectedUser.whatsappNumber.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl tracking-wider uppercase inline-flex items-center justify-center space-x-1.5 transition-all shadow-xs cursor-pointer font-sans"
                    >
                      <PhoneCall className="h-3.5 w-3.5" />
                      <span>WhatsApp-এ কথা বলুন</span>
                    </a>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="text-center text-neutral-400 text-xs py-12 font-mono">
              কোনো প্রোফাইল নির্বাচিত হয়নি
            </div>
          )}
        </div>

      </div>

      {/* RESTRICTED PHOTO UPLOAD ALERT MODAL */}
      {showPhotoAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl border border-neutral-200 space-y-5 text-center animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto ring-8 ring-amber-50">
              <ImageIcon className="h-7 w-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-neutral-900 font-serif">ছবি পাঠানোর বিশেষ সুবিধা</h3>
              <p className="text-xs text-neutral-600 leading-relaxed font-sans">
                ছবি পাঠানোর সুবিধা শুধুমাত্র <strong>৳৩০০ (প্রিমিয়াম)</strong> অথবা <strong>৳৫০০ (ভিআইপি)</strong> মেম্বারশিপে প্রযোজ্য। ছবি পাঠাতে আপনার মেম্বারশিপ আপগ্রেড করুন।
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setShowPhotoAlertModal(false);
                  if (onOpenUpgradeModal) onOpenUpgradeModal();
                }}
                className="w-full py-3 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer font-sans"
              >
                মেম্বারশিপ আপগ্রেড করুন
              </button>
              <button
                onClick={() => setShowPhotoAlertModal(false)}
                className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs rounded-xl transition-all cursor-pointer font-sans"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
