import React, { useState } from 'react';
import { User, PaymentRecord, Executive, PackageType, ReportRecord, ReportActionLog } from '../types';
import { MEMBERSHIP_PACKAGES } from '../data';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  ShieldCheck, AlertCircle, CreditCard, Users, DollarSign, CheckCircle, 
  XCircle, Search, UserCheck, Plus, ToggleLeft, ToggleRight, Trash2,
  TrendingUp, Award, Calendar, Hash, Phone, Mail, MapPin, Image as ImageIcon,
  Edit2, Globe, Clock, Check, RefreshCw, ShieldAlert, Eye, MessageSquare, AlertTriangle, FileText, Lock, Key
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
  
  // Executive & Performance Password Protection States (Password: wazed772478)
  const [isExecutiveUnlocked, setIsExecutiveUnlocked] = useState(false);
  const [execPasswordInput, setExecPasswordInput] = useState('');
  const [execPasswordError, setExecPasswordError] = useState('');
  
  // Payment Search filters & View Modals
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

  // Form Fields for Add/Edit Executive (No Bio or Statement fields)
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
  const [newGalleryInput, setNewGalleryInput] = useState('');
  const [formError, setFormError] = useState('');

  // --------------------------------------------------
  // METRICS CALCULATIONS (12 Key Indicators)
  // --------------------------------------------------
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Total Registrations
  const totalUsersCount = users.length;

  // 2. Today's Registrations
  const todayUsersCount = users.filter(u => u.registrationDate && u.registrationDate.startsWith(todayStr)).length;

  // 3. Pending Verifications
  const pendingUsersCount = users.filter(u => u.status === 'pending').length;

  // 4. Verified Members
  const verifiedUsersCount = users.filter(u => u.status === 'verified').length;

  // 5. Total Executives
  const totalExecsCount = executives.length;

  // 6. Currently Active Executives
  const activeExecsCount = executives.filter(e => e.isActive).length;

  // 7. Total Approved Payments
  const approvedPaymentsCount = payments.filter(p => p.status === 'approved').length;

  // 8. Today's Payments
  const todayApprovedPayments = payments.filter(p => p.status === 'approved' && p.paymentTime.startsWith(todayStr));
  const todayRevenue = todayApprovedPayments.reduce((sum, p) => sum + p.amount, 0);

  // 9. Total Revenue
  const totalRevenue = payments
    .filter(p => p.status === 'approved')
    .reduce((sum, p) => sum + p.amount, 0);

  // 10. Pending Payment Count & Value
  const pendingPayments = payments.filter(p => p.status === 'pending');
  const pendingPaymentsCount = pendingPayments.length;
  const pendingPaymentsValue = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

  // 11. Membership Distribution
  const basicMembers = users.filter(u => u.packageId === 'basic').length;
  const standardMembers = users.filter(u => u.packageId === 'standard').length;
  const premiumMembers = users.filter(u => u.packageId === 'premium').length;
  const vipMembers = users.filter(u => u.packageId === 'vip').length;

  // System vs Executive Registrations Count
  const systemRegsUsers = users.filter(u => !u.executiveReferenceCode || u.executiveReferenceCode.trim() === '' || u.executiveReferenceCode === 'SYSTEM');
  const executiveRegsUsers = users.filter(u => u.executiveReferenceCode && u.executiveReferenceCode !== 'SYSTEM' && u.executiveReferenceCode.trim() !== '');

  // --------------------------------------------------
  // RECHARTS DATA PREPARATION
  // --------------------------------------------------
  const packageUserData = [
    { name: 'Basic (Free)', value: basicMembers, color: '#94a3b8' },
    { name: 'Standard (৳১৫০০)', value: standardMembers, color: '#3b82f6' },
    { name: 'Premium (৳৩০০০)', value: premiumMembers, color: '#b91c1c' },
    { name: 'VIP (৳৫০০০)', value: vipMembers, color: '#854d0e' },
  ];

  // Executive Performance Comparison Data
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
    setNewGalleryInput('');
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
    setNewGalleryInput('');
    setFormError('');
    setShowExecModal(true);
  };

  const handleAddGalleryPhoto = () => {
    if (!newGalleryInput.trim()) return;
    setFormGalleryPhotos(prev => [...prev, newGalleryInput.trim()]);
    setNewGalleryInput('');
  };

  const handleRemoveGalleryPhoto = (index: number) => {
    setFormGalleryPhotos(prev => prev.filter((_, idx) => idx !== index));
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
      photo: formPhoto.trim() || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
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

  const handleDeleteExec = (exec: Executive) => {
    setExecToDelete(exec);
  };

  // Payment search filters
  const filteredPayments = payments.filter(p => {
    const matchesTx = p.transactionId.toLowerCase().includes(searchTxId.trim().toLowerCase());
    const matchesProfile = p.profileId.toLowerCase().includes(searchProfileId.trim().toLowerCase());
    return matchesTx && matchesProfile;
  });

  // Selected executive metrics for detail performance view
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in" id="admin-dashboard-container">
      
      {/* 1. PROFESSIONAL HEADER BAR */}
      <div className="bg-neutral-900 text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-red-900/60 border border-red-700/80 rounded-full text-xs font-mono text-red-200">
            <ShieldCheck className="h-4 w-4 text-red-400" />
            <span>বিবাহবন্ধন ম্যাট্রিমনি অ্যাডমিন ম্যানেজমেন্ট পোর্টাল</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif text-white">
            অ্যাডমিন কন্ট্রোল অ্যান্ড পারফরম্যান্স সেন্টার
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 font-mono">
            রিয়েল-টাইম রেজিস্ট্রি, এক্সিকিউটিভ রেফারেল ট্র্যাকিং, পেমেন্ট ভেরিফিকেশন ও বিজনেস অ্যানালিটিক্স।
          </p>
        </div>
        
        {/* Nav Sub-tabs */}
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          {[
            { id: 'analytics', label: '📊 ড্যাশবোর্ড ও ওভারভিউ', badge: null, locked: false },
            { id: 'executives', label: '👔 এক্সিকিউটিভ তালিকা', badge: totalExecsCount, locked: !isExecutiveUnlocked },
            { id: 'performance', label: '📈 পারফরম্যান্স ও পেআউট', badge: null, locked: false },
            { id: 'system_regs', label: '🌐 সিস্টেম রেজিস্ট্রেশন', badge: systemRegsUsers.length, locked: false },
            { id: 'payments', label: '💳 পেমেন্ট কিউ', badge: pendingPaymentsCount > 0 ? pendingPaymentsCount : null, locked: !isExecutiveUnlocked },
            { id: 'reports', label: '🛡️ রিপোর্ট', badge: reports.length > 0 ? reports.length : null, locked: false },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as any);
                setExecPasswordError('');
              }}
              className={`py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all duration-150 uppercase tracking-wider font-mono cursor-pointer flex items-center space-x-1.5 ${
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
        <div className="space-y-8 animate-fade-in">
          
          {/* Section Title */}
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
            <h3 className="text-lg font-bold font-serif text-neutral-900 flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-red-700" />
              <span>১. মূল ব্যবসা সূচক ও রিয়েল-টাইম কেপিআই ( At-a-Glance 12 KPIs)</span>
            </h3>
            <span className="text-xs text-neutral-500 font-mono">সর্বশেষ আপডেট: আজ {new Date().toLocaleTimeString('bn-BD')}</span>
          </div>

          {/* 12 Metric Bento Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* 1. Total Registrations */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-neutral-500 text-xs font-bold font-mono block uppercase">১. মোট রেজিস্ট্রেশন</span>
                <span className="text-3xl font-black text-neutral-900 font-mono">{totalUsersCount}</span>
                <span className="text-[11px] text-emerald-600 font-semibold block">সক্রিয় বায়োডাটা ডাটাবেজ</span>
              </div>
              <div className="p-3 bg-neutral-100 text-neutral-800 rounded-xl">
                <Users className="h-6 w-6" />
              </div>
            </div>

            {/* 2. Today's Registrations */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-neutral-500 text-xs font-bold font-mono block uppercase">২. আজকের রেজিস্ট্রেশন</span>
                <span className="text-3xl font-black text-red-700 font-mono">+{todayUsersCount}</span>
                <span className="text-[11px] text-neutral-500 font-semibold block">আজ নিবন্ধিত সদস্য</span>
              </div>
              <div className="p-3 bg-red-50 text-red-700 rounded-xl">
                <Calendar className="h-6 w-6" />
              </div>
            </div>

            {/* 3. Pending Verification */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-neutral-500 text-xs font-bold font-mono block uppercase">৩. পেন্ডিং ভেরিফিকেশন</span>
                <span className="text-3xl font-black text-amber-600 font-mono">{pendingUsersCount}</span>
                <span className="text-[11px] text-amber-700 font-semibold block">অনুমোদনের অপেক্ষায়</span>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Clock className="h-6 w-6" />
              </div>
            </div>

            {/* 4. Verified Members */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-neutral-500 text-xs font-bold font-mono block uppercase">৪. ভেরিফাইড সদস্য</span>
                <span className="text-3xl font-black text-emerald-700 font-mono">{verifiedUsersCount}</span>
                <span className="text-[11px] text-emerald-600 font-semibold block">যাচাইকৃত লাইভ প্রোফাইল</span>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
                <UserCheck className="h-6 w-6" />
              </div>
            </div>

            {/* 5. Total Executives */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-neutral-500 text-xs font-bold font-mono block uppercase">৫. মোট এক্সিকিউটিভ</span>
                <span className="text-3xl font-black text-neutral-900 font-mono">{totalExecsCount}</span>
                <span className="text-[11px] text-neutral-500 font-semibold block">অফিসিয়াল টিম প্রতিনিধি</span>
              </div>
              <div className="p-3 bg-neutral-100 text-neutral-800 rounded-xl">
                <Award className="h-6 w-6" />
              </div>
            </div>

            {/* 6. Active Executives */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-neutral-500 text-xs font-bold font-mono block uppercase">৬. সক্রিয় এক্সিকিউটিভ</span>
                <span className="text-3xl font-black text-emerald-700 font-mono">{activeExecsCount}</span>
                <span className="text-[11px] text-emerald-600 font-semibold block">বর্তমানে মাঠপর্যায়ে সক্রিয়</span>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
                <Check className="h-6 w-6" />
              </div>
            </div>

            {/* 7. Approved Payments Count */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-neutral-500 text-xs font-bold font-mono block uppercase">৭. মোট অনুমোদিত পেমেন্ট</span>
                <span className="text-3xl font-black text-blue-700 font-mono">{approvedPaymentsCount} টি</span>
                <span className="text-[11px] text-blue-600 font-semibold block">প্যাকেজ সাবস্ক্রিপশন</span>
              </div>
              <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
                <CreditCard className="h-6 w-6" />
              </div>
            </div>

            {/* 8. Today's Revenue */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-neutral-500 text-xs font-bold font-mono block uppercase">৮. আজকের পেমেন্ট</span>
                <span className="text-3xl font-black text-emerald-700 font-mono">৳{todayRevenue}</span>
                <span className="text-[11px] text-emerald-600 font-semibold block">{todayApprovedPayments.length} টি পেমেন্ট আজ</span>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>

            {/* 9. Total Revenue */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs flex items-center justify-between bg-gradient-to-br from-neutral-900 to-neutral-800 text-white">
              <div className="space-y-1">
                <span className="text-neutral-300 text-xs font-bold font-mono block uppercase">৯. সর্বমোট আয় (Total Revenue)</span>
                <span className="text-3xl font-black text-white font-mono">৳{totalRevenue}</span>
                <span className="text-[11px] text-emerald-400 font-semibold block">ক্লেমড পেমেন্ট ইনকাম</span>
              </div>
              <div className="p-3 bg-white/10 text-emerald-400 rounded-xl backdrop-blur-xs">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>

            {/* 10. Pending Payments Value */}
            <div className="bg-white border border-amber-200 bg-amber-50/40 rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-amber-900 text-xs font-bold font-mono block uppercase">১০. Pending Payment Value</span>
                <span className="text-3xl font-black text-amber-800 font-mono">{pendingPaymentsCount} টি (৳{pendingPaymentsValue})</span>
                <span className="text-[11px] text-amber-700 font-semibold block">অনুমোদনের অপেক্ষায় ব্যাকলগ</span>
              </div>
              <div className="p-3 bg-amber-100 text-amber-800 rounded-xl">
                <AlertCircle className="h-6 w-6" />
              </div>
            </div>

            {/* 11. System vs Executive Registrations */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-neutral-500 text-xs font-bold font-mono block uppercase">১১. রেজিস্ট্রেশন চ্যানেল</span>
                <div className="flex items-center space-x-3 text-xs font-mono font-bold pt-1">
                  <span className="text-red-700">👔 এক্সিকিউটিভ: {executiveRegsUsers.length}</span>
                  <span className="text-blue-700">🌐 সিস্টেম: {systemRegsUsers.length}</span>
                </div>
                <span className="text-[11px] text-neutral-500 font-semibold block mt-1">উৎস অনুপাত</span>
              </div>
              <div className="p-3 bg-neutral-100 text-neutral-800 rounded-xl">
                <Globe className="h-6 w-6" />
              </div>
            </div>

            {/* 12. Active Verification Ratio */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-neutral-500 text-xs font-bold font-mono block uppercase">১২. ভেরিফিকেশন রেট</span>
                <span className="text-3xl font-black text-neutral-900 font-mono">
                  {totalUsersCount > 0 ? Math.round((verifiedUsersCount / totalUsersCount) * 100) : 0}%
                </span>
                <span className="text-[11px] text-neutral-500 font-semibold block">সম্পূর্ণ ভেরিফাইড প্রোফাইল</span>
              </div>
              <div className="p-3 bg-neutral-100 text-neutral-800 rounded-xl">
                <ShieldCheck className="h-6 w-6" />
              </div>
            </div>

          </div>

          {/* CHARTS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Membership Package Breakdown */}
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h4 className="text-base font-bold font-serif text-neutral-900">
                  সদস্যদের প্যাকেজ ডিস্ট্রিবিউশন (Membership Distribution)
                </h4>
                <span className="text-xs font-mono font-bold text-neutral-500">মোট: {totalUsersCount} জন</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-slate-500 font-mono uppercase block">Basic</span>
                  <span className="text-lg font-black text-slate-900 font-mono">{basicMembers}</span>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-blue-700 font-mono uppercase block">Standard</span>
                  <span className="text-lg font-black text-blue-900 font-mono">{standardMembers}</span>
                </div>
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-red-700 font-mono uppercase block">Premium</span>
                  <span className="text-lg font-black text-red-900 font-mono">{premiumMembers}</span>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-amber-800 font-mono uppercase block">VIP</span>
                  <span className="text-lg font-black text-amber-900 font-mono">{vipMembers}</span>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={packageUserData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
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

            {/* Executive Performance Comparison */}
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h4 className="text-base font-bold font-serif text-neutral-900">
                  এক্সিকিউটিভদের পারফরম্যান্স তুলনা (Executive Referrals)
                </h4>
                <span className="text-xs font-mono font-bold text-neutral-500">মোট এক্সিকিউটিভ: {totalExecsCount}</span>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={executiveComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Registrations" name="মোট রেজিস্ট্রেশন" fill="#b91c1c" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Verified" name="ভেরিফাইড" fill="#047857" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* RECENT ACTIVITY TIMELINE FEED */}
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h4 className="text-base font-bold font-serif text-neutral-900 border-b border-neutral-100 pb-3 flex items-center space-x-2">
              <Clock className="h-5 w-5 text-neutral-700" />
              <span>সাম্প্রতিক কার্যক্রম টাইমলাইন (Recent Activity Timeline)</span>
            </h4>

            <div className="space-y-3 font-sans">
              {users.slice(0, 5).map((u, idx) => (
                <div key={`act-${u.id}-${idx}`} className="flex items-center justify-between p-3.5 bg-neutral-50 border border-neutral-200/70 rounded-xl text-xs">
                  <div className="flex items-center space-x-3">
                    <img src={u.profilePicture} alt={u.name} className="h-9 w-9 rounded-full object-cover border border-neutral-300" />
                    <div>
                      <span className="font-bold text-neutral-900 block">{u.name} ({u.profileId})</span>
                      <span className="text-neutral-500 text-[11px]">
                        {u.district} • {u.packageId.toUpperCase()} প্যাকেজ • {u.executiveReferenceCode ? `এক্সিকিউটিভ Ref: ${u.executiveReferenceCode}` : 'সিস্টেম রেজিস্ট্রেশন'}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                    u.status === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {u.status === 'verified' ? 'Verified' : 'Pending Verification'}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* PASSWORD GATE FOR EXECUTIVES & PAYMENTS PAGES */}
      {(activeSubTab === 'executives' || activeSubTab === 'payments') && !isExecutiveUnlocked && (
        <div className="bg-white border-2 border-red-200 rounded-3xl p-8 max-w-lg mx-auto shadow-2xl space-y-6 text-center animate-fade-in my-8" id="admin-exec-password-gate">
          <div className="h-16 w-16 bg-red-100 text-red-700 rounded-full flex items-center justify-center mx-auto border-2 border-red-300 shadow-sm">
            <Lock className="h-8 w-8 text-red-700 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-serif font-black text-neutral-900">
              🔒 সিকিউরিটি পাসওয়ার্ড প্রয়োজন
            </h3>
            <p className="text-xs text-neutral-600 font-mono leading-relaxed bg-red-50/80 p-3.5 rounded-2xl border border-red-200">
              {activeSubTab === 'executives'
                ? 'এক্সিকিউটিভ তালিকা, অ্যাডমিন অ্যাকশন ও সংক্রান্ত গোপনীয় তথ্য অ্যাক্সেস করতে পাসওয়ার্ড দিন।'
                : 'পেমেন্ট ভেরিফিকেশন কিউ ও পেমেন্ট সংক্রান্ত তথ্য দেখতে পাসওয়ার্ড দিন।'}
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
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-700 uppercase block font-mono">
                সিকিউরিটি পাসওয়ার্ড লিখুন (Enter Password) *
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
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm font-mono text-neutral-900 focus:outline-none focus:border-red-700 focus:bg-white"
              />
            </div>

            {execPasswordError && (
              <p className="text-xs text-red-600 font-mono font-bold text-center bg-red-50 p-2 rounded-lg border border-red-200">
                {execPasswordError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-red-700 to-rose-800 hover:from-red-800 hover:to-rose-900 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <Key className="h-4 w-4" />
              <span>আনলক করুন (Unlock Page)</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: EXECUTIVE MANAGEMENT (DIRECTORY & CONTROLS ONLY) */}
      {activeSubTab === 'executives' && isExecutiveUnlocked && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 pb-4">
            <div>
              <h3 className="text-xl font-bold font-serif text-neutral-900 flex items-center space-x-2">
                <span>👔 এক্সিকিউটিভ তালিকা ও অ্যাডমিন ব্যবস্থাপনা</span>
              </h3>
              <p className="text-xs text-neutral-500 font-mono mt-1">
                ইউনিট রেফারেন্স নম্বর তৈরি, মোবাইল/হোয়াটসঅ্যাপ যোগাযোগ, এডিট ও ডিলিট।
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsExecutiveUnlocked(false)}
                className="py-2.5 px-3 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-bold text-xs uppercase rounded-xl transition-all flex items-center space-x-1 font-mono cursor-pointer"
                title="লক করুন"
              >
                <Lock className="h-3.5 w-3.5 text-neutral-700" />
                <span>লক করুন</span>
              </button>

              <button
                onClick={handleOpenAddExec}
                className="py-2.5 px-5 bg-red-700 hover:bg-red-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center space-x-2 font-mono cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>নতুন এক্সিকিউটিভ যোগ করুন</span>
              </button>
            </div>
          </div>

          {/* EXECUTIVE MANAGEMENT DIRECTORY TABLE */}
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h4 className="text-base font-bold font-serif text-neutral-900">
              এক্সিকিউটিভ তালিকা ({executives.length} জন)
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50 font-mono text-[11px] uppercase tracking-wider text-neutral-600">
                    <th className="py-3 px-4">ছবি ও নাম</th>
                    <th className="py-3 px-4">রেফারেন্স নম্বর</th>
                    <th className="py-3 px-4">পদবি</th>
                    <th className="py-3 px-4">যোগাযোগ</th>
                    <th className="py-3 px-4">অফিস</th>
                    <th className="py-3 px-4">স্ট্যাটাস</th>
                    <th className="py-3 px-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-medium">
                  {executives.map((exec) => {
                    const execCustomerCount = users.filter(u => u.executiveReferenceCode === exec.referenceCode).length;
                    return (
                      <tr key={exec.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-3.5 px-4 flex items-center space-x-3">
                          <img src={exec.photo} alt={exec.name} className="h-10 w-10 rounded-full object-cover border border-neutral-300 shrink-0" />
                          <div>
                            <span className="font-bold text-neutral-900 block">{exec.name}</span>
                            <span className="text-[10px] text-neutral-500 font-mono block">কাস্টমার নিবন্ধিত: {execCustomerCount} জন</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-red-900">
                          <span className="bg-red-50 border border-red-200 px-2.5 py-1 rounded-md">
                            {exec.referenceCode}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-neutral-700 font-semibold">{exec.designation}</td>
                        <td className="py-3.5 px-4 font-mono text-neutral-600 space-y-0.5">
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3 text-neutral-400" />
                            <span>{exec.mobileNumber || exec.whatsappNumber}</span>
                          </div>
                          <div className="text-[10px] text-emerald-700 font-bold">WA: {exec.whatsappNumber}</div>
                        </td>
                        <td className="py-3.5 px-4 text-neutral-600">{exec.officeLocation || 'ঢাকা হেড অফিস'}</td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => onToggleExecutiveStatus(exec.id)}
                            className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer ${
                              exec.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-600'
                            }`}
                          >
                            {exec.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEditExec(exec)}
                            className="p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg transition-colors cursor-pointer"
                            title="এডিট করুন"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteExec(exec)}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors cursor-pointer"
                            title="ডিলিট করুন"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: SEPARATE EXECUTIVE PERFORMANCE & PAYMENT DUES PAGE */}
      {activeSubTab === 'performance' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Page Title Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 pb-4">
            <div>
              <h3 className="text-xl font-bold font-serif text-neutral-900 flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-red-700" />
                <span>📈 এক্সিকিউটিভ পারফরম্যান্স রিপোর্ট ও পেমেন্ট ডিউ (Payment Dues)</span>
              </h3>
              <p className="text-xs text-neutral-500 font-mono mt-1">
                সকল এক্সিকিউটিভের ইনসেনটিভ/কমিশন হিসাব, সংগৃহীত আয়, ভেরিফাইড গ্রাহক সংখ্যা ও পেমেন্ট ডিউ রিপোর্ট।
              </p>
            </div>

            <button
              onClick={() => setIsExecutiveUnlocked(false)}
              className="py-2.5 px-3 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-bold text-xs uppercase rounded-xl transition-all flex items-center space-x-1 font-mono cursor-pointer"
              title="লক করুন"
            >
              <Lock className="h-3.5 w-3.5 text-neutral-700" />
              <span>লক করুন</span>
            </button>
          </div>

          {/* ALL EXECUTIVES PAYMENT DUES & COMMISSION SUMMARY TABLE */}
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h4 className="text-base font-bold font-serif text-neutral-900 flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              <span>এক্সিকিউটিভ পেআউট ও ইনসেনটিভ/কমিশন ডিউ সামারি</span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50 font-mono text-[11px] uppercase tracking-wider text-neutral-600">
                    <th className="py-3 px-4">এক্সিকিউটিভ ও রেফারেন্স</th>
                    <th className="py-3 px-4">মোট রেফারেল গ্রাহক</th>
                    <th className="py-3 px-4">ভেরিফাইড কাস্টমার</th>
                    <th className="py-3 px-4">সংগৃহীত মোট আয়</th>
                    <th className="py-3 px-4">ইনসেনটিভ কমিশন (২০%)</th>
                    <th className="py-3 px-4">পেমেন্ট ডিউ স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-medium">
                  {executives.map((exec) => {
                    const execUsers = users.filter(u => u.executiveReferenceCode === exec.referenceCode);
                    const verifiedExecUsers = execUsers.filter(u => u.status === 'verified').length;
                    const execRev = payments
                      .filter(p => p.status === 'approved' && execUsers.some(u => u.profileId === p.profileId))
                      .reduce((sum, p) => sum + p.amount, 0);
                    
                    // Standard 20% incentive commission
                    const commissionDues = Math.round(execRev * 0.20);

                    return (
                      <tr key={`due-${exec.id}`} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-3.5 px-4 flex items-center space-x-3">
                          <img src={exec.photo} alt={exec.name} className="h-10 w-10 rounded-full object-cover border border-neutral-300 shrink-0" />
                          <div>
                            <span className="font-bold text-neutral-900 block">{exec.name}</span>
                            <span className="text-[10px] text-red-800 font-mono font-bold block">Ref: {exec.referenceCode}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-neutral-800">{execUsers.length} জন</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">{verifiedExecUsers} জন</td>
                        <td className="py-3.5 px-4 font-mono font-black text-neutral-900">৳{execRev}</td>
                        <td className="py-3.5 px-4 font-mono font-black text-red-900">৳{commissionDues}</td>
                        <td className="py-3.5 px-4">
                          {commissionDues > 0 ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              ⏳ ৳{commissionDues} পেআউট ডিউ
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                              ✓ কোনো ডিউ নেই
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* INDIVIDUAL EXECUTIVE PERFORMANCE DASHBOARD */}
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-100 pb-4">
              <div>
                <h4 className="text-lg font-bold font-serif text-neutral-900">
                  ব্যক্তিগত এক্সিকিউটিভ পারফরম্যান্স রিপোর্ট
                </h4>
                <p className="text-xs text-neutral-500 font-mono">
                  নির্দিষ্ট এক্সিকিউটিভ নির্বাচন করে তার মাধ্যমে আসা কাস্টমার ও আয়ের হিসাব দেখুন।
                </p>
              </div>

              {/* Selector */}
              <div className="flex items-center space-x-2">
                <label className="text-xs font-bold text-neutral-600 font-mono">এক্সিকিউটিভ নির্বাচন করুন:</label>
                <select
                  value={selectedExecForPerf}
                  onChange={(e) => setSelectedExecForPerf(e.target.value)}
                  className="bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs rounded-xl px-3 py-2 font-mono font-bold focus:outline-none focus:border-red-700"
                >
                  {executives.map(exec => (
                    <option key={exec.id} value={exec.referenceCode}>
                      {exec.name} ({exec.referenceCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Executive Header Profile & KPIs */}
            {currentSelectedExec && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 p-5 bg-neutral-50 border border-neutral-200/80 rounded-2xl">
                  <img src={currentSelectedExec.photo} alt={currentSelectedExec.name} className="h-20 w-20 rounded-2xl object-cover border-2 border-white shadow-sm" />
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h5 className="text-lg font-bold text-neutral-900 font-serif">{currentSelectedExec.name}</h5>
                      <span className="px-2.5 py-0.5 bg-red-900 text-white font-mono text-xs font-bold rounded-md">
                        Ref: {currentSelectedExec.referenceCode}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-neutral-600 font-mono">{currentSelectedExec.designation} • {currentSelectedExec.officeLocation || 'ঢাকা হেড অফিস'}</p>
                    <p className="text-xs text-neutral-500 font-mono">মোবাইল: {currentSelectedExec.mobileNumber} | WA: {currentSelectedExec.whatsappNumber}</p>
                  </div>
                </div>

                {/* Selected Exec Metrics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-red-50/60 border border-red-200/80 rounded-2xl text-center space-y-1">
                    <span className="text-[10px] font-bold text-red-800 font-mono uppercase block">মোট রেফারেল গ্রাহক</span>
                    <span className="text-2xl font-black text-red-900 font-mono">{selectedExecUsers.length} জন</span>
                  </div>
                  <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl text-center space-y-1">
                    <span className="text-[10px] font-bold text-emerald-800 font-mono uppercase block">ভেরিফাইড সদস্য</span>
                    <span className="text-2xl font-black text-emerald-900 font-mono">{selectedExecVerifiedUsers} জন</span>
                  </div>
                  <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl text-center space-y-1">
                    <span className="text-[10px] font-bold text-amber-800 font-mono uppercase block">পেন্ডিং ভেরিফিকেশন</span>
                    <span className="text-2xl font-black text-amber-900 font-mono">{selectedExecPendingUsers} জন</span>
                  </div>
                  <div className="p-4 bg-neutral-900 text-white rounded-2xl text-center space-y-1">
                    <span className="text-[10px] font-bold text-emerald-400 font-mono uppercase block">মোট আয়ের অবদান</span>
                    <span className="text-2xl font-black text-white font-mono">৳{selectedExecRevenue}</span>
                  </div>
                </div>

                {/* Users Registered under this executive */}
                <div className="space-y-3">
                  <h5 className="text-sm font-bold font-serif text-neutral-900">
                    {currentSelectedExec.name} (Ref: {currentSelectedExec.referenceCode})-এর নিবন্ধিত গ্রাহক তালিকা ({selectedExecUsers.length})
                  </h5>

                  {selectedExecUsers.length === 0 ? (
                    <p className="text-xs text-neutral-500 italic py-4 text-center">এখনো কোনো কাস্টমার এই রেফারেন্স কোড ব্যবহার করে নিবন্ধন করেননি।</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-sans">
                        <thead>
                          <tr className="border-b border-neutral-200 bg-neutral-100 font-mono text-[10px] uppercase text-neutral-600">
                            <th className="py-2.5 px-3">সদস্যের নাম ও আইডি</th>
                            <th className="py-2.5 px-3">লিঙ্গ ও জেলা</th>
                            <th className="py-2.5 px-3">প্যাকেজ</th>
                            <th className="py-2.5 px-3">তারিখ</th>
                            <th className="py-2.5 px-3">স্ট্যাটাস</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {selectedExecUsers.map(u => (
                            <tr key={u.id} className="hover:bg-neutral-50">
                              <td className="py-2.5 px-3 font-bold text-neutral-900 flex items-center space-x-2">
                                <img src={u.profilePicture} alt={u.name} className="h-7 w-7 rounded-full object-cover" />
                                <span>{u.name} ({u.profileId})</span>
                              </td>
                              <td className="py-2.5 px-3 text-neutral-600">{u.gender} • {u.district}</td>
                              <td className="py-2.5 px-3 font-mono uppercase font-bold text-neutral-800">{u.packageId}</td>
                              <td className="py-2.5 px-3 font-mono text-neutral-500">{u.registrationDate ? u.registrationDate.split('T')[0] : 'N/A'}</td>
                              <td className="py-2.5 px-3">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                                  u.status === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {u.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 3: DEDICATED SYSTEM REGISTRATIONS VIEW */}
      {activeSubTab === 'system_regs' && (
        <div className="space-y-6 animate-fade-in">
          <div className="border-b border-neutral-200 pb-3">
            <h3 className="text-xl font-bold font-serif text-neutral-900 flex items-center space-x-2">
              <Globe className="h-5 w-5 text-blue-700" />
              <span>🌐 সিস্টেম রেজিস্ট্রেশন (System Registrations Directory)</span>
            </h3>
            <p className="text-xs text-neutral-500 font-mono mt-1">
              যেসকল কাস্টমার কোনো এক্সিকিউটিভের রেফারেন্স নম্বর ব্যবহার না করে সরাসরি ওয়েবসাইট থেকে নিবন্ধন করেছেন ({systemRegsUsers.length} জন)।
            </p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50 font-mono text-[11px] uppercase text-neutral-600">
                    <th className="py-3 px-4">সদস্য ও বায়োডাটা আইডি</th>
                    <th className="py-3 px-4">পেশা ও জেলা</th>
                    <th className="py-3 px-4">মোবাইল</th>
                    <th className="py-3 px-4">প্যাকেজ</th>
                    <th className="py-3 px-4">তারিখ</th>
                    <th className="py-3 px-4">ভেরিফিকেশন স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-medium">
                  {systemRegsUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-neutral-400 italic font-mono">
                        কোনো সিস্টেম রেজিস্ট্রেশন পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    systemRegsUsers.map(u => (
                      <tr key={u.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-3.5 px-4 flex items-center space-x-3">
                          <img src={u.profilePicture} alt={u.name} className="h-10 w-10 rounded-full object-cover border border-neutral-300 shrink-0" />
                          <div>
                            <span className="font-bold text-neutral-900 block">{u.name}</span>
                            <span className="text-[10px] text-blue-700 font-mono font-bold block">ID: {u.profileId}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-neutral-700">
                          <div>{u.profession}</div>
                          <div className="text-[10px] text-neutral-500">{u.district}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-neutral-700">{u.mobileNumber}</td>
                        <td className="py-3.5 px-4 font-mono font-bold uppercase text-neutral-900">{u.packageId}</td>
                        <td className="py-3.5 px-4 font-mono text-neutral-500">{u.registrationDate ? u.registrationDate.split('T')[0] : 'N/A'}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                            u.status === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {u.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PAYMENTS QUEUE */}
      {activeSubTab === 'payments' && isExecutiveUnlocked && (
        <div className="space-y-6 animate-fade-in">
          <div className="border-b border-neutral-200 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold font-serif text-neutral-900 flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-red-700" />
                <span>💳 পেমেন্ট ভেরিফিকেশন ব্যাকলগ কিউ</span>
              </h3>
              <p className="text-xs text-neutral-500 font-mono mt-1">
                বিকাশ/নগদ ট্রানজেকশন আইডি যাচাই করে অ্যাকাউন্টের ভেরিফিকেশন ও অ্যাক্টিভেশন দিন।
              </p>
            </div>

            {/* Payment Search inputs */}
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="TrxID সার্চ করুন..."
                value={searchTxId}
                onChange={(e) => setSearchTxId(e.target.value)}
                className="bg-white border border-neutral-300 rounded-xl px-3 py-1.5 text-xs font-mono text-neutral-900 focus:outline-none focus:border-red-700"
              />
              <input
                type="text"
                placeholder="প্রোফাইল আইডি সার্চ..."
                value={searchProfileId}
                onChange={(e) => setSearchProfileId(e.target.value)}
                className="bg-white border border-neutral-300 rounded-xl px-3 py-1.5 text-xs font-mono text-neutral-900 focus:outline-none focus:border-red-700"
              />
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50 font-mono text-[11px] uppercase text-neutral-600">
                    <th className="py-3 px-4">ট্রানজেকশন আইডি</th>
                    <th className="py-3 px-4">বায়োডাটা আইডি ও ইউজার</th>
                    <th className="py-3 px-4">মেথড & প্যাকেজ</th>
                    <th className="py-3 px-4">পরিমাণ (টাকা)</th>
                    <th className="py-3 px-4">তারিখ</th>
                    <th className="py-3 px-4">রেজিস্ট্রেশন স্ট্যাটাস</th>
                    <th className="py-3 px-4">স্ট্যাটাস</th>
                    <th className="py-3 px-4 text-right">অনুমোদন অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-medium">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-neutral-400 italic font-mono">
                        কোনো পেমেন্ট রেকর্ড পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => {
                      const linkedUser = users.find(u => u.profileId === p.profileId || u.mobileNumber === p.userMobile);

                      return (
                        <tr key={p.id} className="hover:bg-neutral-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-red-900 uppercase">
                            {p.transactionId}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-neutral-900">
                            <span className="font-bold block">{p.profileId}</span>
                            <span className="text-[11px] text-neutral-500 font-sans">{p.userName || linkedUser?.name || 'অসম্পূর্ণ রেজিস্ট্রেশন'}</span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-neutral-700">
                            <span className="capitalize font-bold text-neutral-800">{p.paymentMethod}</span> • <span className="uppercase text-red-800 font-bold">{p.membershipPackage}</span>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-black text-neutral-900">
                            ৳{p.amount}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-neutral-500">
                            {new Date(p.paymentTime).toLocaleString('bn-BD')}
                          </td>
                          <td className="py-3.5 px-4">
                            {p.isIncompleteRegistration ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                ⚠️ ইনকমপ্লিট রেজিস্ট্রেশন
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-blue-100 text-blue-900 border border-blue-300">
                                ✅ সম্পূর্ণ রেজিস্ট্রেশন
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                              p.status === 'approved' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : p.status === 'rejected' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => setPaymentToView(p)}
                                className="p-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg transition-colors cursor-pointer"
                                title="বিস্তারিত দেখুন"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>

                              {p.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => onApprovePayment(p.id)}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold font-mono transition-colors cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => setRejectingPaymentId(p.id)}
                                    className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-xs font-bold font-mono transition-colors cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                              <button
                                onClick={() => {
                                  if (onDeletePaymentRecord) {
                                    onDeletePaymentRecord(p.id);
                                  }
                                }}
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors cursor-pointer"
                                title="রেকর্ড মুছে ফেলুন"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MODERATION & REPORTS */}
      {activeSubTab === 'reports' && (
        <AdminReportManagementSection
          reports={reports}
          users={users}
          payments={payments}
          onResolveReport={onResolveReport}
        />
      )}

      {/* EXECUTIVE ADD / EDIT MODAL */}
      {showExecModal && (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowExecModal(false)}
              className="absolute top-4 right-4 h-9 w-9 bg-neutral-100 hover:bg-neutral-200 rounded-full flex items-center justify-center text-neutral-600 font-bold"
            >
              ✕
            </button>

            <div className="space-y-1 border-b border-neutral-100 pb-4">
              <h3 className="text-xl font-bold font-serif text-neutral-900">
                {editingExec ? 'এক্সিকিউটিভ প্রোফাইল এডিট করুন' : 'নতুন এক্সিকিউটিভ যোগ করুন'}
              </h3>
              <p className="text-xs text-neutral-500 font-mono">
                এক্সিকিউটিভের ব্যক্তিগত তথ্য, পদবি, ইউনিক রেফারেন্স কোড ও গ্যালারি লিংক প্রদান করুন।
              </p>
            </div>

            <form onSubmit={handleSaveExecSubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* 1. Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 block font-mono">নাম (Executive Name) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nusrat Jahan"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2 text-sm text-neutral-900 focus:outline-none focus:border-red-700 focus:bg-white"
                  />
                </div>

                {/* 2. Designation */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 block font-mono">পদবি (Designation) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Executive, Team Leader"
                    value={formDesignation}
                    onChange={(e) => setFormDesignation(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2 text-sm text-neutral-900 focus:outline-none focus:border-red-700 focus:bg-white"
                  />
                </div>

                {/* 3. Reference Code */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-red-900 block font-mono">ইউনিক রেফারেন্স নম্বর (Ref Code) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BBE-1001"
                    value={formRefCode}
                    onChange={(e) => setFormRefCode(e.target.value.toUpperCase())}
                    className="w-full bg-red-50 border border-red-300 rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-red-900 uppercase focus:outline-none focus:border-red-700"
                  />
                </div>

                {/* 4. Photo URL */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 block font-mono">প্রোফাইল ছবি (Photo URL) *</label>
                  <input
                    type="text"
                    required
                    value={formPhoto}
                    onChange={(e) => setFormPhoto(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2 text-sm text-neutral-900 focus:outline-none focus:border-red-700"
                  />
                </div>

                {/* 5. Mobile Number */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 block font-mono">মোবাইল নম্বর (Mobile) *</label>
                  <input
                    type="text"
                    required
                    placeholder="+88017XXXXXXXX"
                    value={formMobile}
                    onChange={(e) => setFormMobile(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2 text-sm text-neutral-900 focus:outline-none focus:border-red-700 font-mono"
                  />
                </div>

                {/* 6. WhatsApp Number */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 block font-mono">WhatsApp নম্বর *</label>
                  <input
                    type="text"
                    required
                    placeholder="+88017XXXXXXXX"
                    value={formWhatsapp}
                    onChange={(e) => setFormWhatsapp(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2 text-sm text-neutral-900 focus:outline-none focus:border-red-700 font-mono"
                  />
                </div>

                {/* 7. Email */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 block font-mono">ই-মেইল (Email Address)</label>
                  <input
                    type="email"
                    placeholder="executive@example.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2 text-sm text-neutral-900 focus:outline-none focus:border-red-700"
                  />
                </div>

                {/* 8. Office Location */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 block font-mono">বর্তমান কর্মস্থল/অফিস</label>
                  <input
                    type="text"
                    placeholder="e.g. ঢাকা হেড অফিস (ধানমণ্ডি)"
                    value={formOffice}
                    onChange={(e) => setFormOffice(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2 text-sm text-neutral-900 focus:outline-none focus:border-red-700"
                  />
                </div>

                {/* 9. Joining Date */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 block font-mono">যোগদানের তারিখ (Joining Date)</label>
                  <input
                    type="date"
                    value={formJoiningDate}
                    onChange={(e) => setFormJoiningDate(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2 text-sm text-neutral-900 focus:outline-none focus:border-red-700 font-mono"
                  />
                </div>

                {/* 10. Active Status */}
                <div className="space-y-1 flex items-center pt-5">
                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="h-4 w-4 text-red-700 rounded border-neutral-300"
                    />
                    <span className="text-xs font-bold text-neutral-900 font-mono">সক্রিয় এক্সিকিউটিভ (Active Status)</span>
                  </label>
                </div>

              </div>

              {/* GALLERY PHOTOS SECTION */}
              <div className="space-y-3 p-4 bg-neutral-50 border border-neutral-200 rounded-2xl">
                <label className="text-xs font-bold text-neutral-900 block font-mono">
                  গ্যালারি ফটো (Executive Gallery Photos)
                </label>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="ছবির লিংক (URL) দিন..."
                    value={newGalleryInput}
                    onChange={(e) => setNewGalleryInput(e.target.value)}
                    className="flex-1 bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-red-700"
                  />
                  <button
                    type="button"
                    onClick={handleAddGalleryPhoto}
                    className="py-2 px-4 bg-neutral-900 text-white rounded-xl text-xs font-bold font-mono hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    যোগ করুন
                  </button>
                </div>

                {formGalleryPhotos.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    {formGalleryPhotos.map((imgUrl, idx) => (
                      <div key={idx} className="relative rounded-xl overflow-hidden border border-neutral-300 aspect-square group">
                        <img src={imgUrl} alt={`Gall ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryPhoto(idx)}
                          className="absolute top-1 right-1 bg-red-700 text-white p-1 rounded-full text-[10px] opacity-90 hover:opacity-100 transition-opacity"
                          title="ছবি মুছুন"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {formError && (
                <p className="text-xs text-red-600 font-semibold font-mono">{formError}</p>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowExecModal(false)}
                  className="py-2.5 px-5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl font-mono cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-xl font-mono uppercase tracking-wider shadow-md transition-all cursor-pointer"
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
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <h3 className="text-lg font-bold font-serif text-neutral-900">পেমেন্ট প্রত্যাখ্যান করার কারণ প্রদান করুন</h3>
            <textarea
              rows={3}
              placeholder="যেমন: ভুল ট্রানজেকশন আইডি বা অপর্যাপ্ত ব্যালেন্স..."
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-3 text-xs text-neutral-900 focus:outline-none focus:border-red-700 font-sans"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setRejectingPaymentId(null)}
                className="px-4 py-2 bg-neutral-100 text-neutral-800 text-xs font-bold rounded-xl font-mono cursor-pointer"
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
                className="px-4 py-2 bg-red-700 text-white text-xs font-bold rounded-xl font-mono uppercase tracking-wider shadow-xs cursor-pointer"
              >
                নিশ্চিত করুন
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
}

function AdminReportManagementSection({
  reports,
  users,
  payments,
  onResolveReport,
}: AdminReportManagementSectionProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedReportForAction, setSelectedReportForAction] = useState<ReportRecord | null>(null);
  const [actionNoteInput, setActionNoteInput] = useState<string>('');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [expandedUserReportHistoryId, setExpandedUserReportHistoryId] = useState<string | null>(null);

  // Filtered reports list
  const filteredReports = reports.filter((r) => {
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h3 className="text-xl font-bold font-serif text-neutral-900 flex items-center space-x-2">
            <ShieldAlert className="h-5 w-5 text-red-700" />
            <span>🛡️ ইউজার রিপোর্ট ও মডারেশন সেকশন ({reports.length})</span>
          </h3>
          <p className="text-xs text-neutral-500 font-mono mt-1">
            সদস্যদের অভিযোগসমূহ খতিয়ে দেখুন, নিবন্ধন তথ্য যাচাই করুন এবং উপযুক্ত প্রশাসনিক ব্যবস্থা নিন।
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['all', 'pending', 'investigating', 'warned', 'suspended', 'banned', 'dismissed', 'content_removed'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                filterStatus === st
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {st === 'all' && `সবগুলো (${reports.length})`}
              {st === 'pending' && `পেন্ডিং (${reports.filter(r => r.status === 'pending').length})`}
              {st === 'investigating' && `তদন্তাধীন (${reports.filter(r => r.status === 'investigating').length})`}
              {st === 'warned' && `সতর্কবার্তা (${reports.filter(r => r.status === 'warned').length})`}
              {st === 'suspended' && `স্থগিত (${reports.filter(r => r.status === 'suspended').length})`}
              {st === 'banned' && `ব্যানড (${reports.filter(r => r.status === 'banned').length})`}
              {st === 'dismissed' && `বাতিল (${reports.filter(r => r.status === 'dismissed').length})`}
              {st === 'content_removed' && `কন্টেন্ট রিমুভড (${reports.filter(r => r.status === 'content_removed').length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List Cards */}
      {filteredReports.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-3xl p-12 text-center space-y-2">
          <ShieldCheck className="h-10 w-10 text-emerald-600 mx-auto" />
          <p className="text-sm font-bold text-neutral-800">কোনো রিপোর্ট পাওয়া যায়নি</p>
          <p className="text-xs text-neutral-500 font-mono">নির্বাচিত ফিল্টারে বর্তমানে কোনো ইউজার কমপ্লেইন জমা নেই।</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredReports.map((rep) => {
            const reportedUser = users.find(u => u.id === rep.reportedUserId || u.profileId === rep.reportedUserProfileId);
            const reporterUser = users.find(u => u.id === rep.reporterId || u.profileId === rep.reporterProfileId);
            
            // Payment record for reported user
            const userPayment = payments.find(p => p.profileId === (reportedUser?.profileId || rep.reportedUserProfileId));

            // Calculate total reports against this reported user
            const totalUserReports = reports.filter(r => r.reportedUserId === rep.reportedUserId || r.reportedUserProfileId === rep.reportedUserProfileId);

            return (
              <div 
                key={rep.id} 
                className="bg-white border border-neutral-200/90 rounded-3xl p-6 shadow-xs space-y-6 relative overflow-hidden"
              >
                
                {/* Header Strip */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-neutral-100">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 bg-red-50 border border-red-200 text-red-900 rounded-lg text-xs font-mono font-bold">
                      Report ID: {rep.id}
                    </span>
                    <span className="text-xs text-neutral-500 font-mono">
                      তারিখ: {new Date(rep.timestamp).toLocaleString('bn-BD')}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase ${
                      rep.status === 'pending' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                      rep.status === 'investigating' ? 'bg-blue-100 text-blue-900 border border-blue-300' :
                      rep.status === 'warned' ? 'bg-purple-100 text-purple-900 border border-purple-300' :
                      rep.status === 'suspended' ? 'bg-orange-100 text-orange-900 border border-orange-300' :
                      rep.status === 'banned' ? 'bg-red-700 text-white font-bold' :
                      rep.status === 'content_removed' ? 'bg-neutral-800 text-white' :
                      'bg-neutral-200 text-neutral-800'
                    }`}>
                      {rep.status === 'pending' ? 'পেন্ডিং (Pending)' :
                       rep.status === 'investigating' ? 'তদন্তাধীন (Investigating)' :
                       rep.status === 'warned' ? 'সতর্কবার্তা প্রদত্ত (Warned)' :
                       rep.status === 'suspended' ? 'স্থগিত (Suspended)' :
                       rep.status === 'banned' ? 'স্থায়ী ব্যান (Banned)' :
                       rep.status === 'content_removed' ? 'কন্টেন্ট অপসারিত' :
                       'বাতিল (Dismissed)'}
                    </span>
                  </div>
                </div>

                {/* 2 Columns: Reporter vs Reported User Dossier */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* LEFT: REPORTER INFO */}
                  <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between border-b border-neutral-200/60 pb-2">
                      <span className="text-xs font-bold font-mono text-neutral-700 uppercase flex items-center space-x-1">
                        <Users className="h-3.5 w-3.5 text-neutral-500" />
                        <span>রিপোর্টকারীর তথ্য (Reporter)</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <img 
                        src={reporterUser?.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                        alt="" 
                        className="w-10 h-10 rounded-full object-cover border border-neutral-300"
                      />
                      <div className="space-y-0.5">
                        <h5 className="font-bold text-neutral-900 text-sm">{rep.reporterName || reporterUser?.name || 'অজানা ইউজার'}</h5>
                        <p className="text-xs text-neutral-500 font-mono">
                          ID: <strong className="text-neutral-900">{rep.reporterProfileId || reporterUser?.profileId}</strong> (User ID: {rep.reporterId})
                        </p>
                        <p className="text-xs text-neutral-600 font-mono">
                          মোবাইল: <strong className="text-neutral-900">{rep.reporterMobileNumber || reporterUser?.mobileNumber || 'N/A'}</strong>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: REPORTED MEMBER DOSSIER */}
                  <div className="p-4 bg-red-50/50 border border-red-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between border-b border-red-200/60 pb-2">
                      <span className="text-xs font-bold font-mono text-red-900 uppercase flex items-center space-x-1">
                        <AlertTriangle className="h-3.5 w-3.5 text-red-700" />
                        <span>অভিযুক্ত সদস্যের রেজিস্ট্রেশন তথ্য (Reported User Dossier)</span>
                      </span>

                      {/* Repeat Report Counter Badge */}
                      {totalUserReports.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setExpandedUserReportHistoryId(expandedUserReportHistoryId === rep.reportedUserId ? null : rep.reportedUserId)}
                          className="px-2.5 py-0.5 bg-red-700 text-white rounded-md text-[10px] font-mono font-bold tracking-wider hover:bg-red-800 transition-colors cursor-pointer"
                        >
                          ⚠️ মোট {totalUserReports.length}টি রিপোর্ট (হিস্ট্রি দেখুন)
                        </button>
                      )}
                    </div>

                    <div className="flex items-start space-x-3">
                      <img 
                        src={reportedUser?.profilePicture || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'} 
                        alt="" 
                        className="w-12 h-12 rounded-full object-cover border-2 border-red-300 shrink-0"
                      />
                      <div className="space-y-1 text-xs font-mono w-full">
                        <div className="flex justify-between items-baseline">
                          <h5 className="font-extrabold text-neutral-900 text-sm font-serif">
                            {rep.reportedUserName || reportedUser?.name || 'অজানা সদস্য'}
                          </h5>
                          <span className="font-bold text-red-900">{rep.reportedUserProfileId || reportedUser?.profileId}</span>
                        </div>

                        {/* Detailed Registration & Payment Info */}
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] pt-1 text-neutral-700 border-t border-red-100">
                          <div>
                            <span className="text-neutral-500 block">মোবাইল:</span>
                            <strong className="text-neutral-900">{reportedUser?.mobileNumber || 'N/A'}</strong>
                          </div>
                          <div>
                            <span className="text-neutral-500 block">WhatsApp:</span>
                            <strong className="text-emerald-700">{reportedUser?.whatsappNumber || 'N/A'}</strong>
                          </div>
                          <div>
                            <span className="text-neutral-500 block">মেম্বারশিপ প্যাকেজ:</span>
                            <strong className="uppercase text-purple-900">{reportedUser?.packageId || 'Basic'} (৳{userPayment?.amount || 50})</strong>
                          </div>
                          <div>
                            <span className="text-neutral-500 block">ভেরিফিকেশন স্ট্যাটাস:</span>
                            <strong className={reportedUser?.status === 'verified' ? 'text-emerald-700 font-bold' : 'text-amber-800 font-bold'}>
                              {reportedUser?.status || 'Pending'}
                            </strong>
                          </div>
                          <div>
                            <span className="text-neutral-500 block">রেজিস্ট্রেশন তারিখ:</span>
                            <span className="text-neutral-900">{reportedUser?.registeredDate || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-neutral-500 block">ট্রানজেকশন ID:</span>
                            <span className="text-neutral-900 font-bold">{userPayment?.transactionId || 'BB-FREE'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* REPEAT REPORT HISTORY DROPDOWN PANEL */}
                {expandedUserReportHistoryId === rep.reportedUserId && (
                  <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-2 animate-in fade-in duration-150">
                    <h6 className="text-xs font-bold text-amber-900 font-mono flex items-center space-x-1">
                      <FileText className="h-4 w-4" />
                      <span>এই সদস্যের বিরুদ্ধে পূর্ববর্তী অন্যান্য সকল রিপোর্ট ({totalUserReports.length})</span>
                    </h6>
                    <div className="space-y-1.5 text-xs font-mono">
                      {totalUserReports.map((pastRep, pIdx) => (
                        <div key={pastRep.id} className="p-2.5 bg-white border border-amber-200 rounded-xl flex justify-between items-center">
                          <div>
                            <span className="font-bold text-neutral-900"># {pIdx + 1}. কারণ: "{pastRep.reasonPreset}"</span>
                            {pastRep.additionalDetails && <p className="text-[11px] text-neutral-600 mt-0.5 font-sans">"{pastRep.additionalDetails}"</p>}
                          </div>
                          <span className="text-[10px] text-neutral-500">{new Date(pastRep.timestamp).toLocaleDateString('bn-BD')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* COMPLAINT DETAILS & SCREENSHOTS */}
                <div className="p-4 bg-white border border-neutral-200 rounded-2xl space-y-3">
                  <div className="flex items-center space-x-2 border-b border-neutral-100 pb-2">
                    <span className="px-3 py-1 bg-red-700 text-white rounded-lg text-xs font-bold font-mono">
                      অভিযোগের কারণ: {rep.reasonPreset || rep.reasonPreset || 'অভিযোগ'}
                    </span>
                  </div>

                  {rep.additionalDetails && (
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-neutral-700 font-mono block">বিস্তারিত বিবরণ:</span>
                      <p className="text-xs text-neutral-800 bg-neutral-50 p-3 rounded-xl border border-neutral-200/80 leading-relaxed font-sans">
                        "{rep.additionalDetails}"
                      </p>
                    </div>
                  )}

                  {/* Screenshots Proof Gallery */}
                  {rep.screenshots && rep.screenshots.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-xs font-bold text-neutral-800 font-mono flex items-center space-x-1">
                        <ImageIcon className="h-3.5 w-3.5 text-neutral-500" />
                        <span>আপলোডকৃত প্রমান্য Screenshot ({rep.screenshots.length}টি):</span>
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {rep.screenshots.map((src, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => setLightboxImage(src)}
                            className="w-20 h-20 rounded-xl border border-neutral-300 overflow-hidden cursor-pointer hover:border-red-700 transition-colors relative group"
                          >
                            <img src={src} alt={`Proof ${idx + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-neutral-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold font-mono">
                              বড় করুন
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* PAST ACTION LOGS FOR THIS REPORT */}
                {rep.actionLogs && rep.actionLogs.length > 0 && (
                  <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-2">
                    <span className="text-xs font-bold text-neutral-800 font-mono block">প্রশাসনিক অ্যাকশন লগ হিস্ট্রি:</span>
                    <div className="space-y-1 text-xs font-mono">
                      {rep.actionLogs.map((log) => (
                        <div key={log.id} className="p-2 bg-white border border-neutral-200 rounded-xl flex justify-between items-center text-[11px]">
                          <div>
                            <strong className="text-red-900 uppercase">{log.actionType}</strong> - {log.adminName}
                            {log.actionNote && <span className="block text-neutral-600 font-sans">মন্তব্য: "{log.actionNote}"</span>}
                          </div>
                          <span className="text-neutral-400">{new Date(log.timestamp).toLocaleString('bn-BD')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ADMIN ACTION CONTROL PANEL */}
                <div className="p-4 bg-neutral-900 text-white rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-neutral-300 uppercase tracking-wider flex items-center space-x-1">
                      <ShieldCheck className="h-4 w-4 text-red-500" />
                      <span>প্রশাসনিক সিদ্ধান্ত ও অ্যাকশন (Admin Actions)</span>
                    </span>
                  </div>

                  <div className="space-y-2">
                    <textarea
                      rows={2}
                      placeholder="অ্যাকশনের বিবরণ বা প্রশাসনিক মন্তব্য লিখুন (ঐচ্ছিক)..."
                      value={selectedReportForAction?.id === rep.id ? actionNoteInput : ''}
                      onChange={(e) => {
                        setSelectedReportForAction(rep);
                        setActionNoteInput(e.target.value);
                      }}
                      className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-xl p-2.5 text-xs focus:outline-none focus:border-red-500 font-sans"
                    />

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        onClick={() => handleActionClick(rep, 'dismiss')}
                        className="px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 text-white rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer"
                      >
                        Dismiss (বাতিল)
                      </button>

                      <button
                        onClick={() => handleActionClick(rep, 'warning')}
                        className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer"
                      >
                        Warning (সতর্কবার্তা)
                      </button>

                      <button
                        onClick={() => handleActionClick(rep, 'investigating')}
                        className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer"
                      >
                        Investigate (তদন্তাধীন)
                      </button>

                      <button
                        onClick={() => handleActionClick(rep, 'remove_content')}
                        className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer"
                      >
                        Remove Content (কন্টেন্ট মুছুন)
                      </button>

                      <button
                        onClick={() => handleActionClick(rep, 'suspend')}
                        className="px-3 py-1.5 bg-orange-700 hover:bg-orange-800 text-white rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer"
                      >
                        Suspend (স্থগিত)
                      </button>

                      <button
                        onClick={() => handleActionClick(rep, 'ban')}
                        className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold font-mono uppercase tracking-wider shadow-md transition-colors cursor-pointer"
                      >
                        Permanent Ban (স্থায়ী বন্ধ)
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('আপনি কি নিশ্চিত এই রিপোর্টটি মুছে ফেলতে চান?')) {
                            if (onDeleteReport) {
                              onDeleteReport(rep.id);
                            }
                          }
                        }}
                        className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-900 border border-neutral-700 text-red-400 hover:text-red-300 rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer flex items-center space-x-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete Report (মুছুন)</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* EXECUTIVE DELETE CONFIRMATION POPUP MODAL */}
      {execToDelete && (
        <div className="fixed inset-0 bg-neutral-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center space-y-3">
              <div className="h-14 w-14 bg-red-100 text-red-700 rounded-full flex items-center justify-center mx-auto border-2 border-red-200">
                <Trash2 className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold font-serif text-neutral-900">
                আপনি কি নিশ্চিত এই Executive-কে স্থায়ীভাবে মুছে ফেলতে চান?
              </h3>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-700 font-mono space-y-1">
                <p className="font-bold text-neutral-900 text-sm">{execToDelete.name}</p>
                <p>রেফারেন্স কোড: <span className="text-red-700 font-bold">{execToDelete.referenceCode}</span></p>
                <p>পদবি: {execToDelete.designation}</p>
              </div>
              <p className="text-xs text-neutral-500 font-mono">
                ডিলিট নিশ্চিত করলে এই এক্সিকিউটিভ সম্পূর্ণভাবে ডাটাবেজ থেকে মুছে যাবে এবং তালিকা থেকে অদৃশ্য হয়ে যাবে।
              </p>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setExecToDelete(null)}
                className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl transition-colors cursor-pointer font-mono"
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
                className="flex-1 py-3 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer font-mono uppercase tracking-wider"
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
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setPaymentToView(null)}
              className="absolute top-4 right-4 h-9 w-9 bg-neutral-100 hover:bg-neutral-200 rounded-full flex items-center justify-center text-neutral-600 font-bold"
            >
              ✕
            </button>

            <div className="flex items-center space-x-3 border-b border-neutral-100 pb-4">
              <div className="h-10 w-10 bg-red-50 text-red-700 rounded-2xl flex items-center justify-center font-bold">
                💳
              </div>
              <div>
                <h3 className="text-lg font-bold font-serif text-neutral-900">
                  পেমেন্ট ও ভেরিফিকেশন তথ্য
                </h3>
                <p className="text-xs text-neutral-500 font-mono">
                  Trx ID: <strong className="text-red-900 uppercase">{paymentToView.transactionId}</strong>
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-500">মেম্বারশিপ প্যাকেজ:</span>
                  <strong className="uppercase text-red-800 font-bold">{paymentToView.membershipPackage}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">পেমেন্ট মেথড:</span>
                  <strong className="capitalize text-neutral-900">{paymentToView.paymentMethod}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">পেমেন্ট পরিমাণ:</span>
                  <strong className="text-emerald-700 text-sm font-black">৳{paymentToView.amount}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">বায়োডাটা আইডি:</span>
                  <strong className="text-neutral-900">{paymentToView.profileId}</strong>
                </div>
                {paymentToView.userName && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">ইউজারের নাম:</span>
                    <strong className="text-neutral-900 font-sans">{paymentToView.userName}</strong>
                  </div>
                )}
                {paymentToView.userMobile && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">ইউজার মোবাইল:</span>
                    <strong className="text-neutral-900">{paymentToView.userMobile}</strong>
                  </div>
                )}
                {paymentToView.executiveReferralCode && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">এক্সিকিউটিভ রেফারেল:</span>
                    <strong className="text-purple-900 font-bold">{paymentToView.executiveReferralCode}</strong>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-neutral-500">পেমেন্ট সময়:</span>
                  <span className="text-neutral-700">{new Date(paymentToView.paymentTime).toLocaleString('bn-BD')}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-neutral-200">
                  <span className="text-neutral-500">রেজিস্ট্রেশন অবস্থা:</span>
                  {paymentToView.isIncompleteRegistration ? (
                    <span className="text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded">⚠️ অসম্পূর্ণ (Incomplete)</span>
                  ) : (
                    <span className="text-blue-800 font-bold bg-blue-100 px-2 py-0.5 rounded">✅ সম্পূর্ণ (Completed)</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">ভেরিফিকেশন স্ট্যাটাস:</span>
                  <span className={`font-bold uppercase px-2 py-0.5 rounded ${
                    paymentToView.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                    paymentToView.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {paymentToView.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              {paymentToView.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      onApprovePayment(paymentToView.id);
                      setPaymentToView(null);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer"
                  >
                    Approve Payment
                  </button>
                  <button
                    onClick={() => {
                      setRejectingPaymentId(paymentToView.id);
                      setPaymentToView(null);
                    }}
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer"
                  >
                    Reject Payment
                  </button>
                </>
              )}
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

      {/* SCREENSHOT LIGHTBOX PREVIEW MODAL */}
      {lightboxImage && (
        <div className="fixed inset-0 bg-neutral-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center space-y-4">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-12 right-0 h-10 w-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center font-bold text-lg cursor-pointer transition-colors"
            >
              ✕
            </button>
            <img 
              src={lightboxImage} 
              alt="Full Resolution Proof" 
              className="max-w-full max-h-[80vh] object-contain rounded-2xl border border-neutral-700 shadow-2xl"
            />
            <p className="text-xs text-neutral-400 font-mono">প্রমাণ হিসেবে জমা দেওয়া স্ক্রিনশট</p>
          </div>
        </div>
      )}

    </div>
  );
}
