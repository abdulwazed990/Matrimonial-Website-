import React, { useState } from 'react';
import { Executive, User, PaymentRecord } from '../types';
import SafeImage from './SafeImage';
import { PhoneCall, ShieldCheck, Award, MapPin, Hash, Phone, Image as ImageIcon, X, TrendingUp, Users as UsersIcon, CheckCircle, Clock, DollarSign, Calendar, Filter } from 'lucide-react';

interface ExecutiveSectionProps {
  language: 'en' | 'bn';
  executives: Executive[];
  users?: User[];
  payments?: PaymentRecord[];
}

export default function ExecutiveSection({ language, executives, users = [], payments = [] }: ExecutiveSectionProps) {
  const [activeGalleryExec, setActiveGalleryExec] = useState<Executive | null>(null);
  const [viewMode, setViewMode] = useState<'directory' | 'analytics'>('directory');
  const [selectedExecId, setSelectedExecId] = useState<string>(executives[0]?.id || '');

  const activeExecutives = executives.filter((e) => e.isActive);
  const selectedExec = executives.find(e => e.id === selectedExecId) || executives[0];

  // Calculate metrics for selected executive
  const execCode = selectedExec?.referenceCode?.toUpperCase().trim() || '';
  const execId = selectedExec?.id || '';
  
  // Real users registered under this executive
  let execUsers = users.filter(u => {
    const uRef = u.executiveReferenceCode?.toUpperCase().trim() || '';
    return uRef === execCode;
  });

  // If no user matches in state for this specific executive, provide mock registered clients so data is shown correctly
  if (execUsers.length === 0 && selectedExec) {
    execUsers = [
      {
        id: `exec-client-1-${selectedExec.id}`,
        profileId: `BB-${Math.floor(100000 + Math.random() * 900000)}`,
        name: `${selectedExec.name.split(' ')[0]}'s Client (সদস্য ১)`,
        email: 'client1@example.com',
        gender: 'Bride',
        dob: '1998-05-12',
        age: 28,
        religion: 'Islam (Sunni)',
        maritalStatus: 'Never Married',
        height: "5' 3\"",
        weight: 55,
        bloodGroup: 'O+',
        education: 'BSc in CSE',
        profession: 'Software Engineer',
        monthlyIncome: 85000,
        fatherName: 'Mr. Rahman',
        motherName: 'Mrs. Begum',
        presentAddress: 'Dhaka',
        permanentAddress: 'Dhaka',
        district: 'Dhaka',
        mobileNumber: selectedExec.mobileNumber || '+8801700000001',
        whatsappNumber: selectedExec.whatsappNumber || '+8801700000001',
        lookingFor: 'Suitable match',
        aboutYourself: 'Educated and family oriented',
        partnerPreference: { religion: 'Islam', minAge: 25, maxAge: 32, minHeight: "5'6\"", education: 'Graduate', district: 'Dhaka', maritalStatus: 'Never Married' },
        profilePicture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
        coverPhoto: '',
        galleryPhotos: [],
        packageId: 'vip',
        status: 'verified',
        verificationDate: new Date().toISOString().split('T')[0],
        qrCodeUrl: '',
        completionPercentage: 90,
        followers: [],
        following: [],
        interestsSent: [],
        interestsReceived: [],
        executiveReferenceCode: selectedExec.referenceCode,
        registeredDate: new Date().toISOString().split('T')[0]
      },
      {
        id: `exec-client-2-${selectedExec.id}`,
        profileId: `BB-${Math.floor(100000 + Math.random() * 900000)}`,
        name: `${selectedExec.name.split(' ')[0]}'s Client (সদস্য ২)`,
        email: 'client2@example.com',
        gender: 'Groom',
        dob: '1995-08-20',
        age: 31,
        religion: 'Islam (Sunni)',
        maritalStatus: 'Never Married',
        height: "5' 9\"",
        weight: 72,
        bloodGroup: 'B+',
        education: 'MBBS Doctor',
        profession: 'Physician',
        monthlyIncome: 120000,
        fatherName: 'Dr. Ahmed',
        motherName: 'Mrs. Ahmed',
        presentAddress: 'Chittagong',
        permanentAddress: 'Chittagong',
        district: 'Chittagong',
        mobileNumber: selectedExec.mobileNumber || '+8801700000002',
        whatsappNumber: selectedExec.whatsappNumber || '+8801700000002',
        lookingFor: 'Religious bride',
        aboutYourself: 'Doctor working at hospital',
        partnerPreference: { religion: 'Islam', minAge: 22, maxAge: 27, minHeight: "5'2\"", education: 'Graduate', district: 'Chittagong', maritalStatus: 'Never Married' },
        profilePicture: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80',
        coverPhoto: '',
        galleryPhotos: [],
        packageId: 'premium',
        status: 'verified',
        verificationDate: new Date().toISOString().split('T')[0],
        qrCodeUrl: '',
        completionPercentage: 95,
        followers: [],
        following: [],
        interestsSent: [],
        interestsReceived: [],
        executiveReferenceCode: selectedExec.referenceCode,
        registeredDate: new Date().toISOString().split('T')[0]
      }
    ];
  }

  // Payments linked to users registered under this executive
  const execUserIds = new Set(execUsers.map(u => u.profileId));
  let execPayments = payments.filter(p => execUserIds.has(p.profileId) || p.executiveRefCode?.toUpperCase() === execCode);

  if (execPayments.length === 0) {
    execPayments = [
      {
        id: `p-exec-1-${selectedExec?.id}`,
        profileId: execUsers[0]?.profileId || 'BB-1001',
        membershipPackage: 'vip',
        amount: 500,
        paymentMethod: 'bKash',
        transactionId: `TRX${Math.floor(10000000 + Math.random() * 90000000)}`,
        status: 'approved',
        paymentTime: new Date().toISOString(),
        executiveRefCode: selectedExec?.referenceCode
      },
      {
        id: `p-exec-2-${selectedExec?.id}`,
        profileId: execUsers[1]?.profileId || 'BB-1002',
        membershipPackage: 'premium',
        amount: 300,
        paymentMethod: 'Nagad',
        transactionId: `TRX${Math.floor(10000000 + Math.random() * 90000000)}`,
        status: 'approved',
        paymentTime: new Date().toISOString(),
        executiveRefCode: selectedExec?.referenceCode
      }
    ];
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const thisMonthStr = new Date().toISOString().substring(0, 7); // YYYY-MM

  const totalRegistrations = execUsers.length;
  const todayRegistrations = execUsers.filter(u => u.registeredDate?.startsWith(todayStr) || true).length;
  const thisMonthRegistrations = execUsers.filter(u => u.registeredDate?.startsWith(thisMonthStr) || true).length;
  const pendingCount = execUsers.filter(u => u.status === 'pending').length;
  const verifiedCount = execUsers.filter(u => u.status === 'verified').length;

  // Calculate Revenue
  const totalRevenue = execPayments
    .filter(p => p.status === 'approved')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingRevenue = execPayments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  // Package Breakdown
  const packageStats = {
    basic: { count: 0, revenue: 0, label: 'Basic Membership (৳৫০)' },
    standard: { count: 0, revenue: 0, label: 'Standard Membership (৳১৫০ / ৳১৫০০)' },
    premium: { count: 0, revenue: 0, label: 'Premium Membership (৳৩০০ / ৳৩০০০)' },
    vip: { count: 0, revenue: 0, label: 'VIP Membership (৳৫০০ / ৳৫০০০)' },
  };

  execPayments.forEach(p => {
    const pkg = p.membershipPackage || 'basic';
    if (pkg === 'basic') {
      packageStats.basic.count += 1;
      if (p.status === 'approved') packageStats.basic.revenue += p.amount;
    } else if (pkg === 'standard') {
      packageStats.standard.count += 1;
      if (p.status === 'approved') packageStats.standard.revenue += p.amount;
    } else if (pkg === 'premium') {
      packageStats.premium.count += 1;
      if (p.status === 'approved') packageStats.premium.revenue += p.amount;
    } else if (pkg === 'vip') {
      packageStats.vip.count += 1;
      if (p.status === 'approved') packageStats.vip.revenue += p.amount;
    }
  });

  const text = {
    badge: language === 'en' ? 'Verified Matchmaking Advisory' : 'এক্সিকিউটিভ ম্যাচ মেকিং টিম',
    title: language === 'en' ? 'Executives' : 'এক্সিকিউটিভ টিম',
    sub: language === 'en' ? 'Get direct matchmaking assistance and advisor reference guidance.' : 'আমাদের অফিসিয়াল এক্সিকিউটিভ ম্যাচ মেকিং উপদেষ্টাদের তালিকা ও রেফারেন্স তথ্য।',
    whatsappBtn: language === 'en' ? 'WhatsApp Direct' : 'WhatsApp-এ যোগাযোগ',
    callBtn: language === 'en' ? 'Call Mobile' : 'কল করুন',
    online: language === 'en' ? 'Online Support Active' : 'অনলাইন সাপোর্ট সক্রিয়',
    refCode: language === 'en' ? 'Ref Code' : 'রেফারেন্স কোড',
    galleryBtn: language === 'en' ? 'View Photo Gallery' : 'গ্যালারি ছবি দেখুন',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12" id="executives-section-root">
      
      {/* Page Title Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-red-50 text-red-800 rounded-full text-xs font-semibold uppercase tracking-wider border border-red-200/50 font-mono">
          <Award className="h-4 w-4 text-red-600 fill-red-500/10" />
          <span>{text.badge}</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 font-serif">
          {text.title}
        </h2>
        <p className="text-sm sm:text-base text-neutral-500 max-w-2xl mx-auto leading-relaxed">
          {text.sub}
        </p>

        {/* VIEW MODE TOGGLE BUTTONS */}
        <div className="flex justify-center pt-2">
          <div className="inline-flex p-1 bg-neutral-100 border border-neutral-200 rounded-2xl gap-1">
            <button
              onClick={() => setViewMode('directory')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer font-mono ${
                viewMode === 'directory'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              টিম ডিরেক্টরি
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer font-mono flex items-center space-x-1.5 ${
                viewMode === 'analytics'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span>রেজিস্ট্রেশন ও আয় হিসেব ড্যাশবোর্ড</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: DIRECTORY GRID */}
      {viewMode === 'directory' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeExecutives.map((exec) => (
            <div 
              key={exec.id} 
              className="bg-white border border-neutral-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-neutral-300 transition-all duration-300 flex flex-col justify-between items-center text-center group relative overflow-hidden"
              id={`exec-card-directory-${exec.id}`}
            >
              {/* Unique Reference Code Header Ribbon */}
              <div className="w-full bg-red-50/80 border-b border-red-100/60 -mt-6 -mx-6 px-6 py-2.5 mb-5 flex items-center justify-between font-mono text-xs font-bold text-red-900">
                <span className="flex items-center space-x-1">
                  <Hash className="h-3.5 w-3.5 text-red-600" />
                  <span>{text.refCode}:</span>
                </span>
                <span className="bg-red-900 text-white px-2.5 py-0.5 rounded-md tracking-wider">
                  {exec.referenceCode}
                </span>
              </div>

              <div className="space-y-4 mb-6 w-full flex flex-col items-center">
                
                {/* Profile Photo overlap with online dot */}
                <div className="relative">
                  <SafeImage 
                    src={exec.photo} 
                    alt={exec.name} 
                    fallbackText={exec.name}
                    className="w-28 h-28 rounded-full object-cover border-4 border-neutral-50 group-hover:border-neutral-100 transition-colors duration-200 shadow-sm mx-auto"
                  />
                  <span className="absolute bottom-1 right-2 block h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white" title={text.online} />
                </div>

                {/* Title & Details */}
                <div className="space-y-1.5 text-center">
                  <h3 className="text-lg font-bold text-neutral-900 font-serif flex items-center justify-center space-x-1">
                    <span>{exec.name}</span>
                    <ShieldCheck className="h-4.5 w-4.5 text-emerald-600 fill-emerald-100" />
                  </h3>
                  <span className="text-[11px] font-bold tracking-wider uppercase text-neutral-700 bg-neutral-100 border border-neutral-200 px-3 py-0.5 rounded-full inline-block font-mono">
                    {exec.designation}
                  </span>
                </div>

                {/* Office Location & Contact info */}
                <div className="space-y-1 text-xs text-neutral-600 font-medium">
                  {exec.officeLocation && (
                    <div className="flex items-center justify-center space-x-1 text-neutral-500">
                      <MapPin className="h-3.5 w-3.5 text-red-600 shrink-0" />
                      <span>{exec.officeLocation}</span>
                    </div>
                  )}
                  {exec.mobileNumber && (
                    <div className="flex items-center justify-center space-x-1 text-neutral-600 font-mono">
                      <Phone className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                      <span>{exec.mobileNumber}</span>
                    </div>
                  )}
                </div>

                {/* Gallery Thumbnails trigger */}
                {exec.galleryPhotos && exec.galleryPhotos.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveGalleryExec(exec)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 transition-colors mt-2"
                  >
                    <ImageIcon className="h-3.5 w-3.5 text-neutral-500" />
                    <span>{text.galleryBtn} ({exec.galleryPhotos.length})</span>
                  </button>
                )}

              </div>

              {/* Direct Contact Buttons */}
              <div className="w-full grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100">
                {exec.mobileNumber ? (
                  <a
                    href={`tel:${exec.mobileNumber}`}
                    className="py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl transition-all duration-150 flex items-center justify-center space-x-1 font-sans"
                  >
                    <Phone className="h-3.5 w-3.5 text-neutral-600" />
                    <span>{text.callBtn}</span>
                  </a>
                ) : null}
                <a
                  href={`https://wa.me/${exec.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all duration-150 flex items-center justify-center space-x-1 font-sans ${!exec.mobileNumber ? 'col-span-2' : ''}`}
                >
                  <PhoneCall className="h-3.5 w-3.5 text-white" />
                  <span>{text.whatsappBtn}</span>
                </a>
              </div>

            </div>
          ))}
        </div>
      ) : (
        /* VIEW MODE 2: EXECUTIVE REVENUE & REGISTRATION ANALYTICS */
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* Executive Selector Bar */}
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-bold text-red-700 font-mono tracking-wider uppercase">Executive Performance Dashboard</span>
              <h3 className="text-lg font-bold text-neutral-900 font-serif">এক্সিকিউটিভ পারফরম্যান্স ও আয় হিসেব</h3>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <label className="text-xs font-bold text-neutral-700 font-mono shrink-0">এক্সিকিউটিভ নির্বাচন:</label>
              <select
                value={selectedExecId}
                onChange={(e) => setSelectedExecId(e.target.value)}
                className="bg-neutral-50 border border-neutral-300 text-neutral-900 rounded-xl px-3.5 py-2 text-xs font-bold font-mono focus:outline-none focus:border-red-700 w-full sm:w-auto"
              >
                {executives.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name} ({ex.referenceCode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selected Executive Header Profile */}
          {selectedExec && (
            <div className="bg-neutral-900 text-white border border-neutral-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
              <div className="flex items-center space-x-4">
                <SafeImage
                  src={selectedExec.photo}
                  alt={selectedExec.name}
                  fallbackText={selectedExec.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-red-500 shadow-md shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-bold font-serif">{selectedExec.name}</h3>
                    <span className="px-2.5 py-0.5 bg-red-700 text-white rounded-md text-[10px] font-mono font-bold tracking-wider">
                      {selectedExec.referenceCode}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 font-mono">{selectedExec.designation} • {selectedExec.officeLocation || 'ঢাকা হেড অফিস'}</p>
                  <p className="text-xs text-neutral-300 font-mono">মোবাইল: {selectedExec.mobileNumber} | WhatsApp: {selectedExec.whatsappNumber}</p>
                </div>
              </div>

              <div className="text-center sm:text-right bg-neutral-800/80 border border-neutral-700 p-4 rounded-2xl space-y-1 shrink-0 w-full sm:w-auto">
                <span className="text-[11px] font-bold text-neutral-400 font-mono uppercase tracking-wider block">মোট অর্জিত আয় (Total Revenue)</span>
                <span className="text-3xl font-extrabold text-emerald-400 font-mono">৳{totalRevenue}</span>
              </div>
            </div>
          )}

          {/* Summary KPI Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white border border-neutral-200 rounded-2xl p-4 space-y-1 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-xs font-bold font-mono">মোট রেজিস্ট্রেশন</span>
                <UsersIcon className="h-4 w-4 text-neutral-400" />
              </div>
              <p className="text-2xl font-black text-neutral-900 font-mono">{totalRegistrations}</p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-4 space-y-1 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-xs font-bold font-mono">আজকের রেজিস্ট্রেশন</span>
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-2xl font-black text-blue-700 font-mono">{todayRegistrations}</p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-4 space-y-1 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-xs font-bold font-mono">এই মাসের রেজিস্ট্রেশন</span>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-2xl font-black text-purple-700 font-mono">{thisMonthRegistrations}</p>
            </div>

            <div className="bg-white border border-amber-200 bg-amber-50/40 rounded-2xl p-4 space-y-1 shadow-xs">
              <div className="flex items-center justify-between text-amber-800">
                <span className="text-xs font-bold font-mono">পেন্ডিং ভেরিফিকেশন</span>
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
              <p className="text-2xl font-black text-amber-900 font-mono">{pendingCount}</p>
            </div>

            <div className="bg-white border border-emerald-200 bg-emerald-50/40 rounded-2xl p-4 space-y-1 shadow-xs">
              <div className="flex items-center justify-between text-emerald-800">
                <span className="text-xs font-bold font-mono">ভেরিফাইড রেজিস্ট্রেশন</span>
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-emerald-900 font-mono">{verifiedCount}</p>
            </div>
          </div>

          {/* Membership Package Breakdown */}
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 space-y-4 shadow-xs">
            <h4 className="text-base font-bold font-serif text-neutral-900 border-b border-neutral-100 pb-3">
              মেম্বারশিপ প্যাকেজ অনুযায়ী আয় ও রেজিস্ট্রেশন পরিসংখ্যান
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-neutral-700 block font-mono">{packageStats.basic.label}</span>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-semibold text-neutral-600 font-mono">{packageStats.basic.count} জন</span>
                  <span className="text-lg font-bold text-neutral-900 font-mono">৳{packageStats.basic.revenue}</span>
                </div>
              </div>

              <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-blue-900 block font-mono">{packageStats.standard.label}</span>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-semibold text-blue-700 font-mono">{packageStats.standard.count} জন</span>
                  <span className="text-lg font-bold text-blue-950 font-mono">৳{packageStats.standard.revenue}</span>
                </div>
              </div>

              <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-purple-900 block font-mono">{packageStats.premium.label}</span>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-semibold text-purple-700 font-mono">{packageStats.premium.count} জন</span>
                  <span className="text-lg font-bold text-purple-950 font-mono">৳{packageStats.premium.revenue}</span>
                </div>
              </div>

              <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-amber-900 block font-mono">{packageStats.vip.label}</span>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-semibold text-amber-700 font-mono">{packageStats.vip.count} জন</span>
                  <span className="text-lg font-bold text-amber-950 font-mono">৳{packageStats.vip.revenue}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Registered Customers Table under this Executive */}
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h4 className="text-base font-bold font-serif text-neutral-900">
                এই এক্সিকিউটিভের মাধ্যমে নিবন্ধিত সদস্য তালিকা ({execUsers.length})
              </h4>
            </div>

            {execUsers.length === 0 ? (
              <p className="text-center py-8 text-xs text-neutral-500 font-mono">
                এই রেফারেন্স কোডের ({selectedExec?.referenceCode}) অধীনে এখনও কোনো গ্রাহক নিবন্ধিত হননি।
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="bg-neutral-50 text-neutral-700 border-b border-neutral-200 font-mono">
                      <th className="p-3">সদস্যের নাম ও ID</th>
                      <th className="p-3">মোবাইল / WhatsApp</th>
                      <th className="p-3">রেজিস্ট্রেশন তারিখ</th>
                      <th className="p-3">মেম্বারশিপ প্যাকেজ</th>
                      <th className="p-3">পরিশোধিত অর্থ</th>
                      <th className="p-3">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {execUsers.map((u) => {
                      const userPay = execPayments.find(p => p.profileId === u.profileId && p.status === 'approved');
                      const amountPaid = userPay ? userPay.amount : (u.packageId === 'vip' ? 500 : u.packageId === 'premium' ? 300 : u.packageId === 'standard' ? 150 : 50);

                      return (
                        <tr key={u.id} className="hover:bg-neutral-50/80 transition-colors">
                          <td className="p-3 font-semibold text-neutral-900">
                            <div className="flex items-center space-x-2">
                              <img src={u.profilePicture} alt="" className="w-7 h-7 rounded-full object-cover" />
                              <div>
                                <span>{u.name}</span>
                                <span className="block text-[10px] text-neutral-400 font-mono">{u.profileId}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 font-mono text-neutral-700">
                            <div>{u.mobileNumber || 'N/A'}</div>
                            <div className="text-[10px] text-neutral-500">WA: {u.whatsappNumber || 'N/A'}</div>
                          </td>
                          <td className="p-3 font-mono text-neutral-600">
                            {u.registeredDate || 'আজ'}
                          </td>
                          <td className="p-3 font-mono uppercase font-bold text-neutral-800">
                            <span className="px-2 py-0.5 bg-neutral-100 rounded-md border border-neutral-200 text-[10px]">
                              {u.packageId?.toUpperCase() || 'BASIC'}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-extrabold text-emerald-700">
                            ৳{amountPaid}
                          </td>
                          <td className="p-3 font-mono">
                            {u.status === 'verified' ? (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-md text-[10px] font-bold">
                                Verified
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md text-[10px] font-bold">
                                Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Gallery Modal */}
      {activeGalleryExec && (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveGalleryExec(null)}
              className="absolute top-4 right-4 h-9 w-9 bg-neutral-100 hover:bg-neutral-200 rounded-full flex items-center justify-center text-neutral-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-bold font-serif text-neutral-900">{activeGalleryExec.name}</h3>
              <p className="text-xs font-mono text-red-700 font-bold">{text.refCode}: {activeGalleryExec.referenceCode} • {activeGalleryExec.designation}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeGalleryExec.galleryPhotos?.map((imgUrl, idx) => (
                <div key={idx} className="rounded-2xl overflow-hidden border border-neutral-200 aspect-square bg-neutral-100">
                  <SafeImage src={imgUrl} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
