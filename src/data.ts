import { MembershipPackage, User, Executive, SuccessStory, Post, Story } from './types';

export const MEMBERSHIP_PACKAGES: MembershipPackage[] = [
  {
    id: 'basic',
    name: 'Basic Membership',
    nameBn: 'বেসিক মেম্বারশিপ',
    price: 50,
    durationDays: 7,
    features: [
      'Account Registration',
      'Complete Profile Creation',
      'Upload Profile & Cover Picture',
      'Browse Matches & Timeline',
      'Send Limited Interests'
    ],
    featuresBn: [
      'অ্যাকাউন্ট রেজিস্ট্রেশন',
      'সম্পূর্ণ প্রোফাইল তৈরি',
      'প্রোফাইল ও কভার ফটো আপলোড',
      'প্রোফাইল ও টাইমলাইন ব্রাউজ',
      'সীমিত আগ্রহ প্রকাশ'
    ]
  },
  {
    id: 'standard',
    name: 'Standard Membership',
    nameBn: 'স্ট্যান্ডার্ড মেম্বারশিপ',
    price: 150,
    durationDays: 30,
    features: [
      'Everything in Basic',
      'Unlimited Profile Browsing',
      'Direct Inbox Chat (Text Messages)',
      'Priority Profile Placement'
    ],
    featuresBn: [
      'বেসিক-এর সব সুবিধা',
      'আনলিমিটেড প্রোফাইল ভিউ',
      'ইনবক্স চ্যাট সুবিধা (টেক্সট মেসেজ)',
      'প্রোফাইল প্রায়োরিটি লিস্টিং'
    ]
  },
  {
    id: 'premium',
    name: 'Premium Membership',
    nameBn: 'প্রিমিয়াম মেম্বারশিপ',
    price: 300,
    durationDays: 90,
    features: [
      'Everything in Standard',
      'Send Photos in Inbox Chat',
      'Verified Premium Badge on Profile',
      'Featured Profile for 7 Days'
    ],
    featuresBn: [
      'স্ট্যান্ডার্ড-এর সব সুবিধা',
      'ইনবক্স চ্যাটে ছবি পাঠানোর বিশেষ সুবিধা',
      'প্রোফাইলে ভেরিফাইড প্রিমিয়াম ব্যাজ',
      '৭ দিনের জন্য ফিচারড প্রোফাইল'
    ]
  },
  {
    id: 'vip',
    name: 'VIP Membership',
    nameBn: 'ভিআইপি মেম্বারশিপ',
    price: 500,
    durationDays: 180,
    features: [
      'Everything in Premium',
      'Unlock Contact & WhatsApp Number (VIP Only)',
      'VIP Exclusive Profile Badge',
      'Dedicated Personal Matchmaker Support',
      'Homepage Featured Profile permanently'
    ],
    featuresBn: [
      'প্রিমিয়াম-এর সব সুবিধা',
      'মোবাইল নম্বর ও সরাসরি WhatsApp আনলক (একমাত্র VIP সুবিধা)',
      'ভিআইপি এক্সক্লুসিভ প্রোফাইল ব্যাজ',
      'ডেডিকেটেড পার্সোনাল ঘটক সহায়তা',
      'হোমপেজে স্থায়ী ফিচারড প্রোফাইল'
    ]
  }
];

