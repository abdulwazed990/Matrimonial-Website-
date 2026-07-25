import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { MapPin, ShieldCheck } from 'lucide-react';

interface SearchMatchesProps {
  language: 'en' | 'bn';
  users: User[];
  onSelectProfile: (user: User) => void;
  initialFilters?: {
    gender: string;
    religion: string;
    district: string;
    minAge: number;
    maxAge: number;
  };
}

export default function SearchMatches({
  language,
  users,
  onSelectProfile,
  initialFilters,
}: SearchMatchesProps) {
  const [gender, setGender] = useState<'Bride' | 'Groom'>('Bride');

  // Sync initial filters if available
  useEffect(() => {
    if (initialFilters?.gender) {
      setGender(initialFilters.gender as 'Bride' | 'Groom');
    }
  }, [initialFilters]);

  // Filter users by gender only (filters panel removed per prompt requirement)
  const filteredUsers = users.filter((u) => u.gender === gender);

  const text = {
    title: language === 'en' ? 'Verified Matrimonial Proposals' : 'ভেরিফাইড পাত্র-পাত্রী তালিকা',
    sub: language === 'en' ? 'Select a candidate profile to view full biodata parameters and connect.' : 'সরাসরি প্রোফাইল নির্বাচন করে সম্পূর্ণ বায়োডাটা পর্যবেক্ষণ করুন।',
    bridesTab: language === 'en' ? '👰 Brides (কনে)' : '👰 কনে (Brides)',
    groomsTab: language === 'en' ? '🤵 Grooms (বর)' : '🤵 বর (Grooms)',
    resultsLabel: language === 'en' ? 'Available Profiles' : 'উপলব্ধ পাত্র/পাত্রী',
    viewProfile: language === 'en' ? 'View Full Profile' : 'বিস্তারিত প্রোফাইল',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12" id="search-matches-root">
      
      {/* Title */}
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-serif">{text.title}</h2>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-xl mx-auto">{text.sub}</p>
      </div>

      {/* Gender Toggle Tabs */}
      <div className="flex justify-center mb-10" id="match-gender-toggle-bar">
        <div className="bg-neutral-100 p-1.5 rounded-2xl border border-neutral-200/80 inline-flex space-x-2">
          <button
            onClick={() => setGender('Bride')}
            className={`py-2.5 px-6 sm:px-8 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 cursor-pointer ${
              gender === 'Bride'
                ? 'bg-neutral-900 text-white shadow-md'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {text.bridesTab}
          </button>
          <button
            onClick={() => setGender('Groom')}
            className={`py-2.5 px-6 sm:px-8 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 cursor-pointer ${
              gender === 'Groom'
                ? 'bg-neutral-900 text-white shadow-md'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {text.groomsTab}
          </button>
        </div>
      </div>

      {/* CANDIDATES GRID */}
      <div className="space-y-6" id="search-results-panel">
        
        <div className="flex justify-between items-baseline border-b border-neutral-200/60 pb-3">
          <h3 className="font-extrabold text-neutral-900 text-base font-serif">
            {text.resultsLabel} ({filteredUsers.length})
          </h3>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-16 bg-white border border-neutral-200/60 rounded-3xl shadow-xs text-center text-neutral-400 font-medium">
            No profiles found under this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <div 
                key={user.id} 
                className="bg-white border border-neutral-200/60 rounded-2xl shadow-xs hover:shadow-md hover:border-neutral-350 transition-all duration-300 overflow-hidden flex flex-col group relative"
                id={`search-match-card-${user.profileId}`}
              >
                <div className="h-32 bg-neutral-100 relative">
                  <img 
                    src={user.coverPhoto} 
                    alt="" 
                    className="w-full h-full object-cover filter brightness-95 group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-full text-[9px] font-bold text-neutral-900 uppercase tracking-widest border border-neutral-200/50 shadow-xs flex items-center space-x-1 font-mono">
                    <MapPin className="h-3 w-3 text-red-600" />
                    <span>{user.district}</span>
                  </div>

                  {user.isVIP && (
                    <div className="absolute top-2.5 right-2.5 bg-amber-500 text-white px-2 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-wider font-mono shadow-xs">
                      👑 VIP
                    </div>
                  )}
                  {!user.isVIP && user.isPremium && (
                    <div className="absolute top-2.5 right-2.5 bg-red-700 text-white px-2 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-wider font-mono shadow-xs">
                      💎 PREM
                    </div>
                  )}
                </div>

                <div className="px-5 pb-5 pt-0 relative flex-1 flex flex-col">
                  <div className="relative -mt-10 mb-3 flex items-end justify-between">
                    <img 
                      src={user.profilePicture} 
                      alt={user.name} 
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-xs"
                      referrerPolicy="no-referrer"
                    />
                    {user.status === 'verified' && (
                      <div className="bg-emerald-50 text-emerald-800 font-bold text-[9px] px-2.5 py-1 rounded-full border border-emerald-100 flex items-center space-x-1 font-mono uppercase">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Verified</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-0.5 mb-3">
                    <h4 className="text-base font-bold text-neutral-900 font-serif group-hover:text-red-700 transition-colors duration-150">
                      {user.name}
                    </h4>
                    <p className="text-[9px] text-red-700 font-bold uppercase font-mono tracking-widest">{user.profileId}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2.5 gap-x-2 py-3 border-t border-b border-neutral-100 my-3 text-[11px] font-medium text-neutral-500 flex-1">
                    <div>
                      <span className="text-neutral-400 block text-[9px] uppercase font-bold font-mono">Age / Height</span>
                      <span className="text-neutral-800">{user.age} Yrs • {user.height}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[9px] uppercase font-bold font-mono">Religion</span>
                      <span className="text-neutral-800 truncate block">{user.religion}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[9px] uppercase font-bold font-mono">Marital Status</span>
                      <span className="text-neutral-800">{user.maritalStatus}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[9px] uppercase font-bold font-mono">Profession</span>
                      <span className="text-neutral-800 truncate block">{user.profession}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => onSelectProfile(user)}
                    className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    {text.viewProfile}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}
