import React, { useState } from 'react';
import { User, PaymentRecord, Executive, PackageType, ReportRecord, ReportActionLog } from '../types';
import { SEED_REPORTS } from '../data';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  ShieldCheck, AlertCircle, CreditCard, Users, DollarSign, CheckCircle, 
  XCircle, Search, UserCheck, Plus, ToggleLeft, ToggleRight, Trash2,
  TrendingUp, Award, Calendar, Hash, Phone, Mail, MapPin, Image as ImageIcon,
  Edit2, Globe, Clock, Check, RefreshCw, ShieldAlert, Eye, MessageSquare, AlertTriangle, FileText, Lock, Key, ArrowLeft, Upload
} from 'lucide-react';

interface AdminDashboardProps {
  language: 'en' | 'bn';
  users: User[];
  payments: PaymentRecord[];
  executives: Executive[];
  reports: ReportRecord[];
  onApprovePayment: (paymentId: string) => void;
  onRejectPayment: (paymentId: string, reason: string) => void;
  onDeletePaymentRecord?: (paymentId: string) => void;
  onAddExecutive: (newExec: Executive) => void;
  onUpdateExecutive?: (updatedExec: Executive) => void;
  onDeleteExecutive?: (execId: string) => void;
  onToggleExecutiveStatus: (execId: string) => void;
  onResolveReport?: (reportId: string, action: 'dismiss' | 'warning' | 'suspend' | 'ban' | 'remove_content' | 'investigating', note?: string) => void;
  onDeleteReport?: (reportId: string) => void;
}