export const SEED_EXECUTIVES: Executive[] = [
  {
    id: 'exec-wazed',
    name: 'Abdul Wazed',
    designation: 'Senior Executive Advisor',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    galleryPhotos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80'
    ],
    mobileNumber: '+8801700990990',
    whatsappNumber: '+8801700990990',
    email: 'mohammadabdulwazed1@gmail.com',
    referenceCode: 'WAZED990',
    officeLocation: 'ঢাকা হেড অফিস (মিরপুর)',
    joiningDate: '2024-01-01',
    isActive: true
  },
  {
    id: 'exec-1',
    name: 'Nusrat Jahan Chowdhury',
    designation: 'Senior Executive',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
    galleryPhotos: [
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=600&auto=format&fit=crop&q=80'
    ],
    mobileNumber: '+8801700112233',
    whatsappNumber: '+8801700112233',
    email: 'nusrat.exec@bibahobondhon.com',
    referenceCode: 'BBE-1001',
    officeLocation: 'ঢাকা হেড অফিস (ধানমণ্ডি)',
    joiningDate: '2024-01-15',
    isActive: true
  },
  {
    id: 'exec-2',
    name: 'Kazi Farhan Ahmed',
    designation: 'Team Leader',
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80',
    galleryPhotos: [
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80'
    ],
    mobileNumber: '+8801712345678',
    whatsappNumber: '+8801712345678',
    email: 'farhan.kazi@bibahobondhon.com',
    referenceCode: 'BBE-1002',
    officeLocation: 'চট্টগ্রাম ব্রাঞ্চ অফিস (জিইসি)',
    joiningDate: '2024-06-01',
    isActive: true
  },
  {
    id: 'exec-3',
    name: 'Tanvir Rahman Mahim',
    designation: 'Executive Advisor',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    galleryPhotos: [],
    mobileNumber: '+8801912345680',
    whatsappNumber: '+8801912345680',
    email: 'tanvir.mahim@bibahobondhon.com',
    referenceCode: 'BBE-1003',
    officeLocation: 'সিলেট ব্রাঞ্চ অফিস',
    joiningDate: '2025-02-10',
    isActive: true
  },
  {
    id: 'exec-rahim',
    name: 'Abdur Rahim',
    designation: 'Senior Executive',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    galleryPhotos: [],
    mobileNumber: '+8801700102102',
    whatsappNumber: '+8801700102102',
    email: 'rahim@bibahobondhon.com',
    referenceCode: 'RAHIM102',
    officeLocation: 'ঢাকা হেড অফিস (উত্তরা)',
    joiningDate: '2024-03-10',
    isActive: true
  },
  {
    id: 'exec-akash',
    name: 'Akash Ahmed',
    designation: 'Executive Officer',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    galleryPhotos: [],
    mobileNumber: '+8801800501501',
    whatsappNumber: '+8801800501501',
    email: 'akash@bibahobondhon.com',
    referenceCode: 'AKASH501',
    officeLocation: 'খুলনা ব্রাঞ্চ অফিস',
    joiningDate: '2024-05-15',
    isActive: true
  },
  {
    id: 'exec-tania',
    name: 'Tania Sultana',
    designation: 'Senior Matchmaker Advisor',
    photo: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=400&auto=format&fit=crop&q=80',
    galleryPhotos: [],
    mobileNumber: '+8801900220220',
    whatsappNumber: '+8801900220220',
    email: 'tania@bibahobondhon.com',
    referenceCode: 'TANIA220',
    officeLocation: 'রাজশাহী ব্রাঞ্চ অফিস',
    joiningDate: '2024-04-01',
    isActive: true
  }
];

export const SUCCESS_STORIES: SuccessStory[] = [
  {
    id: 'story-1',
    brideName: 'Sultana Yeasmin',
    groomName: 'Ahsan Kabir',
    marriageDate: '2025-12-14',
    image: 'https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?w=600&auto=format&fit=crop&q=80',
    story: 'We met on BibahoBondhon in September 2025. After exchanging interests, our families connected. Within three months, we locked our hands in marriage. It felt like home!',
    storyBn: 'আমরা ২০২৫ সালের সেপ্টেম্বরে বিবাহবন্ধনে পরিচিত হই। আগ্রহ আদান-প্রদানের পর আমাদের পরিবার যোগাযোগ করে। তিন মাসের মধ্যে আমরা বিবাহ বন্ধনে আবদ্ধ হই। এটি অত্যন্ত চমৎকার অভিজ্ঞতা ছিল!',
    district: 'Dhaka'
  },
  {
    id: 'story-2',
    brideName: 'Farhana Rashid',
    groomName: 'Dr. Rafid Hasan',
    marriageDate: '2026-03-05',
    image: 'https://images.unsplash.com/photo-1621616875450-79f22448040e?w=600&auto=format&fit=crop&q=80',
    story: 'As a doctor, it was difficult to find time. BibahoBondhon standard match filters helped me find Farhana, a banker who shares similar life values. Gratitude to BibahoBondhon!',
    storyBn: 'চিকিৎসক হিসেবে সময় পাওয়া কঠিন ছিল। বিবাহবন্ধনের স্ট্যান্ডার্ড ম্যাচ ফিল্টার আমাকে ফারহানাকে খুঁজে পেতে সাহায্য করেছে, যিনি একজন ব্যাংকার এবং আমাদের জীবনবোধ প্রায় একই। বিবাহবন্ধনের প্রতি কৃতজ্ঞতা!',
    district: 'Chittagong'
  }
];

