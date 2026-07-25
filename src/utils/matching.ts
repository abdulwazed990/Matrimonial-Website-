import { User } from '../types';

export interface MatchResult {
  score: number; // 0 to 100
  reasons: string[];
  reasonsBn: string[];
  aiCommentary: string;
  aiCommentaryBn: string;
}

function parseHeightInInches(heightStr: string): number {
  const match = heightStr.match(/(\d+)'(\d+)"?/);
  if (match) {
    const feet = parseInt(match[1]);
    const inches = parseInt(match[2]);
    return feet * 12 + inches;
  }
  return 60; // Default 5 feet
}

export function calculateMatchScore(userA: User, userB: User): MatchResult {
  let score = 0;
  const reasons: string[] = [];
  const reasonsBn: string[] = [];

  // 1. Religion Match (Critical - 25 points)
  const relA = userA.religion.split(' ')[0].toLowerCase();
  const relB = userB.religion.split(' ')[0].toLowerCase();
  if (relA === relB) {
    score += 25;
    reasons.push('Same religious background');
    reasonsBn.push('একই ধর্মীয় বিশ্বাস');
  } else {
    // Different major religions
    reasons.push('Different religious beliefs');
    reasonsBn.push('ভিন্ন ধর্মীয় বিশ্বাস');
  }

  // 2. Age Preference (20 points)
  const prefAgeMin = userA.partnerPreference.minAge || 20;
  const prefAgeMax = userA.partnerPreference.maxAge || 45;
  if (userB.age >= prefAgeMin && userB.age <= prefAgeMax) {
    score += 20;
    reasons.push(`Age (${userB.age} years) is within your preferred range (${prefAgeMin}-${prefAgeMax})`);
    reasonsBn.push(`বয়স (${userB.age} বছর) আপনার পছন্দের সীমার (${prefAgeMin}-${prefAgeMax}) মধ্যে আছে`);
  } else {
    const ageDiff = Math.min(Math.abs(userB.age - prefAgeMin), Math.abs(userB.age - prefAgeMax));
    if (ageDiff <= 3) {
      score += 10;
      reasons.push(`Age (${userB.age} years) is very close to your preferred range`);
      reasonsBn.push(`বয়স (${userB.age} বছর) আপনার পছন্দের সীমার খুব কাছাকাছি`);
    }
  }

  // 3. District Match (15 points)
  const userBDistrictLower = userB.district.toLowerCase();
  const userAPrefDistrictLower = (userA.partnerPreference.district || '').toLowerCase();
  if (userAPrefDistrictLower.includes(userBDistrictLower) || userBDistrictLower.includes(userAPrefDistrictLower) || userAPrefDistrictLower === 'any district' || userAPrefDistrictLower === 'any') {
    score += 15;
    reasons.push(`District (${userB.district}) matches your preferred location`);
    reasonsBn.push(`জেলা (${userB.district}) আপনার পছন্দের অবস্থানের সাথে মিলেছে`);
  } else if (userA.district.toLowerCase() === userB.district.toLowerCase()) {
    score += 10;
    reasons.push(`Both are currently living in ${userA.district}`);
    reasonsBn.push(`উভয়েই বর্তমানে ${userA.district} জেলায় বসবাস করছেন`);
  }

  // 4. Education Preference (15 points)
  const prefEdu = (userA.partnerPreference.education || '').toLowerCase();
  const bEdu = userB.education.toLowerCase();
  if (prefEdu === 'any' || prefEdu === '' || bEdu.includes(prefEdu) || prefEdu.split('/').some(edu => bEdu.includes(edu.trim()))) {
    score += 15;
    reasons.push(`Education (${userB.education}) meets your academic standards`);
    reasonsBn.push(`শিক্ষাগত যোগ্যতা (${userB.education}) আপনার পছন্দের সাথে সামঞ্জস্যপূর্ণ`);
  } else {
    score += 5;
    reasons.push('Highly educated background');
    reasonsBn.push('উচ্চ শিক্ষিত পারিবারিক পটভূমি');
  }

  // 5. Height Match (10 points)
  const bHeightInches = parseHeightInInches(userB.height);
  const prefMinHeightInches = parseHeightInInches(userA.partnerPreference.minHeight || "5'0\"");
  if (bHeightInches >= prefMinHeightInches) {
    score += 10;
    reasons.push(`Height (${userB.height}) meets your partner height criteria`);
    reasonsBn.push(`উচ্চতা (${userB.height}) আপনার পছন্দের উচ্চতা সীমার সাথে মিলেছে`);
  } else {
    score += 5;
  }

  // 6. Income & Professional Level (15 points)
  if (userB.monthlyIncome >= 80000) {
    score += 15;
    reasons.push('Strong professional and financial stability');
    reasonsBn.push('দৃঢ় পেশাদার এবং আর্থিক স্থিতিশীলতা');
  } else if (userB.monthlyIncome >= 40000) {
    score += 10;
    reasons.push('Settled professional background');
    reasonsBn.push('প্রতিষ্ঠিত পেশাগত অবস্থান');
  } else {
    score += 5;
  }

  // Cap score at 100 and guarantee a reasonable floor for the same religion
  if (relA === relB) {
    score = Math.max(score, 60);
  }
  score = Math.min(score, 100);

  // Generate dynamic AI matchmaker description
  let aiCommentary = '';
  let aiCommentaryBn = '';

  if (score >= 90) {
    aiCommentary = `Excellent Match! ${userB.name} ticks almost all of your core preferences. Both profiles demonstrate exceptional educational qualifications and professional standing in ${userB.district}. We highly recommend sending an interest immediately.`;
    aiCommentaryBn = `চমৎকার ম্যাচ! ${userB.name} আপনার প্রায় সমস্ত প্রধান পছন্দ পূরণ করে। উভয় প্রোফাইলই শিক্ষা ও পেশাগত দিক থেকে ${userB.district}-এ অত্যন্ত সম্মানিত অবস্থানে রয়েছে। আমরা অবিলম্বে আগ্রহ প্রেরণের পরামর্শ দিচ্ছি।`;
  } else if (score >= 75) {
    aiCommentary = `Great Compatibility! There is strong alignment in religious views, age, and academic qualifications. Although minor preferences like specific location or heights vary slightly, the family values appear to be highly compatible.`;
    aiCommentaryBn = `দারুণ সামঞ্জস্য! ধর্মীয় দৃষ্টিভঙ্গি, বয়স এবং শিক্ষাগত যোগ্যতায় চমৎকার মিল রয়েছে। যদিও জেলা বা উচ্চতার মতো ছোটখাটো বিষয়ে সামান্য অমিল আছে, তবে পারিবারিক মূল্যবোধের দিক থেকে এটি চমৎকার হতে পারে।`;
  } else {
    aiCommentary = `Good Match. While there are some differences in district or career sectors, you share a common religious and cultural background. It could be an interesting connection to explore if you are flexible on secondary criteria.`;
    aiCommentaryBn = `ভালো ম্যাচ। যদিও জেলা বা পেশাগত ক্ষেত্রে কিছু অমিল রয়েছে, তবে আপনারা একই ধর্মীয় ও সাংস্কৃতিক পটভূমি শেয়ার করেন। অন্যান্য বিষয় শিথিল করলে এটি একটি সুন্দর জোড় হতে পারে।`;
  }

  return {
    score,
    reasons,
    reasonsBn,
    aiCommentary,
    aiCommentaryBn
  };
}