export default function AdminDashboard({
  language,
  users,
  payments,
  executives,
  reports,
  onApprovePayment,
  onRejectPayment,
  onDeletePaymentRecord,
  onAddExecutive,
  onUpdateExecutive,
  onDeleteExecutive,
  onToggleExecutiveStatus,
  onResolveReport,
  onDeleteReport,
}: AdminDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'executives' | 'performance' | 'system_regs' | 'payments' | 'reports'>('analytics');
  
  // Executive & Payment Password Protection States (Password: wazed772478)
  const [isExecutiveUnlocked, setIsExecutiveUnlocked] = useState(false);
  const [execPasswordInput, setExecPasswordInput] = useState('');
  const [execPasswordError, setExecPasswordError] = useState('');
  
  // Payment Search filters & Modals
  const [searchTxId, setSearchTxId] = useState('');
  const [searchProfileId, setSearchProfileId] = useState('');
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [rejectingPaymentId, setRejectingPaymentId] = useState<string | null>(null);
  const [paymentToView, setPaymentToView] = useState<PaymentRecord | null>(null);

  // Executive Management & Custom Delete States
  const [editingExec, setEditingExec] = useState<Executive | null>(null);
  const [execToDelete, setExecToDelete] = useState<Executive | null>(null);
  const [showExecModal, setShowExecModal] = useState(false);
  const [selectedExecForPerf, setSelectedExecForPerf] = useState<string>(executives[0]?.referenceCode || '');

  // Form Fields for Add/Edit Executive (Upload Photo from Device Gallery only, NO URL input)
  const [formName, setFormName] = useState('');
  const [formPhoto, setFormPhoto] = useState('https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80');
  const [formMobile, setFormMobile] = useState('');
  const [formWhatsapp, setFormWhatsapp] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formDesignation, setFormDesignation] = useState('Executive Advisor');
  const [formRefCode, setFormRefCode] = useState('');
  const [formOffice, setFormOffice] = useState('ঢাকা হেড অফিস');
  const [formJoiningDate, setFormJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formGalleryPhotos, setFormGalleryPhotos] = useState<string[]>([]);
  const [formError, setFormError] = useState('');

  // Use provided reports prop directly
  const activeReports = reports || [];

  // --------------------------------------------------
  // METRICS CALCULATIONS
  // --------------------------------------------------
  const todayStr = new Date().toISOString().split('T')[0];

  const totalUsersCount = users.length;
  const todayUsersCount = users.filter(u => u.registrationDate && u.registrationDate.startsWith(todayStr)).length;
  const pendingUsersCount = users.filter(u => u.status === 'pending').length;
  const verifiedUsersCount = users.filter(u => u.status === 'verified').length;

  const totalExecsCount = executives.length;
  const activeExecsCount = executives.filter(e => e.isActive).length;

  const approvedPaymentsCount = payments.filter(p => p.status === 'approved').length;
  const todayApprovedPayments = payments.filter(p => p.status === 'approved' && p.paymentTime.startsWith(todayStr));
  const todayRevenue = todayApprovedPayments.reduce((sum, p) => sum + p.amount, 0);

  const totalRevenue = payments
    .filter(p => p.status === 'approved')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const pendingPaymentsCount = pendingPayments.length;
  const pendingPaymentsValue = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

  const basicMembers = users.filter(u => u.packageId === 'basic').length;
  const standardMembers = users.filter(u => u.packageId === 'standard').length;
  const premiumMembers = users.filter(u => u.packageId === 'premium').length;
  const vipMembers = users.filter(u => u.packageId === 'vip').length;

  const systemRegsUsers = users.filter(u => !u.executiveReferenceCode || u.executiveReferenceCode.trim() === '' || u.executiveReferenceCode === 'SYSTEM');
  const executiveRegsUsers = users.filter(u => u.executiveReferenceCode && u.executiveReferenceCode !== 'SYSTEM' && u.executiveReferenceCode.trim() !== '');

  const packageUserData = [
    { name: 'Basic (Free)', value: basicMembers, color: '#94a3b8' },
    { name: 'Standard (৳১৫০০)', value: standardMembers, color: '#3b82f6' },
    { name: 'Premium (৳৩০০০)', value: premiumMembers, color: '#b91c1c' },
    { name: 'VIP (৳৫০০০)', value: vipMembers, color: '#854d0e' },
  ];

  const executiveComparisonData = executives.map(exec => {
    const execUsers = users.filter(u => u.executiveReferenceCode === exec.referenceCode);
    const verifiedExecUsers = execUsers.filter(u => u.status === 'verified').length;
    const rev = payments
      .filter(p => p.status === 'approved' && execUsers.some(u => u.profileId === p.profileId))
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      name: exec.name.split(' ')[0],
      refCode: exec.referenceCode,
      Registrations: execUsers.length,
      Verified: verifiedExecUsers,
      Revenue: rev,
    };
  });

  // --------------------------------------------------
  // EXECUTIVE FORM HANDLERS
  // --------------------------------------------------
  const handleOpenAddExec = () => {
    setEditingExec(null);
    setFormName('');
    setFormPhoto('https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80');
    setFormMobile('');
    setFormWhatsapp('');
    setFormEmail('');
    setFormDesignation('Executive Advisor');
    const autoRefCode = `BBE-${1000 + executives.length + 1}`;
    setFormRefCode(autoRefCode);
    setFormOffice('ঢাকা হেড অফিস');
    setFormJoiningDate(new Date().toISOString().split('T')[0]);
    setFormIsActive(true);
    setFormGalleryPhotos([]);
    setFormError('');
    setShowExecModal(true);
  };

  const handleOpenEditExec = (exec: Executive) => {
    setEditingExec(exec);
    setFormName(exec.name);
    setFormPhoto(exec.photo);
    setFormMobile(exec.mobileNumber || '');
    setFormWhatsapp(exec.whatsappNumber);
    setFormEmail(exec.email || '');
    setFormDesignation(exec.designation);
    setFormRefCode(exec.referenceCode);
    setFormOffice(exec.officeLocation || 'ঢাকা হেড অফিস');
    setFormJoiningDate(exec.joiningDate || new Date().toISOString().split('T')[0]);
    setFormIsActive(exec.isActive);
    setFormGalleryPhotos(exec.galleryPhotos || []);
    setFormError('');
    setShowExecModal(true);
  };

  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormError('ছবি সর্বোচ্চ ৫ মেগাবাইটের হওয়া আবশ্যক।');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormPhoto(reader.result);
          setFormError('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveExecSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formWhatsapp.trim() || !formRefCode.trim() || !formDesignation.trim()) {
      setFormError('নাম, পদবি, ইউনিক রেফারেন্স নম্বর এবং WhatsApp নম্বর আবশ্যক।');
      return;
    }

    const execData: Executive = {
      id: editingExec ? editingExec.id : `exec-${Date.now()}`,
      name: formName.trim(),
      designation: formDesignation.trim(),
      photo: formPhoto || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
      mobileNumber: formMobile.trim() || formWhatsapp.trim(),
      whatsappNumber: formWhatsapp.trim(),
      email: formEmail.trim() || undefined,
      referenceCode: formRefCode.trim().toUpperCase(),
      officeLocation: formOffice.trim() || undefined,
      joiningDate: formJoiningDate,
      isActive: formIsActive,
      galleryPhotos: formGalleryPhotos,
    };

    if (editingExec && onUpdateExecutive) {
      onUpdateExecutive(execData);
    } else {
      onAddExecutive(execData);
    }

    setShowExecModal(false);
  };

  const filteredPayments = payments.filter(p => {
    const matchesTx = p.transactionId.toLowerCase().includes(searchTxId.trim().toLowerCase());
    const matchesProfile = p.profileId.toLowerCase().includes(searchProfileId.trim().toLowerCase());
    return matchesTx && matchesProfile;
  });

  const currentSelectedExec = executives.find(e => e.referenceCode === selectedExecForPerf) || executives[0];
  const selectedExecUsers = currentSelectedExec 
    ? users.filter(u => u.executiveReferenceCode === currentSelectedExec.referenceCode)
    : [];
  const selectedExecVerifiedUsers = selectedExecUsers.filter(u => u.status === 'verified').length;
  const selectedExecPendingUsers = selectedExecUsers.filter(u => u.status === 'pending').length;
  const selectedExecRevenue = currentSelectedExec
    ? payments
        .filter(p => p.status === 'approved' && selectedExecUsers.some(u => u.profileId === p.profileId))
        .reduce((sum, p) => sum + p.amount, 0)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in font-sans" id="admin-dashboard-container">
      
      {/* 1. PROFESSIONAL MOBILE-FIRST HEADER BAR */}
      <div className="bg-neutral-900 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-md space-y-4">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-red-900/60 border border-red-700/80 rounded-full text-[11px] sm:text-xs font-mono text-red-200">
            <ShieldCheck className="h-4 w-4 text-red-400 shrink-0" />
            <span>বিবাহবন্ধন ম্যাট্রিমনি অ্যাডমিন পোর্টাল</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight font-serif text-white">
            অ্যাডমিন কন্ট্রোল সেন্টার
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 font-mono">
            রিয়েল-টাইম রেজিস্ট্রি, কাস্টমার ট্র্যাকিং, পেমেন্ট ভেরিফিকেশন ও ইউজার কমপ্লেন ম্যানেজমেন্ট।
          </p>
        </div>
        
        {/* Scrollable Sub-tabs Navigation for Mobile */}
        <div className="flex overflow-x-auto gap-2 pb-2 pt-2 scrollbar-none border-t border-neutral-800 -mx-1 px-1">
          {[
            { id: 'analytics', label: '📊 ওভারভিউ', badge: null, locked: false },
            { id: 'executives', label: '👔 এক্সিকিউটিভ', badge: totalExecsCount, locked: !isExecutiveUnlocked },
            { id: 'performance', label: '📈 পারফরম্যান্স', badge: null, locked: false },
            { id: 'system_regs', label: '🌐 সিস্টেম রেজিস্ট্রেশন', badge: systemRegsUsers.length, locked: false },
            { id: 'payments', label: '💳 পেমেন্ট কিউ', badge: pendingPaymentsCount > 0 ? pendingPaymentsCount : null, locked: !isExecutiveUnlocked },
            { id: 'reports', label: '🛡️ রিপোর্ট', badge: activeReports.length > 0 ? activeReports.length : null, locked: false },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as any);
                setExecPasswordError('');
              }}
              className={`py-2 px-3 sm:py-2.5 sm:px-4 rounded-xl text-xs font-bold transition-all duration-150 uppercase tracking-wider font-mono cursor-pointer flex items-center space-x-1.5 whitespace-nowrap shrink-0 ${
                activeSubTab === tab.id
                  ? 'bg-red-700 text-white shadow-md'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              {tab.locked && <Lock className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
              <span>{tab.label}</span>
              {tab.badge !== null && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeSubTab === tab.id ? 'bg-white text-red-900' : 'bg-red-900 text-red-100'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW & 12 AT-A-GLANCE KPIS */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6 sm:space-y-8 animate-fade-in">
          
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
            <h3 className="text-base sm:text-lg font-bold font-serif text-neutral-900 flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-red-700 shrink-0" />
              <span>মূল ব্যবসা সূচক ও কেপিআই (KPIs)</span>
            </h3>
            <span className="text-[10px] sm:text-xs text-neutral-500 font-mono">আপডেট: {new Date().toLocaleTimeString('bn-BD')}</span>
          </div>

          {/* 12 Metric Cards Responsive Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            
            <div className="bg-white border border-neutral-200 rounded-2xl p-3.5 sm:p-5 shadow-xs flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-neutral-500 text-[10px] sm:text-xs font-bold font-mono block uppercase">১. মোট রেজিস্ট্রেশন</span>
                <span className="text-xl sm:text-3xl font-black text-neutral-900 font-mono">{totalUsersCount}</span>
                <span className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold block truncate">সক্রিয় বায়োডাটা</span>
              </div>
              <div className="p-2 sm:p-3 bg-neutral-100 text-neutral-800 rounded-xl shrink-0">
                <Users className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-3.5 sm:p-5 shadow-xs flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-neutral-500 text-[10px] sm:text-xs font-bold font-mono block uppercase">২. আজকের নিবন্ধিত</span>
                <span className="text-xl sm:text-3xl font-black text-red-700 font-mono">+{todayUsersCount}</span>
                <span className="text-[10px] sm:text-[11px] text-neutral-500 font-semibold block truncate">আজকের সদস্য</span>
              </div>
              <div className="p-2 sm:p-3 bg-red-50 text-red-700 rounded-xl shrink-0">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-3.5 sm:p-5 shadow-xs flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-neutral-500 text-[10px] sm:text-xs font-bold font-mono block uppercase">৩. পেন্ডিং ভেরিফিকেশন</span>
                <span className="text-xl sm:text-3xl font-black text-amber-600 font-mono">{pendingUsersCount}</span>
                <span className="text-[10px] sm:text-[11px] text-amber-700 font-semibold block truncate">অনুমোদনের অপেক্ষায়</span>
              </div>
              <div className="p-2 sm:p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-3.5 sm:p-5 shadow-xs flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-neutral-500 text-[10px] sm:text-xs font-bold font-mono block uppercase">৪. ভেরিফাইড সদস্য</span>
                <span className="text-xl sm:text-3xl font-black text-emerald-700 font-mono">{verifiedUsersCount}</span>
                <span className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold block truncate">যাচাইকৃত প্রোফাইল</span>
              </div>
              <div className="p-2 sm:p-3 bg-emerald-50 text-emerald-700 rounded-xl shrink-0">
                <UserCheck className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-3.5 sm:p-5 shadow-xs flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-neutral-500 text-[10px] sm:text-xs font-bold font-mono block uppercase">৫. মোট এক্সিকিউটিভ</span>
                <span className="text-xl sm:text-3xl font-black text-neutral-900 font-mono">{totalExecsCount}</span>
                <span className="text-[10px] sm:text-[11px] text-neutral-500 font-semibold block truncate">প্রতিনিধি</span>
              </div>
              <div className="p-2 sm:p-3 bg-neutral-100 text-neutral-800 rounded-xl shrink-0">
                <Award className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-3.5 sm:p-5 shadow-xs flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-neutral-500 text-[10px] sm:text-xs font-bold font-mono block uppercase">৬. সক্রিয় প্রতিনিধি</span>
                <span className="text-xl sm:text-3xl font-black text-emerald-700 font-mono">{activeExecsCount}</span>
                <span className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold block truncate">মাঠপর্যায়ে সক্রিয়</span>
              </div>
              <div className="p-2 sm:p-3 bg-emerald-50 text-emerald-700 rounded-xl shrink-0">
                <Check className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-3.5 sm:p-5 shadow-xs flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-neutral-500 text-[10px] sm:text-xs font-bold font-mono block uppercase">৭. অনুমোদিত পেমেন্ট</span>
                <span className="text-xl sm:text-3xl font-black text-blue-700 font-mono">{approvedPaymentsCount} টি</span>
                <span className="text-[10px] sm:text-[11px] text-blue-600 font-semibold block truncate">সাবস্ক্রিপশন</span>
              </div>
              <div className="p-2 sm:p-3 bg-blue-50 text-blue-700 rounded-xl shrink-0">
                <CreditCard className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-3.5 sm:p-5 shadow-xs flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-neutral-500 text-[10px] sm:text-xs font-bold font-mono block uppercase">৮. আজকের পেমেন্ট</span>
                <span className="text-xl sm:text-3xl font-black text-emerald-700 font-mono">৳{todayRevenue}</span>
                <span className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold block truncate">{todayApprovedPayments.length} টি আজকের পেমেন্ট</span>
              </div>
              <div className="p-2 sm:p-3 bg-emerald-50 text-emerald-700 rounded-xl shrink-0">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-3.5 sm:p-5 shadow-xs flex items-center justify-between bg-gradient-to-br from-neutral-900 to-neutral-800 text-white col-span-2 sm:col-span-1">
              <div className="space-y-0.5">
                <span className="text-neutral-300 text-[10px] sm:text-xs font-bold font-mono block uppercase">৯. সর্বমোট আয়</span>
                <span className="text-xl sm:text-3xl font-black text-white font-mono">৳{totalRevenue}</span>
                <span className="text-[10px] sm:text-[11px] text-emerald-400 font-semibold block truncate">মোট সংগৃহীত আয়</span>
              </div>
              <div className="p-2 sm:p-3 bg-white/10 text-emerald-400 rounded-xl backdrop-blur-xs shrink-0">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>

            <div className="bg-white border border-amber-200 bg-amber-50/40 rounded-2xl p-3.5 sm:p-5 shadow-xs flex items-center justify-between col-span-2 sm:col-span-1">
              <div className="space-y-0.5">
                <span className="text-amber-900 text-[10px] sm:text-xs font-bold font-mono block uppercase">১০. পেন্ডিং পেমেন্ট</span>
                <span className="text-xl sm:text-3xl font-black text-amber-800 font-mono">{pendingPaymentsCount} টি (৳{pendingPaymentsValue})</span>
                <span className="text-[10px] sm:text-[11px] text-amber-700 font-semibold block truncate">যাচাই বাকি</span>
              </div>
              <div className="p-2 sm:p-3 bg-amber-100 text-amber-800 rounded-xl shrink-0">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-3.5 sm:p-5 shadow-xs flex items-center justify-between col-span-2 sm:col-span-1">
              <div className="space-y-0.5">
                <span className="text-neutral-500 text-[10px] sm:text-xs font-bold font-mono block uppercase">১১. রেজিস্ট্রেশন চ্যানেল</span>
                <div className="flex items-center space-x-2 text-[11px] font-mono font-bold pt-0.5">
                  <span className="text-red-700">👔 {executiveRegsUsers.length}</span>
                  <span className="text-blue-700">🌐 {systemRegsUsers.length}</span>
                </div>
              </div>
              <div className="p-2 sm:p-3 bg-neutral-100 text-neutral-800 rounded-xl shrink-0">
                <Globe className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-3.5 sm:p-5 shadow-xs flex items-center justify-between col-span-2 sm:col-span-1">
              <div className="space-y-0.5">
                <span className="text-neutral-500 text-[10px] sm:text-xs font-bold font-mono block uppercase">১২. ভেরিফিকেশন রেট</span>
                <span className="text-xl sm:text-3xl font-black text-neutral-900 font-mono">
                  {totalUsersCount > 0 ? Math.round((verifiedUsersCount / totalUsersCount) * 100) : 0}%
                </span>
              </div>
              <div className="p-2 sm:p-3 bg-neutral-100 text-neutral-800 rounded-xl shrink-0">
                <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>

          </div>

          {/* CHARTS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div className="bg-white border border-neutral-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h4 className="text-sm sm:text-base font-bold font-serif text-neutral-900">
                  প্যাকেজ ডিস্ট্রিবিউশন
                </h4>
                <span className="text-xs font-mono font-bold text-neutral-500">মোট: {totalUsersCount}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-slate-500 font-mono uppercase block">Basic</span>
                  <span className="text-base font-black text-slate-900 font-mono">{basicMembers}</span>
                </div>
                <div className="p-2 bg-blue-50 border border-blue-200 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-blue-700 font-mono uppercase block">Standard</span>
                  <span className="text-base font-black text-blue-900 font-mono">{standardMembers}</span>
                </div>
                <div className="p-2 bg-red-50 border border-red-200 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-red-700 font-mono uppercase block">Premium</span>
                  <span className="text-base font-black text-red-900 font-mono">{premiumMembers}</span>
                </div>
                <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-amber-800 font-mono uppercase block">VIP</span>
                  <span className="text-base font-black text-amber-900 font-mono">{vipMembers}</span>
                </div>
              </div>

              <div className="h-56 sm:h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={packageUserData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {packageUserData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} জন`, 'সদস্য']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h4 className="text-sm sm:text-base font-bold font-serif text-neutral-900">
                  এক্সিকিউটিভ রেফারেল তুলনা
                </h4>
                <span className="text-xs font-mono font-bold text-neutral-500">টিম: {totalExecsCount}</span>
              </div>

              <div className="h-56 sm:h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={executiveComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Registrations" name="রেজিস্ট্রেশন" fill="#b91c1c" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Verified" name="ভেরিফাইড" fill="#047857" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* PASSWORD GATE FOR EXECUTIVES & PAYMENTS PAGES ONLY */}
      {(activeSubTab === 'executives' || activeSubTab === 'payments') && !isExecutiveUnlocked && (
        <div className="bg-white border-2 border-red-200 rounded-2xl sm:rounded-3xl p-5 sm:p-8 max-w-lg mx-auto shadow-2xl space-y-5 text-center animate-fade-in my-4 sm:my-8" id="admin-exec-password-gate">
          <div className="h-14 w-14 bg-red-100 text-red-700 rounded-full flex items-center justify-center mx-auto border-2 border-red-300 shadow-sm">
            <Lock className="h-7 w-7 text-red-700 animate-pulse" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg sm:text-xl font-serif font-black text-neutral-900">
              🔒 সিকিউরিটি পাসওয়ার্ড প্রয়োজন
            </h3>
            <p className="text-xs text-neutral-600 font-mono leading-relaxed bg-red-50/80 p-3 rounded-xl border border-red-200">
              {activeSubTab === 'executives'
                ? 'এক্সিকিউটিভ তালিকা ও গোপনীয় প্রশাসনিক তথ্য দেখতে পাসওয়ার্ড দিন।'
                : 'পেমেন্ট ভেরিফিকেশন কিউ দেখতে সিকিউরিটি পাসওয়ার্ড দিন।'}
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (execPasswordInput === 'wazed772478') {
                setIsExecutiveUnlocked(true);
                setExecPasswordError('');
                setExecPasswordInput('');
              } else {
                setExecPasswordError('❌ ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড প্রদান করুন।');
              }
            }}
            className="space-y-4 text-left"
          >
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-700 uppercase block font-mono">
                সিকিউরিটি পাসওয়ার্ড *
              </label>
              <input
                type="password"
                required
                autoFocus
                placeholder="পাসওয়ার্ড লিখুন (wazed772478)"
                value={execPasswordInput}
                onChange={(e) => {
                  setExecPasswordInput(e.target.value);
                  setExecPasswordError('');
                }}
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm font-mono text-neutral-900 focus:outline-none focus:border-red-700 focus:bg-white"
              />
            </div>

            {execPasswordError && (
              <p className="text-xs text-red-600 font-mono font-bold text-center bg-red-50 p-2 rounded-lg border border-red-200">
                {execPasswordError}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={() => setActiveSubTab('analytics')}
                className="w-full sm:w-1/2 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-mono font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>ড্যাশবোর্ডে ফিরে যান</span>
              </button>
              <button
                type="submit"
                className="w-full sm:w-1/2 py-3 bg-gradient-to-r from-red-700 to-rose-800 hover:from-red-800 hover:to-rose-900 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <Key className="h-4 w-4" />
                <span>আনলক করুন</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: EXECUTIVE MANAGEMENT */}
      {activeSubTab === 'executives' && isExecutiveUnlocked && (
        <div className="space-y-6 sm:space-y-8 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-neutral-200 pb-3">
            <div>
              <h3 className="text-lg sm:text-xl font-bold font-serif text-neutral-900 flex items-center space-x-2">
                <span>👔 এক্সিকিউটিভ তালিকা ও ব্যবস্থাপনা</span>
              </h3>
              <p className="text-xs text-neutral-500 font-mono mt-0.5">
                ইউনিট রেফারেন্স কোড তৈরি, সরাসরি ফটো আপলোড, এডিট ও স্থায়ী ডিলিট।
              </p>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                onClick={() => setIsExecutiveUnlocked(false)}
                className="py-2 px-3 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-bold text-xs uppercase rounded-xl transition-all flex items-center space-x-1 font-mono cursor-pointer"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>লক করুন</span>
              </button>

              <button
                onClick={handleOpenAddExec}
                className="flex-1 sm:flex-initial py-2 px-4 bg-red-700 hover:bg-red-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 font-mono cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>নতুন এক্সিকিউটিভ</span>
              </button>
            </div>
          </div>

          {/* Responsive Executive Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {executives.map((exec) => {
              const execCustomerCount = users.filter(u => u.executiveReferenceCode === exec.referenceCode).length;
              return (
                <div key={exec.id} className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-xs space-y-3 hover:border-red-300 transition-all flex flex-col justify-between">
                  
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-3">
                        <img src={exec.photo} alt={exec.name} className="h-12 w-12 rounded-full object-cover border-2 border-neutral-200 shrink-0" />
                        <div>
                          <h4 className="font-bold text-neutral-900 text-sm font-serif">{exec.name}</h4>
                          <span className="text-xs text-neutral-500 font-mono block">{exec.designation}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => onToggleExecutiveStatus(exec.id)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          exec.isActive ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-neutral-200 text-neutral-600'
                        }`}
                      >
                        {exec.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </div>

                    <div className="p-3 bg-neutral-50 rounded-xl space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-500">রেফারেন্স কোড:</span>
                        <span className="bg-red-50 border border-red-200 text-red-900 px-2 py-0.5 rounded font-bold">{exec.referenceCode}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-500">WhatsApp:</span>
                        <a href={`https://wa.me/${exec.whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="text-emerald-700 font-bold hover:underline">
                          {exec.whatsappNumber}
                        </a>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-500">নিবন্ধিত কাস্টমার:</span>
                        <span className="font-bold text-neutral-900">{execCustomerCount} জন</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-500">অফিস:</span>
                        <span className="text-neutral-700 truncate max-w-[150px]">{exec.officeLocation || 'ঢাকা হেড অফিস'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-2 pt-2 border-t border-neutral-100">
                    <button
                      onClick={() => handleOpenEditExec(exec)}
                      className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold font-mono transition-colors flex items-center space-x-1"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span>এডিট</span>
                    </button>
                    <button
                      onClick={() => setExecToDelete(exec)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold font-mono transition-colors flex items-center space-x-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>ডিলিট</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* TAB 3: EXECUTIVE PERFORMANCE */}
      {activeSubTab === 'performance' && (
        <div className="space-y-6 sm:space-y-8 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-neutral-200 pb-3">
            <div>
              <h3 className="text-lg sm:text-xl font-bold font-serif text-neutral-900 flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-red-700 shrink-0" />
                <span>📈 এক্সিকিউটিভ পারফরম্যান্স ও পেআউট ডিউ</span>
              </h3>
              <p className="text-xs text-neutral-500 font-mono mt-0.5">
                ইনসেনটিভ/কমিশন হিসাব (২০%), সংগৃহীত আয় ও রেফারেল কাস্টমার রিপোর্ট।
              </p>
            </div>
          </div>

          {/* Responsive Executive Payout Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {executives.map((exec) => {
              const execUsers = users.filter(u => u.executiveReferenceCode === exec.referenceCode);
              const verifiedExecUsers = execUsers.filter(u => u.status === 'verified').length;
              const execRev = payments
                .filter(p => p.status === 'approved' && execUsers.some(u => u.profileId === p.profileId))
                .reduce((sum, p) => sum + p.amount, 0);
              const commissionDues = Math.round(execRev * 0.20);

              return (
                <div key={`perf-${exec.id}`} className="bg-white border border-neutral-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
                  <div className="flex items-center space-x-3 pb-2 border-b border-neutral-100">
                    <img src={exec.photo} alt={exec.name} className="h-12 w-12 rounded-full object-cover border border-neutral-300" />
                    <div>
                      <h4 className="font-bold text-neutral-900 text-sm font-serif">{exec.name}</h4>
                      <span className="text-xs font-mono text-red-800 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                        Ref: {exec.referenceCode}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
                    <div className="p-2 bg-neutral-50 rounded-xl">
                      <span className="text-[10px] text-neutral-500 block">মোট কাস্টমার</span>
                      <strong className="text-sm text-neutral-900">{execUsers.length} জন</strong>
                    </div>
                    <div className="p-2 bg-emerald-50 rounded-xl">
                      <span className="text-[10px] text-emerald-800 block">ভেরিফাইড</span>
                      <strong className="text-sm text-emerald-900">{verifiedExecUsers} জন</strong>
                    </div>
                    <div className="p-2 bg-neutral-900 text-white rounded-xl">
                      <span className="text-[10px] text-neutral-300 block">মোট সংগৃহীত আয়</span>
                      <strong className="text-sm text-emerald-400">৳{execRev}</strong>
                    </div>
                    <div className="p-2 bg-red-50 rounded-xl border border-red-200">
                      <span className="text-[10px] text-red-800 block">কমিশন (২০%)</span>
                      <strong className="text-sm text-red-900">৳{commissionDues}</strong>
                    </div>
                  </div>

                  <div className="pt-1 flex justify-between items-center">
                    <button
                      onClick={() => setSelectedExecForPerf(exec.referenceCode)}
                      className="text-xs font-bold font-mono text-red-700 hover:underline"
                    >
                      কাস্টমারদের তালিকা দেখুন (View Users)
                    </button>
                    {commissionDues > 0 ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        ⏳ ৳{commissionDues} ডিউ
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-900">
                        ✓ ডিউ নেই
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* INDIVIDUAL EXECUTIVE USER DRILLDOWN */}
          {currentSelectedExec && (
            <div className="bg-white border border-neutral-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-neutral-100">
                <div>
                  <h4 className="text-base font-bold font-serif text-neutral-900">
                    {currentSelectedExec.name} ({currentSelectedExec.referenceCode})-এর নিবন্ধিত গ্রাহকগণ ({selectedExecUsers.length} জন)
                  </h4>
                </div>
                <select
                  value={selectedExecForPerf}
                  onChange={(e) => setSelectedExecForPerf(e.target.value)}
                  className="bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs rounded-xl px-3 py-1.5 font-mono font-bold focus:outline-none focus:border-red-700 w-full sm:w-auto"
                >
                  {executives.map(exec => (
                    <option key={exec.id} value={exec.referenceCode}>
                      {exec.name} ({exec.referenceCode})
                    </option>
                  ))}
                </select>
              </div>

              {selectedExecUsers.length === 0 ? (
                <p className="text-xs text-neutral-500 italic py-4 text-center">কোনো কাস্টমার এই রেফারেন্স কোডে নেই।</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedExecUsers.map(u => (
                    <div key={u.id} className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center space-x-2 truncate">
                        <img src={u.profilePicture} alt={u.name} className="h-8 w-8 rounded-full object-cover shrink-0" />
                        <div className="truncate">
                          <span className="font-bold text-neutral-900 font-sans block truncate">{u.name}</span>
                          <span className="text-[10px] text-neutral-500">{u.profileId} • {u.packageId.toUpperCase()}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.status === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {u.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* TAB 4: SYSTEM REGISTRATIONS */}
      {activeSubTab === 'system_regs' && (
        <div className="space-y-6 animate-fade-in">
          <div className="border-b border-neutral-200 pb-3">
            <h3 className="text-lg sm:text-xl font-bold font-serif text-neutral-900 flex items-center space-x-2">
              <Globe className="h-5 w-5 text-blue-700 shrink-0" />
              <span>🌐 সিস্টেম রেজিস্ট্রেশন ডিরেক্টরি ({systemRegsUsers.length} জন)</span>
            </h3>
            <p className="text-xs text-neutral-500 font-mono mt-0.5">
              কোনো এক্সিকিউটিভের রেফারেন্স নম্বর ছাড়া সরাসরি নিবন্ধিত সকল বায়োডাটা।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemRegsUsers.map(u => (
              <div key={u.id} className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-xs space-y-2">
                <div className="flex items-center space-x-3">
                  <img src={u.profilePicture} alt={u.name} className="h-10 w-10 rounded-full object-cover border border-neutral-300" />
                  <div>
                    <h4 className="font-bold text-neutral-900 text-sm font-serif">{u.name}</h4>
                    <span className="text-xs font-mono font-bold text-blue-700 block">ID: {u.profileId}</span>
                  </div>
                </div>
                <div className="p-2.5 bg-neutral-50 rounded-xl text-xs font-mono space-y-1">
                  <div className="flex justify-between"><span className="text-neutral-500">মোবাইল:</span><span>{u.mobileNumber}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">প্যাকেজ:</span><span className="uppercase font-bold">{u.packageId}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">জেলা:</span><span>{u.district}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">স্ট্যাটাস:</span>
                    <span className={`font-bold ${u.status === 'verified' ? 'text-emerald-700' : 'text-amber-700'}`}>{u.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PAYMENTS QUEUE REDESIGN */}
      {activeSubTab === 'payments' && isExecutiveUnlocked && (
        <div className="space-y-6 animate-fade-in">
          <div className="border-b border-neutral-200 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-lg sm:text-xl font-bold font-serif text-neutral-900 flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-red-700 shrink-0" />
                <span>💳 পেমেন্ট ভেরিফিকেশন ব্যাকলগ কিউ</span>
              </h3>
              <p className="text-xs text-neutral-500 font-mono mt-0.5">
                বিকাশ/নগদ ট্রানজেকশন আইডি যাচাই করে সদস্যপদ অনুমোদন বা বাতিল করুন।
              </p>
            </div>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="TrxID সার্চ..."
                value={searchTxId}
                onChange={(e) => setSearchTxId(e.target.value)}
                className="bg-white border border-neutral-300 rounded-xl px-3 py-1.5 text-xs font-mono text-neutral-900 focus:outline-none focus:border-red-700 flex-1 sm:w-36"
              />
              <input
                type="text"
                placeholder="প্রোফাইল আইডি..."
                value={searchProfileId}
                onChange={(e) => setSearchProfileId(e.target.value)}
                className="bg-white border border-neutral-300 rounded-xl px-3 py-1.5 text-xs font-mono text-neutral-900 focus:outline-none focus:border-red-700 flex-1 sm:w-36"
              />
            </div>
          </div>

          {filteredPayments.length === 0 ? (
            <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center text-neutral-500 font-mono text-xs">
              কোনো পেমেন্ট রেকর্ড পাওয়া যায়নি।
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPayments.map((p) => {
                const linkedUser = users.find(u => u.profileId === p.profileId || u.mobileNumber === p.userMobile);

                return (
                  <div key={p.id} className="bg-white border border-neutral-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 hover:border-red-300 transition-all">
                    
                    {/* Top Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-neutral-100">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-1 bg-red-50 border border-red-200 text-red-900 rounded-lg font-mono font-bold text-xs uppercase">
                          Trx: {p.transactionId}
                        </span>
                        <span className="text-[11px] font-mono text-neutral-500">
                          {new Date(p.paymentTime).toLocaleDateString('bn-BD')}
                        </span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        p.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        p.status === 'rejected' ? 'bg-red-100 text-red-800 border border-red-300' :
                        'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {p.status === 'approved' ? '✅ অনুমোদিত' : p.status === 'rejected' ? '❌ বাতিল' : '⏳ পেন্ডিং'}
                      </span>
                    </div>

                    {/* Data Details */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                      <div>
                        <span className="text-neutral-500 block text-[10px]">ব্যবহারকারীর নাম:</span>
                        <span className="font-bold text-neutral-900 font-sans block truncate">{p.userName || linkedUser?.name || 'অজানা সদস্য'}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-[10px]">বায়োডাটা / ইউজার আইডি:</span>
                        <span className="font-bold text-red-900 block">{p.profileId}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-[10px]">প্যাকেজ & মেথড:</span>
                        <span className="font-bold text-neutral-900 block capitalize">{p.paymentMethod} ({p.membershipPackage.toUpperCase()})</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-[10px]">পেমেন্ট পরিমাণ:</span>
                        <span className="font-black text-emerald-700 text-sm block">৳{p.amount}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-[10px]">রেফারেন্স কোড:</span>
                        <span className="font-bold text-purple-900 block">{p.executiveRefCode || 'সিস্টেম রেজিস্ট্রেশন'}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-[10px]">পেমেন্ট সময়:</span>
                        <span className="text-neutral-700 block text-[11px]">{new Date(p.paymentTime).toLocaleTimeString('bn-BD')}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                      <button
                        onClick={() => setPaymentToView(p)}
                        className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold font-mono transition-colors"
                      >
                        🔍 Details
                      </button>
                      
                      {p.status === 'pending' && (
                        <>
                          <button
                            onClick={() => onApprovePayment(p.id)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold font-mono shadow-xs transition-colors cursor-pointer"
                          >
                            ✓ Verify (অনুমোদন)
                          </button>
                          <button
                            onClick={() => setRejectingPaymentId(p.id)}
                            className="px-3.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer"
                          >
                            ✕ Invalid (বাতিল)
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => {
                          if (onDeletePaymentRecord) {
                            onDeletePaymentRecord(p.id);
                          }
                        }}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer"
                      >
                        🗑️ Delete
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: COMPLETE REPORT SYSTEM */}
      {activeSubTab === 'reports' && (
        <AdminReportManagementSection
          reports={activeReports}
          users={users}
          payments={payments}
          onResolveReport={onResolveReport}
          onDeleteReport={onDeleteReport}
        />
      )}

      {/* EXECUTIVE ADD / EDIT MODAL (PHOTO GALLERY UPLOAD ONLY - NO URL INPUT) */}
      {showExecModal && (
        <div className="fixed inset-0 bg-neutral-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border border-neutral-200 rounded-2xl sm:rounded-3xl max-w-lg w-full p-5 sm:p-7 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowExecModal(false)}
              className="absolute top-4 right-4 h-8 w-8 bg-neutral-100 hover:bg-neutral-200 rounded-full flex items-center justify-center text-neutral-600 font-bold"
            >
              ✕
            </button>

            <div className="space-y-1 border-b border-neutral-100 pb-3">
              <h3 className="text-lg sm:text-xl font-bold font-serif text-neutral-900">
                {editingExec ? 'এক্সিকিউটিভ প্রোফাইল এডিট' : 'নতুন এক্সিকিউটিভ যোগ করুন'}
              </h3>
              <p className="text-xs text-neutral-500 font-mono">
                এক্সিকিউটিভের নাম, হোয়াটসঅ্যাপ, পদবি ও গ্যালারি থেকে প্রোফাইল ছবি আপলোড করুন।
              </p>
            </div>

            <form onSubmit={handleSaveExecSubmit} className="space-y-4">
              
              {/* Photo Upload Box */}
              <div className="space-y-2 text-center p-4 bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-2xl">
                <img
                  src={formPhoto}
                  alt="Executive Preview"
                  className="h-20 w-20 rounded-full object-cover border-2 border-white shadow-md mx-auto"
                />
                <div className="space-y-1">
                  <label className="inline-flex items-center space-x-1.5 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold font-mono cursor-pointer transition-colors shadow-xs">
                    <Upload className="h-4 w-4" />
                    <span>ডিভাইস গ্যালারি থেকে ছবি আপলোড করুন</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoFileUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-neutral-500 font-mono">গ্যালারি থেকে সরাসরি ফটো সিলেক্ট করুন (মেগাবাইট সর্বোচ্চ ৫MB)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                
                <div className="space-y-1">
                  <label className="font-bold text-neutral-700 block">নাম (Executive Name) *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: নুসরাত জাহান"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:border-red-700 font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-neutral-700 block">পদবি (Designation) *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: Senior Executive Advisor"
                    value={formDesignation}
                    onChange={(e) => setFormDesignation(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:border-red-700 font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-red-900 block">রেফারেন্স কোড (Ref Code) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BBE-1001"
                    value={formRefCode}
                    onChange={(e) => setFormRefCode(e.target.value.toUpperCase())}
                    className="w-full bg-red-50 border border-red-300 rounded-xl px-3 py-2 text-sm font-bold text-red-900 uppercase focus:outline-none focus:border-red-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-neutral-700 block">WhatsApp নম্বর *</label>
                  <input
                    type="text"
                    required
                    placeholder="017XXXXXXXX"
                    value={formWhatsapp}
                    onChange={(e) => setFormWhatsapp(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:border-red-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-neutral-700 block">মোবাইল নম্বর</label>
                  <input
                    type="text"
                    placeholder="017XXXXXXXX"
                    value={formMobile}
                    onChange={(e) => setFormMobile(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:border-red-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-neutral-700 block">কর্মস্থল/অফিস</label>
                  <input
                    type="text"
                    placeholder="ঢাকা হেড অফিস"
                    value={formOffice}
                    onChange={(e) => setFormOffice(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:border-red-700 font-sans"
                  />
                </div>

              </div>

              {formError && (
                <p className="text-xs text-red-600 font-semibold font-mono text-center">{formError}</p>
              )}

              <div className="flex justify-end space-x-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowExecModal(false)}
                  className="py-2 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl font-mono cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-xl font-mono uppercase tracking-wider shadow-md transition-all cursor-pointer"
                >
                  {editingExec ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectingPaymentId && (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-2xl max-w-md w-full p-5 space-y-3 shadow-2xl relative">
            <h3 className="text-base font-bold font-serif text-neutral-900">পেমেন্ট বাতিলের কারণ নির্বাচন করুন</h3>
            <textarea
              rows={3}
              placeholder="যেমন: ভুল ট্রানজেকশন আইডি প্রদান করেছেন..."
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-3 text-xs text-neutral-900 focus:outline-none focus:border-red-700 font-sans"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setRejectingPaymentId(null)}
                className="px-3.5 py-1.5 bg-neutral-100 text-neutral-800 text-xs font-bold rounded-xl font-mono cursor-pointer"
              >
                বাতিল
              </button>
              <button
                onClick={() => {
                  if (rejectingPaymentId) {
                    onRejectPayment(rejectingPaymentId, rejectionReasonInput || 'ভুল তথ্য');
                    setRejectingPaymentId(null);
                    setRejectionReasonInput('');
                  }
                }}
                className="px-4 py-1.5 bg-red-700 text-white text-xs font-bold rounded-xl font-mono uppercase tracking-wider shadow-xs cursor-pointer"
              >
                নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXECUTIVE DELETE CONFIRMATION MODAL */}
      {execToDelete && (
        <div className="fixed inset-0 bg-neutral-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 text-center">
            <div className="h-14 w-14 bg-red-100 text-red-700 rounded-full flex items-center justify-center mx-auto border-2 border-red-200">
              <Trash2 className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold font-serif text-neutral-900">
                স্থায়ীভাবে এক্সিকিউটিভ মুছে ফেলতে চান?
              </h3>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-700 font-mono">
                <p className="font-bold text-neutral-900 text-sm">{execToDelete.name}</p>
                <p>রেফারেন্স কোড: <span className="text-red-700 font-bold">{execToDelete.referenceCode}</span></p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setExecToDelete(null)}
                className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl font-mono cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteExecutive && execToDelete) {
                    onDeleteExecutive(execToDelete.id);
                  }
                  setExecToDelete(null);
                }}
                className="flex-1 py-2.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-xl shadow-md font-mono uppercase cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT DETAIL VIEW MODAL */}
      {paymentToView && (
        <div className="fixed inset-0 bg-neutral-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-lg w-full p-5 sm:p-7 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setPaymentToView(null)}
              className="absolute top-4 right-4 h-8 w-8 bg-neutral-100 hover:bg-neutral-200 rounded-full flex items-center justify-center text-neutral-600 font-bold"
            >
              ✕
            </button>

            <div className="flex items-center space-x-3 border-b border-neutral-100 pb-3">
              <div className="h-10 w-10 bg-red-50 text-red-700 rounded-xl flex items-center justify-center font-bold">
                💳
              </div>
              <div>
                <h3 className="text-base font-bold font-serif text-neutral-900">
                  পেমেন্ট বিবরণ
                </h3>
                <p className="text-xs text-neutral-500 font-mono">
                  Trx ID: <strong className="text-red-900 uppercase">{paymentToView.transactionId}</strong>
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
              <div className="flex justify-between"><span className="text-neutral-500">প্যাকেজ:</span><strong className="uppercase text-red-800">{paymentToView.membershipPackage}</strong></div>
              <div className="flex justify-between"><span className="text-neutral-500">মেথড:</span><strong className="capitalize">{paymentToView.paymentMethod}</strong></div>
              <div className="flex justify-between"><span className="text-neutral-500">পরিমাণ:</span><strong className="text-emerald-700 text-sm font-black">৳{paymentToView.amount}</strong></div>
              <div className="flex justify-between"><span className="text-neutral-500">বায়োডাটা আইডি:</span><strong>{paymentToView.profileId}</strong></div>
              {paymentToView.userName && <div className="flex justify-between"><span className="text-neutral-500">ইউজারের নাম:</span><strong className="font-sans">{paymentToView.userName}</strong></div>}
              {paymentToView.userMobile && <div className="flex justify-between"><span className="text-neutral-500">মোবাইল:</span><strong>{paymentToView.userMobile}</strong></div>}
              {paymentToView.executiveRefCode && <div className="flex justify-between"><span className="text-neutral-500">রেফারেল:</span><strong className="text-purple-900">{paymentToView.executiveRefCode}</strong></div>}
              <div className="flex justify-between"><span className="text-neutral-500">সময়:</span><span>{new Date(paymentToView.paymentTime).toLocaleString('bn-BD')}</span></div>
              <div className="flex justify-between pt-1 border-t border-neutral-200"><span className="text-neutral-500">স্ট্যাটাস:</span><strong className="uppercase">{paymentToView.status}</strong></div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setPaymentToView(null)}
                className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer"
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

// ----------------------------------------------------------------------
// ADMIN REPORT & COMPLAINT MANAGEMENT SECTION
// ----------------------------------------------------------------------
interface AdminReportManagementSectionProps {
  reports: ReportRecord[];
  users: User[];
  payments: PaymentRecord[];
  onResolveReport?: (
    reportId: string, 
    action: 'dismiss' | 'warning' | 'suspend' | 'ban' | 'remove_content' | 'investigating', 
    note?: string
  ) => void;
  onDeleteReport?: (reportId: string) => void;
}

function AdminReportManagementSection({
  reports,
  users,
  payments,
  onResolveReport,
  onDeleteReport,
}: AdminReportManagementSectionProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedReportForAction, setSelectedReportForAction] = useState<ReportRecord | null>(null);
  const [actionNoteInput, setActionNoteInput] = useState<string>('');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const effectiveReports = (reports && reports.length > 0) ? reports : SEED_REPORTS;

  const filteredReports = effectiveReports.filter((r) => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  const handleActionClick = (
    report: ReportRecord, 
    action: 'dismiss' | 'warning' | 'suspend' | 'ban' | 'remove_content' | 'investigating'
  ) => {
    if (onResolveReport) {
      onResolveReport(report.id, action, actionNoteInput || undefined);
    }
    setActionNoteInput('');
    setSelectedReportForAction(null);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Header & Status Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-neutral-200 pb-3">
        <div>
          <h3 className="text-lg sm:text-xl font-bold font-serif text-neutral-900 flex items-center space-x-2">
            <ShieldAlert className="h-5 w-5 text-red-700 shrink-0" />
            <span>🛡️ ইউজার রিপোর্ট ও কমপ্লেন পোর্টাল ({effectiveReports.length})</span>
          </h3>
          <p className="text-xs text-neutral-500 font-mono mt-0.5">
            সদস্যদের অভিযোগ খতিয়ে দেখুন, ফোন/হোয়াটসঅ্যাপে যোগাযোগ করুন এবং প্রয়োজনীয় ব্যবস্থা নিন।
          </p>
        </div>

        {/* Status Filters Bar */}
        <div className="flex overflow-x-auto gap-1.5 pb-1 w-full sm:w-auto scrollbar-none">
          {['all', 'pending', 'investigating', 'suspended', 'dismissed'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                filterStatus === st
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {st === 'all' && `সবগুলো (${effectiveReports.length})`}
              {st === 'pending' && `পেন্ডিং (${effectiveReports.filter(r => r.status === 'pending').length})`}
              {st === 'investigating' && `তদন্তাধীন (${effectiveReports.filter(r => r.status === 'investigating').length})`}
              {st === 'suspended' && `স্থগিত (${effectiveReports.filter(r => r.status === 'suspended').length})`}
              {st === 'dismissed' && `বাতিল (${effectiveReports.filter(r => r.status === 'dismissed').length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List Cards */}
      {filteredReports.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center space-y-2">
          <ShieldCheck className="h-10 w-10 text-emerald-600 mx-auto" />
          <p className="text-sm font-bold text-neutral-800">কোনো রিপোর্ট পাওয়া যায়নি</p>
          <p className="text-xs text-neutral-500 font-mono">বর্তমানে নির্বাচিত ফিল্টারে কোনো কমপ্লেন নেই।</p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {filteredReports.map((rep) => {
            const reportedUser = users.find(u => u.id === rep.reportedUserId || u.profileId === rep.reportedUserProfileId);
            const reporterUser = users.find(u => u.id === rep.reporterId || u.profileId === rep.reporterProfileId);

            const reporterPhone = rep.reporterMobileNumber || reporterUser?.mobileNumber || reporterUser?.whatsappNumber || '01700000000';
            const reportedPhone = rep.reportedMobileNumber || reportedUser?.mobileNumber || reportedUser?.whatsappNumber || '01800000000';

            return (
              <div 
                key={rep.id} 
                className="bg-white border border-neutral-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-5 relative overflow-hidden"
              >
                
                {/* Header Strip */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-100">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 bg-red-50 border border-red-200 text-red-900 rounded-lg text-xs font-mono font-bold">
                      ID: {rep.id}
                    </span>
                    <span className="text-[11px] text-neutral-500 font-mono">
                      {new Date(rep.timestamp).toLocaleString('bn-BD')}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                    rep.status === 'pending' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                    rep.status === 'investigating' ? 'bg-blue-100 text-blue-900 border border-blue-300' :
                    rep.status === 'suspended' ? 'bg-orange-100 text-orange-900 border border-orange-300' :
                    'bg-neutral-200 text-neutral-800'
                  }`}>
                    {rep.status === 'pending' ? '⏳ পেন্ডিং' :
                     rep.status === 'investigating' ? '🔍 তদন্তাধীন' :
                     rep.status === 'suspended' ? '⚠️ অ্যাকাউন্ট স্থগিত' :
                     '❌ বাতিল/নিষ্পত্তি'}
                  </span>
                </div>

                {/* 2 Columns: Reporter vs Reported User */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  
                  {/* REPORTER CARD */}
                  <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2 text-xs font-mono">
                    <div className="font-bold text-neutral-700 uppercase pb-1 border-b border-neutral-200/60 flex justify-between items-center">
                      <span>👤 রিপোর্টকারী (Reporter)</span>
                      <a 
                        href={`https://wa.me/${reporterPhone.replace(/[^0-9]/g, '')}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-emerald-700 font-bold text-[11px] hover:underline flex items-center space-x-1"
                      >
                        <Phone className="h-3 w-3" />
                        <span>যোগাযোগ</span>
                      </a>
                    </div>
                    <div className="space-y-1">
                      <p><span className="text-neutral-500">নাম:</span> <strong className="text-neutral-900 font-sans">{rep.reporterName || reporterUser?.name || 'অজানা সদস্য'}</strong></p>
                      <p><span className="text-neutral-500">ইউজার ID:</span> <strong className="text-red-900">{rep.reporterProfileId || reporterUser?.profileId}</strong></p>
                      <p><span className="text-neutral-500">মোবাইল:</span> <strong>{reporterPhone}</strong></p>
                    </div>
                  </div>

                  {/* REPORTED USER CARD */}
                  <div className="p-3.5 bg-red-50/60 border border-red-200 rounded-xl space-y-2 text-xs font-mono">
                    <div className="font-bold text-red-900 uppercase pb-1 border-b border-red-200/60 flex justify-between items-center">
                      <span>⚠️ অভিযুক্ত সদস্য (Reported User)</span>
                      <a 
                        href={`https://wa.me/${reportedPhone.replace(/[^0-9]/g, '')}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-red-700 font-bold text-[11px] hover:underline flex items-center space-x-1"
                      >
                        <Phone className="h-3 w-3" />
                        <span>যোগাযোগ</span>
                      </a>
                    </div>
                    <div className="space-y-1">
                      <p><span className="text-neutral-500">নাম:</span> <strong className="text-neutral-900 font-sans">{rep.reportedUserName || reportedUser?.name || 'অজানা সদস্য'}</strong></p>
                      <p><span className="text-neutral-500">ইউজার ID:</span> <strong className="text-red-900">{rep.reportedUserProfileId || reportedUser?.profileId}</strong></p>
                      <p><span className="text-neutral-500">মোবাইল:</span> <strong>{reportedPhone}</strong></p>
                    </div>
                  </div>

                </div>

                {/* COMPLAINT DETAILS */}
                <div className="p-3.5 bg-white border border-neutral-200 rounded-xl space-y-2 text-xs">
                  <div className="font-bold font-mono text-red-900">
                    অভিযোগের বিষয়: <span className="bg-red-50 px-2 py-0.5 rounded border border-red-200 text-red-900">{rep.reasonPreset}</span>
                  </div>

                  {rep.additionalDetails && (
                    <p className="text-neutral-700 bg-neutral-50 p-2.5 rounded-lg border border-neutral-200 font-sans leading-relaxed">
                      "{rep.additionalDetails}"
                    </p>
                  )}

                  {/* Proof Screenshots */}
                  {rep.screenshots && rep.screenshots.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[11px] font-bold text-neutral-700 font-mono block">প্রমান্য স্ক্রিনশট ({rep.screenshots.length}টি):</span>
                      <div className="flex flex-wrap gap-2">
                        {rep.screenshots.map((src, idx) => (
                          <img 
                            key={idx} 
                            src={src} 
                            alt={`Proof ${idx + 1}`} 
                            onClick={() => setLightboxImage(src)}
                            className="w-16 h-16 rounded-lg object-cover border border-neutral-300 cursor-pointer hover:opacity-80 transition-opacity"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* ADMIN ACTION BUTTONS */}
                <div className="p-3 bg-neutral-900 text-white rounded-xl space-y-2">
                  <span className="text-[11px] font-bold font-mono text-neutral-300 block uppercase">অ্যাডমিন অ্যাকশন নিন:</span>
                  
                  <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                    <a
                      href={`https://wa.me/${reporterPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold flex items-center space-x-1"
                    >
                      <span>📞 Contact Reporter</span>
                    </a>

                    <a
                      href={`https://wa.me/${reportedPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold flex items-center space-x-1"
                    >
                      <span>📞 Contact Reported</span>
                    </a>

                    <button
                      onClick={() => handleActionClick(rep, 'suspend')}
                      className="px-2.5 py-1.5 bg-orange-700 hover:bg-orange-800 text-white rounded-lg font-bold"
                    >
                      ⚠️ Suspend User
                    </button>

                    <button
                      onClick={() => handleActionClick(rep, 'dismiss')}
                      className="px-2.5 py-1.5 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg font-bold"
                    >
                      ✕ Reject Report
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm('আপনি কি নিশ্চিত এই ভুয়া রিপোর্টটি মুছে ফেলতে চান?')) {
                          if (onDeleteReport) {
                            onDeleteReport(rep.id);
                          }
                        }
                      }}
                      className="px-2.5 py-1.5 bg-red-800 hover:bg-red-900 text-red-200 rounded-lg font-bold flex items-center space-x-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete Fake Report</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* LIGHTBOX MODAL */}
      {lightboxImage && (
        <div className="fixed inset-0 bg-neutral-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full flex flex-col items-center">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-10 right-0 h-9 w-9 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center font-bold"
            >
              ✕
            </button>
            <img src={lightboxImage} alt="Proof Full" className="max-w-full max-h-[80vh] object-contain rounded-xl border border-neutral-700 shadow-2xl" />
          </div>
        </div>
      )}

    </div>
  );
}