export const SAFETY_TIPS = [
  {
    title: 'Keep Your Initial Conversations on the Platform',
    titleBn: 'প্রাথমিক কথোপকথন প্ল্যাটফর্মেই সীমাবদ্ধ রাখুন',
    description: 'Use our secure, filtered chat system to get to know someone before giving out personal phone numbers or social profiles.',
    descriptionBn: 'ব্যক্তিগত ফোন নম্বর বা সোশ্যাল প্রোফাইল দেওয়ার আগে আমাদের সুরক্ষিত চ্যাট সিস্টেম ব্যবহার করে একে অপরকে জানুন।'
  },
  {
    title: 'Verify Details via Family Meetings',
    titleBn: 'পারিবারিক বৈঠকের মাধ্যমে তথ্য যাচাই করুন',
    description: 'Always involve family members early. Arrange meetings in neutral, public places to ensure authenticity.',
    descriptionBn: 'সর্বদা পরিবারের সদস্যদের দ্রুত জড়িত করুন। সত্যতা নিশ্চিত করতে নিরপেক্ষ ও প্রকাশ্য স্থানে বৈঠকের ব্যবস্থা করুন।'
  },
  {
    title: 'Never Send Money to Anyone',
    titleBn: 'কখনোই কাউকে টাকা পাঠাবেন না',
    description: 'No genuine user or BibahoBondhon representative will ever ask you for money directly. Report any such profiles immediately.',
    descriptionBn: 'কোনো প্রকৃত ব্যবহারকারী বা বিবাহবন্ধন প্রতিনিধি কখনো সরাসরি আপনার কাছে টাকা চাইবেন না। এ ধরনের প্রোফাইল অবিলম্বে রিপোর্ট করুন।'
  },
  {
    title: 'Report Suspicious Behavior Instantly',
    titleBn: 'সন্দেহজনক আচরণ অবিলম্বে রিপোর্ট করুন',
    description: 'If someone uses abusive language, shares fake details, or attempts scamming, click the "Report Profile" button to alert our admin.',
    descriptionBn: 'কেউ যদি অশালীন ভাষা ব্যবহার করে, ভুয়ো তথ্য শেয়ার করে বা প্রতারণার চেষ্টা করে, তবে অ্যাডমিনকে সতর্ক করতে "রিপোর্ট প্রোফাইল" বাটনে ক্লিক করুন।'
  }
];

export const SEED_USERS: User[] = [];

