import React, { useState } from 'react';
import { Executive, User, PaymentRecord } from '../types';
import SafeImage from './SafeImage';
import { PhoneCall, ShieldCheck, Award, MapPin, Hash, Phone, Image as ImageIcon, X } from 'lucide-react';

interface ExecutiveSectionProps {
  language: 'en' | 'bn';
  executives: Executive[];
  users?: User[];
  payments?: PaymentRecord[];
}

export default function ExecutiveSection({ language, executives, users = [], payments = [] }: ExecutiveSectionProps) {
  const [activeGalleryExec, setActiveGalleryExec] = useState<Executive | null>(null);

  const activeExecutives = executives.filter((e) => e.isActive);

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
      </div>

      {/* DIRECTORY GRID */}
      {activeExecutives.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200/80 p-8 shadow-xs max-w-md mx-auto space-y-3">
          <Award className="h-10 w-10 text-neutral-300 mx-auto" />
          <p className="text-sm sm:text-base text-neutral-600 font-bold font-serif">
            {language === 'en' ? 'No active executives registered at this time.' : 'বর্তমানে কোনো সক্রিয় এক্সিকিউটিভ নেই।'}
          </p>
        </div>
      ) : (
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
      )}

      {/* GALLERY MODAL */}
      {activeGalleryExec && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setActiveGalleryExec(null)}
              className="absolute top-4 right-4 h-8 w-8 bg-neutral-100 hover:bg-neutral-200 rounded-full flex items-center justify-center text-neutral-600 font-bold"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-lg font-bold font-serif text-neutral-900">
              {activeGalleryExec.name} - ফটো গ্যালারি
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto">
              {activeGalleryExec.galleryPhotos?.map((photo, i) => (
                <img
                  key={i}
                  src={photo}
                  alt={`Exec gallery ${i}`}
                  className="w-full h-36 object-cover rounded-xl border border-neutral-200"
                />
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
