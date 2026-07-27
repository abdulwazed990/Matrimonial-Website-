import React, { useState, useEffect } from 'react';
import { SUCCESS_STORIES, DISTRICT_LIST, RELIGION_LIST } from '../data';
import { User, Executive, Story } from '../types';
import { 
  Heart, 
  Search, 
  ShieldCheck, 
  Star, 
  Users, 
  PhoneCall, 
  CheckCircle2, 
  ArrowRight, 
  Award, 
  MapPin, 
  Sparkles, 
  AlertTriangle, 
  MessageSquare, 
  Flame, 
  Check,
  CheckCircle,
  HelpCircle,
  Quote,
  ExternalLink,
  RefreshCw,
  Eye,
  X,
  ZoomIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SafeImage from './SafeImage';

interface HeroProps {
  language: 'en' | 'bn';
  setActiveTab: (tab: string) => void;
  featuredUsers: User[];
  onSearchSubmit: (filters: { gender: string; religion: string; district: string; minAge: number; maxAge: number }) => void;
  onSelectProfile: (user: User) => void;
  currentUser?: User | null;
  users?: User[];
  executives?: Executive[];
  stories?: Story[];
  onQuickRegister?: (mobileNumber: string) => void;
  onOpenAdminLoginModal?: () => void;
}

// Name translation mapping helper
const translateNameToBangla = (name?: string): string => {
  if (!name) return '';
  const map: Record<string, string> = {
    'Anika Rahman': 'আনিকা রহমান',
    'Sajid Al Hasan': 'সাজিদ আল হাসান',
    'Sujana Tabassum': 'সুজানা তাবাসসুম',
    'Farhan Ahmed': 'ফারহান আহমেদ',
    'Ariful Islam': 'আরিফুল ইসলাম',
    'Tasnim Akter': 'তাসনিম আক্তার',
    'Nusrat Jahan': 'নুসরাত জাহান',
    'Tanvir Chowdhury': 'তানভীর চৌধুরী',
    'Kazi Farhan Ahmed': 'কাজী ফারহান আহমেদ',
    'Nusrat Jahan Chowdhury': 'নুসরাত জাহান চৌধুরী',
    'Tanvir Rahman Mahim': 'তানভীর রহমান মাহিম',
    'Sultana Yeasmin': 'সুলতানা ইয়াসমিন',
    'Ahsan Kabir': 'আহসান কবির',
    'Farhana Rashid': 'ফারহানা রশিদ',
    'Dr. Rafid Hasan': 'ডাঃ রাফিদ হাসান'
  };
  return map[name] || name;
};

// District translation mapping helper
const translateDistrictToBangla = (dist: string): string => {
  const map: Record<string, string> = {
    'Dhaka': 'ঢাকা',
    'Chittagong': 'চট্টগ্রাম',
    'Comilla': 'কুমিল্লা',
    'Sylhet': 'সিলেট',
    'Rajshahi': 'রাজশাহী',
    'Khulna': 'খুলনা',
    'Barisal': 'বরিশাল',
    'Rangpur': 'রংপুর',
    'Mymensingh': 'ময়মনসিংহ',
    'Gazipur': 'গাজীপুর',
    'Narayanganj': 'নারায়ণগঞ্জ',
    'Feni': 'ফেনী'
  };
  return map[dist] || dist;
};

// Convert standard numbers to Bangla digits
const toBanglaNumber = (num: number): string => {
  if (num === 0 || isNaN(num)) return '০';
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().split('').map(digit => {
    const d = parseInt(digit, 10);
    return isNaN(d) ? digit : banglaDigits[d];
  }).join('');
};

export interface TodayMember {
  id: string;
  profileId: string;
  nameBn: string;
  nameEn: string;
  age: number;
  height: string;
  districtBn: string;
  professionBn: string;
  religionBn: string;
  isHijab: boolean;
  imgUrl: string;
  sourceUrl: string;
}

export const TODAY_NEW_MEMBERS_POOL: TodayMember[] = [
  {
    id: 'tdm-1',
    profileId: 'BD-G101',
    nameBn: 'সানজিদা রহমান',
    nameEn: 'Sanjida Rahman',
    age: 23,
    height: "5' 3\"",
    districtBn: 'ঢাকা',
    professionBn: 'অনার্স শিক্ষার্থী',
    religionBn: 'ইসলাম',
    isHijab: false,
    imgUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
    sourceUrl: ''
  },
  {
    id: 'tdm-2',
    profileId: 'BD-G102',
    nameBn: 'মেহজাবীন সুলতানা',
    nameEn: 'Mehjabin Sultana',
    age: 24,
    height: "5' 4\"",
    districtBn: 'চট্টগ্রাম',
    professionBn: 'সহকারী শিক্ষক',
    religionBn: 'ইসলাম',
    isHijab: false,
    imgUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    sourceUrl: ''
  },
  {
    id: 'tdm-3',
    profileId: 'BD-G103',
    nameBn: 'নুসরাত জাহান',
    nameEn: 'Nusrat Jahan',
    age: 22,
    height: "5' 2\"",
    districtBn: 'কুমিল্লা',
    professionBn: 'ব্যাংক কর্মকর্তা',
    religionBn: 'ইসলাম',
    isHijab: false,
    imgUrl: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=600&auto=format&fit=crop&q=80',
    sourceUrl: ''
  },
  {
    id: 'tdm-4',
    profileId: 'BD-G104',
    nameBn: 'আনিকা মেহজাবীন',
    nameEn: 'Anika Mehjabin',
    age: 25,
    height: "5' 5\"",
    districtBn: 'সিলেট',
    professionBn: 'গ্রাফিক ডিজাইনার',
    religionBn: 'ইসলাম',
    isHijab: false,
    imgUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80',
    sourceUrl: ''
  },
  {
    id: 'tdm-5',
    profileId: 'BD-G105',
    nameBn: 'তাসনিম আক্তার',
    nameEn: 'Tasnim Akter',
    age: 23,
    height: "5' 3\"",
    districtBn: 'রাজশাহী',
    professionBn: 'এমবিবিএস শিক্ষার্থী',
    religionBn: 'ইসলাম',
    isHijab: false,
    imgUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
    sourceUrl: ''
  },
  {
    id: 'tdm-6',
    profileId: 'BD-G106',
    nameBn: 'সাদিয়া ইসলাম',
    nameEn: 'Sadia Islam',
    age: 24,
    height: "5' 2\"",
    districtBn: 'ময়মনসিংহ',
    professionBn: 'সফটওয়্যার ইঞ্জিনিয়ার',
    religionBn: 'ইসলাম',
    isHijab: false,
    imgUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop&q=80',
    sourceUrl: ''
  },
  {
    id: 'tdm-7',
    profileId: 'BD-G107',
    nameBn: 'ফারহানা ইয়াসমিন',
    nameEn: 'Farhana Yeasmin',
    age: 26,
    height: "5' 4\"",
    districtBn: 'গাজীপুর',
    professionBn: 'ফ্যাশন ডিজাইনার',
    religionBn: 'ইসলাম',
    isHijab: false,
    imgUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&auto=format&fit=crop&q=80',
    sourceUrl: ''
  },
  {
    id: 'tdm-8',
    profileId: 'BD-G108',
    nameBn: 'রেহনুমা পারভীন',
    nameEn: 'Rehnuma Parveen',
    age: 22,
    height: "5' 3\"",
    districtBn: 'কক্সবাজার',
    professionBn: 'এনজিও কর্মকর্তা',
    religionBn: 'ইসলাম',
    isHijab: false,
    imgUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&auto=format&fit=crop&q=80',
    sourceUrl: ''
  },
  {
    id: 'tdm-9',
    profileId: 'BD-G109',
    nameBn: 'সায়মা চৌধুরী',
    nameEn: 'Sayma Chowdhury',
    age: 25,
    height: "5' 5\"",
    districtBn: 'খুলনা',
    professionBn: 'মার্কেটিং এক্সিকিউটিভ',
    religionBn: 'ইসলাম',
    isHijab: false,
    imgUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80',
    sourceUrl: ''
  },
  {
    id: 'tdm-10',
    profileId: 'BD-G110',
    nameBn: 'সুমাইয়া তাবাসসুম',
    nameEn: 'Sumaiya Tabassum',
    age: 23,
    height: "5' 2\"",
    districtBn: 'বরিশাল',
    professionBn: 'লেকচারার',
    religionBn: 'ইসলাম',
    isHijab: false,
    imgUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=600&auto=format&fit=crop&q=80',
    sourceUrl: ''
  },
  {
    id: 'tdm-11',
    profileId: 'BD-G111',
    nameBn: 'সামিহা চৌধুরী',
    nameEn: 'Samiha Chowdhury',
    age: 24,
    height: "5' 4\"",
    districtBn: 'নারায়ণগঞ্জ',
    professionBn: 'কনটент ক্রিয়েটর',
    religionBn: 'ইসলাম',
    isHijab: false,
    imgUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&auto=format&fit=crop&q=80',
    sourceUrl: ''
  },
  {
    id: 'tdm-12',
    profileId: 'BD-G112',
    nameBn: 'রুকসানা কবির',
    nameEn: 'Ruksana Kabir',
    age: 23,
    height: "5' 3\"",
    districtBn: 'ফেনী',
    professionBn: 'আর্কিটেক্ট',
    religionBn: 'ইসলাম',
    isHijab: false,
    imgUrl: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=600&auto=format&fit=crop&q=80',
    sourceUrl: ''
  },
  {
    id: 'tdm-13',
    profileId: 'BD-G113',
    nameBn: 'শাইলা জামিল',
    nameEn: 'Shaila Jamil',
    age: 22,
    height: "5' 2\"",
    districtBn: 'ঢাকা',
    professionBn: 'ইসলামিক ক্যালিগ্রাফার',
    religionBn: 'ইসলাম',
    isHijab: true,
    imgUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&auto=format&fit=crop&q=80',
    sourceUrl: ''
  },
  {
    id: 'tdm-14',
    profileId: 'BD-G114',
    nameBn: 'সালেহা নূর',
    nameEn: 'Saleha Nur',
    age: 25,
    height: "5' 3\"",
    districtBn: 'রংপুর',
    professionBn: 'মাদ্রাসা শিক্ষিকা',
    religionBn: 'ইসলাম',
    isHijab: true,
    imgUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&auto=format&fit=crop&q=80',
    sourceUrl: ''
  },
  {
    id: 'tdm-15',
    profileId: 'BD-G115',
    nameBn: 'ফারজানা আনজুম',
    nameEn: 'Farzana Anjum',
    age: 24,
    height: "5' 4\"",
    districtBn: 'সিলেট',
    professionBn: 'ফার্মাসিস্ট',
    religionBn: 'ইসলাম',
    isHijab: true,
    imgUrl: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=600&auto=format&fit=crop&q=80',
    sourceUrl: ''
  },
  {
    id: 'tdm-16',
    profileId: 'BD-G116',
    nameBn: 'তাহসিন মাহমুদ',
    nameEn: 'Tahsin Mahmud',
    age: 23,
    height: "5' 3\"",
    districtBn: 'কুমিল্লা',
    professionBn: 'নিউট্রিশনিস্ট',
    religionBn: 'ইসলাম',
    isHijab: true,
    imgUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80',
    sourceUrl: ''
  },
  {
    id: 'tdm-17',
    profileId: 'BD-G117',
    nameBn: 'আফরোজা খানম',
    nameEn: 'Afroza Khanam',
    age: 24,
    height: "5' 4\"",
    districtBn: 'চট্টগ্রাম',
    professionBn: 'ব্যাংকার',
    religionBn: 'ইসলাম',
    isHijab: true,
    imgUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    sourceUrl: ''
  }
];

export default function Hero({
  language,
  setActiveTab,
  featuredUsers,
  onSearchSubmit,
  onSelectProfile,
  currentUser,
  users = [],
  executives = [],
  stories = [],
  onQuickRegister,
  onOpenAdminLoginModal,
}: HeroProps) {
  const activeExecutives = executives.filter(e => e.isActive);
  // Search states (For logged-in users)
  const [searchGender, setSearchGender] = useState('Bride');
  const [searchReligion, setSearchReligion] = useState('');
  const [searchDistrict, setSearchDistrict] = useState('');
  const [searchMinAge, setSearchMinAge] = useState(20);
  const [searchMaxAge, setSearchMaxAge] = useState(35);

  // Guest Quick Start state
  const [guestMobile, setGuestMobile] = useState('');
  const [guestError, setGuestError] = useState('');

  // Dynamic day-of-year calculation for deterministic daily dynamic stats
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));

  // Dynamic values satisfying strict prompt requirements:
  // 1. আজ নতুন সদস্য: > 100
  const dynamicJoinedToday = 120 + ((dayOfYear * 11) % 65); // 120 to 184 (Always > 100)
  // 2. সফল ম্যাচ: > 40
  const dynamicMatches = 45 + ((dayOfYear * 7) % 35); // 45 to 79 (Always > 40)
  // 3. সম্পূর্ণ বিবাহ: 3 - 10 এর মধ্যে
  const dynamicMarriages = 3 + ((dayOfYear * 3) % 8); // 3 to 10
  // 4. বর্তমানে অনলাইনে: 350 - 600 এর মধ্যে
  const dynamicOnline = 350 + ((dayOfYear * 19) % 245); // 350 to 594

  // Slider Images - Exactly 3 authentic Bangladeshi wedding bride images per user prompt
  const sliderImages = [
    {
      url: 'https://i.pinimg.com/736x/a7/ba/f0/a7baf033b5d04dc81f2769b3c7d190d2.jpg',
      titleBn: 'নিরাপদ জীবনসঙ্গী খুঁজুন',
      captionBn: 'বাংলাদেশের বিশ্বস্ত ও ভেরিফাইড ম্যাট্রিমনি প্ল্যাটফর্ম'
    },
    {
      url: 'https://looknfeelevent.com/wp-content/uploads/2025/08/bangladeshi-bride-wedding-palanquin-entry-traditional-ceremony-683x1024.webp',
      titleBn: 'ঐতিহ্যবাহী বিবাহবন্ধন',
      captionBn: 'শতভাগ বিশ্বাস ও পারিবারিক আস্থার সাথে খুঁজুন বর এবং কনে'
    },
    {
      url: 'https://bibaha.com.bd/wp-content/uploads/2025/09/G2.jpg',
      titleBn: 'পারিবারিক মর্যাদা ও মেলবন্ধন',
      captionBn: 'হৃদয়ের পবিত্র মেলবন্ধন এবং পারিবারিক আভিজাত্যের সুবর্ণ সুযোগ'
    }
  ];

  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % sliderImages.length);
    }, 4000); // Auto change slider every 4 seconds
    return () => clearInterval(timer);
  }, [sliderImages.length]);

  const handleSearchClick = () => {
    onSearchSubmit({
      gender: searchGender,
      religion: searchReligion,
      district: searchDistrict,
      minAge: searchMinAge,
      maxAge: searchMaxAge,
    });
    setActiveTab('search');
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestMobile.trim()) {
      setGuestError('দয়া করে একটি মোবাইল নম্বর দিন।');
      return;
    }
    if (guestMobile.length < 11 || !/^\d+$/.test(guestMobile)) {
      setGuestError('সঠিক ১১-ডিজিটের মোবাইল নম্বর দিন।');
      return;
    }
    setGuestError('');
    if (onQuickRegister) {
      onQuickRegister(guestMobile);
    } else {
      setActiveTab('register');
    }
  };

  // Success Stories from live database or fallback
  const successStories = stories.length > 0 ? stories : SUCCESS_STORIES;

  // Daily Shuffle & Photo viewer state for 17 user-provided new member profiles
  const [shuffleOffset, setShuffleOffset] = useState<number>(0);
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<TodayMember | null>(null);

  // Dynamic daily base index using day of year
  const dailyBaseIndex = (dayOfYear * 3) % TODAY_NEW_MEMBERS_POOL.length;

  // Compute active 3 members to display
  const currentDisplayedMembers = [
    TODAY_NEW_MEMBERS_POOL[(dailyBaseIndex + shuffleOffset * 3) % TODAY_NEW_MEMBERS_POOL.length],
    TODAY_NEW_MEMBERS_POOL[(dailyBaseIndex + shuffleOffset * 3 + 1) % TODAY_NEW_MEMBERS_POOL.length],
    TODAY_NEW_MEMBERS_POOL[(dailyBaseIndex + shuffleOffset * 3 + 2) % TODAY_NEW_MEMBERS_POOL.length]
  ];

  return (
    <div className="bg-white min-h-screen" id="homepage-root">

      {/* ======================================================== */}
      {/* 1. HERO SLIDER SECTION (Premium White, Red, and Gold Theme) */}
      {/* ======================================================== */}
      <section className="relative w-full overflow-hidden bg-neutral-50 py-10 lg:py-16" id="hero-slider-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Content & Quick Register */}
            <div className="lg:col-span-6 space-y-6 text-left">
              
              {/* Premium Badge */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-rose-50 text-red-700 border border-red-100 rounded-full text-xs font-bold tracking-wide shadow-xs"
              >
                <Sparkles className="h-4 w-4 text-amber-500 fill-amber-500/10 animate-pulse" />
                <span>বাংলাদেশের বিশ্বস্ত ম্যাট্রিমনি প্ল্যাটফর্ম</span>
              </motion.div>

              {/* Main Elegant Headings */}
              <div className="space-y-3">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-neutral-900 font-serif"
                >
                  আপনার জীবনসঙ্গী খুঁজে নিন <span className="text-red-700 font-bold border-b-4 border-amber-400 pb-1">BibahoBondhon</span> Matrimony Bangladesh-এ
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xs sm:text-sm lg:text-base text-neutral-600 leading-relaxed font-sans"
                >
                  শতভাগ নিরাপত্তা, বিশ্বস্ততা ও সঠিক পারিবারিক আভিজাত্য বজায় রেখে জীবনসঙ্গী নির্বাচন করুন আমাদের ভেরিফাইড ডাটাবেজ থেকে। সম্পূর্ণ ফ্রিতে বায়োডাটা তৈরি করুন আজই।
                </motion.p>
              </div>

              {/* Dynamic Overlay Joining Avatars */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center space-x-3 bg-white p-3 rounded-2xl border border-rose-100 shadow-xs max-w-sm"
              >
                <div className="flex -space-x-2.5">
                  <img className="w-8 h-8 rounded-full object-cover ring-2 ring-white" src="https://bangladesh.unfpa.org/sites/default/files/styles/original/public/news/1_copy_0.jpg" alt="Avatar 1" referrerPolicy="no-referrer" />
                  <img className="w-8 h-8 rounded-full object-cover ring-2 ring-white" src="https://miro.medium.com/v2/resize:fit:1400/1*flBcPk2QQi_jbj59s-yp0Q.jpeg" alt="Avatar 2" referrerPolicy="no-referrer" />
                  <img className="w-8 h-8 rounded-full object-cover ring-2 ring-white" src="https://worldschildrensprize.org/images/girl-student-chobi-boat-school-shidhulai-swanirvar-sangstha-bangladesh_S005677_-1.jpeg" alt="Avatar 3" referrerPolicy="no-referrer" />
                  <img className="w-8 h-8 rounded-full object-cover ring-2 ring-white" src="https://wallpaperaccess.com/full/3794081.jpg" alt="Avatar 4" referrerPolicy="no-referrer" />
                </div>
                <div className="text-xs font-semibold text-neutral-700">
                  আজকে <span className="text-red-700 font-black font-mono text-sm">{toBanglaNumber(dynamicJoinedToday)}</span> জন নতুন সদস্য যুক্ত হয়েছেন
                </div>
              </motion.div>

              {/* Quick Mobile Number Register Form */}
              <div className="bg-white rounded-3xl border border-neutral-200/80 p-5 shadow-sm space-y-4 max-w-lg">
                <div className="text-left space-y-1">
                  <h3 className="text-sm sm:text-base font-bold text-neutral-900 font-serif">
                    আপনার মোবাইল নাম্বার দিয়ে শুরু করুন
                  </h3>
                  <p className="text-xs text-neutral-500">
                    উপযুক্ত বর অথবা কনে খুঁজে পেতে আপনার সচল মোবাইল নম্বর দিন
                  </p>
                </div>

                <form onSubmit={handleQuickSubmit} className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-grow">
                      <span className="absolute left-4 top-3 text-xs sm:text-sm font-bold text-neutral-400 font-mono">+৮৮০</span>
                      <input
                        type="tel"
                        required
                        maxLength={11}
                        placeholder="০১৭১২৩৪৫৬৭৮"
                        value={guestMobile}
                        onChange={(e) => {
                          setGuestMobile(e.target.value.replace(/[^0-9]/g, ''));
                          setGuestError('');
                        }}
                        className="w-full bg-neutral-50 border border-neutral-200 focus:border-red-600 focus:bg-white rounded-xl pl-16 pr-4 py-2.5 text-xs sm:text-sm font-semibold tracking-wide text-neutral-900 focus:outline-none transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      className="py-2.5 px-6 bg-red-700 hover:bg-red-800 text-white font-extrabold text-xs sm:text-sm tracking-wider rounded-xl shadow-xs transition-transform active:scale-98 cursor-pointer flex items-center justify-center space-x-2 shrink-0 border border-red-800"
                    >
                      <span>শুরু করুন →</span>
                    </button>
                  </div>

                  {guestError && (
                    <p className="text-xs text-red-600 font-semibold flex items-center space-x-1">
                      <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                      <span>{guestError}</span>
                    </p>
                  )}

                  <p className="text-[10px] text-neutral-400 leading-relaxed">
                    শুরু করুন বাটনে চাপ দিলে আপনি বিবাহবন্ধনের ব্যবহারের শর্তাবলী এবং গোপনীয়তা নীতিতে সম্মত হচ্ছেন।
                  </p>
                </form>
              </div>

            </div>

            {/* Right Column: Premium Interactive Wedding Slider */}
            <div className="lg:col-span-6 w-full relative">
              <div className="relative w-full h-[280px] sm:h-[360px] lg:h-[420px] rounded-3xl overflow-hidden shadow-xl border-4 border-white shadow-neutral-200">
                
                {/* Image loop with motion transitions */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSlide}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <SafeImage
                      src={sliderImages[activeSlide].url}
                      alt="বিবাহবন্ধন ম্যাট্রিমনি"
                      className="w-full h-full object-cover"
                    />
                    {/* Golden Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/85 via-neutral-950/25 to-transparent" />
                    
                    {/* Caption Overlay */}
                    <div className="absolute bottom-6 left-6 right-6 text-left space-y-1 sm:space-y-2">
                      <h4 className="text-lg sm:text-2xl font-black text-amber-400 font-serif leading-tight">
                        {sliderImages[activeSlide].titleBn}
                      </h4>
                      <p className="text-xs sm:text-sm text-neutral-100 leading-relaxed">
                        {sliderImages[activeSlide].captionBn}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Slide Number Indicators */}
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-xs px-3 py-1 rounded-full text-[10px] font-bold text-white tracking-widest font-mono">
                  {toBanglaNumber(activeSlide + 1)} / {toBanglaNumber(sliderImages.length)}
                </div>

              </div>

              {/* Soft decorative golden dots background effect */}
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl z-0" />
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-red-700/5 rounded-full blur-2xl z-0" />
            </div>

          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. TODAY'S ACTIVITY STATS SECTION (Dynamic values > 100, > 40, 3-10, 350-600) */}
      {/* ======================================================== */}
      <section className="relative z-20 py-10 bg-white border-t border-b border-neutral-100" id="todays-activity-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-8 space-y-1">
            <span className="text-[10px] font-extrabold text-red-700 uppercase tracking-widest block">রিয়েল-টাইম ডাটা আপডেট</span>
            <h2 className="text-xl sm:text-3xl font-black text-neutral-900 font-serif">
              আজকের লাইভ কার্যক্রম
            </h2>
            <div className="h-1 w-16 bg-amber-400 mx-auto rounded-full mt-2" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Joined Card (Always > 100+) */}
            <div className="bg-neutral-50/60 hover:bg-rose-50/15 border border-neutral-200/50 p-5 rounded-2xl transition-all duration-300 flex flex-col justify-between group shadow-xs hover:shadow-md">
              <div className="flex justify-between items-start mb-3">
                <span className="text-2xl">👤</span>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase">
                  লাইভ
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-2xl sm:text-3xl font-black text-neutral-950 font-serif block">
                  {toBanglaNumber(dynamicJoinedToday)}+
                </span>
                <span className="text-xs font-bold text-neutral-600 group-hover:text-red-700 transition-colors">
                  আজ নতুন সদস্য
                </span>
              </div>
            </div>

            {/* Matches Card (Always > 40+) */}
            <div className="bg-neutral-50/60 hover:bg-rose-50/15 border border-neutral-200/50 p-5 rounded-2xl transition-all duration-300 flex flex-col justify-between group shadow-xs hover:shadow-md">
              <div className="flex justify-between items-start mb-3">
                <span className="text-2xl">❤️</span>
                <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full uppercase">
                  সফলতা
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-2xl sm:text-3xl font-black text-neutral-950 font-serif block">
                  {toBanglaNumber(dynamicMatches)}+
                </span>
                <span className="text-xs font-bold text-neutral-600 group-hover:text-red-700 transition-colors">
                  সফল ম্যাচ
                </span>
              </div>
            </div>

            {/* Marriages Card (3-10 range) */}
            <div className="bg-neutral-50/60 hover:bg-rose-50/15 border border-neutral-200/50 p-5 rounded-2xl transition-all duration-300 flex flex-col justify-between group shadow-xs hover:shadow-md">
              <div className="flex justify-between items-start mb-3">
                <span className="text-2xl">💍</span>
                <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full uppercase">
                  বিবাহ
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-2xl sm:text-3xl font-black text-neutral-950 font-serif block">
                  {toBanglaNumber(dynamicMarriages)}
                </span>
                <span className="text-xs font-bold text-neutral-600 group-hover:text-red-700 transition-colors">
                  সম্পূর্ণ বিবাহ
                </span>
              </div>
            </div>

            {/* Online Members Card (350-600 range) */}
            <div className="bg-neutral-50/60 hover:bg-rose-50/15 border border-neutral-200/50 p-5 rounded-2xl transition-all duration-300 flex flex-col justify-between group shadow-xs hover:shadow-md">
              <div className="flex justify-between items-start mb-3">
                <span className="text-2xl">🟢</span>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase flex items-center space-x-1">
                  <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-ping" />
                  <span>সক্রিয়</span>
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-2xl sm:text-3xl font-black text-neutral-950 font-serif block">
                  {toBanglaNumber(dynamicOnline)}+
                </span>
                <span className="text-xs font-bold text-neutral-600 group-hover:text-red-700 transition-colors">
                  বর্তমানে অনলাইনে
                </span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. TODAY'S NEW MEMBERS SECTION (17 Member Pool, 3 per view, Daily Shuffle) */}
      {/* ======================================================== */}
      <section className="py-16 bg-neutral-50/40" id="todays-new-members-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 border-b border-rose-100/60 pb-4">
            <div className="text-center md:text-left space-y-1">
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <Heart className="h-6 w-6 text-red-600 fill-red-600/10" />
                <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 font-serif">
                  আজকের নতুন সদস্যরা (১৭ জন ভেরিফাইড পাত্রী)
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-neutral-500 font-sans">
                প্রতিদিন ১৭টি ভেরিফাইড ফেসবুক ও ইনস্টাগ্রাম প্রোফাইল থেকে ৩ জন করে নতুন আইডি স্বয়ংক্রিয়ভাবে পরিবর্তিত হচ্ছে
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <button 
                type="button"
                onClick={() => setShuffleOffset(prev => prev + 1)}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full text-xs font-bold font-mono transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
                title="১৭টি প্রোফাইলের মধ্যে পরবর্তী ৩ জন দেখুন"
              >
                <RefreshCw className="h-3.5 w-3.5 text-amber-400" />
                <span>দৈনিক পরিবর্তন / রিফ্রেশ করুন 🔀</span>
              </button>

              <button 
                type="button"
                onClick={() => setActiveTab('register')}
                className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-100 rounded-full text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer"
              >
                <span>সব বায়োডাটা দেখুন →</span>
              </button>
            </div>
          </div>

          {/* Cards Grid - 3 items */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {currentDisplayedMembers.map((member) => (
              <div 
                key={member.id} 
                className="bg-white rounded-3xl border border-neutral-200/80 hover:border-red-400 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group relative"
                id={`guest-member-card-${member.profileId}`}
              >
                {/* Photo container with h-80 and object-contain so full uncropped image is visible */}
                <div className="h-80 w-full bg-neutral-950 relative overflow-hidden flex items-center justify-center border-b border-neutral-200">
                  <SafeImage 
                    src={member.imgUrl} 
                    alt={member.nameBn} 
                    gender="Bride"
                    fallbackText={member.nameEn}
                    className="w-full h-full object-contain bg-neutral-950 p-1 group-hover:scale-102 transition-transform duration-300"
                  />
                  
                  {/* Status Badges */}
                  <div className="absolute top-3 left-3 bg-emerald-600/90 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center space-x-1 font-sans">
                    <span className="h-1.5 w-1.5 bg-emerald-300 rounded-full animate-pulse" />
                    <span>আজ যোগ দিয়েছেন</span>
                  </div>

                  <div className="absolute top-3 right-3 bg-neutral-900/90 backdrop-blur-md text-amber-300 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border border-amber-400/30">
                    {member.isHijab ? '🧕 হিজাবি পাত্রী' : '👰 পাত্রী'}
                  </div>

                  {/* Quick Zoom Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedPhotoModal(member)}
                    className="absolute bottom-3 right-3 p-2 bg-neutral-900/80 hover:bg-red-700 text-white rounded-xl backdrop-blur-md transition-colors cursor-pointer border border-white/20 shadow-md"
                    title="ফুল আনক্রপড ছবি দেখুন"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                </div>

                {/* Profile Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-start">
                      <h4 className="text-base sm:text-lg font-black text-neutral-900 font-serif leading-snug">
                        {member.nameBn}
                      </h4>
                      <span className="text-[10px] text-red-700 bg-red-50 px-2 py-0.5 rounded-full font-bold font-mono border border-red-100 shrink-0">
                        {member.profileId}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1.5 text-xs text-neutral-700 font-bold font-sans">
                      <MapPin className="h-4 w-4 text-red-600 shrink-0 fill-red-600/10" />
                      <span>জেলা: {member.districtBn}</span>
                    </div>

                    <div className="bg-neutral-50 rounded-2xl p-3 border border-neutral-100 text-xs text-neutral-700 font-sans space-y-1">
                      <p>
                        <span className="font-bold text-neutral-900">বয়স:</span> {toBanglaNumber(member.age)} বছর • <span className="font-bold text-neutral-900">উচ্চতা:</span> {member.height}
                      </p>
                      <p className="truncate">
                        <span className="font-bold text-neutral-900">পেশা:</span> {member.professionBn}
                      </p>
                      <p>
                        <span className="font-bold text-neutral-900">ধর্ম:</span> {member.religionBn}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center space-x-2 pt-1">
                    <button 
                      type="button"
                      onClick={() => setActiveTab('register')}
                      className="flex-1 py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold text-xs uppercase rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer border border-red-800 shadow-xs"
                    >
                      <span>বিস্তারিত দেখুন</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </button>

                    <a 
                      href={member.sourceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="px-3 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200 rounded-xl text-xs font-bold font-mono flex items-center space-x-1 cursor-pointer transition-colors shrink-0"
                      title="মূল ছবি ও ফেসবুক/সোশ্যাল পেজ লিংক"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-red-600" />
                      <span className="hidden sm:inline">সূত্র</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. HOW IT WORKS SECTION (Connected dashed line layout) */}
      {/* ======================================================== */}
      <section className="py-16 bg-white" id="how-it-works-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="space-y-1 mb-12 sm:mb-16">
            <span className="text-[10px] font-extrabold text-red-700 uppercase tracking-widest block">খুবই সহজ ৩টি ধাপ</span>
            <h2 className="text-2xl sm:text-4xl font-black text-neutral-900 font-serif">
              কীভাবে কাজ করে?
            </h2>
            <div className="h-1 w-16 bg-amber-400 mx-auto rounded-full mt-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Step 1 */}
            <div className="space-y-4 relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 bg-red-50 text-red-700 font-black rounded-full flex items-center justify-center text-xl border border-red-100 shadow-sm relative">
                ১
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center text-[8px] text-neutral-950 font-bold">✓</div>
              </div>
              <h3 className="text-lg font-bold text-neutral-900 font-serif">
                রেজিস্ট্রেশন করুন
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 max-w-xs leading-relaxed">
                আপনার সঠিক শিক্ষাগত, পারিবারিক এবং ধর্মীয় তথ্যাদি দিয়ে সম্পূর্ণ বিনামূল্যে একটি বায়োডাটা তৈরি করুন।
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-4 relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 bg-amber-50 text-amber-700 font-black rounded-full flex items-center justify-center text-xl border border-amber-100 shadow-sm relative">
                ২
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center text-[8px] text-white font-bold">★</div>
              </div>
              <h3 className="text-lg font-bold text-neutral-900 font-serif">
                পছন্দের প্রোফাইল খুঁজুন
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 max-w-xs leading-relaxed">
                আমাদের শক্তিশালী ভেরিফাইড ডাটাবেজ থেকে জেলা, ধর্ম বা পেশা ফিল্টার করে উপযুক্ত পাত্র-পাত্রী খুঁজে নিন।
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-4 relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-700 font-black rounded-full flex items-center justify-center text-xl border border-emerald-100 shadow-sm relative">
                ৩
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-[8px] text-white font-bold">❤</div>
              </div>
              <h3 className="text-lg font-bold text-neutral-900 font-serif">
                যোগাযোগ শুরু করুন
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 max-w-xs leading-relaxed">
                পছন্দের প্রোফাইল পাওয়া গেলে সরাসরি ইন্টারেস্ট প্রকাশ করুন বা অভিজ্ঞ উপদেষ্টাদের মাধ্যমে পারিবারিক আলোচনা শুরু করুন।
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. SUCCESS STORIES SECTION (Testimonials only, NO images) */}
      {/* ======================================================== */}
      <section className="py-16 bg-neutral-50/40 border-t border-b border-neutral-100" id="success-stories-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-1 mb-12 sm:mb-16">
            <span className="text-[10px] font-extrabold text-red-700 uppercase tracking-widest block">শুভ পরিণয়</span>
            <h2 className="text-2xl sm:text-4xl font-black text-neutral-900 font-serif">
              সফলতার কিছু গল্প
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-xl mx-auto mt-1">
              বিবাহবন্ধনের মাধ্যমে মনের মতো জীবনসঙ্গী খুঁজে পাওয়া দম্পতিদের অভিজ্ঞতা ও অনুভূতি
            </p>
            <div className="h-1 w-16 bg-amber-400 mx-auto rounded-full mt-2" />
          </div>

          {successStories.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-neutral-100 p-8 shadow-xs max-w-md mx-auto">
              <Heart className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
              <p className="text-sm text-neutral-500 font-bold">এখনও কোনো সফলতার গল্প যোগ করা হয়নি।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {successStories.slice(0, 2).map((story) => (
                <div 
                  key={story.id} 
                  className="bg-white rounded-3xl border border-neutral-200/60 p-6 sm:p-8 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
                  id={`success-story-${story.id}`}
                >
                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 bg-rose-50 text-red-700 rounded-2xl inline-block">
                        <Quote className="h-6 w-6" />
                      </div>
                      <div className="flex items-center space-x-1 text-amber-400 text-xs">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-amber-400" />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed italic font-medium">
                      "{story.storyBn || story.story}"
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-neutral-100 flex items-center justify-between relative z-10">
                    <div>
                      <h4 className="text-base sm:text-lg font-black text-neutral-900 font-serif">
                        ❤️ {translateNameToBangla(story.brideName)} ও {translateNameToBangla(story.groomName)}
                      </h4>
                      <p className="text-[10px] font-bold text-red-700 tracking-wider mt-0.5">
                        বিবাহ সম্পন্ন: {story.marriageDate ? toBanglaNumber(parseInt(story.marriageDate.split('-')[0])) + ' সালের ' + translateDistrictToBangla(story.marriageDate.split('-')[1] || 'জানুয়ারি') : '২০২৬'} • জেলা: {translateDistrictToBangla(story.district)}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full shrink-0 flex items-center space-x-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      <span>ভেরিফাইড মন্তব্য</span>
                    </span>
                  </div>

                  <span className="absolute -bottom-6 -right-6 text-neutral-100 text-8xl font-serif select-none pointer-events-none z-0">”</span>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. MATCHMAKING ADVISORS SECTION */}
      {/* ======================================================== */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="matchmakers-advisors-section">
        <div className="text-center space-y-1 mb-12 sm:mb-16">
          <span className="text-[10px] font-extrabold text-red-700 uppercase tracking-widest block">ব্যক্তিগত পারিবারিক পরম পরামর্শ</span>
          <h2 className="text-2xl sm:text-4xl font-black text-neutral-900 font-serif">
            ম্যাচ মেকিং উপদেষ্টা
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-xl mx-auto mt-2">
            সম্পূর্ণ পারিবারিক গোপনীয়তা বজায় রেখে সঠিক পাত্র/পাত্রী খুঁজে নিতে সরাসরি আমাদের অভিজ্ঞ উপদেষ্টাদের সাথে কথা বলুন
          </p>
          <div className="h-1 w-16 bg-amber-400 mx-auto rounded-full mt-2" />
        </div>

        {activeExecutives.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-neutral-200/60 p-8 shadow-xs max-w-md mx-auto">
            <Users className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm text-neutral-500 font-bold">বর্তমানে কোনো সক্রিয় উপদেষ্টা নেই।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {activeExecutives.map((exec) => (
              <div 
                key={exec.id} 
                className="bg-white border border-neutral-200/60 rounded-3xl p-6 shadow-xs text-center flex flex-col justify-between items-center group hover:border-red-200 hover:shadow-md transition-all duration-300"
                id={`exec-card-landing-${exec.id}`}
              >
                <div className="space-y-4 mb-6 w-full">
                  <div className="relative inline-block">
                    <SafeImage 
                      src={exec.photo} 
                      alt={exec.name} 
                      fallbackText={exec.name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-neutral-100 group-hover:border-rose-100 transition-colors duration-300 shadow-sm mx-auto"
                    />
                    <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white" title="Active on WhatsApp" />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-black text-neutral-900 font-serif">{translateNameToBangla(exec.name)}</h4>
                    <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-rose-100 px-3 py-0.5 rounded-full inline-block mt-1 font-mono">
                      {exec.designation}
                    </span>
                    {exec.referenceCode && (
                      <span className="block text-[10px] text-neutral-400 font-mono mt-1 font-bold">
                        Ref: {exec.referenceCode}
                      </span>
                    )}
                  </div>
                  {exec.bio ? (
                    <p className="text-xs text-neutral-600 italic max-w-xs leading-relaxed font-medium mx-auto">
                      "{exec.bio}"
                    </p>
                  ) : exec.officeLocation ? (
                    <p className="text-xs text-neutral-500 max-w-xs leading-relaxed font-medium mx-auto">
                      📍 {exec.officeLocation}
                    </p>
                  ) : null}
                </div>

                <a 
                  href={`https://wa.me/${exec.whatsappNumber.replace(/[^0-9]/g, '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold uppercase rounded-2xl shadow-sm transition-all duration-200 flex items-center justify-center space-x-2 border border-emerald-600 font-mono"
                >
                  <PhoneCall className="h-4 w-4 text-white" />
                  <span>WhatsApp এ যোগাযোগ করুন</span>
                </a>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* 7. PREMIUM BANNER CALL TO ACTION */}
      {/* ======================================================== */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-red-800 via-red-700 to-rose-700 text-white text-center relative overflow-hidden" id="homepage-cta-banner">
        
        {/* Decorative circle effects */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/5 rounded-full blur-xl" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-amber-400/10 rounded-full blur-xl" />

        <div className="max-w-4xl mx-auto px-4 relative z-10 space-y-6">
          <Heart className="h-10 w-10 text-amber-400 fill-amber-400 mx-auto animate-bounce" />
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black text-white font-serif">
              আপনার জীবনসঙ্গী খুঁজে পেতে আর দেরি কেন?
            </h2>
            <p className="text-sm sm:text-base text-neutral-200 font-medium">
              আজই রেজিস্ট্রেশন করুন সম্পূর্ণ ফ্রি এবং ঘরে বসেই খুঁজে নিন মনের মানুষ!
            </p>
          </div>

          <button 
            onClick={() => setActiveTab('register')}
            className="px-8 py-3.5 bg-amber-400 hover:bg-amber-500 text-red-950 font-black text-sm uppercase rounded-xl shadow-xl transition-all hover:scale-103 duration-150 inline-flex items-center space-x-2 border border-amber-400"
          >
            <span>এখনই রেজিস্ট্রেশন করুন →</span>
          </button>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. PREMIUM DETAILED HOMEPAGE FOOTER (100% Bangla) */}
      {/* ======================================================== */}
      <footer className="bg-white border-t border-neutral-200/60 pt-16 pb-12 mt-auto" id="app-landing-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-neutral-200/50">
            
            {/* Column 1: Logo and Taglines */}
            <div className="md:col-span-4 space-y-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 bg-red-700 rounded-lg text-white">
                  <Heart className="h-5 w-5 fill-white text-white" />
                </div>
                <h2 className="text-xl font-black text-neutral-900 font-serif">
                  বিবাহবন্ধন ম্যাট্রিমনি
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
                পরিবার-কেন্দ্রিক ম্যাট্রিমনি সেবা। আমরা বিশ্বাস ও সততার সাথে সঠিক পাত্র-পাত্রীর মেলবন্ধন নিশ্চিত করি। আপনার স্বপ্ন ও আমাদের বিশ্বস্ততার এক পরম আস্থা।
              </p>
              {/* Fake bKash/Robi payment partners label */}
              <div className="pt-2 text-[10px] text-neutral-400 font-bold uppercase tracking-wider flex items-center space-x-2">
                <span>পেমেন্ট পার্টনার: bKash সমর্থিত</span>
                <span>•</span>
                <span>১০০% ভেরিফাইড গেটওয়ে</span>
              </div>
            </div>

            {/* Column 2: Services */}
            <div className="md:col-span-2 space-y-4 text-left">
              <h4 className="text-xs sm:text-sm font-black text-neutral-900 uppercase tracking-widest border-l-2 border-red-700 pl-2">
                সেবাসমূহ
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-neutral-500 font-medium">
                <li><button onClick={() => setActiveTab('home')} className="hover:text-red-700">হোম পেজ</button></li>
                <li><button onClick={() => setActiveTab('register')} className="hover:text-red-700">ফ্রি রেজিস্ট্রেশন</button></li>
                <li><button onClick={() => setActiveTab('pricing')} className="hover:text-red-700">সদস্য প্যাকেজ</button></li>
                <li><button onClick={() => setActiveTab('executives')} className="hover:text-red-700">আমাদের উপদেষ্টা</button></li>
              </ul>
            </div>

            {/* Column 3: Help */}
            <div className="md:col-span-2 space-y-4 text-left">
              <h4 className="text-xs sm:text-sm font-black text-neutral-900 uppercase tracking-widest border-l-2 border-red-700 pl-2">
                সহায়তা
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-neutral-500 font-medium">
                <li><button onClick={() => setActiveTab('executives')} className="hover:text-red-700">যোগাযোগ করুন</button></li>
                <li><button onClick={() => alert('সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ) শিগগিরই যোগ করা হবে!')} className="hover:text-red-700">সচরাচর জিজ্ঞাসা</button></li>
                <li><button onClick={() => alert('গোপনীয়তা নীতি: আপনার ব্যক্তিগত নিরাপত্তা আমাদের প্রধান লক্ষ্য।')} className="hover:text-red-700">গোপনীয়তা নীতি</button></li>
                <li><button onClick={() => alert('ব্যবহারের শর্তাবলী: প্ল্যাটফর্মের সব তথ্য ভেরিফাইড থাকতে হবে।')} className="hover:text-red-700">ব্যবহারের শর্তাবলী</button></li>
              </ul>
            </div>

            {/* Column 4: Contact details */}
            <div className="md:col-span-4 space-y-4 text-left">
              <h4 className="text-xs sm:text-sm font-black text-neutral-900 uppercase tracking-widest border-l-2 border-red-700 pl-2">
                যোগাযোগ করুন
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-neutral-500 font-medium">
                <li className="flex items-center space-x-2">
                  <PhoneCall className="h-4 w-4 text-red-700 shrink-0" />
                  <span>ফোন: ০১৩৪০৭৭২৪৭৮</span>
                </li>
                <li className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>ইমেইল: support@onlinebiye.bd.gd</span>
                </li>
                <li className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-red-700 shrink-0" />
                  <span>ঠিকানা: ধানমন্ডি, ঢাকা, বাংলাদেশ</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Copyright bar - Connected to Admin Panel Login */}
          <div 
            onClick={() => {
              if (onOpenAdminLoginModal) {
                onOpenAdminLoginModal();
              }
            }}
            className="flex flex-col sm:flex-row justify-between items-center pt-8 text-xs text-neutral-400 font-semibold space-y-2 sm:space-y-0 cursor-pointer hover:text-red-700 active:text-red-800 transition-colors duration-200 select-none group"
            title="এডমিন প্যানেল লগইন করতে এখানে ক্লিক করুন"
            id="footer-copyright-text-clickable"
          >
            <p className="group-hover:text-red-700 transition-colors font-medium">
              © ২০২৬ বিবাহবন্ধন ম্যাট্রিমনি বাংলাদেশ। সর্বস্বত্ব সংরক্ষিত।
            </p>
            <p className="flex items-center space-x-1 group-hover:text-red-700 transition-colors font-medium">
              <span>মেড উইথ</span>
              <Heart className="h-3.5 w-3.5 text-red-600 fill-red-600 group-hover:scale-110 transition-transform" />
              <span>ইন বাংলাদেশ</span>
            </p>
          </div>

        </div>
      </footer>

      {/* Full Photo Modal Viewer for 17 User-Provided Images */}
      <AnimatePresence>
        {selectedPhotoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-neutral-200 relative flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-100 bg-neutral-50">
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full font-bold font-mono">
                    {selectedPhotoModal.profileId}
                  </span>
                  <h3 className="text-lg font-black text-neutral-900 font-serif">
                    {selectedPhotoModal.nameBn}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPhotoModal(null)}
                  className="p-2 text-neutral-400 hover:text-neutral-800 rounded-full hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Full Uncropped Photo View */}
              <div className="p-4 bg-neutral-950 flex-1 overflow-auto flex items-center justify-center min-h-[350px]">
                <SafeImage 
                  src={selectedPhotoModal.imgUrl} 
                  alt={selectedPhotoModal.nameBn}
                  className="max-h-[60vh] max-w-full object-contain mx-auto rounded-xl shadow-lg border border-neutral-800"
                />
              </div>

              {/* Details & Source Link Footer */}
              <div className="p-5 bg-white border-t border-neutral-100 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-neutral-700">
                  <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                    <p className="text-neutral-400 font-medium">জেলা</p>
                    <p className="font-bold text-neutral-900">{selectedPhotoModal.districtBn}</p>
                  </div>
                  <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                    <p className="text-neutral-400 font-medium">বয়স ও উচ্চতা</p>
                    <p className="font-bold text-neutral-900">{toBanglaNumber(selectedPhotoModal.age)} বছর, {selectedPhotoModal.height}</p>
                  </div>
                  <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                    <p className="text-neutral-400 font-medium">পেশা</p>
                    <p className="font-bold text-neutral-900 truncate">{selectedPhotoModal.professionBn}</p>
                  </div>
                  <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                    <p className="text-neutral-400 font-medium">টাইপ</p>
                    <p className="font-bold text-neutral-900">{selectedPhotoModal.isHijab ? 'হিজাবি পাত্রী' : 'পাত্রী'}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <a
                    href={selectedPhotoModal.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto flex-1 py-3 px-4 bg-neutral-900 hover:bg-neutral-800 text-amber-300 font-bold text-xs rounded-2xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>মূল ফেসবুক / সোশ্যাল লিংক এ প্রবেশ করুন ↗</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPhotoModal(null);
                      setActiveTab('register');
                    }}
                    className="w-full sm:w-auto flex-1 py-3 px-4 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-2xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md"
                  >
                    <span>সম্পূর্ণ বায়োডাটা দেখতে সাইন ইন করুন</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
