import {
  db,
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  deleteDoc,
  getDocs,
  writeBatch
} from './firebase';
import { User, Post, Story, Executive, PaymentRecord, ReportRecord, Notification, ChatMessage } from '../types';
import { SEED_EXECUTIVES, SEED_POSTS, SEED_STORIES } from '../data';

// Helper to sanitize undefined values for Firestore
function sanitizeForFirestore<T>(obj: T): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore);
  }
  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const [key, val] of Object.entries(obj)) {
      if (val !== undefined) {
        cleaned[key] = sanitizeForFirestore(val);
      }
    }
    return cleaned;
  }
  return obj;
}

// Ensure initial seed data exists ONCE across database lifecycle
export async function seedInitialFirestoreData() {
  try {
    const metaRef = doc(db, 'system_metadata', 'initial_seed');
    const metaSnap = await getDoc(metaRef);

    // If initial seed has already been completed for this database, never seed again!
    if (metaSnap.exists()) {
      console.log('Firebase: Database initial seed already completed. Skipping seed.');
      return;
    }

    const batch = writeBatch(db);
    let shouldCommit = false;

    // 1. Check & Clean up any old seed executives
    const oldExecIds = ['exec-wazed', 'exec-1', 'exec-2', 'exec-3', 'exec-rahim', 'exec-akash', 'exec-tania'];
    for (const oldId of oldExecIds) {
      const oldDocRef = doc(db, 'executives', oldId);
      const oldSnap = await getDoc(oldDocRef);
      if (oldSnap.exists()) {
        batch.delete(oldDocRef);
        shouldCommit = true;
      }
    }

    // 2. Check Posts
    const postsSnap = await getDocs(collection(db, 'posts'));
    if (postsSnap.empty && SEED_POSTS.length > 0) {
      SEED_POSTS.forEach((post) => {
        batch.set(doc(db, 'posts', post.id), sanitizeForFirestore(post));
      });
      shouldCommit = true;
    }

    // 3. Check Stories
    const storiesSnap = await getDocs(collection(db, 'stories'));
    if (storiesSnap.empty && SEED_STORIES.length > 0) {
      SEED_STORIES.forEach((story) => {
        batch.set(doc(db, 'stories', story.id), sanitizeForFirestore(story));
      });
      shouldCommit = true;
    }

    // Always record that the initial seed step was executed so it never runs again
    batch.set(metaRef, {
      seededAt: new Date().toISOString(),
      completed: true
    });

    await batch.commit();
    console.log('Firebase: Initial database seed completed ONCE.');
  } catch (error) {
    console.error('Error seeding initial Firestore data:', error);
  }
}

// ---------------- SUBSCRIPTIONS ----------------

export function subscribeUsers(onData: (users: User[]) => void) {
  return onSnapshot(
    collection(db, 'users'),
    (snapshot) => {
      const list: User[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as User);
      });
      onData(list);
    },
    (err) => console.error('Error listening to users:', err)
  );
}

export function subscribePosts(onData: (posts: Post[]) => void) {
  return onSnapshot(
    collection(db, 'posts'),
    (snapshot) => {
      const list: Post[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Post);
      });
      // Sort newest first
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      onData(list);
    },
    (err) => console.error('Error listening to posts:', err)
  );
}

export function subscribeStories(onData: (stories: Story[]) => void) {
  return onSnapshot(
    collection(db, 'stories'),
    (snapshot) => {
      const list: Story[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Story);
      });
      onData(list);
    },
    (err) => console.error('Error listening to stories:', err)
  );
}

export function subscribeExecutives(onData: (executives: Executive[]) => void) {
  return onSnapshot(
    collection(db, 'executives'),
    (snapshot) => {
      const list: Executive[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Executive);
      });
      onData(list);
    },
    (err) => console.error('Error listening to executives:', err)
  );
}

export function subscribePayments(onData: (payments: PaymentRecord[]) => void) {
  return onSnapshot(
    collection(db, 'payments'),
    (snapshot) => {
      const list: PaymentRecord[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as PaymentRecord);
      });
      list.sort((a, b) => new Date(b.paymentTime).getTime() - new Date(a.paymentTime).getTime());
      onData(list);
    },
    (err) => console.error('Error listening to payments:', err)
  );
}