const REMOVED_SEED_USERS = [
  {
    id: 'user-1',
    profileId: 'BB-109283',
    name: 'Nusrat Jahan Chowdhury',
    email: 'nusrat.chowdhury@example.com',
    gender: 'Bride',
    dob: '1998-04-12',
    age: 28,
    religion: 'Islam (Sunni)',
    maritalStatus: 'Never Married',
    height: "5'4\"",
    weight: 54,
    bloodGroup: 'O+',
    education: 'MSc in Software Engineering, DU',
    profession: 'Senior Software Engineer',
    monthlyIncome: 120000,
    fatherName: 'Late Mizanur Rahman Chowdhury',
    motherName: 'Begum Rokeya Chowdhury',
    presentAddress: 'Dhanmondi, Road 15, Dhaka',
    permanentAddress: 'Sadar, Comilla',
    district: 'Dhaka',
    mobileNumber: '+8801700112233',
    whatsappNumber: '+8801700112233',
    lookingFor: 'A modern, religious partner who is well-educated and works in tech/corporate sectors.',
    aboutYourself: 'I am an independent, family-oriented woman. I enjoy coding, travelling, and spending quality time with my family. I balance Islamic values and modern career.',
    partnerPreference: {
      religion: 'Islam',
      minAge: 28,
      maxAge: 34,
      minHeight: "5'7\"",
      education: 'BSc/MSc/MBA',
      district: 'Dhaka or Comilla',
      maritalStatus: 'Never Married'
    },
    profilePicture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80',
    galleryPhotos: [
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80'
    ],
    packageId: 'premium',
    status: 'verified',
    verificationDate: '2026-05-10',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BB-109283',
    completionPercentage: 95,
    followers: ['user-5', 'user-6'],
    following: ['user-5'],
    interestsSent: ['user-5'],
    interestsReceived: ['user-5', 'user-6'],
    isPremium: true,
    isFeatured: true,
    executiveReferenceCode: 'BBE-1001',
    registrationDate: '2026-07-24'
  },
  {
    id: 'user-2',
    profileId: 'BB-103829',
    name: 'Tasnim Akter',
    email: 'tasnim@example.com',
    gender: 'Bride',
    dob: '2000-06-18',
    age: 25,
    religion: 'Islam (Sunni)',
    maritalStatus: 'Never Married',
    height: "5'3\"",
    weight: 51,
    bloodGroup: 'A+',
    education: 'MA in English Literature, CU',
    profession: 'College Lecturer',
    monthlyIncome: 65000,
    fatherName: 'Alhajj Rafiqul Islam',
    motherName: 'Suraiya Begum',
    presentAddress: 'Panchlaish, Chittagong',
    permanentAddress: 'Sadar, Chittagong',
    district: 'Chittagong',
    mobileNumber: '+8801811223344',
    whatsappNumber: '+8801811223344',
    lookingFor: 'An educated gentleman with good moral character, preferably BCS cadre, Banker or Engineer.',
    aboutYourself: 'I am polite, religious and fond of teaching and writing. I value traditional family unity and mutual respect.',
    partnerPreference: {
      religion: 'Islam',
      minAge: 26,
      maxAge: 32,
      minHeight: "5'7\"",
      education: 'Master Degree or BCS',
      district: 'Chittagong or Dhaka',
      maritalStatus: 'Never Married'
    },
    profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    galleryPhotos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80'
    ],
    packageId: 'standard',
    status: 'verified',
    verificationDate: '2026-06-01',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BB-103829',
    completionPercentage: 92,
    followers: [],
    following: [],
    interestsSent: [],
    interestsReceived: [],
    isPremium: true,
    isFeatured: true,
    executiveReferenceCode: 'BBE-1002',
    registrationDate: '2026-07-23'
  },
  {
    id: 'user-3',
    profileId: 'BB-102938',
    name: 'Sujana Tabassum',
    email: 'sujana@example.com',
    gender: 'Bride',
    dob: '1999-08-05',
    age: 26,
    religion: 'Islam (Sunni)',
    maritalStatus: 'Never Married',
    height: "5'2\"",
    weight: 52,
    bloodGroup: 'B+',
    education: 'MBBS, Chittagong Medical College',
    profession: 'Medical Officer, BIRDEM',
    monthlyIncome: 85000,
    fatherName: 'Dr. Anwar Chowdhury',
    motherName: 'Prof. Salma Chowdhury',
    presentAddress: 'Nasirabad, Chittagong',
    permanentAddress: 'Feni Sadar, Feni',
    district: 'Sylhet',
    mobileNumber: '+8801911998877',
    whatsappNumber: '+8801911998877',
    lookingFor: 'A well-educated gentleman, preferably a doctor, engineer, or BCS cadre.',
    aboutYourself: 'I am simple, compassionate, and passionate about helping people. My family consists of highly educated professionals.',
    partnerPreference: {
      religion: 'Islam',
      minAge: 27,
      maxAge: 32,
      minHeight: "5'6\"",
      education: 'MBBS/BSc/BCS Cadre',
      district: 'Sylhet or Chittagong',
      maritalStatus: 'Never Married'
    },
    profilePicture: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=600&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=80',
    galleryPhotos: [
      'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=600&auto=format&fit=crop&q=80'
    ],
    packageId: 'vip',
    status: 'verified',
    verificationDate: '2026-06-15',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BB-102938',
    completionPercentage: 98,
    followers: [],
    following: [],
    interestsSent: [],
    interestsReceived: [],
    isPremium: true,
    isVIP: true,
    isFeatured: true,
    executiveReferenceCode: 'BBE-1001',
    registrationDate: '2026-07-24'
  },
  {
    id: 'user-4',
    profileId: 'BB-108842',
    name: 'Anika Rahman',
    email: 'anika@example.com',
    gender: 'Bride',
    dob: '2001-02-14',
    age: 24,
    religion: 'Islam (Sunni)',
    maritalStatus: 'Never Married',
    height: "5'4\"",
    weight: 50,
    bloodGroup: 'AB+',
    education: 'BBA in Finance, NSU',
    profession: 'Assistant Officer, Dutch-Bangla Bank',
    monthlyIncome: 55000,
    fatherName: 'Jalal Uddin Ahmed',
    motherName: 'Mahmuda Begum',
    presentAddress: 'Uttara, Sector 7, Dhaka',
    permanentAddress: 'Kandirpar, Comilla',
    district: 'Comilla',
    mobileNumber: '+8801511002233',
    whatsappNumber: '+8801511002233',
    lookingFor: 'A well-settled gentleman with strong moral and family values.',
    aboutYourself: 'I love reading books, gardening, and spending time with my parents. I want a caring life partner.',
    partnerPreference: {
      religion: 'Islam',
      minAge: 26,
      maxAge: 32,
      minHeight: "5'7\"",
      education: 'Graduation Complete',
      district: 'Dhaka or Comilla',
      maritalStatus: 'Never Married'
    },
    profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&auto=format&fit=crop&q=80',
    galleryPhotos: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80'
    ],
    packageId: 'standard',
    status: 'verified',
    verificationDate: '2026-07-01',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BB-108842',
    completionPercentage: 90,
    followers: [],
    following: [],
    interestsSent: [],
    interestsReceived: [],
    isPremium: true,
    isFeatured: false,
    registrationDate: '2026-07-20'
  },
  {
    id: 'user-5',
    profileId: 'BB-203948',
    name: 'Kazi Farhan Ahmed',
    email: 'kazi.farhan@example.com',
    gender: 'Groom',
    dob: '1995-09-20',
    age: 30,
    religion: 'Islam (Sunni)',
    maritalStatus: 'Never Married',
    height: "5'10\"",
    weight: 76,
    bloodGroup: 'A+',
    education: 'MBA, IBA (Dhaka University)',
    profession: 'Marketing Manager, Unilever',
    monthlyIncome: 140000,
    fatherName: 'Kazi Rafiqul Islam',
    motherName: 'Dilara Begum',
    presentAddress: 'Gulshan 2, Dhaka',
    permanentAddress: 'Sadar, Chittagong',
    district: 'Dhaka',
    mobileNumber: '+8801711223344',
    whatsappNumber: '+8801711223344',
    lookingFor: 'A soft-spoken, qualified partner who values family relationships.',
    aboutYourself: 'I am ambitious, polite, and humorous. I like playing cricket and travelling.',
    partnerPreference: {
      religion: 'Islam',
      minAge: 23,
      maxAge: 29,
      minHeight: "5'2\"",
      education: 'Graduation Complete',
      district: 'Dhaka or Chittagong',
      maritalStatus: 'Never Married'
    },
    profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    galleryPhotos: [],
    packageId: 'vip',
    status: 'verified',
    verificationDate: '2026-06-01',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BB-203948',
    completionPercentage: 100,
    followers: ['user-1'],
    following: ['user-1'],
    interestsSent: ['user-1'],
    interestsReceived: ['user-1'],
    isVIP: true,
    isPremium: true,
    isFeatured: true
  },
  {
    id: 'user-6',
    profileId: 'BB-204556',
    name: 'Tanvir Rahman Mahim',
    email: 'tanvir.mahim@example.com',
    gender: 'Groom',
    dob: '1994-03-15',
    age: 31,
    religion: 'Islam (Sunni)',
    maritalStatus: 'Never Married',
    height: "5'9\"",
    weight: 74,
    bloodGroup: 'O+',
    education: 'BSc in EEE, BUET',
    profession: 'Executive Engineer, PDB',
    monthlyIncome: 110000,
    fatherName: 'Alhajj Jalal Uddin',
    motherName: 'Mariam Begum',
    presentAddress: 'Rajshahi Sadar',
    permanentAddress: 'Rajshahi Sadar',
    district: 'Rajshahi',
    mobileNumber: '+8801911002233',
    whatsappNumber: '+8801911002233',
    lookingFor: 'A simple, educated and caring bride.',
    aboutYourself: 'I work as an executive engineer. Simple lifestyle and religious family background.',
    partnerPreference: {
      religion: 'Islam',
      minAge: 23,
      maxAge: 28,
      minHeight: "5'2\"",
      education: 'Graduation Complete',
      district: 'Rajshahi or Dhaka',
      maritalStatus: 'Never Married'
    },
    profilePicture: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80',
    galleryPhotos: [],
    packageId: 'standard',
    status: 'verified',
    verificationDate: '2026-07-02',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BB-204556',
    completionPercentage: 90,
    followers: [],
    following: [],
    interestsSent: [],
    interestsReceived: [],
    isPremium: false,
    isVIP: false,
    isFeatured: false
  }
];

