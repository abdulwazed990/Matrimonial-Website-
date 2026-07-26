import React, { useState } from 'react';
import { User, PackageType, PaymentRecord } from '../types';
import { MEMBERSHIP_PACKAGES, DISTRICT_LIST, RELIGION_LIST, SEED_EXECUTIVES } from '../data';
import { ShieldCheck, CreditCard, UserPlus, CheckCircle2, AlertTriangle, Image as ImageIcon, Plus, ArrowRight, ArrowLeft, Copy, Check, Smartphone, Flame, Upload, Trash2, Camera } from 'lucide-react';

interface RegistrationFlowProps {
  language: 'en' | 'bn';
  onRegisterComplete: (newUser: User, initialPayment: PaymentRecord) => void;
  onSavePendingPayment?: (payment: PaymentRecord) => void;
  initialPackageId?: string;
  initialMobileNumber?: string;
}

export default function RegistrationFlow({ language, onRegisterComplete, onSavePendingPayment, initialPackageId, initialMobileNumber }: RegistrationFlowProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Package, 2: Payment Gateway, 3: Success, 4: Registration Form
  
  // Registration success popup modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [pendingUserAndPayment, setPendingUserAndPayment] = useState<{ newUser: User; initialPayment: PaymentRecord } | null>(null);
  
  const [selectedPackage, setSelectedPackage] = useState(() => {
    if (initialPackageId) {
      const found = MEMBERSHIP_PACKAGES.find(p => p.id === initialPackageId);
      if (found) return found;
    }
    return MEMBERSHIP_PACKAGES[0];
  });

  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [transactionId, setTransactionId] = useState('');
  const [tempTxId, setTempTxId] = useState('');
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);
  const [gatewaySubStep, setGatewaySubStep] = useState<1 | 2 | 3>(1);
  
  const [paidAmount, setPaidAmount] = useState(() => {
    if (initialPackageId) {
      const found = MEMBERSHIP_PACKAGES.find(p => p.id === initialPackageId);
      if (found) return found.price.toString();
    }
    return '50';
  });

  const [paymentError, setPaymentError] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Backward compatibility mock states
  const [isBkashModalOpen, setIsBkashModalOpen] = useState(false);
  const [bkashStep, setBkashStep] = useState<number>(1);
  const [showSmsNotification, setShowSmsNotification] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'Bride' | 'Groom'>('Bride');
  const [dob, setDob] = useState('');
  const [religion, setReligion] = useState('Islam (Sunni)');
  const [maritalStatus, setMaritalStatus] = useState('Never Married');
  const [height, setHeight] = useState("5'4\"");
  const [weight, setWeight] = useState(55);
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [education, setEducation] = useState('');
  const [profession, setProfession] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState(40000);
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [presentAddress, setPresentAddress] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [district, setDistrict] = useState('Dhaka');
  const [mobileNumber, setMobileNumber] = useState(initialMobileNumber || '');
  const [whatsappNumber, setWhatsappNumber] = useState(initialMobileNumber || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [execRefCode, setExecRefCode] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [aboutYourself, setAboutYourself] = useState('');

  // Partner Preferences
  const [partnerReligion, setPartnerReligion] = useState('Islam (Sunni)');
  const [partnerMinAge, setPartnerMinAge] = useState(20);
  const [partnerMaxAge, setPartnerMaxAge] = useState(35);
  const [partnerMinHeight, setPartnerMinHeight] = useState("5'2\"");
  const [partnerEducation, setPartnerEducation] = useState('Graduation');
  const [partnerDistrict, setPartnerDistrict] = useState('Dhaka');
  const [partnerMaritalStatus, setPartnerMaritalStatus] = useState('Never Married');

  // Pictures (Direct mobile gallery file upload)
  const [profilePic, setProfilePic] = useState('');
  const [coverPic, setCoverPic] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [formError, setFormError] = useState('');

  const merchantNumber = '01340772478';

  const handleOpenGatewayModal = (method: 'bKash' | 'Nagad' | 'Rocket') => {
    const code = execRefCode.trim().toUpperCase();
    if (code) {
      const matched = SEED_EXECUTIVES.find(e => e.isActive && e.referenceCode.toUpperCase() === code);
      if (!matched) {
        alert(language === 'en'
          ? 'Invalid Executive Referral Code! Please enter a valid code (e.g. WAZED990, RAHIM102, AKASH501, TANIA220) or clear the field.'
          : 'অকার্যকর রেফারেল কোড! অনুগ্রহ করে সঠিক এক্সিকিউটিভ কোড লিখুন (যেমন: WAZED990, RAHIM102, AKASH501, TANIA220) অথবা ফিল্ডটি ফাঁকা রাখুন।');
        return;
      }
    }
    setPaymentMethod(method);
    setTempTxId('');
    setGatewaySubStep(1);
    setPaymentError('');
    setIsGatewayOpen(true);
  };

  const handleGenderChange = (selected: 'Bride' | 'Groom') => {
    setGender(selected);
  };

  const handleProfilePicFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfilePic(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray: File[] = Array.from(files);
      fileArray.forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setGalleryImages((prev) => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleCopy = (val: string, field: string) => {
    navigator.clipboard.writeText(val);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleAutoFill = () => {
    const isBk = paymentMethod === 'bKash';
    const randomTx = isBk
      ? 'BK' + Math.random().toString(36).substring(2, 10).toUpperCase()
      : 'NG' + Math.random().toString(36).substring(2, 10).toUpperCase();
    setTransactionId(randomTx);
    setTempTxId(randomTx);
    setPaidAmount(selectedPackage.price.toString());
    
    // Set simulated feedback
    setCopiedField('autofill');
    setTimeout(() => setCopiedField(null), 3000);
  };

  const handleGatewayAutoFill = (method: 'bKash' | 'Nagad') => {
    const randomTx = method === 'bKash'
      ? 'BK' + Math.random().toString(36).substring(2, 10).toUpperCase()
      : 'NG' + Math.random().toString(36).substring(2, 10).toUpperCase();
    setTempTxId(randomTx);
    setCopiedField('autofill_popup');
    setTimeout(() => setCopiedField(null), 3000);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      setPaymentError(language === 'en' ? 'Please provide a valid Transaction ID.' : 'দয়া করে সঠিক ট্রানজেকশন আইডি দিন।');
      return;
    }
    if (transactionId.length < 8) {
      setPaymentError(language === 'en' ? 'Transaction ID must be at least 8 alphanumeric characters.' : 'ট্রানজেকশন আইডি কমপক্ষে ৮টি অক্ষরের হতে হবে।');
      return;
    }
    if (parseInt(paidAmount) !== selectedPackage.price) {
      setPaymentError(language === 'en' ? `Paid amount must match the package price (৳${selectedPackage.price}).` : `পরিশোধিত মূল্য অবশ্যই প্যাকেজ মূল্যের (৳${selectedPackage.price}) সমান হতে হবে।`);
      return;
    }
    setPaymentError('');
    setStep(3); // Go to Payment successful
  };

  const handleRegistrationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !dob || !mobileNumber.trim() || !password.trim()) {
      setFormError(language === 'en' ? 'Please fill in Name, DOB, Mobile Number and Password.' : 'দয়া করে আপনার নাম, জন্ম তারিখ, মোবাইল নম্বর এবং পাসওয়ার্ড প্রদান করুন।');
      return;
    }
    if (password !== confirmPassword) {
      setFormError(language === 'en' ? 'Passwords do not match.' : 'পাসওয়ার্ড দুটি মেলেনি।');
      return;
    }

    setFormError('');

    const profileId = 'BB-' + Math.floor(100000 + Math.random() * 900000);

    // Calculate age from dob
    const birthYear = new Date(dob).getFullYear();
    const currentYear = new Date().getFullYear();
    const age = Math.max(currentYear - birthYear, 18);

    const newUser: User = {
      id: `user-${Date.now()}`,
      profileId,
      name: fullName,
      email: email.trim() || `${mobileNumber.trim()}@bibahobondhon.com`,
      gender,
      dob,
      age,
      religion,
      maritalStatus,
      height,
      weight,
      bloodGroup,
      education: education.trim() || 'Graduate',
      profession: profession.trim() || 'Private Service',
      monthlyIncome,
      fatherName,
      motherName,
      presentAddress,
      permanentAddress,
      district,
      mobileNumber: mobileNumber.trim(),
      whatsappNumber: whatsappNumber.trim() || mobileNumber.trim(),
      password: password.trim(),
      lookingFor: lookingFor || 'A suitable partner.',
      aboutYourself: aboutYourself || 'Family oriented individual.',
      partnerPreference: {
        religion: partnerReligion,
        minAge: partnerMinAge,
        maxAge: partnerMaxAge,
        minHeight: partnerMinHeight,
        education: partnerEducation,
        district: partnerDistrict,
        maritalStatus: partnerMaritalStatus,
      },
      profilePicture: profilePic,
      coverPhoto: coverPic,
      galleryPhotos: galleryImages.length > 0 ? galleryImages : [profilePic],
      packageId: selectedPackage.id as PackageType,
      status: 'pending', // Set to pending to require admin manual approval
      isPremium: false,
      isVIP: false,
      isFeatured: false,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${profileId}`,
      completionPercentage: 100,
      followers: [],
      following: [],
      interestsSent: [],
      interestsReceived: [],
      executiveReferenceCode: execRefCode.trim().toUpperCase() || undefined,
      registrationDate: new Date().toISOString(),
    };

    const initialPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      transactionId: transactionId.toUpperCase(),
      amount: selectedPackage.price,
      paymentMethod,
      membershipPackage: selectedPackage.id as PackageType,
      profileId,
      userName: fullName,
      userMobile: mobileNumber,
      paymentTime: new Date().toISOString(),
      status: 'pending', // Set to pending to require admin manual approval
      executiveRefCode: execRefCode.trim().toUpperCase() || undefined,
      isIncompleteRegistration: false,
    };

    setPendingUserAndPayment({ newUser, initialPayment });
    setShowSuccessModal(true);
  };

  const addGalleryImage = (url: string) => {
    setGalleryImages([...galleryImages, url]);
  };

  const text = {
    step1Title: language === 'en' ? 'Step 1: Select Basic Registration Package' : 'ধাপ ১: বেসিক রেজিস্ট্রেশন প্যাকেজ নির্বাচন',
    step2Title: language === 'en' ? 'Step 2: Premium Payment Gateway' : 'ধাপ ২: প্রিমিয়াম পেমেন্ট গেটওয়ে',
    step3Title: language === 'en' ? 'Step 3: Payment Verification Pending' : 'ধাপ ৩: পেমেন্ট ভেরিফিকেশন প্রক্রিয়াধীন',
    step4Title: language === 'en' ? 'Step 4: Build Your Matrimonial Profile' : 'ধাপ ৪: আপনার জীবনসঙ্গী প্রোফাইল তৈরি করুন',
    instructionPayment: language === 'en' 
      ? `Send ৳${selectedPackage.price} to our official Merchant Account. Copy the Transaction ID from the SMS and paste below.`
      : `আমাদের অফিশিয়াল মার্চেন্ট নম্বরে ৳${selectedPackage.price} পেমেন্ট করুন। তারপর এসএমএস থেকে ট্রানজেকশন আইডি কপি করে নিচে পেস্ট করুন।`,
    checkoutTitle: language === 'en' ? 'Secure Matrimonial Checkout' : 'নিরাপদ ম্যাট্রিমোনিয়াল চেকআউট',
    mandatoryNotice: language === 'en'
      ? 'A minimum fee of ৳50 (Basic Package) is required to secure registrations from fake spam profiles.'
      : 'ভুয়ো প্রোফাইল প্রতিরোধে ন্যূনতম ৫০ টাকার বেসিক প্ল্যান নিয়ে নিবন্ধন শুরু করা বাধ্যতামূলক।',
    payWith: language === 'en' ? 'Choose Wallet' : 'ওয়ালেট নির্বাচন করুন',
    merchantNum: language === 'en' ? 'Merchant Number (Personal/Merchant)' : 'মার্চেন্ট নম্বর (পার্সোনাল/মার্চেন্ট)',
    txId: language === 'en' ? 'Transaction ID' : 'ট্রানজেকশন আইডি (TxnID)',
    amountLabel: language === 'en' ? 'Amount (BDT)' : 'পরিমাণ (টাকা)',
    verifyBtn: language === 'en' ? 'Verify Payment' : 'পেমেন্ট ভেরিফাই করুন',
    backBtn: language === 'en' ? 'Go Back' : 'ফিরে যান',
    congrats: language === 'en' ? 'Payment Registered Successfully!' : 'পেমেন্ট সফলভাবে নিবন্ধিত হয়েছে!',
    congratsSub: language === 'en' 
      ? 'Your payment request has been received. Please proceed to fill out your detailed matrimonial profile details.' 
      : 'আপনার পেমেন্ট অনুরোধ আমাদের সিস্টেমে যুক্ত হয়েছে। দয়া করে আপনার বিস্তারিত বায়োডাটা পূরণ করতে এগিয়ে যান।',
    proceedFormBtn: language === 'en' ? 'Proceed to Registration Form' : 'রেজিস্ট্রেশন ফরম পূরণ করুন',
    regSub: language === 'en' ? 'Fill out all family, academic, and personal details. Your bio-data will go live after admin approves the payment.' : 'আপনার সব পারিবারিক, শিক্ষাগত ও ব্যক্তিগত তথ্য দিন। পেমেন্ট অনুমোদন সাপেক্ষে প্রোফাইল লাইভ করা হবে।',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12" id="registration-flow-root">
      
      {/* Wizard Steps indicator */}
      <div className="flex items-center justify-between mb-8 sm:mb-12 border-b border-neutral-200/60 pb-5 text-xs sm:text-sm font-semibold text-neutral-400">
        <div className={`flex items-center space-x-2 ${step === 1 ? 'text-neutral-900 font-bold' : ''}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono ${step === 1 ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500 border border-neutral-200/50'}`}>1</span>
          <span>{language === 'en' ? 'Package' : 'প্যাকেজ'}</span>
        </div>
        <div className="flex-1 h-0.5 bg-neutral-200 mx-3"></div>
        <div className={`flex items-center space-x-2 ${step === 2 ? 'text-neutral-900 font-bold' : ''}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono ${step === 2 ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500 border border-neutral-200/50'}`}>2</span>
          <span>{language === 'en' ? 'Payment' : 'পেমেন্ট'}</span>
        </div>
        <div className="flex-1 h-0.5 bg-neutral-200 mx-3"></div>
        <div className={`flex items-center space-x-2 ${step === 3 ? 'text-neutral-900 font-bold' : ''}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono ${step === 3 ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500 border border-neutral-200/50'}`}>3</span>
          <span>{language === 'en' ? 'Success' : 'সফল'}</span>
        </div>
        <div className="flex-1 h-0.5 bg-neutral-200 mx-3"></div>
        <div className={`flex items-center space-x-2 ${step === 4 ? 'text-neutral-900 font-bold' : ''}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono ${step === 4 ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500 border border-neutral-200/50'}`}>4</span>
          <span>{language === 'en' ? 'Bio-Data' : 'বায়োডাটা'}</span>
        </div>
      </div>

      {/* STEP 1: SELECT PACKAGE */}
      {step === 1 && (
        <div className="bg-white rounded-3xl border border-neutral-200/60 p-6 sm:p-8 shadow-sm space-y-6" id="reg-step-1">
          <div className="text-center space-y-2">
            <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-900 font-serif">
              {language === 'en' ? 'Select Your Matrimonial Package' : 'আপনার পছন্দসই মেম্বারশিপ প্যাকেজটি বেছে নিন'}
            </h3>
            <p className="text-sm text-neutral-500 max-w-xl mx-auto">
              {language === 'en' 
                ? 'Select a plan to start. Better plans unlock premium direct contacts, priority matchmakers, and executive assistance.'
                : 'শুরু করতে একটি প্ল্যান নির্বাচন করুন। উন্নত প্ল্যানে সরাসরি যোগাযোগ নম্বর, দ্রুত ঘটক এবং এক্সক্লুসিভ ফিচার সাপোর্ট পাওয়া যাবে।'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MEMBERSHIP_PACKAGES.map((pkg) => {
              const isSelected = selectedPackage.id === pkg.id;
              const emoji = pkg.id === 'basic' ? '🥉' : pkg.id === 'standard' ? '🥈' : pkg.id === 'premium' ? '🥇' : '💎';
              return (
                <div
                  key={pkg.id}
                  onClick={() => {
                    setSelectedPackage(pkg);
                    setPaidAmount(pkg.price.toString());
                  }}
                  className={`relative p-5 rounded-2xl border-2 transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                    isSelected 
                      ? 'border-red-700 bg-red-50/20 shadow-md ring-1 ring-red-700/30' 
                      : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-xs'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl">{emoji}</span>
                      {isSelected && (
                        <span className="text-[10px] font-bold uppercase py-0.5 px-2 bg-red-700 text-white rounded-full font-mono tracking-wider">
                          Selected
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-950 text-sm sm:text-base font-serif">
                        {language === 'en' ? pkg.name : pkg.nameBn}
                      </h4>
                      <p className="text-[10px] text-neutral-400 font-mono">
                        {pkg.durationDays} Days Duration
                      </p>
                    </div>
                    
                    <ul className="space-y-1 text-xs text-neutral-500">
                      {(language === 'en' ? pkg.features : pkg.featuresBn).slice(0, 3).map((feat, i) => (
                        <li key={i} className="flex items-center space-x-1">
                          <span className="text-red-700 shrink-0">✓</span>
                          <span className="truncate">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-100 flex justify-between items-baseline shrink-0">
                    <span className="text-neutral-400 text-[10px] uppercase font-mono font-bold">Price</span>
                    <span className="text-lg font-extrabold text-neutral-900 font-mono">৳{pkg.price}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200/50 rounded-2xl flex items-center space-x-3 text-xs text-amber-950">
            <ShieldCheck className="h-5 w-5 text-amber-600 shrink-0" />
            <p>
              {language === 'en'
                ? 'Your registration is secure. Choose standard or premium plans to unlock direct messaging, mobile numbers and verified premium badges on your profile.'
                : 'আপনার রেজিস্ট্রেশন সম্পূর্ণ নিরাপদ। প্রোফাইল ভেরিফাইড ব্যাজ এবং সরাসরি যোগাযোগ সুবিধা পেতে স্ট্যান্ডার্ড বা প্রিমিয়াম প্ল্যান সিলেক্ট করুন।'}
            </p>
          </div>

          <div className="pt-4 border-t border-neutral-100 flex justify-end">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl shadow-sm text-sm uppercase tracking-wider flex items-center space-x-2 cursor-pointer"
              id="btn-goto-step-2"
            >
              <span>{language === 'en' ? 'Proceed to Checkout' : 'চেকআউটে যান'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: PAYMENT GATEWAY INTERACTION (bKash, Nagad) */}
      {step === 2 && (
        <div className="bg-white rounded-3xl border border-neutral-200/60 p-6 sm:p-10 shadow-sm space-y-8 animate-fade-in" id="reg-step-2">
          
          {/* Main selection Header */}
          <div className="text-center space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 font-serif leading-tight">
              {language === 'en' ? 'Complete Secure Checkout' : 'নিরাপদ পেমেন্ট গেটওয়ে চেকআউট'}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-xl mx-auto leading-relaxed">
              {language === 'en' 
                ? 'Select your preferred mobile wallet to open the official secure checkout popup. Your account will be verified based on manual transaction audit.' 
                : 'আপনার পছন্দের মোবাইল ওয়ালেটটি সিলেক্ট করে অফিশিয়াল সিকিউর পেমেন্ট গেটওয়ে উইন্ডোটি চালু করুন। ম্যানুয়াল অডিট সম্পন্ন হওয়ার পর আপনার অ্যাকাউন্টটি সক্রিয় হবে।'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Left: Package summary */}
            <div className="md:col-span-5 bg-neutral-50 border border-neutral-200/60 p-6 rounded-2xl space-y-4">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block font-mono">Selected Plan / নির্বাচিত প্যাকেজ</span>
              <div className="border-b border-neutral-200/50 pb-4">
                <h4 className="text-lg font-extrabold text-neutral-900 font-serif capitalize">
                  ✨ {language === 'en' ? selectedPackage.name : selectedPackage.nameBn} Package
                </h4>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">Duration: {selectedPackage.durationDays} Days</p>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-xs font-bold text-neutral-600">Subtotal Amount:</span>
                <span className="text-xl font-black text-neutral-900 font-mono">৳{selectedPackage.price}.00 BDT</span>
              </div>

              <div className="text-[11px] text-neutral-500 leading-relaxed pt-2 border-t border-neutral-100">
                {language === 'en' 
                  ? 'Note: All payments are processed over manual mobile financial services. Transactions are fully safe and confidential.' 
                  : 'উল্লেখ্য: বিবাহবন্ধন প্ল্যাটফর্মের সকল পেমেন্ট ম্যানুয়াল মোবাইল ব্যাংকিংয়ের মাধ্যমে সম্পন্ন হয়ে থাকে। আপনার লেনদেনের গোপনীয়তা সম্পূর্ণ সুরক্ষিত।'}
              </div>
            </div>

            {/* Right: Payment Channels Selectors */}
            <div className="md:col-span-7 space-y-4">
              <label className="text-xs font-black uppercase text-neutral-400 tracking-wider block font-mono">
                {language === 'en' ? 'Select Payment Channel' : 'পেমেন্ট গেটওয়ে চ্যানেল সিলেক্ট করুন'}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* bKash Gateway Card */}
                <button
                  type="button"
                  onClick={() => handleOpenGatewayModal('bKash')}
                  className="bg-white border-2 border-pink-200 hover:border-pink-500 rounded-3xl p-5 text-left transition-all duration-300 hover:shadow-xl cursor-pointer flex flex-col justify-between h-52 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-28 h-28 bg-pink-50/50 rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-300" />
                  <div className="space-y-3 relative z-10">
                    <div className="h-14 flex items-center">
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/BKash_Logo.svg/512px-BKash_Logo.svg.png" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://download.logo.wine/logo/BKash/BKash-Icon-Logo.wine.png';
                        }}
                        alt="bKash" 
                        className="h-12 max-w-[180px] object-contain drop-shadow-xs"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h5 className="text-sm font-extrabold text-pink-900 font-mono uppercase tracking-wide">bKash</h5>
                      <p className="text-[11px] text-neutral-500 mt-0.5">Pay via bKash App/USSD</p>
                    </div>
                  </div>
                  <div className="w-full py-2.5 bg-[#e2136e] hover:bg-pink-700 text-white text-[11px] font-black uppercase rounded-xl tracking-wider text-center shadow-xs transition-colors relative z-10">
                    {language === 'en' ? 'Pay with bKash' : 'বিকাশ দিয়ে পে করুন'}
                  </div>
                </button>

                {/* Nagad Gateway Card */}
                <button
                  type="button"
                  onClick={() => handleOpenGatewayModal('Nagad')}
                  className="bg-white border-2 border-orange-200 hover:border-orange-500 rounded-3xl p-5 text-left transition-all duration-300 hover:shadow-xl cursor-pointer flex flex-col justify-between h-52 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-28 h-28 bg-orange-50/50 rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-300" />
                  <div className="space-y-3 relative z-10">
                    <div className="h-14 flex items-center">
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Nagad_logo.svg/512px-Nagad_logo.svg.png" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://download.logo.wine/logo/Nagad/Nagad-Vertical-Logo.wine.png';
                        }}
                        alt="Nagad" 
                        className="h-12 max-w-[180px] object-contain drop-shadow-xs"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h5 className="text-sm font-extrabold text-orange-900 font-mono uppercase tracking-wide">Nagad</h5>
                      <p className="text-[11px] text-neutral-500 mt-0.5">Checkout with Nagad</p>
                    </div>
                  </div>
                  <div className="w-full py-2.5 bg-[#f7941d] hover:bg-orange-600 text-white text-[11px] font-black uppercase rounded-xl tracking-wider text-center shadow-xs transition-colors relative z-10">
                    {language === 'en' ? 'Pay with Nagad' : 'নগদ দিয়ে পে করুন'}
                  </div>
                </button>

                {/* Rocket Gateway Card */}
                <button
                  type="button"
                  onClick={() => handleOpenGatewayModal('Rocket')}
                  className="bg-white border-2 border-purple-200 hover:border-purple-500 rounded-3xl p-5 text-left transition-all duration-300 hover:shadow-xl cursor-pointer flex flex-col justify-between h-52 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-28 h-28 bg-purple-50/50 rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-300" />
                  <div className="space-y-3 relative z-10">
                    <div className="h-14 flex items-center">
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Dutch-Bangla_Bank_Rocket_logo.svg/512px-Dutch-Bangla_Bank_Rocket_logo.svg.png" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          const parent = (e.target as HTMLElement).parentElement;
                          if (parent && !parent.querySelector('.rocket-fallback')) {
                            const badge = document.createElement('span');
                            badge.className = 'rocket-fallback text-purple-900 font-black font-serif text-base tracking-wide bg-purple-100 px-3 py-1.5 rounded-lg';
                            badge.innerText = '🚀 DBBL Rocket';
                            parent.appendChild(badge);
                          }
                        }}
                        alt="Rocket" 
                        className="h-12 max-w-[180px] object-contain drop-shadow-xs"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h5 className="text-sm font-extrabold text-purple-900 font-mono uppercase tracking-wide">Rocket</h5>
                      <p className="text-[11px] text-neutral-500 mt-0.5">Dutch-Bangla Rocket Pay</p>
                    </div>
                  </div>
                  <div className="w-full py-2.5 bg-purple-800 hover:bg-purple-900 text-white text-[11px] font-black uppercase rounded-xl tracking-wider text-center shadow-xs transition-colors relative z-10">
                    {language === 'en' ? 'Pay with Rocket' : 'রকেট দিয়ে পে করুন'}
                  </div>
                </button>

              </div>

              {/* Informative Note for Executive Referral */}
              <div className="p-3 bg-red-50/70 border border-red-200/80 rounded-2xl flex items-center justify-between text-xs font-mono">
                <div className="flex items-center space-x-2 text-red-950">
                  <Flame className="h-4 w-4 text-red-600 fill-red-600 shrink-0" />
                  <span className="font-bold text-[11px]">
                    {language === 'en'
                      ? 'Have an Executive Advisor Referral Code? Enter it inside the Payment Gateway Popup!'
                      : 'এক্সিকিউটিভ রেফারেন্স কোড আছে? পছন্দের পেমেন্ট চ্যানেলে ক্লিক করে পপ-আপের ভেতরে প্রবেশ করান।'}
                  </span>
                </div>
                {execRefCode && (
                  <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded-full uppercase">
                    Code: {execRefCode}
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* BACK ACTIONS */}
          <div className="pt-4 border-t border-neutral-100 flex justify-between items-center">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 text-xs font-bold text-neutral-500 hover:text-neutral-900 flex items-center space-x-1 cursor-pointer font-mono"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{language === 'en' ? 'Back to Packages' : 'প্যাকেজে ফিরে যান'}</span>
            </button>
            <p className="text-[10px] text-neutral-400 font-mono">
              Secured SSL Encrypted Mobile Checkout Gateway
            </p>
          </div>

          {/* ---------------------------------------------------- */}
          {/* STREAMLINED SINGLE-STAGE GATEWAY OVERLAY MODAL */}
          {/* ---------------------------------------------------- */}
          {isGatewayOpen && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" id="payment-gateway-modal-overlay">
              
              {/* Modal Card Structure */}
              <div 
                className={`w-full max-w-sm rounded-[28px] overflow-hidden shadow-2xl flex flex-col text-white transition-all duration-300 border border-white/20 ${
                  paymentMethod === 'bKash' 
                    ? 'bg-[#e2136e]' 
                    : paymentMethod === 'Nagad'
                    ? 'bg-gradient-to-b from-[#f7941d] to-[#e62e2d]'
                    : 'bg-gradient-to-b from-purple-800 to-indigo-950'
                }`}
                id="payment-modal-card"
              >
                
                {/* White Official Header Area */}
                <div className="bg-white px-6 py-5 flex justify-between items-center text-neutral-800 relative shadow-sm">
                  
                  {/* Central Branded Logo */}
                  <div className="flex-1 text-center flex items-center justify-center min-h-[56px]">
                    {paymentMethod === 'bKash' ? (
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/BKash_Logo.svg/512px-BKash_Logo.svg.png" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://download.logo.wine/logo/BKash/BKash-Icon-Logo.wine.png';
                        }}
                        alt="bKash Logo" 
                        className="h-14 max-w-[220px] mx-auto object-contain drop-shadow-xs"
                        referrerPolicy="no-referrer"
                      />
                    ) : paymentMethod === 'Nagad' ? (
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Nagad_logo.svg/512px-Nagad_logo.svg.png" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://download.logo.wine/logo/Nagad/Nagad-Vertical-Logo.wine.png';
                        }}
                        alt="Nagad Logo" 
                        className="h-14 max-w-[220px] mx-auto object-contain drop-shadow-xs"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex items-center justify-center">
                        <img 
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Dutch-Bangla_Bank_Rocket_logo.svg/512px-Dutch-Bangla_Bank_Rocket_logo.svg.png" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            const parent = (e.target as HTMLElement).parentElement;
                            if (parent && !parent.querySelector('.rocket-fallback-modal')) {
                              const badge = document.createElement('span');
                              badge.className = 'rocket-fallback-modal text-purple-900 font-black font-serif text-lg tracking-wider bg-purple-50 px-3 py-1 rounded-lg';
                              badge.innerText = '🚀 DBBL ROCKET';
                              parent.appendChild(badge);
                            }
                          }}
                          alt="Rocket Logo" 
                          className="h-14 max-w-[220px] mx-auto object-contain drop-shadow-xs"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                  </div>

                  {/* Close Cross button */}
                  <button
                    onClick={() => {
                      setIsGatewayOpen(false);
                      setPaymentError('');
                      setGatewaySubStep(1);
                    }}
                    className="absolute right-4 top-4 p-2 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors font-bold text-base cursor-pointer"
                    title="Cancel Checkout"
                  >
                    ✕
                  </button>
                </div>

                {/* Sub-Header / Billing Stripes */}
                <div className="bg-black/15 px-5 py-2.5 flex justify-between items-center text-[10px] font-mono border-b border-white/10">
                  <div className="space-y-0.5">
                    <span className="opacity-75 block uppercase">Recipient Merchant</span>
                    <span className="font-bold">BibahoBondhon Ltd</span>
                  </div>
                  <div className="text-right space-y-0.5">
                    <span className="opacity-75 block uppercase">Amount to Transfer</span>
                    <span className="font-extrabold text-sm text-white font-mono">৳{selectedPackage.price}.00</span>
                  </div>
                </div>

                {/* MODAL MAIN CONTENT: SINGLE STREAMLINED VIEW */}
                <div className="p-5 flex-1 flex flex-col space-y-4">
                  {gatewaySubStep === 3 ? (
                    /* Simulated Checking Spinner */
                    <div className="py-12 text-center space-y-4 flex flex-col items-center justify-center">
                      <div className="relative h-14 w-14">
                        <div className="absolute inset-0 rounded-full border-4 border-white/20" />
                        <div className="absolute inset-0 rounded-full border-4 border-t-white border-r-transparent animate-spin" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-black uppercase tracking-widest">
                          {paymentMethod === 'bKash' ? 'Checking bKash Secure API...' : paymentMethod === 'Nagad' ? 'Verifying with Nagad Core...' : 'Connecting Rocket Gateway...'}
                        </h4>
                        <p className="text-[10px] opacity-75 font-mono">
                          {language === 'en' 
                            ? 'Resolving manual transaction logs. Please wait...' 
                            : 'ম্যানুয়াল ট্রানজেকশন আইডি ও রেফারেল যাচাই করা হচ্ছে। অনুগ্রহ করে অপেক্ষা করুন...'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* The single screen instructions, referral code & transaction ID entry */
                    <>
                      <div className="space-y-3">
                        <p className="text-[11px] opacity-95 leading-relaxed text-center font-medium">
                          {language === 'en'
                            ? `Send Money BDT ৳${selectedPackage.price} to the Merchant number below, enter your Transaction ID (TxID) & optional Executive Code to submit.`
                            : `নিচের মার্চেন্ট নাম্বারে ৳${selectedPackage.price} সেন্ড মানি করুন, এবং ট্রানজেকশন আইডি ও এক্সিকিউটিভ কোড (যদি থাকে) দিয়ে সাবমিট করুন।`}
                        </p>

                        {/* Merchant Number Copy Block */}
                        <div className="bg-white/10 rounded-xl p-3 flex justify-between items-center border border-white/15">
                          <div className="space-y-0.5">
                            <span className="text-[9px] opacity-80 font-mono uppercase tracking-wider block">Merchant Personal Number</span>
                            <span className="text-sm font-extrabold font-mono text-white">{merchantNumber}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(merchantNumber, 'number')}
                            className="py-1 px-3.5 rounded-lg bg-white text-neutral-900 hover:bg-neutral-50 font-bold text-xs flex items-center space-x-1 cursor-pointer transition-all active:scale-95 shadow-sm font-mono"
                          >
                            {copiedField === 'number' ? (
                              <span className="text-emerald-700 flex items-center font-bold">✓ Copied</span>
                            ) : (
                              <span>Copy</span>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Executive Referral Code Input Box Inside Modal */}
                      {(() => {
                        const code = execRefCode.trim().toUpperCase();
                        const matchedExec = SEED_EXECUTIVES.find(e => e.isActive && e.referenceCode.toUpperCase() === code);

                        return (
                          <div className="bg-white/10 border border-white/20 rounded-xl p-3 space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] font-bold uppercase tracking-wider block opacity-90 font-mono flex items-center space-x-1">
                                <Flame className="h-3.5 w-3.5 text-yellow-300 fill-yellow-300" />
                                <span>Executive Referral Code (Optional)</span>
                              </label>
                              <span className="text-[9px] font-mono font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">
                                e.g. WAZED990
                              </span>
                            </div>

                            <input
                              type="text"
                              placeholder="রেফারেন্স কোড দিন (যেমন: WAZED990)"
                              value={execRefCode}
                              onChange={(e) => {
                                setExecRefCode(e.target.value.toUpperCase());
                                setPaymentError('');
                              }}
                              className={`w-full bg-white text-neutral-900 border-2 rounded-lg px-3 py-2 text-xs font-mono font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-black placeholder:normal-case placeholder:tracking-normal placeholder:font-normal placeholder:text-neutral-400 ${
                                code && matchedExec
                                  ? 'border-emerald-400'
                                  : code && !matchedExec
                                  ? 'border-red-400'
                                  : 'border-white/20'
                              }`}
                            />

                            {code && (
                              matchedExec ? (
                                <div className="p-1.5 bg-emerald-950/80 border border-emerald-400/60 rounded-lg text-[10px] font-mono text-emerald-200 font-bold flex items-center space-x-1">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                                  <span>✅ ভ্যালিড: {matchedExec.name} ({matchedExec.referenceCode})</span>
                                </div>
                              ) : (
                                <div className="p-1.5 bg-red-950/80 border border-red-400/60 rounded-lg text-[10px] font-mono text-red-200 font-bold flex items-center space-x-1">
                                  <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                                  <span>❌ অকার্যকর কোড! (সঠিক কোড: WAZED990, RAHIM102)</span>
                                </div>
                              )
                            )}
                          </div>
                        );
                      })()}

                      {/* Transaction ID Input Form */}
                      <div className="space-y-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider block opacity-90 font-mono">
                            {language === 'en' ? 'Enter Transaction ID' : 'ট্রানজেকশন আইডি লিখুন (TxID)'}
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              placeholder={paymentMethod === 'bKash' ? 'e.g. BK892HJKD8' : 'e.g. NG71A9B3C'}
                              value={tempTxId}
                              onChange={(e) => {
                                setTempTxId(e.target.value.toUpperCase());
                                setPaymentError('');
                              }}
                              className="w-full bg-white border-2 border-white/20 rounded-xl pl-3.5 pr-24 py-2.5 text-xs font-mono font-bold tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-black text-neutral-900 placeholder:normal-case placeholder:tracking-normal placeholder:font-normal placeholder:text-neutral-400"
                            />
                            
                            {/* Inline Autofill button for easy sandbox testing */}
                            <button
                              type="button"
                              onClick={() => handleGatewayAutoFill(paymentMethod)}
                              className="absolute right-2 top-1.5 bottom-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-bold font-mono transition-colors uppercase tracking-wider flex items-center justify-center shrink-0 cursor-pointer"
                            >
                              Auto-Fill
                            </button>
                          </div>
                        </div>

                        {/* Testing helper panel */}
                        <div className="bg-black/20 border border-white/10 rounded-xl p-2 flex justify-between items-center text-white">
                          <span className="text-[9px] opacity-80 font-mono uppercase">Testing Sandbox</span>
                          <button
                            type="button"
                            onClick={() => handleGatewayAutoFill(paymentMethod)}
                            className="py-1 px-2 bg-white text-neutral-900 hover:bg-neutral-100 rounded-md text-[9px] font-bold cursor-pointer transition-transform duration-100 active:scale-95 shadow-xs"
                          >
                            Simulate TxID
                          </button>
                        </div>

                        {copiedField === 'autofill_popup' && (
                          <div className="text-[10px] text-emerald-200 font-bold font-mono text-center animate-bounce">
                            ✓ Transaction ID auto-filled!
                          </div>
                        )}

                        {paymentError && (
                          <div className="bg-red-950/90 border border-red-400 p-2.5 rounded-xl text-[10px] font-mono text-red-100 font-semibold leading-relaxed flex items-start space-x-1.5">
                            <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                            <span>{paymentError}</span>
                          </div>
                        )}
                      </div>

                      {/* Submit action */}
                      <button
                        type="button"
                        onClick={() => {
                          const code = execRefCode.trim().toUpperCase();
                          if (code) {
                            const matched = SEED_EXECUTIVES.find(e => e.isActive && e.referenceCode.toUpperCase() === code);
                            if (!matched) {
                              setPaymentError(language === 'en'
                                ? 'Invalid Executive Referral Code! Please enter a valid code (e.g. WAZED990, RAHIM102, AKASH501, TANIA220) or clear it.'
                                : 'অকার্যকর এক্সিকিউটিভ রেফারেল কোড! অনুগ্রহ করে সঠিক রেফারেল কোড দিন (যেমন: WAZED990, RAHIM102, AKASH501, TANIA220) অথবা ফিল্ডটি ফাঁকা রাখুন।');
                              return;
                            }
                          }

                          if (!tempTxId.trim()) {
                            setPaymentError(language === 'en' ? 'Please enter Transaction ID.' : 'ট্রানজেকশন আইডি দিন।');
                            return;
                          }
                          if (tempTxId.length < 8) {
                            setPaymentError(language === 'en' ? 'TxID must be at least 8 alphanumeric characters.' : 'কমপক্ষে ৮ ডিজিটের ট্রানজেকশন আইডি দিন।');
                            return;
                          }
                          
                          // Go to simulated Loader state
                          setPaymentError('');
                          setGatewaySubStep(3);
                          
                          // Trigger simulated verification
                          setTimeout(() => {
                            setTransactionId(tempTxId);
                            setPaidAmount(selectedPackage.price.toString());
                            setIsGatewayOpen(false);
                            setGatewaySubStep(1); // reset

                            // Save incomplete pending payment record right away
                            if (onSavePendingPayment) {
                              onSavePendingPayment({
                                id: `pay-${Date.now()}`,
                                transactionId: tempTxId.trim().toUpperCase(),
                                amount: selectedPackage.price,
                                paymentMethod,
                                membershipPackage: selectedPackage.id as PackageType,
                                profileId: `PENDING-${Math.floor(100000 + Math.random() * 900000)}`,
                                paymentTime: new Date().toISOString(),
                                status: 'pending',
                                executiveRefCode: execRefCode.trim().toUpperCase() || undefined,
                                isIncompleteRegistration: true,
                              });
                            }

                            setStep(3); // Advance to success step
                          }, 1500);
                        }}
                        className="w-full py-3 text-neutral-900 bg-white hover:bg-neutral-50 font-black rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-md text-center flex items-center justify-center space-x-1.5 transition-all active:scale-95 mt-1"
                      >
                        <span>{language === 'en' ? 'SUBMIT PAYMENT / VERIFY' : 'পেমেন্ট সাবমিট করুন / যাচাই'}</span>
                      </button>
                    </>
                  )}
                </div>

                {/* Branded Footer Strip */}
                <div className="bg-black/20 text-center py-2 text-[8px] font-mono uppercase tracking-widest opacity-60">
                  © 2026 {paymentMethod} Secure Payment Gateway
                </div>

              </div>

            </div>
          )}

        </div>
      )}

      {/* STEP 3: PAYMENT REGISTERED / GOTO REGISTRATION */}
      {step === 3 && (
        <div className="bg-white rounded-3xl border border-neutral-200/60 p-8 sm:p-12 shadow-sm text-center space-y-6" id="reg-step-3">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-800 border border-emerald-100 shadow-sm">
            <CheckCircle2 className="h-10 w-10 fill-emerald-100 text-emerald-600" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-900 font-serif">
              {language === 'en' ? 'Payment Completed & Approved!' : 'পেমেন্ট সফলভাবে সম্পন্ন ও অনুমোদিত!'}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-lg mx-auto leading-relaxed">
              {language === 'en'
                ? 'Your transaction has been verified successfully. Your premium membership will be automatically activated immediately after you complete your profile registration below.'
                : 'আপনার পেমেন্ট ট্রানজেকশন সফলভাবে ভেরিফাই করা হয়েছে। নিচের প্রোফাইল রেজিস্ট্রেশন ফরমটি পূরণ করার সাথে সাথে আপনার প্রিমিয়াম মেম্বারশিপ স্বয়ংক্রিয়ভাবে সক্রিয় হয়ে যাবে।'}
            </p>
          </div>

          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/60 text-xs text-neutral-600 font-mono max-w-sm mx-auto space-y-1.5 text-left">
            <div><span className="text-neutral-400 font-semibold">Payment Wallet:</span> <span className="font-bold text-neutral-800">{paymentMethod}</span></div>
            <div><span className="text-neutral-400 font-semibold">Transaction ID:</span> <span className="font-bold text-neutral-800 uppercase">{transactionId}</span></div>
            <div><span className="text-neutral-400 font-semibold">Package:</span> <span className="font-bold text-neutral-800">{selectedPackage.name}</span></div>
            <div><span className="text-neutral-400 font-semibold">Verified Status:</span> <span className="text-emerald-600 font-bold font-mono">Approved & Automatically Active</span></div>
          </div>

          <div className="pt-4">
            <button
              onClick={() => setStep(4)}
              className="px-6 py-3 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl shadow-sm text-sm uppercase tracking-wider flex items-center space-x-2 mx-auto cursor-pointer"
              id="btn-goto-profile-form"
            >
              <span>{text.proceedFormBtn}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: DETAILED REGISTRATION FORM */}
      {step === 4 && (
        <form onSubmit={handleRegistrationSubmit} className="bg-white rounded-3xl border border-neutral-200/60 p-6 sm:p-10 shadow-sm space-y-8" id="reg-step-4">
          
          <div className="border-b border-neutral-200 pb-5 text-center sm:text-left space-y-2">
            <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-900 font-serif">{text.step4Title}</h3>
            <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed font-mono">{text.regSub}</p>
          </div>

          {/* Form Content Divided into Sections */}
          <div className="space-y-8">
            
            {/* Section A: Account & Personal Info */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-l-4 border-neutral-900 pl-2 font-mono">
                {language === 'en' ? 'A. Account & Demographics' : 'ক. অ্যাকাউন্ট ও ব্যক্তিগত তথ্য'}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-600 block">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fatema Khatun"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-450 focus:ring-0"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-600 block">Gender *</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleGenderChange('Bride')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all duration-150 cursor-pointer ${
                        gender === 'Bride'
                          ? 'bg-neutral-900 border-neutral-950 text-white'
                          : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      👰 Bride (কনে)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenderChange('Groom')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all duration-150 cursor-pointer ${
                        gender === 'Groom'
                          ? 'bg-neutral-900 border-neutral-950 text-white'
                          : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      🤵 Groom (বর)
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-600 block">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-450 focus:ring-0"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-600 block">Religion *</label>
                  <select
                    value={religion}
                    onChange={(e) => setReligion(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-450 focus:ring-0"
                  >
                    {RELIGION_LIST.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-600 block">Marital Status *</label>
                  <select
                    value={maritalStatus}
                    onChange={(e) => setMaritalStatus(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-450 focus:ring-0"
                  >
                    <option value="Never Married">Never Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-600 block">Height *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 5ft 4in"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-2.5 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-450 focus:ring-0"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-600 block">Weight (kg) *</label>
                    <input
                      type="number"
                      required
                      value={weight}
                      onChange={(e) => setWeight(parseInt(e.target.value))}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-2.5 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-450 focus:ring-0"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-600 block">Blood Group</label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-1.5 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-450 focus:ring-0"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>

              </div>
            </div>

            {/* Section B: Academic & Professional Status */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-l-4 border-neutral-900 pl-2 font-mono">
                {language === 'en' ? 'B. Academic & Career Details' : 'খ. শিক্ষাগত ও পেশাগত তথ্য'}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-600 block">Education Qualification *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BBA, North South University"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-450 focus:ring-0"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-600 block">Profession / Occupation *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Banker, Officer"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-450 focus:ring-0"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-600 block">Monthly Income (BDT) *</label>
                  <input
                    type="number"
                    required
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(parseInt(e.target.value))}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-450 focus:ring-0"
                  />
                </div>
              </div>
            </div>

            {/* Section C: Family Background & Location */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-l-4 border-neutral-900 pl-2 font-mono">
                {language === 'en' ? 'C. Family & Address Parameters' : 'গ. পারিবারিক বিবরণ ও ঠিকানা'}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-600 block">Father's Name</label>
                  <input
                    type="text"
                    placeholder="Father's full name"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-450 focus:ring-0"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-600 block">Mother's Name</label>
                  <input
                    type="text"
                    placeholder="Mother's full name"
                    value={motherName}
                    onChange={(e) => setMotherName(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-450 focus:ring-0"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-600 block">Present Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="Street, Police Station, Area"
                    value={presentAddress}
                    onChange={(e) => setPresentAddress(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-450 focus:ring-0"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-600 block">Permanent Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="Village, Post Office, Sub-district"
                    value={permanentAddress}
                    onChange={(e) => setPermanentAddress(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-450 focus:ring-0"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-600 block">District *</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-450 focus:ring-0"
                  >
                    {DISTRICT_LIST.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section D: Contact Security & Credentials */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-l-4 border-neutral-900 pl-2 font-mono">
                {language === 'en' ? 'D. Secure Contact & Credentials' : 'ঘ. যোগাযোগ ও পাসওয়ার্ড'}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-600 block">Mobile Number (Format: +880...) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+88017XXXXXXXX"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-450 focus:ring-0"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-600 block">WhatsApp Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+88017XXXXXXXX"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-450 focus:ring-0"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-600 block">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="example@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-450 focus:ring-0"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-600 block">Password *</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-450 focus:ring-0"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-600 block">Confirm *</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-450 focus:ring-0"
                    />
                  </div>
                </div>

                {/* Executive Reference Code (Optional) */}
                <div className="md:col-span-2 p-3.5 bg-red-50/50 border border-red-200/60 rounded-xl space-y-1.5">
                  <label className="text-xs font-bold text-red-900 flex items-center justify-between">
                    <span>{language === 'en' ? 'Executive Reference Number (Optional)' : 'এক্সিকিউটিভ রেফারেন্স নম্বর (যদি থাকে)'}</span>
                    <span className="text-[10px] text-red-600 font-mono font-normal">{language === 'en' ? 'e.g. BBE-1001' : 'উদাহরণ: BBE-1001'}</span>
                  </label>
                  <input
                    type="text"
                    placeholder={language === 'en' ? 'e.g. BBE-1001 (Leave blank for system registration)' : 'যেমন: BBE-1001 (কোনো রেফারেন্স না থাকলে খালি রাখুন)'}
                    value={execRefCode}
                    onChange={(e) => setExecRefCode(e.target.value.toUpperCase())}
                    className="w-full bg-white border border-red-200 rounded-lg px-3 py-2 text-sm font-mono font-bold text-red-900 uppercase tracking-wide focus:outline-none focus:border-red-500 focus:ring-0 placeholder:font-sans placeholder:font-normal placeholder:text-neutral-400"
                  />
                  <p className="text-[11px] text-neutral-600 leading-normal">
                    {language === 'en'
                      ? 'If you were guided by a specific matchmaking executive, enter their unique reference code. Otherwise, keep blank.'
                      : 'যদি কোনো নির্দিষ্ট এক্সিকিউটিভ আপনাকে সহায়তা করে থাকেন, তবে তাঁর রেফারেন্স কোড প্রবেশ করান। অন্যথায় এটি খালি রাখুন (সিস্টেম রেজিস্ট্রেশন হিসেবে গণ্য হবে)।'}
                  </p>
                </div>
              </div>
            </div>

            {/* Section E: Bio Description */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-l-4 border-neutral-900 pl-2 font-mono">
                {language === 'en' ? 'E. Partner Looking For & About' : 'ঙ. পছন্দ ও নিজের বিবরণ'}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-600 block">About Yourself *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe your character, habits, lifestyle..."
                    value={aboutYourself}
                    onChange={(e) => setAboutYourself(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-450 focus:ring-0"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-600 block">Looking For *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe your expectations for the ideal partner..."
                    value={lookingFor}
                    onChange={(e) => setLookingFor(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-450 focus:ring-0"
                  />
                </div>
              </div>
            </div>

            {/* Section F: Partner Preferences details */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-l-4 border-neutral-900 pl-2 font-mono">
                {language === 'en' ? 'F. Partner Preferences Specifications' : 'চ. কাঙ্ক্ষিত পাত্র/পাত্রীর যোগ্যতা'}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-600 block">Preferred Religion</label>
                  <select
                    value={partnerReligion}
                    onChange={(e) => setPartnerReligion(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-450 focus:ring-0"
                  >
                    {RELIGION_LIST.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-600 block">Min / Max Age Range</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={partnerMinAge}
                      onChange={(e) => setPartnerMinAge(parseInt(e.target.value))}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-450 focus:ring-0"
                    />
                    <span className="text-neutral-400 font-bold">to</span>
                    <input
                      type="number"
                      value={partnerMaxAge}
                      onChange={(e) => setPartnerMaxAge(parseInt(e.target.value))}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-450 focus:ring-0"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-600 block">Preferred District</label>
                  <select
                    value={partnerDistrict}
                    onChange={(e) => setPartnerDistrict(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-450 focus:ring-0"
                  >
                    <option value="Any District">Any District</option>
                    {DISTRICT_LIST.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section G: Mobile Gallery Photo Uploads */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-l-4 border-neutral-900 pl-2 font-mono">
                {language === 'en' ? 'G. Profile & Gallery Photo Uploads (Mobile Gallery)' : 'ছ. ছবি আপলোড (সরাসরি মোবাইল গ্যালারি)'}
              </h4>

              <div className="p-5 bg-neutral-50 border border-neutral-200/80 rounded-2xl space-y-6">
                
                {/* 1. Profile Picture Upload */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-neutral-800 block">
                    {language === 'en' ? 'Profile Picture (Upload from Gallery) *' : '১। প্রোফাইল ছবি (মোবাইল গ্যালারি থেকে আপলোড করুন) *'}
                  </label>

                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-white border border-dashed border-neutral-300 rounded-xl">
                    {profilePic ? (
                      <div className="relative group shrink-0">
                        <img 
                          src={profilePic} 
                          alt="Profile Preview" 
                          className="w-24 h-24 rounded-2xl object-cover ring-2 ring-red-500 shadow-sm"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => setProfilePic('')}
                          className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition-colors"
                          title="ছবি মুছুন"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-neutral-100 rounded-2xl border border-neutral-200 flex flex-col items-center justify-center text-neutral-400 shrink-0">
                        <Camera className="h-8 w-8 mb-1 text-neutral-400" />
                        <span className="text-[10px] font-bold">ছবি নেই</span>
                      </div>
                    )}

                    <div className="flex-1 text-center sm:text-left space-y-2">
                      <label className="inline-flex items-center space-x-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-all font-mono">
                        <Upload className="h-4 w-4 text-amber-400" />
                        <span>{profilePic ? 'অন্য ছবি বেছে নিন' : 'গ্যালারি থেকে ছবি আপলোড করুন'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePicFileChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[11px] text-neutral-500 font-medium leading-relaxed">
                        মোবাইল ফাইল বা গ্যালারি থেকে আপনার স্পষ্ট ছবি আপলোড করুন (JPG/PNG)।
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Gallery Pictures Upload */}
                <div className="pt-4 border-t border-neutral-200/60 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <label className="text-xs font-bold text-neutral-800 block">
                        {language === 'en' ? 'Gallery Photos (Upload from Gallery)' : '২। গ্যালারি ছবি (মোবাইল গ্যালারি থেকে একাধিক ছবি আপলোড)'}
                      </label>
                      <p className="text-[11px] text-neutral-500 font-medium">মোট যুক্ত করা হয়েছে: {galleryImages.length} টি ছবি</p>
                    </div>

                    <label className="px-3.5 py-2 bg-white border border-neutral-300 text-neutral-900 hover:bg-neutral-100 text-xs font-bold rounded-xl cursor-pointer shadow-2xs transition-all flex items-center space-x-1.5 font-mono">
                      <Upload className="h-3.5 w-3.5 text-red-600" />
                      <span>ছবি যোগ করুন</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleGalleryFilesChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {galleryImages.length > 0 ? (
                    <div className="flex flex-wrap gap-3 pt-2">
                      {galleryImages.map((gImg, gIdx) => (
                        <div key={gIdx} className="relative group w-16 h-16 rounded-xl overflow-hidden border border-neutral-300">
                          <img src={gImg} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <button
                            type="button"
                            onClick={() => setGalleryImages(prev => prev.filter((_, idx) => idx !== gIdx))}
                            className="absolute inset-0 bg-neutral-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-400 italic py-2">
                      এখনও কোনো গ্যালারি ছবি যোগ করা হয়নি। ইচ্ছা হলে পরে আপনার প্রোফাইল থেকে ছবি যোগ করতে পারবেন।
                    </p>
                  )}
                </div>

              </div>
            </div>

          </div>

          {formError && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-800 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-2 font-mono">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Submit Application button */}
          <div className="pt-6 border-t border-neutral-200 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl shadow-xs text-sm uppercase tracking-wider flex items-center space-x-2 cursor-pointer font-mono"
              id="btn-submit-registration-biodata"
            >
              <UserPlus className="h-4.5 w-4.5" />
              <span>{language === 'en' ? 'Submit Biodata Registration' : 'নিবন্ধন আবেদন জমা দিন'}</span>
            </button>
          </div>

        </form>
      )}

      {/* REGISTRATION SUCCESS POPUP MODAL */}
      {showSuccessModal && pendingUserAndPayment && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" id="registration-success-modal-overlay">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl text-center relative animate-in fade-in zoom-in-95 duration-200">
            
            <div className="h-16 w-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-300 shadow-sm">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-serif font-black text-neutral-900">
                🎉 ধন্যবাদ!
              </h3>
              <p className="text-sm font-bold text-neutral-800 font-sans">
                আপনার রেজিস্ট্রেশন সফলভাবে সম্পন্ন হয়েছে।
              </p>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 font-mono space-y-1 mt-3 leading-relaxed">
                <ShieldCheck className="h-5 w-5 text-amber-600 mx-auto mb-1" />
                <p className="font-bold">
                  “আপনার পেমেন্ট যাচাই করা হচ্ছে। অ্যাডমিন ভেরিফাই করার পর আপনার অ্যাকাউন্ট সম্পূর্ণভাবে সক্রিয় হবে।”
                </p>
              </div>
            </div>

            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 text-left text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-neutral-500">বায়োডাটা আইডি:</span>
                <strong className="text-red-900">{pendingUserAndPayment.newUser.profileId}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">মেম্বারশিপ প্যাকেজ:</span>
                <strong className="uppercase text-neutral-900">{pendingUserAndPayment.newUser.packageId}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">ট্রানজেকশন ID:</span>
                <strong className="text-neutral-900">{pendingUserAndPayment.initialPayment.transactionId}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onRegisterComplete(pendingUserAndPayment.newUser, pendingUserAndPayment.initialPayment);
                setShowSuccessModal(false);
              }}
              className="w-full py-3.5 bg-red-700 hover:bg-red-800 text-white font-mono font-bold text-sm uppercase tracking-wider rounded-xl shadow-md transition-all duration-150 cursor-pointer"
              id="btn-close-registration-success-modal"
            >
              {language === 'en' ? 'OK / Continue' : 'ঠিক আছে'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
