import React, { useState, useRef } from 'react';
import { User } from '../types';
import SafeImage from './SafeImage';
import { BANGLADESH_LOCATIONS, MUSIC_CATALOG } from '../data';
import { 
  ArrowLeft, Upload, Camera, Image as ImageIcon, MapPin, Music, 
  Send, X, Sparkles, CheckCircle2, ShieldAlert, Disc, Play, Pause 
} from 'lucide-react';

interface CreatePostProps {
  language: 'en' | 'bn';
  currentUser: User | null;
  onAddPost: (
    content: string, 
    image?: string, 
    location?: string, 
    music?: { id?: string; title: string; artist: string; audioUrl?: string; coverUrl?: string }
  ) => void;
  onCancel: () => void;
}

export default function CreatePost({
  language,
  currentUser,
  onAddPost,
  onCancel,
}: CreatePostProps) {
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [location, setLocation] = useState('');
  const [selectedMusic, setSelectedMusic] = useState<{ id?: string; title: string; artist: string; audioUrl?: string; coverUrl?: string } | null>(null);

  // Modals & Selectors
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [customLocation, setCustomLocation] = useState('');
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [musicQuery, setMusicQuery] = useState('');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isPending = currentUser?.status === 'pending';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const togglePlayAudio = (id: string, audioUrl?: string) => {
    if (!audioUrl) return;
    if (playingAudioId === id) {
      if (audioRef.current) audioRef.current.pause();
      setPlayingAudioId(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.play().catch(e => console.log('Audio error:', e));
      audio.onended = () => setPlayingAudioId(null);
      setPlayingAudioId(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !image) return;
    if (isPending) return;

    onAddPost(
      content,
      image || undefined,
      location || undefined,
      selectedMusic || undefined
    );
    onCancel(); // Navigate back to feed
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8 space-y-6" id="dedicated-create-post-page">
      
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between bg-white border border-neutral-200 rounded-2xl p-4 shadow-xs">
        <button
          onClick={onCancel}
          className="flex items-center space-x-2 text-xs sm:text-sm font-bold font-mono text-neutral-700 hover:text-neutral-950 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{language === 'en' ? 'Back to Feed' : 'ফিডে ফিরে যান'}</span>
        </button>

        <h1 className="text-base sm:text-lg font-bold font-serif text-neutral-950 flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-amber-500 fill-amber-500" />
          <span>{language === 'en' ? 'Create New Post' : 'নতুন পোস্ট তৈরি করুন'}</span>
        </h1>

        <div className="w-10"></div> {/* Spacer for symmetry */}
      </div>

      {/* Main Create Post Card */}
      <form onSubmit={handleSubmit} className="bg-white border border-neutral-200/90 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6">
        
        {/* User Badge Bar */}
        <div className="flex items-center space-x-3.5 pb-4 border-b border-neutral-100">
          <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-neutral-200 shrink-0">
            <SafeImage
              src={currentUser.profilePicture}
              alt={currentUser.name}
              gender={currentUser.gender}
              fallbackText={currentUser.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-neutral-950 font-serif text-base">{currentUser.name}</h3>
              {currentUser.status === 'verified' && (
                <CheckCircle2 className="h-4 w-4 fill-neutral-900 text-white" />
              )}
            </div>
            <div className="flex items-center space-x-2 text-[11px] font-mono text-neutral-500">
              <span className="bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-md font-bold text-neutral-700">
                🌐 {language === 'en' ? 'Public Post' : 'পাবলিক পোস্ট'}
              </span>
              <span>•</span>
              <span className="font-bold uppercase text-red-700">{currentUser.profileId}</span>
            </div>
          </div>
        </div>

        {/* Warning for Pending Users */}
        {isPending && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-3 text-red-900">
            <ShieldAlert className="h-6 w-6 text-red-600 shrink-0" />
            <p className="text-xs font-mono font-bold leading-relaxed">
              {language === 'en'
                ? "Your account approval is pending. Post creation will be activated once admin confirms payment."
                : "আপনার অ্যাকাউন্টের পেমেন্ট ভেরিফিকেশন পেন্ডিং আছে। অ্যাডমিন থেকে অনুমোদন পাওয়ার পর পোস্ট প্রকাশ করা যাবে।"}
            </p>
          </div>
        )}

        {/* Text Area for Caption */}
        <div className="space-y-2">
          <label className="block text-xs font-bold font-mono text-neutral-700 uppercase tracking-wider">
            {language === 'en' ? 'Write Caption / Message' : 'পোস্টের বার্তা বা বিবরণ লিখুন'}
          </label>
          <textarea
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              language === 'en'
                ? 'Share your life values, matrimonial expectations, or daily updates with members...'
                : 'আপনার বিবাহের চিন্তাভাবনা, জীবনের লক্ষ্য বা সুন্দর মুহূর্ত নিয়ে লিখুন...'
            }
            className="w-full bg-neutral-50/80 border border-neutral-200/90 rounded-2xl p-4 text-sm sm:text-base text-neutral-900 focus:outline-none focus:border-neutral-950 focus:bg-white transition-all font-sans leading-relaxed"
          />
          <div className="flex justify-between items-center text-[11px] font-mono text-neutral-400 px-1">
            <span>{content.length} characters</span>
            <span>{language === 'en' ? 'Markdown formatting supported' : 'সুন্দর করে গুছিয়ে লিখুন'}</span>
          </div>
        </div>

        {/* Image / Gallery Upload Area */}
        <div className="space-y-3">
          <label className="block text-xs font-bold font-mono text-neutral-700 uppercase tracking-wider">
            {language === 'en' ? 'Attach Photo from Gallery or Camera' : 'গ্যালারি বা ক্যামেরা থেকে ছবি যুক্ত করুন'}
          </label>

          {image ? (
            <div className="relative rounded-2xl overflow-hidden max-h-80 bg-neutral-900/5 border border-neutral-200 flex items-center justify-center p-2">
              <img src={image} alt="Preview" className="max-h-72 w-auto object-contain rounded-xl" />
              <button
                type="button"
                onClick={() => setImage('')}
                className="absolute top-4 right-4 bg-neutral-900/80 hover:bg-neutral-950 text-white p-2 rounded-full transition-all cursor-pointer shadow-md"
                title="ছবিটি সরান"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Device Gallery Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-5 border-2 border-dashed border-neutral-300 hover:border-neutral-900 rounded-2xl bg-neutral-50/50 hover:bg-neutral-100/80 transition-all flex flex-col items-center justify-center space-y-2 cursor-pointer text-center group"
              >
                <div className="w-12 h-12 rounded-full bg-neutral-100 group-hover:bg-neutral-200 flex items-center justify-center text-neutral-800 transition-colors">
                  <Upload className="h-6 w-6" />
                </div>
                <div>
                  <span className="block font-bold text-xs text-neutral-900 font-mono">
                    {language === 'en' ? 'Upload from Gallery' : 'গ্যালারি থেকে ফটো আপলোড'}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">PNG, JPG, WEBP up to 10MB</span>
                </div>
              </button>

              {/* Camera Capture Button */}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="p-5 border-2 border-dashed border-neutral-300 hover:border-neutral-900 rounded-2xl bg-neutral-50/50 hover:bg-neutral-100/80 transition-all flex flex-col items-center justify-center space-y-2 cursor-pointer text-center group"
              >
                <div className="w-12 h-12 rounded-full bg-neutral-100 group-hover:bg-neutral-200 flex items-center justify-center text-neutral-800 transition-colors">
                  <Camera className="h-6 w-6" />
                </div>
                <div>
                  <span className="block font-bold text-xs text-neutral-900 font-mono">
                    {language === 'en' ? 'Take Photo via Camera' : 'ক্যামেরা দিয়ে ফটো তুলুন'}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">Direct camera input</span>
                </div>
              </button>
            </div>
          )}

          {/* Hidden Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        {/* Location & Music Optional Chips */}
        <div className="pt-2 border-t border-neutral-100 space-y-3">
          <label className="block text-xs font-bold font-mono text-neutral-700 uppercase tracking-wider">
            {language === 'en' ? 'Location & Background Tune' : 'লোকেশন এবং মিউজিক সংযুক্তি'}
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowLocationModal(true)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono border flex items-center space-x-2 transition-all cursor-pointer ${
                location 
                  ? 'bg-red-50 text-red-900 border-red-300' 
                  : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              <MapPin className="h-4 w-4 text-red-600" />
              <span>{location ? `📍 ${location}` : (language === 'en' ? 'Add Location' : 'লোকেশন যোগ করুন')}</span>
              {location && (
                <X 
                  className="h-3.5 w-3.5 ml-1 text-red-600 hover:text-red-950" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setLocation('');
                  }}
                />
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowMusicModal(true)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono border flex items-center space-x-2 transition-all cursor-pointer ${
                selectedMusic 
                  ? 'bg-purple-50 text-purple-900 border-purple-300' 
                  : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              <Music className="h-4 w-4 text-purple-600" />
              <span>
                {selectedMusic 
                  ? `🎵 ${selectedMusic.title}` 
                  : (language === 'en' ? 'Attach Music Tune' : 'মিউজিক সংযোজন করুন')}
              </span>
              {selectedMusic && (
                <X 
                  className="h-3.5 w-3.5 ml-1 text-purple-600 hover:text-purple-950" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMusic(null);
                  }}
                />
              )}
            </button>
          </div>
        </div>

        {/* Submit & Cancel Action Bar */}
        <div className="pt-6 border-t border-neutral-200 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold rounded-2xl font-mono text-xs transition-all cursor-pointer text-center"
          >
            {language === 'en' ? 'Cancel' : 'বাতিল করুন'}
          </button>

          <button
            type="submit"
            disabled={(!content.trim() && !image) || isPending}
            className={`w-full sm:w-auto px-8 py-3.5 bg-neutral-950 hover:bg-neutral-800 text-white font-bold rounded-2xl shadow-md uppercase tracking-wider flex items-center justify-center space-x-2 font-mono text-xs transition-all cursor-pointer ${
              (!content.trim() && !image) || isPending ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Send className="h-4 w-4" />
            <span>{language === 'en' ? 'Publish Post Now' : 'পোস্ট শেয়ার করুন'}</span>
          </button>
        </div>
      </form>

      {/* ---------------------------------------------------- */}
      {/* LOCATION PICKER MODAL                                */}
      {/* ---------------------------------------------------- */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-neutral-200">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-900 font-serif text-base flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-red-600" />
                <span>স্থান নির্বাচন করুন (Select Location)</span>
              </h3>
              <button onClick={() => setShowLocationModal(false)} className="text-neutral-400 hover:text-neutral-900 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-bold font-mono text-neutral-700">কাস্টম ঠিকানা লিখুন:</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                    placeholder="যেমন: ধানমন্ডি, ঢাকা"
                    className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-sans focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customLocation.trim()) {
                        setLocation(customLocation.trim());
                        setCustomLocation('');
                        setShowLocationModal(false);
                      }
                    }}
                    className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold font-mono cursor-pointer"
                  >
                    সেভ
                  </button>
                </div>
              </div>

              <div className="border-t border-neutral-100 pt-2">
                <p className="text-[11px] font-bold font-mono text-neutral-400 mb-2">বাংলাদেশি জেলাসমূহ:</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {BANGLADESH_LOCATIONS.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => {
                        setLocation(loc);
                        setShowLocationModal(false);
                      }}
                      className="text-left px-3 py-2 rounded-xl text-xs font-mono font-semibold bg-neutral-50 hover:bg-red-50 hover:text-red-900 transition-all cursor-pointer border border-neutral-100"
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MUSIC PICKER MODAL                                   */}
      {/* ---------------------------------------------------- */}
      {showMusicModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-neutral-200">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-900 font-serif text-base flex items-center space-x-2">
                <Music className="h-5 w-5 text-purple-600" />
                <span>মিউজিক যোগ করুন (Select Tune)</span>
              </h3>
              <button onClick={() => setShowMusicModal(false)} className="text-neutral-400 hover:text-neutral-900 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <input
              type="text"
              value={musicQuery}
              onChange={(e) => setMusicQuery(e.target.value)}
              placeholder="গান বা সুর খুঁজুন..."
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none"
            />

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {MUSIC_CATALOG.filter(m => m.title.toLowerCase().includes(musicQuery.toLowerCase()) || m.artist.toLowerCase().includes(musicQuery.toLowerCase())).map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-neutral-50 hover:bg-purple-50 transition-all border border-neutral-100"
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => togglePlayAudio(m.id, m.audioUrl)}
                      className="w-9 h-9 rounded-full bg-purple-900 text-white flex items-center justify-center shrink-0 hover:scale-105 transition-all cursor-pointer"
                    >
                      {playingAudioId === m.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                    </button>
                    <div className="truncate">
                      <h5 className="text-xs font-bold text-neutral-900 font-mono truncate">{m.title}</h5>
                      <p className="text-[10px] text-neutral-500 font-mono truncate">{m.artist}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMusic(m);
                      setShowMusicModal(false);
                    }}
                    className="px-3 py-1.5 bg-neutral-950 text-white rounded-xl text-[11px] font-bold font-mono hover:bg-purple-900 transition-all cursor-pointer shrink-0"
                  >
                    সিলেক্ট
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