export const SEED_POSTS: Post[] = [
  {
    id: 'post-1',
    userId: 'user-2',
    userName: 'Sajid Al Hasan',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    userGender: 'Groom',
    userBadge: 'vip',
    content: 'Alhamdulillah! Taking a peaceful morning walk at Gulshan Lake Park today. In search of a lifetime companion who enjoys small morning moments and beautiful conversations. Wishing everyone a blessed day!',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80',
    likes: ['user-1', 'user-3'],
    loves: ['user-1'],
    comments: [
      {
        id: 'comment-1',
        userId: 'user-1',
        userName: 'Anika Rahman',
        userAvatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=400&auto=format&fit=crop&q=80',
        content: 'Beautiful scenery! Blessed morning to you too Sajid.',
        timestamp: new Date(Date.now() - 3600 * 1000).toISOString()
      }
    ],
    shares: 2,
    timestamp: new Date(Date.now() - 7200 * 1000).toISOString()
  },
  {
    id: 'post-2',
    userId: 'user-1',
    userName: 'Anika Rahman',
    userAvatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=400&auto=format&fit=crop&q=80',
    userGender: 'Bride',
    userBadge: 'premium',
    content: 'Spent my evening baking a fresh red velvet cake. There is a different kind of joy in preparing food with love. Hoping to share these warm, homey evenings with someone special very soon. ✨🍰',
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80',
    likes: ['user-2'],
    loves: ['user-2'],
    comments: [],
    shares: 0,
    timestamp: new Date(Date.now() - 14400 * 1000).toISOString()
  }
];

