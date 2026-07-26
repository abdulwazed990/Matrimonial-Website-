export type UserStatus = 'pending' | 'verified' | 'rejected' | 'suspended';

export type PackageType = 'basic' | 'standard' | 'premium' | 'vip';

export interface MembershipPackage {
  id: PackageType;
  name: string;
  nameBn: string;
  price: number;
  durationDays: number;
  features: string[];
  featuresBn: string[];
}

export interface User {
  id: string; // Unique simulation ID or random string
  profileId: string; // BB-XXXXXX
  name: string;
  email: string;
  gender: 'Bride' | 'Groom';
  dob: string;
  age: number;
  religion: string;
  maritalStatus: string;
  height: string;
  weight: number; // in kg
  bloodGroup: string;
  education: string;
  profession: string;
  monthlyIncome: number; // in BDT
  fatherName: string;
  motherName: string;
  presentAddress: string;
  permanentAddress: string;
  district: string;
  mobileNumber: string;
  whatsappNumber: string;
  password?: string;
  lookingFor: string;
  aboutYourself: string;
  partnerPreference: {
    religion: string;
    minAge: number;
    maxAge: number;
    minHeight: string;
    education: string;
    district: string;
    maritalStatus: string;
  };
  profilePicture: string;
  coverPhoto: string;
  galleryPhotos: string[];
  packageId: PackageType;
  status: UserStatus;
  verificationDate?: string;
  qrCodeUrl: string;
  completionPercentage: number;
  activationPin?: string;
  serialNumber?: string;
  followers: string[]; // User IDs of followers
  following: string[]; // User IDs of following
  interestsSent: string[]; // User IDs whom this user sent interest to
  interestsReceived: string[]; // User IDs from whom this user received interest
  isPremium?: boolean;
  isVIP?: boolean;
  isFeatured?: boolean;
  isOnline?: boolean;
  lastSeen?: string;
  executiveReferenceCode?: string; // Reference code if registered via Executive (e.g. BBE-1001) or empty for System Registration
  registrationDate?: string; // ISO date string e.g. 2026-07-24
  registeredDate?: string; // Alias for registrationDate
  membershipActiveDate?: string; // Active activation date string
  membershipExpiryDate?: string; // Expiry date string
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  replies?: Comment[];
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userGender: 'Bride' | 'Groom';
  userBadge?: 'premium' | 'vip' | 'none';
  userVerified?: boolean;
  content: string;
  image?: string;
  video?: string;
  location?: string;
  music?: {
    id?: string;
    title: string;
    artist: string;
    audioUrl?: string;
    coverUrl?: string;
  };
  likes: string[]; // list of user IDs who liked
  loves: string[]; // list of user IDs who loved
  comments: Comment[];
  shares: number;
  timestamp: string;
}

export interface StoryReaction {
  userId: string;
  userName: string;
  userAvatar: string;
  type: 'like' | 'love' | 'heart' | 'clap';
}

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  image: string;
  video?: string;
  location?: string;
  music?: {
    id?: string;
    title: string;
    artist: string;
    audioUrl?: string;
    coverUrl?: string;
  };
  timestamp: string;
  viewedBy: string[]; // list of user IDs
  reactions?: StoryReaction[];
}

export interface PaymentRecord {
  id: string;
  transactionId: string;
  amount: number;
  paymentMethod: 'bKash' | 'Nagad' | 'Rocket';
  membershipPackage: PackageType;
  profileId: string; // BB-XXXXXX
  userName?: string;
  userMobile?: string;
  paymentTime: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  executiveRefCode?: string;
  isIncompleteRegistration?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  image?: string;
  timestamp: string;
  seen: boolean;
  typing?: boolean;
}

export interface Executive {
  id: string;
  name: string;
  designation: string; // e.g. Executive, Senior Executive, Team Leader
  photo: string;
  galleryPhotos?: string[]; // Multiple photos gallery
  mobileNumber?: string;
  whatsappNumber: string;
  email?: string;
  referenceCode: string; // Unique reference code e.g. BBE-1001, BBE-1002
  officeLocation?: string; // Current workstation / office location
  isActive: boolean;
  joiningDate?: string; // Joining date e.g. 2026-01-15
  bio?: string; // Optional for backward compatibility, not prompted or shown
}

export interface ReportActionLog {
  id: string;
  reportId: string;
  adminName: string;
  actionType: 'dismiss' | 'warning' | 'suspend' | 'ban' | 'remove_content' | 'investigating';
  actionNote?: string;
  timestamp: string;
}

export interface ReportRecord {
  id: string;
  reporterId: string;
  reporterName: string;
  reporterProfileId: string;
  reporterMobileNumber?: string;
  reportedUserId: string;
  reportedUserName: string;
  reportedUserProfileId: string;
  reportedMobileNumber?: string;
  reasonPreset: string;
  additionalDetails?: string;
  screenshots: string[]; // array of base64 data URLs or uploaded photo links
  timestamp: string;
  status: 'pending' | 'dismissed' | 'warned' | 'suspended' | 'banned' | 'content_removed' | 'investigating';
  actionTaken?: string;
  actionNote?: string;
  actionTimestamp?: string;
  actionLogs?: ReportActionLog[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  titleBn: string;
  content: string;
  contentBn: string;
  type: 'payment' | 'match' | 'message' | 'view' | 'system';
  timestamp: string;
  read: boolean;
}

export interface SuccessStory {
  id: string;
  brideName: string;
  groomName: string;
  marriageDate: string;
  image: string;
  story: string;
  storyBn: string;
  district: string;
}