export function subscribeReports(onData: (reports: ReportRecord[]) => void) {
  return onSnapshot(
    collection(db, 'reports'),
    (snapshot) => {
      const list: ReportRecord[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as ReportRecord);
      });
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      onData(list);
    },
    (err) => console.error('Error listening to reports:', err)
  );
}

export function subscribeNotifications(onData: (notifications: Notification[]) => void) {
  return onSnapshot(
    collection(db, 'notifications'),
    (snapshot) => {
      const list: Notification[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Notification);
      });
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      onData(list);
    },
    (err) => console.error('Error listening to notifications:', err)
  );
}

export function subscribeChats(onData: (chats: ChatMessage[]) => void) {
  return onSnapshot(
    collection(db, 'chats'),
    (snapshot) => {
      const list: ChatMessage[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as ChatMessage);
      });
      list.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      onData(list);
    },
    (err) => console.error('Error listening to chats:', err)
  );
}

// ---------------- CRUD WRITE HELPERS ----------------

export async function saveUserInFirestore(user: User) {
  if (!user.id) return;
  const ref = doc(db, 'users', user.id);
  await setDoc(ref, sanitizeForFirestore(user), { merge: true });
}

export async function deleteUserInFirestore(userId: string) {
  if (!userId) return;
  await deleteDoc(doc(db, 'users', userId));
}

export async function savePostInFirestore(post: Post) {
  if (!post.id) return;
  const ref = doc(db, 'posts', post.id);
  await setDoc(ref, sanitizeForFirestore(post), { merge: true });
}

export async function deletePostInFirestore(postId: string) {
  if (!postId) return;
  await deleteDoc(doc(db, 'posts', postId));
}

export async function saveStoryInFirestore(story: Story) {
  if (!story.id) return;
  const ref = doc(db, 'stories', story.id);
  await setDoc(ref, sanitizeForFirestore(story), { merge: true });
}

export async function deleteStoryInFirestore(storyId: string) {
  if (!storyId) return;
  await deleteDoc(doc(db, 'stories', storyId));
}

export async function saveExecutiveInFirestore(exec: Executive) {
  if (!exec.id) return;
  const ref = doc(db, 'executives', exec.id);
  await setDoc(ref, sanitizeForFirestore(exec), { merge: true });
}

export async function deleteExecutiveInFirestore(execId: string) {
  if (!execId) return;
  await deleteDoc(doc(db, 'executives', execId));
}

export async function clearAllExecutivesInFirestore() {
  try {
    const snap = await getDocs(collection(db, 'executives'));
    const batch = writeBatch(db);
    snap.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
    console.log('Firebase: All executives cleared from database.');
  } catch (error) {
    console.error('Error clearing executives from Firestore:', error);
  }
}

export async function savePaymentInFirestore(payment: PaymentRecord) {
  if (!payment.id) return;
  const ref = doc(db, 'payments', payment.id);
  await setDoc(ref, sanitizeForFirestore(payment), { merge: true });
}

export async function deletePaymentInFirestore(paymentId: string) {
  if (!paymentId) return;
  await deleteDoc(doc(db, 'payments', paymentId));
}

export async function saveReportInFirestore(report: ReportRecord) {
  if (!report.id) return;
  const ref = doc(db, 'reports', report.id);
  await setDoc(ref, sanitizeForFirestore(report), { merge: true });
}

export async function deleteReportInFirestore(reportId: string) {
  if (!reportId) return;
  await deleteDoc(doc(db, 'reports', reportId));
}

export async function saveNotificationInFirestore(notification: Notification) {
  if (!notification.id) return;
  const ref = doc(db, 'notifications', notification.id);
  await setDoc(ref, sanitizeForFirestore(notification), { merge: true });
}

export async function saveChatMessageInFirestore(message: ChatMessage) {
  if (!message.id) return;
  const ref = doc(db, 'chats', message.id);
  await setDoc(ref, sanitizeForFirestore(message), { merge: true });
}