export const SEED_STORIES: Story[] = [
  {
    id: 'story-1',
    userId: 'user-1',
    userName: 'Anika Rahman',
    userAvatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=400&auto=format&fit=crop&q=80',
    image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&auto=format&fit=crop&q=80',
    timestamp: new Date(Date.now() - 3600 * 1000).toISOString(),
    viewedBy: ['user-2']
  },
  {
    id: 'story-2',
    userId: 'user-2',
    userName: 'Sajid Al Hasan',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    timestamp: new Date(Date.now() - 7200 * 1000).toISOString(),
    viewedBy: ['user-1']
  }
];

export const DISTRICT_LIST = [
  'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh',
  'Comilla', 'Feni', 'Gazipur', 'Narayanganj', 'Narsingdi', 'Tangail', 'Faridpur', 'Jessore',
  'Kushtia', 'Bogra', 'Dinajpur', 'Cox\'s Bazar', 'Habiganj', 'Maulvibazar', 'Sunamganj'
];

export const BANGLADESH_LOCATIONS = [
  'Gulshan, Dhaka', 'Banani, Dhaka', 'Dhanmondi, Dhaka', 'Uttara, Dhaka', 'Mirpur, Dhaka', 'Bashundhara R/A, Dhaka',
  'GEC Circle, Chittagong', 'Agrabad, Chittagong', 'Zindabazar, Sylhet', 'Shahjalal Dargah, Sylhet',
  'Cox\'s Bazar Sea Beach', 'Srimangal, Maulvibazar', 'Sajek Valley, Rangamati', 'Kuatakata Beach, Patuakhali',
  'Lalbagh Fort, Dhaka', 'National Parliament, Dhaka', 'Ahsan Manzil, Old Dhaka', 'Comilla Cantonment'
];

export const MUSIC_CATALOG = [
  // BANGLA SONGS
  {
    id: 'm1',
    title: 'Sundori Komola (সুন্দর কমলা)',
    artist: 'Traditional Marriage Folk',
    category: 'Wedding',
    language: 'Bangla',
    languageBn: 'বাংলা',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
    audioUrl: 'https://actions.google.com/sounds/v1/ambiences/outdoor_gentle_breeze.ogg'
  },
  {
    id: 'm2',
    title: 'Biyer Shehnai (বিয়ের সানাই সুর)',
    artist: 'Wedding Melodies Ensemble',
    category: 'Instrumental',
    language: 'Bangla',
    languageBn: 'বাংলা',
    coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=300&auto=format&fit=crop&q=80',
    audioUrl: 'https://actions.google.com/sounds/v1/foley/paper_slide.ogg'
  },
  {
    id: 'm3',
    title: 'Mon Shudhu Mon Chuyeche (মন শুধু মন ছুঁয়েছে)',
    artist: 'Romantic Classic Bengali',
    category: 'Romantic',
    language: 'Bangla',
    languageBn: 'বাংলা',
    coverUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=300&auto=format&fit=crop&q=80',
    audioUrl: 'https://actions.google.com/sounds/v1/weather/rain_heavy.ogg'
  },
  {
    id: 'm4',
    title: 'O He Shundor (ও হে সুন্দর)',
    artist: 'Rabindra Sangeet Love Edition',
    category: 'Classical',
    language: 'Bangla',
    languageBn: 'বাংলা',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80',
    audioUrl: 'https://actions.google.com/sounds/v1/ambiences/meadow_morning.ogg'
  },
  {
    id: 'm5',
    title: 'Holud Shondha Dhol Beats (হলুদ সন্ধ্যার ঢোল)',
    artist: 'Gaye Holud Celebration Crew',
    category: 'Gaye Holud',
    language: 'Bangla',
    languageBn: 'বাংলা',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80',
    audioUrl: 'https://actions.google.com/sounds/v1/ambiences/fire_crackling.ogg'
  },

  // HINDI SONGS
  {
    id: 'm6',
    title: 'Dil Wale Dulhania Wedding Sangeet',
    artist: 'Bollywood Romantic Beats',
    category: 'Romantic',
    language: 'Hindi',
    languageBn: 'হিন্দি',
    coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80',
    audioUrl: 'https://actions.google.com/sounds/v1/foley/running_water.ogg'
  },
  {
    id: 'm7',
    title: 'Khabar Nahi (Love Melody)',
    artist: 'Arijit & Shreya Duet Style',
    category: 'Romantic',
    language: 'Hindi',
    languageBn: 'হিন্দি',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
    audioUrl: 'https://actions.google.com/sounds/v1/ambiences/outdoor_gentle_breeze.ogg'
  },
  {
    id: 'm8',
    title: 'Navrai Majhi Sangeet Beats',
    artist: 'Royal Wedding Flute & Dhol',
    category: 'Wedding',
    language: 'Hindi',
    languageBn: 'হিন্দি',
    coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=300&auto=format&fit=crop&q=80',
    audioUrl: 'https://actions.google.com/sounds/v1/foley/paper_slide.ogg'
  },

  // ARABIC SONGS
  {
    id: 'm9',
    title: 'Khadita Al Qalb (حبيبي يا نور العين)',
    artist: 'Middle Eastern Wedding Sufi',
    category: 'Traditional',
    language: 'Arabic',
    languageBn: 'আরবি',
    coverUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=300&auto=format&fit=crop&q=80',
    audioUrl: 'https://actions.google.com/sounds/v1/weather/rain_heavy.ogg'
  },
  {
    id: 'm10',
    title: 'Maher Zain Nikah Blessing Nasheed',
    artist: 'Islamic Acoustic Oud',
    category: 'Nasheed',
    language: 'Arabic',
    languageBn: 'আরবি',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80',
    audioUrl: 'https://actions.google.com/sounds/v1/ambiences/meadow_morning.ogg'
  },

  // ENGLISH SONGS
  {
    id: 'm11',
    title: 'A Thousand Years (Violin Wedding Cover)',
    artist: 'Acoustic Wedding Strings',
    category: 'Acoustic',
    language: 'English',
    languageBn: 'ইংরেজি',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80',
    audioUrl: 'https://actions.google.com/sounds/v1/ambiences/fire_crackling.ogg'
  },
  {
    id: 'm12',
    title: 'Perfect Dual Piano & Flute',
    artist: 'Romantic Piano Duet',
    category: 'Instrumental',
    language: 'English',
    languageBn: 'ইংরেজি',
    coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80',
    audioUrl: 'https://actions.google.com/sounds/v1/foley/running_water.ogg'
  },

  // OTHER LANGUAGES
  {
    id: 'm13',
    title: 'Sufi Kalam & Harmonium Wedding Chords',
    artist: 'Subcontinent Classic Ensemble',
    category: 'Folk',
    language: 'Other',
    languageBn: 'অন্যান্য',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
    audioUrl: 'https://actions.google.com/sounds/v1/ambiences/outdoor_gentle_breeze.ogg'
  }
];

export const RELIGION_LIST = [
  'Islam (Sunni)', 'Islam (Shia)', 'Islam (Other)', 'Hinduism', 'Buddhism', 'Christianity'
];

export const SEED_REPORTS: import('./types').ReportRecord[] = [];
const REMOVED_SEED_REPORTS = [
  {
    id: 'REP-1001',
    reporterId: 'usr-2',
    reporterName: 'নাসরিন সুলতানা',
    reporterProfileId: 'BB-100202',
    reporterMobileNumber: '01711223344',
    reportedUserId: 'usr-1',
    reportedUserName: 'তানভীর আহমেদ',
    reportedUserProfileId: 'BB-100101',
    reportedMobileNumber: '01812345678',
    reasonPreset: 'ভুয়া বায়োডাটা / ফেক প্রোফাইল',
    additionalDetails: 'উনার বায়োডাটার শিক্ষাগত যোগ্যতা এবং পেশার তথ্য সঠিক মনে হচ্ছে না। মেসেজে অসামঞ্জস্যপূর্ণ কথা বলেছেন।',
    screenshots: [
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
    ],
    timestamp: new Date().toISOString(),
    status: 'pending',
    actionLogs: [],
  },
  {
    id: 'REP-1002',
    reporterId: 'usr-4',
    reporterName: 'ফারজানা আক্তার',
    reporterProfileId: 'BB-100404',
    reporterMobileNumber: '01988776655',
    reportedUserId: 'usr-3',
    reportedUserName: 'রাশেদুল ইসলাম',
    reportedUserProfileId: 'BB-100303',
    reportedMobileNumber: '01755443322',
    reasonPreset: 'অশোভন আচরণ বা অশালীন ভাষা',
    additionalDetails: 'ইনবক্সে অনুপযুক্ত ও অশালীন কথা বলেছেন। উপযুক্ত ব্যবস্থা নেয়ার অনুরোধ করছি।',
    screenshots: [
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80',
    ],
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    status: 'investigating',
    actionLogs: [
      {
        id: 'log-1',
        reportId: 'REP-1002',
        adminName: 'Super Admin',
        actionType: 'investigating',
        actionNote: 'অভিযোগটি প্রাথমিক তদন্তের অধীনে আনা হলো।',
        timestamp: new Date(Date.now() - 43200000).toISOString(),
      }
    ],
  },
  {
    id: 'REP-1003',
    reporterId: 'usr-1',
    reporterName: 'তানভীর আহমেদ',
    reporterProfileId: 'BB-100101',
    reporterMobileNumber: '01812345678',
    reportedUserId: 'usr-5',
    reportedUserName: 'জহির রায়হান',
    reportedUserProfileId: 'BB-100505',
    reportedMobileNumber: '01633221100',
    reasonPreset: 'টাকা চাওয়া বা বাণিজ্যিক প্রতারণা',
    additionalDetails: 'যোগাযোগের প্রথম দিনেই চিকিৎসার কথা বলে টাকা চেয়েছেন। এটি সন্দেহজনক প্রতারণামূলক আচরণ।',
    screenshots: [
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    ],
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    status: 'pending',
    actionLogs: [],
  }
];

