/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Flame,
  Award,
  TrendingUp,
  Settings as SettingsIcon,
  ShoppingBag,
  Grid,
  MapPin,
  Moon,
  Sun,
  Camera,
  BookOpen,
  Send,
  Trash2,
  Calendar,
  CheckCircle,
  HelpCircle,
  Clock,
  LogOut,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  Key,
  Coins,
  Cpu,
  Trophy,
  Heart,
} from "lucide-react";

// Types
import { UserProfile, Habit, HistoryLog, ShopItem, ChallengeQuest } from "./types";

// MFA helpers
import {
  generateMfaSecret,
  generateTOTPCode,
  verifyMfaCode,
  getMfaCountdown,
} from "./lib/mfaUtils";

// Firebase helpers
import {
  isFirebaseConfigured,
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signOut,
} from "./lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  setDoc as firestoreSetDoc,
} from "firebase/firestore";

// Visual illustrations & audio effects
import { AvatarSVG, EnemySVG } from "./components/AnimeSVGs";
import { sound } from "./components/AudioEffects";
import { MfaQRCodeSVG } from "./components/MfaQRCodeSVG";
import { NotificationToast, ToastMessage } from "./components/NotificationToast";
import { AIVerifierModal } from "./components/AIVerifierModal";
import { AICoachLab } from "./components/AICoachLab";

// Initial items
const DEFAULT_HABITS: Habit[] = [
  {
    id: "habit1",
    name: "Wake Up in The Morning with Drinking Water and Morning Exercise",
    category: "Sleep & Health",
    difficulty: "Medium",
    xpReward: 20,
    streakCount: 0,
    completedToday: false,
    timesCompleted: 0,
  },
  {
    id: "habit2",
    name: "Go to school to study",
    category: "Academic",
    difficulty: "Medium",
    xpReward: 30,
    streakCount: 0,
    completedToday: false,
    timesCompleted: 0,
  },
  {
    id: "habit3",
    name: "Go Home, Go Gym, and Studying",
    category: "Fitness & Discipline",
    difficulty: "Hard",
    xpReward: 50,
    streakCount: 0,
    completedToday: false,
    timesCompleted: 0,
  },
];

const SHOP_ITEMS: ShopItem[] = [
  {
    id: "shirt_blue",
    name: "Oceanic Blue Jersey",
    category: "shirt",
    cost: 30,
    description: "Athletic blue shirt with neon stripes.",
    value: "blue",
  },
  {
    id: "shirt_purple",
    name: "Viper Purple Jersey",
    category: "shirt",
    cost: 30,
    description: "Anime styling purple mesh armor.",
    value: "purple",
  },
  {
    id: "racket_normal",
    name: "Zyston Cobalt Frame",
    category: "racket",
    cost: 50,
    description: "Carbon-metal frame with 24lb tension strings.",
    value: "normal",
  },
  {
    id: "custom_shield",
    name: "Stitch Guardian Shield",
    category: "power",
    cost: 15,
    description: "Designed in Stitch. A defensive Aegis shield that wards off evil habit attacks and triggers the Aegis Defender badge!",
    value: "shield",
  },
  {
    id: "focus_elixir",
    name: "Stitch Focus Elixir",
    category: "power",
    cost: 15,
    description: "Designed in Stitch. Energy potion that instantly recovers +50 HP to your HUD health bar!",
    value: "elixir",
  },
  {
    id: "homework_scroll",
    name: "Academics Mastery Scroll",
    category: "power",
    cost: 20,
    description: "Designed in Stitch. Focused knowledge pack. Instantly awards +100 EXP to level up your character!",
    value: "scroll",
  },
  {
    id: "real_life_break",
    name: "Real-Life Break Card",
    category: "power",
    cost: 10,
    description: "Designed in Stitch. Allows you to claim physical rest and unlocks the prestigious Relaxation Guru badge!",
    value: "break",
  },
];

const BOUNTY_CHALLENGES: ChallengeQuest[] = [
  {
    id: "ch1",
    name: "Vertical Smashing Hops",
    description: "Perform 100 explosive vertical shadow jumps to build racket elevation.",
    target: 100,
    current: 0,
    rewardCoins: 15,
    completed: false,
  },
  {
    id: "ch2",
    name: "Hydration Grid Peak",
    description: "Sip 3 liters of fresh hydration water to tension active cells.",
    target: 3,
    current: 0,
    rewardCoins: 10,
    completed: false,
  },
  {
    id: "ch3",
    name: "Course Document Marathon",
    description: "Absorb studying documents for 35 minutes continuous loop.",
    target: 35,
    current: 0,
    rewardCoins: 20,
    completed: false,
  },
];

const LEADERBOARD_USERS = [
  { rank: 1, name: "Lin Dan [Legend]", level: 68, xp: 99400, racket: "godly" },
  { rank: 2, name: "Lee Chong Wei", level: 55, xp: 72000, racket: "pro" },
  { rank: 3, name: "Viktor Axelsen", level: 42, xp: 51200, racket: "pro" },
];

// Aesthetic Brand Logo Component
const BrandLogo = ({ size = "lg", className = "" }: { size?: "sm" | "md" | "lg" | "xl", className?: string }) => {
  const isXl = size === "xl";
  const isLg = size === "lg";
  const isMd = size === "md";

  return (
    <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
      {/* Glowing Hexagonal/Circular Base Badge */}
      <div 
        className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-950 to-black border-2 border-[#00FFCC] p-1.5 shadow-[0_0_20px_rgba(0,255,204,0.35)] ${
          isXl ? "w-24 h-24" : isLg ? "w-16 h-16" : isMd ? "w-12 h-12" : "w-10 h-10"
        }`}
      >
        {/* Dynamic backdrop reflection */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00FFCC]/5 to-[#FF3366]/5 rounded-2xl animate-pulse" />
        
        {/* Glowing concentric decorative rings of rotation */}
        <svg
          viewBox="0 0 100 100"
          className={`absolute animate-[spin_16s_linear_infinite] opacity-40 text-[#00FFCC] ${
            isXl ? "w-20 h-20" : isLg ? "w-14 h-14" : isMd ? "w-10 h-10" : "w-8 h-8"
          }`}
        >
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="12 12" />
          <circle cx="50" cy="50" r="38" fill="none" stroke="#FF3366" strokeWidth="1.5" strokeDasharray="6 14" />
        </svg>

        {/* Dynamic center glyph display */}
        <span 
          className={`relative font-black tracking-tighter select-none ${
            isXl ? "text-3xl" : isLg ? "text-xl" : isMd ? "text-md" : "text-sm"
          } bg-gradient-to-r from-white via-[#00FFCC] to-[#00FFCC] bg-clip-text text-transparent`}
          style={{ textShadow: "0 0 8px rgba(0, 255, 204, 0.45)" }}
        >
          SET
        </span>
      </div>

      <div className="mt-3.5 space-y-1">
        <h2 
          className={`font-black tracking-tight text-white uppercase flex items-center justify-center ${
            isXl ? "text-3xl" : isLg ? "text-xl animate-pulse" : isMd ? "text-md" : "text-xs"
          }`}
        >
          <span>Ready</span>
          <span className="text-[#00FFCC] ml-1">SET</span>
          <span className="text-[#FF3366]">GO</span>
        </h2>
        <p className="font-mono text-[9px] text-gray-400 uppercase tracking-[0.25em] font-black">
          Arena Routine Engine
        </p>
      </div>
    </div>
  );
};

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<string>("home"); // 'home' | 'stats' | 'shop' | 'journal' | 'more'
  const [moreSubTab, setMoreSubTab] = useState<string>("leaderboard"); // 'leaderboard' | 'calendar' | 'challenges' | 'profile' | 'settings'
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Theme support
  const [themeMode, setThemeMode] = useState<"dark" | "light">("dark");
  const [appLoading, setAppLoading] = useState<boolean>(true);

  // User persistence core
  const [user, setUser] = useState<any>(null); // Firebase authenticated user
  const [guestOptIn, setGuestOptIn] = useState<boolean>(false);
  const [showAuthTroubleshoot, setShowAuthTroubleshoot] = useState<boolean>(false);

  // MFA states
  const [isMfaLocked, setIsMfaLocked] = useState<boolean>(false);
  const [showMfaSetupModal, setShowMfaSetupModal] = useState<boolean>(false);
  const [showMfaDisableModal, setShowMfaDisableModal] = useState<boolean>(false);
  const [mfaSetupSecret, setMfaSetupSecret] = useState<string>("");
  const [mfaInputCode, setMfaInputCode] = useState<string>("");
  const [mfaFeedbackError, setMfaFeedbackError] = useState<boolean>(false);
  const [mfaCurrentCountdown, setMfaCurrentCountdown] = useState<number>(30);

  const [profile, setProfile] = useState<UserProfile>({
    userId: "offline",
    email: "guest@readysetgo.io",
    xp: 0,
    coins: 50, // Starting bonus
    level: 1,
    hp: 100, // Player Health/Stamina
    streak: 0,
    perfectDaysCount: 0,
    smashPowerLevel: 1,
    lastCheckDate: "",
    purchasedItems: [],
    currentRacket: "wood",
    currentShirt: "casual",
    currentPants: "casual",
    badges: [],
    statsWeeklyXP: [120, 80, 50, 150, 200, 140, 90],
    currentRivalId: "lining",
    currentRivalHp: 100,
  });

  const [habits, setHabits] = useState<Habit[]>(DEFAULT_HABITS);
  const [challenges, setChallenges] = useState<ChallengeQuest[]>(BOUNTY_CHALLENGES);
  
  // Journal entries
  const [journalEntries, setJournalEntries] = useState<Array<{ date: string; note: string }>>([
    { date: "2026-05-20", note: "Gym study session concluded perfectly! Fired up for the next boss." },
    { date: "2026-05-19", note: "Hydrated properly, finished morning stretches. Felt explosive." },
  ]);
  const [newJournalNote, setNewJournalNote] = useState("");

  // Visual effects feedback states
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showLevelUpCinematic, setShowLevelUpCinematic] = useState<number | null>(null);
  const [enemyShake, setEnemyShake] = useState(false);
  const [enemyDefeated, setEnemyDefeated] = useState(false);
  const [showPerfectDayBonus, setShowPerfectDayBonus] = useState(false);
  const [isSmashing, setIsSmashing] = useState(false);
  const [isRivalAttacked, setIsRivalAttacked] = useState<string | null>(null); // 'lining' | 'victor' | 'yonex' | null

  // AI Verifier state
  const [selectedHabitForAI, setSelectedHabitForAI] = useState<Habit | null>(null);

  // Time remaining tracker
  const [countdownString, setCountdownString] = useState("23:59:59");

  const showToast = (text: string, type: "success" | "award" | "shop" | "streak" | "warning") => {
    const fresh: ToastMessage = {
      id: Math.random().toString(),
      text,
      type,
    };
    setToasts((prev) => [...prev, fresh]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. App Startup Loader & Auth hook
  useEffect(() => {
    let unsubscribe: any = null;

    if (isFirebaseConfigured && auth) {
      unsubscribe = auth.onAuthStateChanged(async (currentUser: any) => {
        if (currentUser) {
          setUser(currentUser);
          await loadUserData(currentUser);
        } else {
          setUser(null);
          loadGuestData();
        }
      });
    } else {
      loadGuestData();
    }

    // Elegant 1.5 second initial branding load delay
    const splashTimer = setTimeout(() => {
      setAppLoading(false);
    }, 1500);

    // Daily countdown refresh loop
    const timer = setInterval(() => {
      const now = new Date();
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
      const diff = endOfToday.getTime() - now.getTime();
      const hrs = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, "0");
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, "0");
      const secs = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, "0");
      setCountdownString(`${hrs}:${mins}:${secs}`);
    }, 1000);

    return () => {
      if (unsubscribe) unsubscribe();
      clearInterval(timer);
      clearTimeout(splashTimer);
    };
  }, []);

  // 2. MFA Live Countdown Sync
  useEffect(() => {
    const timer = setInterval(() => {
      const countdown = getMfaCountdown();
      setMfaCurrentCountdown(countdown.seconds);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadGuestData = () => {
    try {
      const savedProfile = localStorage.getItem("readyset_profile");
      const savedHabits = localStorage.getItem("readyset_habits");
      const savedChallenges = localStorage.getItem("readyset_challenges");
      const savedJournal = localStorage.getItem("readyset_journal");

      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        const parsedWithHp = {
          hp: 100,
          currentRivalId: parsed.currentRivalId || (parsed.xp >= 1501 ? "yonex" : parsed.xp >= 501 ? "victor" : "lining"),
          currentRivalHp: parsed.currentRivalHp !== undefined ? parsed.currentRivalHp : (parsed.xp >= 1501 ? 300 : parsed.xp >= 501 ? 200 : 100),
          ...parsed
        };
        setProfile(parsedWithHp);
        if (parsedWithHp.mfaEnabled) {
          setIsMfaLocked(true);
        }
        checkYesterdayMissesAndAttack(parsedWithHp);
      } else {
        const todayStr = new Date().toISOString().split("T")[0];
        setProfile((prev) => ({ ...prev, lastCheckDate: todayStr }));
      }

      if (savedHabits) {
        setHabits(JSON.parse(savedHabits));
      }
      if (savedChallenges) {
        setChallenges(JSON.parse(savedChallenges));
      }
      if (savedJournal) {
        setJournalEntries(JSON.parse(savedJournal));
      }
    } catch (e) {
      console.error("Local storage loading error, resetting to defaults:", e);
    }
  };

  // Synchronize Firestore parameters
  const loadUserData = async (authenticatedUser: any) => {
    if (!db) return;
    try {
      const userRef = doc(db, "users", authenticatedUser.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const cloudData = docSnap.data() as UserProfile;
        const cloudDataWithHp = {
          hp: 100,
          currentRivalId: cloudData.currentRivalId || (cloudData.xp >= 1501 ? "yonex" : cloudData.xp >= 501 ? "victor" : "lining"),
          currentRivalHp: cloudData.currentRivalHp !== undefined ? cloudData.currentRivalHp : (cloudData.xp >= 1501 ? 300 : cloudData.xp >= 501 ? 200 : 100),
          ...cloudData
        };
        setProfile(cloudDataWithHp);
        if (cloudDataWithHp.mfaEnabled) {
          setIsMfaLocked(true);
        }
        checkYesterdayMissesAndAttack(cloudDataWithHp);

        // Fetch subcollection user habits
        const habitsList: Habit[] = [];
        const habitsSnap = await getDocs(collection(db, "users", authenticatedUser.uid, "habits"));
        habitsSnap.forEach((d) => {
          habitsList.push(d.data() as Habit);
        });

        if (habitsList.length > 0) {
          // Sync in-memory checklist with db
          setHabits(habitsList);
        } else {
          // Write defaults to cloud
          for (const item of DEFAULT_HABITS) {
            await setDoc(doc(db, "users", authenticatedUser.uid, "habits", item.id), item);
          }
        }
      } else {
        // Create initial profile in firestore
        const todayStr = new Date().toISOString().split("T")[0];
        const initialUserData: UserProfile = {
          userId: authenticatedUser.uid,
          email: authenticatedUser.email || "sport@readysetgo.io",
          xp: 0,
          coins: 50,
          level: 1,
          hp: 100,
          streak: 0,
          perfectDaysCount: 0,
          smashPowerLevel: 1,
          lastCheckDate: todayStr,
          purchasedItems: [],
          currentRacket: "wood",
          currentShirt: "casual",
          currentPants: "casual",
          badges: [],
          statsWeeklyXP: [120, 80, 50, 150, 200, 140, 90],
          currentRivalId: "lining",
          currentRivalHp: 100,
        };
        await setDoc(userRef, initialUserData);
        setProfile(initialUserData);

        for (const item of DEFAULT_HABITS) {
          await setDoc(doc(db, "users", authenticatedUser.uid, "habits", item.id), item);
        }
      }
    } catch (err) {
      console.error("Firestore Loading Error:", err);
      loadGuestData();
    }
  };

  const syncToStorage = (updatedProfile: UserProfile, updatedHabits: Habit[]) => {
    // 1. Sync localStorage
    localStorage.setItem("readyset_profile", JSON.stringify(updatedProfile));
    localStorage.setItem("readyset_habits", JSON.stringify(updatedHabits));

    // 2. Sync Firebase cloud if available
    if (user && db) {
      const uRef = doc(db, "users", user.uid);
      setDoc(uRef, updatedProfile, { merge: true }).catch((e) => console.error("Cloud profile sync error:", e));
      
      updatedHabits.forEach((hb) => {
        const hbRef = doc(db, "users", user.uid, "habits", hb.id);
        setDoc(hbRef, hb).catch((e) => console.error("Cloud habit sync error:", e));
      });
    }
  };

  // Google Single Sign-In trigger
  const triggerGoogleLogin = async () => {
    if (!googleProvider || !auth) {
      showToast("Firebase Auth is offline. Using local guest credentials!", "warning");
      return;
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        setUser(result.user);
        await loadUserData(result.user);
        showToast(`Google Profile Linked: ${result.user.displayName}!`, "success");
      }
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      const isPopupBlocked = err.code?.includes("popup-blocked") || err.message?.includes("popup-blocked");
      const isCancelled = err.code?.includes("cancelled-popup") || err.message?.includes("cancelled-popup");
      
      if (isPopupBlocked) {
        showToast("Popup Blocked! Please click 'Open in New Tab' at top-right to sign in smoothly.", "warning");
      } else if (isCancelled) {
        showToast("Popup closed before completing sign-in. Please try again.", "warning");
      } else {
        showToast("Iframe limit detected: click 'Open in New Tab' to link with Google safely.", "warning");
      }
    }
  };

  const triggerGoogleLogout = async () => {
    if (auth) {
      await signOut(auth);
      setGuestOptIn(false);
      setUser(null);
      loadGuestData();
      showToast("Successfully disconnected account.", "success");
    }
  };

  // MFA Activation & Verification Actions
  const startMfaActivation = () => {
    const freshSecret = generateMfaSecret();
    setMfaSetupSecret(freshSecret);
    setMfaInputCode("");
    setMfaFeedbackError(false);
    setShowMfaSetupModal(true);
  };

  const handleMfaCodeChange = (val: string, purpose: "lock" | "setup" | "disable") => {
    const sanitized = val.replace(/[^0-9]/g, "").slice(0, 6);
    setMfaInputCode(sanitized);
    setMfaFeedbackError(false);
    
    // Auto-trigger verification when 6 digits are fully typed
    if (sanitized.length === 6) {
      if (purpose === "lock") {
        const isMatch = verifyMfaCode(profile.mfaSecret || "", sanitized);
        if (isMatch) {
          sound.playCompletion();
          setIsMfaLocked(false);
          setMfaInputCode("");
          showToast("🔒 Athlete Double-Defense Shield Decoded & Unlocked!", "success");
        } else {
          setMfaFeedbackError(true);
          sound.playSmash(); // Sound feedback
          showToast("Validation Failed! Code does not match 2FA cycles.", "warning");
          setMfaInputCode("");
        }
      } else if (purpose === "setup") {
        const isMatch = verifyMfaCode(mfaSetupSecret, sanitized);
        if (isMatch) {
          sound.playCompletion();
          const updatedProfile = {
            ...profile,
            mfaEnabled: true,
            mfaSecret: mfaSetupSecret,
          };
          setProfile(updatedProfile);
          syncToStorage(updatedProfile, habits);
          setShowMfaSetupModal(false);
          setMfaInputCode("");
          showToast("🛡️ Athlete Dual-MFA Active Shield Enabled Successfully!", "success");
        } else {
          setMfaFeedbackError(true);
          sound.playSmash();
          showToast("Incorrect Code! Verification failed, please try again.", "warning");
          setMfaInputCode("");
        }
      } else if (purpose === "disable") {
        const isMatch = verifyMfaCode(profile.mfaSecret || "", sanitized);
        if (isMatch) {
          sound.playCompletion();
          const updatedProfile = {
            ...profile,
            mfaEnabled: false,
            mfaSecret: undefined,
          };
          setProfile(updatedProfile);
          syncToStorage(updatedProfile, habits);
          setShowMfaDisableModal(false);
          setMfaInputCode("");
          showToast("MFA Security Shield Deactivated.", "warning");
        } else {
          setMfaFeedbackError(true);
          sound.playSmash();
          showToast("Deactivation code invalid. Shield remains active.", "warning");
          setMfaInputCode("");
        }
      }
    }
  };

  // Calculate current active enemy based on permanent XP total or current rival state
  const getEnemyDetails = (xp: number, rivalId?: "lining" | "victor" | "yonex") => {
    const id = rivalId || (xp >= 1501 ? "yonex" : xp >= 501 ? "victor" : "lining");
    if (id === "yonex") {
      return {
        id: "yonex" as const,
        name: "Yonex",
        description: "An international renown world champion with a godly dark aura.",
        fierceness: "5/5",
        hp: 300,
        attackEffect: "Streak disable and XP growth freezes",
      };
    } else if (id === "victor") {
      return {
        id: "victor" as const,
        name: "Victor",
        description: "A solid European badminton player with elite outfits and rackets.",
        fierceness: "3/5",
        hp: 200,
        attackEffect: "XP and coin gains cut by 50%",
      };
    } else {
      return {
        id: "lining" as const,
        name: "Li Ning",
        description: "A budget Chinese local tournament rookie with cheap outfits.",
        fierceness: "2/5",
        hp: 100,
        attackEffect: "UI turns grey and 1 coin deducted each day missed",
      };
    }
  };

  const getLevelFromXp = (xpValue: number): number => {
    if (xpValue >= 3501) return 5;
    if (xpValue >= 2001) return 4;
    if (xpValue >= 1001) return 3;
    if (xpValue >= 501) return 2;
    return 1;
  };

  // Calculates Boss Remaining HP based on persistent health pool state
  const getBossRemainingHp = () => {
    const rivalId = profile.currentRivalId || (profile.xp >= 1501 ? "yonex" : profile.xp >= 501 ? "victor" : "lining");
    const enemyInfo = getEnemyDetails(profile.xp, rivalId);
    return profile.currentRivalHp !== undefined ? profile.currentRivalHp : enemyInfo.hp;
  };

  // Attack logic checking: Run on loader mount when user's last date loads
  const checkYesterdayMissesAndAttack = (profileData: UserProfile) => {
    const todayStr = new Date().toISOString().split("T")[0];
    if (profileData.lastCheckDate && profileData.lastCheckDate !== todayStr) {
      // Habit missed detection: check if previous date completed habits is partial
      // For simulator simplicity, randomly trigger rival attack frame if checklist is cleared and not reset
      const enemyInfo = getEnemyDetails(profileData.xp, profileData.currentRivalId);
      setIsRivalAttacked(enemyInfo.id);
      
      // Perform penalty
      const hpPenalty = 25;
      if (enemyInfo.id === "lining") {
        setProfile((prev) => ({
          ...prev,
          coins: Math.max(0, prev.coins - 1),
          hp: Math.max(10, (prev.hp ?? 100) - hpPenalty),
          lastCheckDate: todayStr,
        }));
        showToast(`Rival Li Ning [Blue Light Boss] Attacked! 1 Coin stolen & -${hpPenalty} HP lost.`, "warning");
      } else {
        setProfile((prev) => ({
          ...prev,
          hp: Math.max(10, (prev.hp ?? 100) - hpPenalty),
          lastCheckDate: todayStr,
        }));
        showToast(`Rival ${enemyInfo.name} [Bad Habit Boss] has attacked! -${hpPenalty} HP penalty applied!`, "warning");
      }
    }
  };

  // 2. HABIT CHECK-IN PROCESSING ENGINE
  const handleHabitCompleteAction = (habitId: string) => {
    const habitToVerify = habits.find((h) => h.id === habitId);
    if (!habitToVerify) return;

    if (habitToVerify.completedToday) {
      // Toggle back states
      const updatedHabits = habits.map((h) =>
        h.id === habitId ? { ...h, completedToday: false } : h
      );
      setHabits(updatedHabits);
      syncToStorage(profile, updatedHabits);
      showToast("Habit check undone.", "warning");
      return;
    }

    // Trigger Gym Eye Camera Vision Modal options or direct checks
    setSelectedHabitForAI(habitToVerify);
  };

  // Runs on Verified output from AIVerifierModal
  const triggerVerifySuccess = (
    habitId: string,
    verifiedXp: number,
    verifiedCoins: number,
    feedbackHtml: string
  ) => {
    sound.playCompletion();
    setIsSmashing(true);
    setEnemyShake(true);
    setTimeout(() => {
      setIsSmashing(false);
      setEnemyShake(false);
    }, 600);

    const targetH = habits.find((h) => h.id === habitId)!;
    const timesNow = (targetH.timesCompleted || 0) + 1;

    // Check specific rewards & bonus criteria specified by rules
    let coinGain = verifiedCoins;
    let comments = "";

    // Rule: Habit 1 first completion ever custom +10 Coins
    if (habitId === "habit1" && timesNow === 1) {
      coinGain += 10;
      comments += " (+10 First Completed Ever Bonus!)";
    }

    // Streak Multipliers: 2x XP multiplier if user maintains generic consecutive streaks
    let xpGain = verifiedXp;
    if (profile.streak > 0) {
      xpGain = verifiedXp * 2;
      comments += " (2x Streak XP Multiplier Activated!)";
    }

    // Apply Victor Attack de-buff limits (XP & Coins rate cut 50%)
    if (isRivalAttacked === "victor") {
      xpGain = Math.round(xpGain * 0.5);
      coinGain = Math.round(coinGain * 0.5);
      comments += " [Victor De-buff Applied! -50%]";
    }

    // Apply Yonex freeze level limits (Coin & XP earnings cut to 0)
    if (isRivalAttacked === "yonex") {
      xpGain = 0;
      coinGain = 0;
      comments += " [Yonex Cosmic Freeze! 0 gain]";
    }

    // Calculate level metrics before & after adding
    const currentXp = profile.xp;
    const nextXp = currentXp + xpGain;
    const oldLevel = getLevelFromXp(currentXp);
    const newLevel = getLevelFromXp(nextXp);

    let levelUnlocked = false;
    if (newLevel > oldLevel) {
      levelUnlocked = true;
      sound.playLevelUp();
      setShowLevelUpCinematic(newLevel);
    }

    // Track streaks on this individual habit
    const updatedHabits = habits.map((h) => {
      if (h.id === habitId) {
        const strictStreak = h.streakCount + 1;
        let bonusFromRule = 0;
        
        // Rule: Habit 3 5-day consecutive streak awards +30 Coins
        if (habitId === "habit3" && strictStreak % 5 === 0) {
          coinGain += 30;
          showToast("Fitness Legend! +30 Coins Gym 5-Day Streak!", "award");
        }

        return {
          ...h,
          completedToday: true,
          streakCount: strictStreak,
          timesCompleted: timesNow,
        };
      }
      return h;
    });

    setHabits(updatedHabits);

    // Track perfect day check
    const checkAllFinished = updatedHabits.every((h) => h.completedToday);
    let perfectDaysBonusTriggered = false;
    let perfectCoinsAccumulated = 0;

    if (checkAllFinished) {
      perfectDaysBonusTriggered = true;
      // Rule: PERFECT DAY BONUS: +50 Coins + confetti award + special Badge
      perfectCoinsAccumulated = 50;
      showToast("🏆 PERFECT DAY UNLOCKED! +50 Coins bonus + Champion Badge", "award");
      setShowPerfectDayBonus(true);
      setTimeout(() => setShowPerfectDayBonus(false), 4500);
    }

    // Calculate active badges
    const freshBadges = [...profile.badges];
    if (checkAllFinished && !freshBadges.includes("Perfect Athlete")) {
      freshBadges.push("Perfect Athlete");
    }

    if (newLevel >= 2 && !freshBadges.includes("Badminton Aspirant")) {
      freshBadges.push("Badminton Aspirant");
    }
    if (newLevel >= 3 && !freshBadges.includes("Pro Court Striker")) {
      freshBadges.push("Pro Court Striker");
    }
    if (newLevel >= 4 && !freshBadges.includes("Ultimate Court Overlord")) {
      freshBadges.push("Ultimate Court Overlord");
    }
    if (newLevel >= 5 && !freshBadges.includes("God of Badminton")) {
      freshBadges.push("God of Badminton");
    }

    // Calculate custom smash damage to active rival based on a percentage of the rival's maximum HP
    const rivalId = profile.currentRivalId || (profile.xp >= 1501 ? "yonex" : profile.xp >= 501 ? "victor" : "lining");
    const rivalMaxHp = rivalId === "yonex" ? 300 : rivalId === "victor" ? 200 : 100;

    // Base damage is percentage-based: 40% of Max HP for Hard, 25% of Max HP for Medium/Easy
    const basePercent = targetH.difficulty === "Hard" ? 40 : 25;
    // Racket Smash Power Level adds 5% additional damage boost per level
    const powerBonusPercent = (profile.smashPowerLevel || 1) * 5;
    const finalDamagePercent = basePercent + powerBonusPercent;

    // Directly calculate final numeric damage based on rival max HP percentage
    const finalDamage = Math.round((rivalMaxHp * finalDamagePercent) / 100);

    const initialHp = profile.currentRivalHp !== undefined ? profile.currentRivalHp : rivalMaxHp;

    let newRivalHp = Math.max(0, initialHp - finalDamage);
    let nextRivalId = rivalId;
    let nextRivalHp = newRivalHp;
    let rivalChanged = false;
    let defeatedName = rivalId === "yonex" ? "Yonex" : rivalId === "victor" ? "Victor" : "Li Ning";

    if (newRivalHp <= 0) {
      // Defeated!
      rivalChanged = true;
      if (rivalId === "lining") {
        nextRivalId = "victor";
        nextRivalHp = 200;
      } else if (rivalId === "victor") {
        nextRivalId = "yonex";
        nextRivalHp = 300;
      } else {
        // Wrap back to lining
        nextRivalId = "lining";
        nextRivalHp = 100;
      }
    }

    // Update profile parameters
    const updatedProfile: UserProfile = {
      ...profile,
      xp: nextXp,
      coins: profile.coins + coinGain + perfectCoinsAccumulated,
      level: newLevel,
      streak: checkAllFinished ? profile.streak + 1 : profile.streak,
      perfectDaysCount: checkAllFinished ? profile.perfectDaysCount + 1 : profile.perfectDaysCount,
      badges: freshBadges,
      lastCheckDate: new Date().toISOString().split("T")[0],
      currentRivalId: nextRivalId,
      currentRivalHp: nextRivalHp,
    };

    setProfile(updatedProfile);
    syncToStorage(updatedProfile, updatedHabits);

    // Dispatch Alerts
    showToast(`Verification Successful: +${xpGain} XP | +${coinGain} Coins ${comments}`, "success");
    setSelectedHabitForAI(null);

    // Dynamic Rival Action Notifications
    if (rivalChanged) {
      setEnemyDefeated(true);
      sound.playLevelUp();
      setTimeout(() => {
        showToast(`🏆 VICTORY! You smashed Rival ${defeatedName} off the court! Dealt ${finalDamage} damage (-${finalDamagePercent}% Rival HP)!`, "award");
        const nextDetails = getEnemyDetails(nextXp, nextRivalId);
        showToast(`🔥 Active challenger updated: ${nextDetails.name} has entered!`, "success");
        setEnemyDefeated(false);
      }, 500);
    } else {
      showToast(`💥 Smashed Rival: Dealt ${finalDamage} damage (-${finalDamagePercent}% Rival HP)! (${newRivalHp} HP remaining)`, "success");
    }
  };

  const handleAICoachAward = (xpGain: number, coinGain: number, reason: string) => {
    const currentXp = profile.xp;
    const nextXp = currentXp + xpGain;
    const oldLevel = getLevelFromXp(currentXp);
    const newLevel = getLevelFromXp(nextXp);

    let levelUnlocked = false;
    if (newLevel > oldLevel) {
      levelUnlocked = true;
      sound.playLevelUp();
      setShowLevelUpCinematic(newLevel);
    }

    const freshBadges = [...profile.badges];
    if (newLevel >= 2 && !freshBadges.includes("Badminton Aspirant")) {
      freshBadges.push("Badminton Aspirant");
    }
    if (newLevel >= 3 && !freshBadges.includes("Pro Court Striker")) {
      freshBadges.push("Pro Court Striker");
    }
    if (newLevel >= 4 && !freshBadges.includes("Ultimate Court Overlord")) {
      freshBadges.push("Ultimate Court Overlord");
    }

    const updatedProfile: UserProfile = {
      ...profile,
      xp: nextXp,
      coins: profile.coins + coinGain,
      level: newLevel,
      badges: freshBadges,
    };

    setProfile(updatedProfile);
    syncToStorage(updatedProfile, habits);
  };

  // Daily Routine Reset trigger
  const triggerDailyReset = () => {
    // Save day completion history log before wiping
    const todayStr = new Date().toISOString().split("T")[0];
    const completedList = habits.filter((h) => h.completedToday).map((h) => h.id);

    // Wipe checks
    const resetHabits = habits.map((h) => ({ ...h, completedToday: false }));
    setHabits(resetHabits);
    
    // Clear attack effect status
    setIsRivalAttacked(null);
    setEnemyDefeated(false);

    // Reset profile date to trigger
    const updatedProfile = {
      ...profile,
      lastCheckDate: todayStr,
    };
    setProfile(updatedProfile);
    syncToStorage(updatedProfile, resetHabits);

    showToast("Active Training Court reset for a new morning!", "streak");
  };

  // 3. SHOP TRANSACTIONS CLOCK ENGINE
  const handleItemBuy = (item: ShopItem) => {
    if (profile.purchasedItems.includes(item.id)) {
      // Toggle Equipping
      const isShirt = item.category === "shirt";
      const isPants = item.category === "pants";
      const isRacket = item.category === "racket";

      const updatedProfile: UserProfile = {
        ...profile,
        currentShirt: isShirt ? item.value : profile.currentShirt,
        currentPants: isPants ? item.value : profile.currentPants,
        currentRacket: isRacket ? item.value : profile.currentRacket,
      };

      setProfile(updatedProfile);
      syncToStorage(updatedProfile, habits);
      showToast(`Equipped items: ${item.name}!`, "success");
      return;
    }

    if (profile.coins < item.cost) {
      showToast("Insufficient Coins balance. Complete habits to earn!", "warning");
      return;
    }

    // Successful Purchase flow
    sound.playCoin();
    const listBought = [...profile.purchasedItems, item.id];
    let customShirt = profile.currentShirt;
    let customPants = profile.currentPants;
    let customRacket = profile.currentRacket;

    if (item.category === "shirt") customShirt = item.value;
    if (item.category === "pants") customPants = item.value;
    if (item.category === "racket") customRacket = item.value;

    const freshBadges = [...profile.badges];
    if (item.category === "badge" && !freshBadges.includes("Cosmetic Elite")) {
      freshBadges.push("Cosmetic Elite");
    }

    // RPG Power item dynamic consumables logic
    let customHp = profile.hp ?? 100;
    let customXp = profile.xp;
    let customLevel = profile.level;

    if (item.id === "focus_elixir") {
      customHp = Math.min(100, customHp + 50);
    } else if (item.id === "homework_scroll") {
      customXp = customXp + 100;
      // level boundaries: Lvl 1: 0-500, Lvl 2: 501-1000, Lvl 3: 1001-1500, Master: 1501+
      const targetLevel = customXp >= 1501 ? 4 : customXp >= 1001 ? 3 : customXp >= 501 ? 2 : 1;
      if (targetLevel > customLevel) {
        customLevel = targetLevel;
        showToast(`LEVEL UP! Advanced to Level ${targetLevel} using Academics Scroll!`, "award");
        sound.playLevelUp();
      }
    } else if (item.id === "real_life_break" && !freshBadges.includes("Relaxation Guru")) {
      freshBadges.push("Relaxation Guru");
    } else if (item.id === "custom_shield" && !freshBadges.includes("Aegis Defender")) {
      freshBadges.push("Aegis Defender");
    }

    const updatedProfile: UserProfile = {
      ...profile,
      coins: profile.coins - item.cost,
      purchasedItems: listBought,
      currentShirt: customShirt,
      currentPants: customPants,
      currentRacket: customRacket,
      badges: freshBadges,
      hp: customHp,
      xp: customXp,
      level: customLevel,
    };

    setProfile(updatedProfile);
    syncToStorage(updatedProfile, habits);
    showToast(`Purchased & Equipped: ${item.name}!`, "shop");
  };

  // Custom Smashing Power levels upgrades
  const upgradeSmashLevel = () => {
    if (profile.smashPowerLevel >= 5) {
      showToast("Active training power limit reached!", "warning");
      return;
    }
    const cost = 20;
    if (profile.coins < cost) {
      showToast("Coin balance insufficient to upgrade power level.", "warning");
      return;
    }

    sound.playCoin();
    const updatedProfile = {
      ...profile,
      coins: profile.coins - cost,
      smashPowerLevel: profile.smashPowerLevel + 1,
    };
    setProfile(updatedProfile);
    syncToStorage(updatedProfile, habits);
    showToast(`Smash power upgraded to Tier ${updatedProfile.smashPowerLevel}!`, "award");
  };

  const handleCreateJournal = () => {
    if (!newJournalNote.trim()) return;
    const todayStr = new Date().toISOString().split("T")[0];
    const freshLog = { date: todayStr, note: newJournalNote };
    const list = [freshLog, ...journalEntries];
    setJournalEntries(list);
    localStorage.setItem("readyset_journal", JSON.stringify(list));
    setNewJournalNote("");
    showToast("Journal notes updated successfully!", "success");
  };

  const triggerDataReset = () => {
    if (profile.mfaEnabled) {
      const entered = prompt("🛡️ MFA SECURITY LOCK:\nEnter your active 6-digit Authenticator passcode to authorize memory erasure:");
      if (!entered) return;
      const isMatch = verifyMfaCode(profile.mfaSecret || "", entered);
      if (!isMatch) {
        sound.playSmash();
        showToast("MFA verification failure. Access to erase memory matrix is denied.", "warning");
        return;
      }
    } else {
      if (!confirm("Reset athlete profile and erase levels / achievements?")) {
        return;
      }
    }
    localStorage.clear();
      setProfile({
        userId: "offline",
        email: "guest@readysetgo.io",
        xp: 0,
        coins: 50,
        level: 1,
        hp: 100,
        streak: 0,
        perfectDaysCount: 0,
        smashPowerLevel: 1,
        lastCheckDate: new Date().toISOString().split("T")[0],
        purchasedItems: [],
        currentRacket: "wood",
        currentShirt: "casual",
        currentPants: "casual",
        badges: [],
        statsWeeklyXP: [120, 80, 50, 150, 200, 140, 90],
        currentRivalId: "lining",
        currentRivalHp: 100,
      });
      setHabits(DEFAULT_HABITS);
      setChallenges(BOUNTY_CHALLENGES);
      setJournalEntries([]);
      showToast("Athlete matrix reset complete.", "warning");
  };

  // Helper calculating leveling percentage progress
  const getXpProgressPercentage = () => {
    const xp = profile.xp;
    if (xp >= 3501) return 100;
    
    let base = 0;
    let boundary = 500;
    
    if (xp >= 2001) {
      base = 2001; boundary = 3500;
    } else if (xp >= 1001) {
      base = 1001; boundary = 2000;
    } else if (xp >= 501) {
      base = 501; boundary = 1000;
    } else {
      base = 0; boundary = 500;
    }

    const completed = xp - base;
    const totalNeeded = boundary - base;
    return Math.min(100, Math.max(0, (completed / totalNeeded) * 100));
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${themeMode === "dark" ? "bg-[#1A1A1A] text-white" : "bg-neutral-100 text-[#0D0D0D]"}`}>
      <div className="w-full max-w-[480px] mx-auto relative min-h-screen bg-[#111111] border-x border-[#2C2C2C] shadow-2xl flex flex-col pb-24 overflow-hidden rounded-none md:rounded-[22px] md:my-4 md:h-[92vh] md:max-h-[900px]">
        
        {/* BRAND LOGO INITIALIZATION LOADING SCREEN */}
        <AnimatePresence>
          {appLoading && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="absolute inset-0 z-[150] bg-[#0D0D0D] flex flex-col items-center justify-center p-8 select-none"
            >
              <div className="w-full max-w-[320px] flex flex-col items-center space-y-12">
                {/* Large Premium Glowing Brand Logo */}
                <BrandLogo size="xl" className="animate-pulse" />

                {/* Animated loading grid/bar */}
                <div className="w-full space-y-3">
                  <div className="relative w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1.4, ease: "easeInOut" }}
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#00FFCC] via-white to-[#FF3366] rounded-full shadow-[0_0_10px_#00FFCC]"
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest px-1">
                    <span className="animate-pulse">Loading Arena Matrix...</span>
                    <span className="text-secondary">READY</span>
                  </div>
                </div>

                {/* Platform secure certification tags */}
                <div className="text-[9px] text-gray-500 font-bold bg-zinc-950 border border-zinc-900 rounded-full px-4 py-1.5 flex items-center space-x-1 uppercase tracking-tight">
                  <ShieldCheck className="w-3.5 h-3.5 text-secondary animate-pulse" />
                  <span>Verified Secure Core Identity</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TOP STATUS HEADER PANEL */}
        <header className="sticky top-0 z-30 bg-[#0D0D0D]/95 backdrop-blur-md p-4 border-b border-[#222222] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-full border border-secondary flex items-center justify-center bg-zinc-950 p-[1.5px] overflow-hidden">
              <span className="text-sm font-extrabold text-[#00FFCC]">SET</span>
            </div>
            <div className="text-left">
              <h1 className="text-base font-black tracking-tight text-[#FFFFFF] flex items-center space-x-1 uppercase">
                <span>Ready</span>
                <span className="text-[#00FFCC]">SET</span>
                <span className="text-[#FF3366]">GO</span>
              </h1>
              <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest font-bold">Arena Routine engine</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-right">
            {/* Coins Balance */}
            <div className="bg-[#1A1A1A] px-2.5 py-1 rounded-full border border-[#2A2A2A] flex items-center space-x-2 shadow-inner">
              <Coins className="w-3.5 h-3.5 text-secondary animate-[spin_5s_linear_infinite]" />
              <span className="text-xs font-mono font-extrabold text-[#FFFFFF]">{profile.coins}</span>
            </div>

            {/* Google Authentication Trigger */}
            {isFirebaseConfigured && (
              user ? (
                <button
                  type="button"
                  onClick={triggerGoogleLogout}
                  className="bg-zinc-800 p-2 rounded-full border border-zinc-700 hover:border-accent group duration-200 cursor-pointer"
                  title="Link linked profile logs"
                >
                  <LogOut className="w-3.5 h-3.5 text-zinc-400 group-hover:text-accent" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={triggerGoogleLogin}
                  className="bg-accent/15 px-2.5 py-1 rounded-full border border-[#FF3366]/40 text-[10px] uppercase font-bold text-[#FF3366] hover:bg-accent hover:text-white transition-all duration-100 cursor-pointer text-shadow"
                >
                  Sign In
                </button>
              )
            )}
          </div>
        </header>

        {isMfaLocked ? (
          <div className="flex-1 overflow-y-auto px-6 py-12 flex flex-col items-center justify-center text-center bg-[#0d0d0d] z-20 space-y-8">
            <div className="relative">
              <div className="absolute inset-0 bg-[#FF3366]/20 rounded-full blur-xl animate-[pulse_2s_infinite]" />
              <div className="relative w-22 h-22 rounded-2xl bg-[#151515] border border-rose-500/20 flex items-center justify-center text-[#FF3366] shadow-2xl">
                <ShieldAlert className="w-10 h-10" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black uppercase text-white tracking-tight flex items-center justify-center space-x-2">
                <span>MFA SHIELD LOCK ACTIVE</span>
              </h2>
              <p className="text-xs text-gray-400 font-bold max-w-sm mx-auto leading-relaxed">
                A dynamic second layer of protection is active for athlete profile{" "}
                <span className="text-[#FF3366] font-mono">{profile.email || "guest@readysetgo.io"}</span>.
              </p>
            </div>

            <div className="space-y-4 w-full max-w-xs">
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  value={mfaInputCode}
                  onChange={(e) => handleMfaCodeChange(e.target.value, "lock")}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10 text-center text-transparent bg-transparent"
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoFocus
                />
                
                <div className="flex justify-center space-x-2.5">
                  {Array.from({ length: 6 }).map((_, idx) => {
                    const digit = mfaInputCode[idx] || "";
                    const isFocused = mfaInputCode.length === idx;
                    return (
                      <div
                        key={idx}
                        className={`w-11 h-13 rounded-xl border flex items-center justify-center font-mono text-lg font-extrabold transition-all duration-150 ${
                          mfaFeedbackError
                            ? "border-rose-500 bg-rose-500/10 text-rose-500 animate-pulse"
                            : isFocused
                            ? "border-[#FF3366] bg-[#FF3366]/10 shadow-[0_0_8px_rgba(255,51,102,0.3)] text-[#FF3366]"
                            : digit
                            ? "border-zinc-700 bg-zinc-900/80 text-white"
                            : "border-zinc-800 bg-[#070707] text-gray-500"
                        }`}
                      >
                        {digit || "•"}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-normal">
                Enter your 6-digit passcode to authenticate
              </p>
            </div>

            <div className="w-full bg-[#1A1A1A]/80 border border-zinc-900/60 p-4 rounded-2xl text-left space-y-2 max-w-sm">
              <div className="flex items-center space-x-2 text-[#00FFCC]">
                <Key className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono font-black uppercase tracking-wide">Sync Live Assist</span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                MFA helps safeguard your levels, custom outfits, rackets, and streak achievements. Open Google Authenticator or your authenticator app to copy the current 6-digit key.
              </p>
              
              <div className="pt-2 border-t border-zinc-800 flex justify-between items-center">
                <span className="text-[9px] font-mono font-bold text-gray-500 uppercase">Synchronized timer</span>
                <span className="text-[9px] font-mono font-black text-[#00FFCC] bg-[#00FFCC]/10 px-2 py-0.5 rounded">
                  {mfaCurrentCountdown}s left
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm("Reset athlete profile state because you lost your authenticator device? This wipes milestones.")) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                className="text-[9px] font-mono text-zinc-600 hover:text-white underline font-bold uppercase tracking-wider cursor-pointer"
              >
                Lost Device? Clear Milestone Cache
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* TOP LEVEL PROGRESSION BAR PANEL */}
        <div className="px-5 py-3.5 bg-[#0D0D0D] border-b border-[#2C2C2C] text-left space-y-3">
          {/* Level name & Coins & info */}
          <div className="flex justify-between items-center text-[10px] font-mono font-bold uppercase tracking-wide">
            <span className="text-white flex items-center space-x-1">
              <span className="bg-accent text-white px-1.5 py-0.5 rounded text-[8px] font-extrabold mr-1">LVL {profile.level}</span>
              <span>Court Athlete Stance</span>
            </span>
            <span className="text-secondary flex items-center space-x-1.5">
              <Coins className="w-3.5 h-3.5 text-secondary animate-pulse" />
              <span>{profile.coins} Gold</span>
            </span>
          </div>

          {/* XP Bar */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest">
              <span>EXP Progress</span>
              <span className="text-[#00FFCC]">{profile.xp} XP</span>
            </div>
            <div className="w-full bg-[#1F1F1F] h-2.5 rounded-full overflow-hidden border border-zinc-900 p-[1.5px] shadow-sm">
              <motion.div
                layout
                initial={{ width: 0 }}
                animate={{ width: `${getXpProgressPercentage()}%` }}
                className="bg-accent h-full rounded-full"
              />
            </div>
          </div>

          {/* User HP Bar */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest">
              <span className="flex items-center space-x-1 text-red-500">
                <Heart className="w-3 h-3 animate-pulse text-[#FF3366]" />
                <span>Player HP / Stamina</span>
              </span>
              <span className={profile.hp >= 60 ? "text-emerald-400" : profile.hp >= 30 ? "text-amber-400" : "text-rose-500 font-extrabold animate-pulse"}>
                {profile.hp ?? 100} / 100 HP
              </span>
            </div>
            <div className="w-full bg-[#1F1F1F] h-2.5 rounded-full overflow-hidden border border-zinc-900 p-[1.5px] shadow-sm">
              <motion.div
                layout
                initial={{ width: "100%" }}
                animate={{ width: `${profile.hp ?? 100}%` }}
                className={`h-full rounded-full transition-all duration-300 ${
                  profile.hp >= 60 ? "bg-emerald-500" : profile.hp >= 30 ? "bg-amber-400" : "bg-rose-500 progress-glow"
                }`}
              />
            </div>
          </div>
        </div>

        {/* RIVAL ATTACK WARNING NOTIFICATIONS BANNER */}
        {isRivalAttacked && (
          <div className="bg-[#FF3366]/10 border-b border-[#FF3366]/30 px-5 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-2.5 text-left text-[11px] font-bold text-[#FF3366] leading-snug">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF3366] animate-ping" />
              <span>
                Yesterday check missed! Rival **{getEnemyDetails(profile.xp, profile.currentRivalId).name}** triggered active attack penalty!
              </span>
            </div>
            <button
              onClick={() => setIsRivalAttacked(null)}
              className="text-xs text-gray-400 hover:text-white cursor-pointer px-1 text-shadow"
              title="Acknowledge and dismiss warning banner"
            >
              &times;
            </button>
          </div>
        )}

        {/* SCROLLABLE MAIN INDEPENDENT VIEW PORT */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === "home" && (
              <motion.div
                key="home_screen"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* BRANDING DASHBOARD HERO BANNER */}
                <div className="relative bg-gradient-to-br from-zinc-950 to-[#121212] border border-zinc-800/80 rounded-[22px] p-5 overflow-hidden flex items-center justify-between shadow-xl">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-secondary/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute left-0 bottom-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center space-x-4 relative z-10">
                    <BrandLogo size="md" />
                    <div className="space-y-1 text-left">
                      <div className="text-[9px] font-mono text-secondary font-black uppercase tracking-wider">
                        Active Athlete HUD
                      </div>
                      <h3 className="text-white text-base font-black uppercase tracking-tight">
                        {profile.email?.split("@")[0] || "Recruit Guest"}
                      </h3>
                      <div className="flex items-center space-x-1.5 font-mono text-[9px] text-gray-500 font-bold">
                        <span>XP Tier:</span>
                        <span className="text-[#00FFCC] font-black">Level {profile.level}</span>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 flex flex-col items-end space-y-1 bg-zinc-900/50 px-3.5 py-2 rounded-xl border border-zinc-800/60 font-mono">
                    <span className="text-[8px] text-gray-500 uppercase font-black">Memory Sync</span>
                    <span className="text-[9px] text-[#00FFCC] font-bold uppercase tracking-wider animate-pulse flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00FFCC] mr-1 animate-ping" />
                      {user ? "Cloud Active" : "Local Sync"}
                    </span>
                  </div>
                </div>

                {/* BATTLE ARENA RIVAL FIGHT AREA */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-black uppercase tracking-widest text-[#FFFFFF] flex items-center space-x-1 text-shadow">
                      <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                      <span>Court Arena</span>
                    </h2>
                    <div className="flex items-center space-x-1.5 font-mono text-[10px] text-gray-400 font-bold bg-[#141414] px-2.5 py-0.5 rounded border border-[#2C2C2C]">
                      <Clock className="w-3 h-3 text-secondary animate-pulse" />
                      <span>Next Reset:</span>
                      <span className="text-secondary">{countdownString}</span>
                    </div>
                  </div>

                  {/* Battle Screen Rendering Hero vs Enemy with Level-based Progression Backgrounds */}
                  {(() => {
                    // level-based progression backgrounds configurations
                    let bgClass = "bg-[#0A0A0A] border-zinc-800";
                    let zoneName = "🌲 Novice Forest Court";
                    let zoneDesc = "Level 1 training sector for prospective badminton aces.";
                    
                    if (profile.level >= 5) {
                      bgClass = "bg-gradient-to-b from-[#1c0a35] via-[#0D0D0D] to-[#0a0314] border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.25)]";
                      zoneName = "🌌 Cosmic Badminton Citadel";
                      zoneDesc = "Interstellar cyber-courts where legendary masters collide.";
                    } else if (profile.level >= 2) {
                      bgClass = "bg-gradient-to-b from-slate-900 via-[#0D0D0D] to-slate-950 border-zinc-700 shadow-[0_0_12px_rgba(255,255,255,0.05)]";
                      zoneName = "⛓️ Iron Training Fortress";
                      zoneDesc = "Heavy iron courts of rigorous stance and dynamic routine discipline.";
                    } else {
                      bgClass = "bg-gradient-to-b from-emerald-950/20 via-[#0D0D0D] to-green-950/10 border-emerald-900/50 shadow-[0_0_12px_rgba(16,185,129,0.08)]";
                    }

                    return (
                      <div className={`p-4 rounded-[22px] border transition-all duration-700 space-y-3.5 relative overflow-hidden ${bgClass}`}>
                        {/* Interactive scanline matrix grid effect overlay for Citadel */}
                        {profile.level >= 5 && (
                          <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_4px] rounded-[22px]" />
                        )}

                        <div className="flex justify-between items-start border-b border-white/5 pb-1.5 text-left relative z-10">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-mono font-black text-[#00FFCC] uppercase tracking-widest block">{zoneName}</span>
                            <span className="text-[8px] font-bold text-gray-500 block leading-tight">{zoneDesc}</span>
                          </div>
                          <span className="text-[8px] font-mono font-black bg-black border border-white/10 px-2 py-0.5 rounded text-gray-400 shrink-0">
                            ZONE LVL {profile.level}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3.5 relative z-10">
                          {/* Left Player character */}
                          <div className="space-y-1">
                            <AvatarSVG
                              level={profile.level}
                              racketType={profile.currentRacket}
                              shirtColor={profile.currentShirt}
                              pantsColor={profile.currentPants}
                              hasBadge={profile.purchasedItems.includes("badge_gold")}
                              isSmashing={isSmashing}
                            />
                            <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block font-bold text-center">Athlete Stance</span>
                          </div>

                          {/* Right Boss rival character */}
                          <div className="space-y-1">
                            <EnemySVG id={getEnemyDetails(profile.xp, profile.currentRivalId).id} damageShake={enemyShake} />
                            <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block font-bold text-center">Badminton Boss</span>
                          </div>

                          {/* Combat Splash Damage Indicator and Smashes details */}
                          {isSmashing && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1.5 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-20 pointer-events-none text-center"
                            >
                              <span className="bg-[#FF3366] text-[#FFFFFF] px-5 py-2 rounded-full text-base font-black italic tracking-widest border border-yellow-300 shadow-2xl skew-x-12 inline-block">
                                SMASH HIT!
                              </span>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Boss HP bar representing health updates */}
                  <div className="bg-[#0D0D0D] p-3.5 rounded-[22px] border border-[#2C2C2C] text-left">
                    <div className="flex justify-between items-center text-[11px] font-bold text-gray-400 mb-1">
                      <span className="text-gray-200">Rival Defense Index</span>
                      <span className="font-mono text-secondary uppercase font-bold">
                        {getBossRemainingHp()} / {getEnemyDetails(profile.xp, profile.currentRivalId).hp} HP
                      </span>
                    </div>
                    <div className="w-full bg-[#1C1C1C] h-3 rounded-full overflow-hidden border border-[#2C2C2C] p-[1.5px] relative">
                      <motion.div
                        layout
                        initial={{ width: "100%" }}
                        animate={{ width: `${(getBossRemainingHp() / getEnemyDetails(profile.xp, profile.currentRivalId).hp) * 100}%` }}
                        className="bg-secondary h-full rounded-full"
                      />
                    </div>
                  </div>
                </div>

                {/* HABIT CHECKLIST MODULE */}
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center text-left">
                    <h2 className="text-sm font-black uppercase tracking-widest text-[#FFFFFF]">DAILY WORKOUT DRILLS</h2>
                    <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">3 Habits checklist</span>
                  </div>

                  <div className="space-y-3">
                    {habits.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleHabitCompleteAction(item.id)}
                        className={`p-4 rounded-[22px] border-2 text-left cursor-pointer select-none active:scale-95 duration-100 ease-in-out transition-all relative overflow-hidden group ${
                          item.completedToday
                            ? "border-secondary/30 bg-secondary/5"
                            : "border-[#2A2A2A] bg-[#0D0D0D]/90 hover:border-zinc-700"
                        }`}
                      >
                        {/* Interactive completing ring percentage background indicator */}
                        {item.completedToday && (
                          <div className="absolute right-0 bottom-0 top-0 w-1.5 bg-[#00FFCC]" />
                        )}

                        <div className="flex items-start justify-between space-x-3.5">
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono uppercase font-bold text-secondary bg-primary tracking-wider px-2 py-0.5 rounded border border-[#222222]">
                              {item.category}
                            </span>
                            <h3 className="text-xs font-bold font-sans text-white leading-relaxed pt-1 select-none">
                              {item.name}
                            </h3>
                            <div className="flex items-center space-x-3 pt-1 text-[11px] font-mono text-gray-400 font-bold uppercase select-none">
                              <span className="text-[#FF3366]">+{item.xpReward} XP</span>
                              <span>• Streak: {item.streakCount} days</span>
                            </div>
                          </div>

                          <div className="flex-shrink-0 pt-0.5">
                            <div
                              className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors select-none ${
                                item.completedToday
                                  ? "border-secondary bg-secondary/20"
                                  : "border-gray-600 group-hover:border-[#00FFCC]"
                              }`}
                            >
                              {item.completedToday && <CheckCircle className="w-4 h-4 text-secondary" />}
                            </div>
                          </div>
                        </div>

                        {/* Extra AI Scan Action Trigger Indicator */}
                        {!item.completedToday && (
                          <div className="mt-2 text-[9px] font-mono text-secondary uppercase tracking-tight flex items-center space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <Cpu className="w-3 h-3 text-secondary animate-pulse" />
                            <span>Run Gym Vision AI check</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* DAILY MANUAL RESET PANEL FOR USER DEMO */}
                <div className="p-4 bg-[#0D0D0D] border border-[#2C2C2C] rounded-[22px] flex items-center justify-between text-left">
                  <div className="space-y-0.5 max-w-[210px]">
                    <h3 className="text-xs font-bold text-white">Need to simulation cycle?</h3>
                    <p className="text-[10px] text-gray-500 font-bold leading-normal">
                      Instantly simulate the midnight date reset trigger for a new daily combat round.
                    </p>
                  </div>
                  <button
                    onClick={triggerDailyReset}
                    className="bg-primary hover:bg-[#1A1A1A] border border-[#2C2C2C] text-secondary hover:text-white px-3.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase scaling-active cursor-pointer uppercase transition-all"
                  >
                    Reset Habits
                  </button>
                </div>
              </motion.div>
            )}

            {/* SCREEN 2: STATS / HISTORIES & CHARTS */}
            {activeTab === "stats" && (
              <motion.div
                key="stats_screen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6 text-left"
              >
                <h2 className="text-sm font-black uppercase tracking-widest text-[#FFFFFF]">ATHLETIC REPORT</h2>

                {/* Metric grid counters */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="p-4 bg-[#0D0D0D] border border-[#2C2C2C] rounded-[22px]">
                    <span className="text-[10px] font-mono text-gray-500 uppercase font-bold">Racket Smash Power</span>
                    <h3 className="text-2xl font-black text-white px-0.5 pt-1.5">LV.{profile.smashPowerLevel}</h3>
                  </div>
                  <div className="p-4 bg-[#0D0D0D] border border-[#2C2C2C] rounded-[22px]">
                    <span className="text-[10px] font-mono text-gray-500 uppercase font-bold">Perfect Days Count</span>
                    <h3 className="text-2xl font-black text-[#00FFCC] px-0.5 pt-1.5">
                      {profile.perfectDaysCount}
                    </h3>
                  </div>
                </div>

                {/* 7-Day XP bar graph */}
                <div className="p-5 bg-[#0D0D0D]/90 border border-[#2C2C2C] rounded-[22px] space-y-4">
                  <span className="text-[10px] font-mono text-gray-500 uppercase font-bold">7-day XP completion bar chart</span>
                  <div className="h-40 flex items-end justify-between items-baseline pt-4 space-x-2">
                    {profile.statsWeeklyXP.map((val, i) => {
                      const maxVal = Math.max(...profile.statsWeeklyXP) || 120;
                      const barPercent = Math.max(12, Math.round((val / maxVal) * 100));
                      const weekday = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i];

                      return (
                        <div key={i} className="flex-1 flex flex-col items-center space-y-2">
                          <span className="text-[10px] font-mono text-secondary font-bold">{val}</span>
                          <div className="w-full bg-[#1C1C1C] h-24 rounded-lg overflow-hidden relative border border-[#2A2A2A] flex items-end">
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${barPercent}%` }}
                              className="w-full bg-accent rounded-t-md"
                            />
                          </div>
                          <span className="text-[10px] font-mono text-gray-500 font-bold">{weekday}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 🏆 TROPHY ROOM & ACHIEVEMENT BADGES */}
                <div className="p-4 bg-[#0D0D0D] border border-[#2C2C2C] rounded-[22px] space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                    <span className="text-[11px] font-mono text-secondary font-black uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      <span>🏆 TROPHY ROOM & ACHIEVEMENT BADGES</span>
                    </span>
                    <span className="text-[10px] font-mono text-gray-500 font-bold uppercase">Permanently Displayed</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-left">
                    {[
                      {
                        key: "7-Day Streak Master",
                        name: "7-Day Streak Master",
                        desc: "Achieve a 7-day training streak",
                        unlocked: profile.streak >= 7 || profile.badges.includes("7-Day Streak Master"),
                        category: "Streak"
                      },
                      {
                        key: "Hydration Hero",
                        name: "Hydration Hero",
                        desc: "Consistently keep diet & hydration green",
                        unlocked: profile.perfectDaysCount >= 2 || profile.badges.includes("Hydration Hero") || profile.xp >= 300,
                        category: "Nutrition"
                      },
                      {
                        key: "Aegis Defender",
                        name: "Aegis Defender",
                        desc: "Procure the Stitch Guardian Shield from Shop",
                        unlocked: profile.badges.includes("Aegis Defender") || profile.purchasedItems.includes("custom_shield"),
                        category: "Defense"
                      },
                      {
                        key: "Relaxation Guru",
                        name: "Relaxation Guru",
                        desc: "Buy and claim a Real-Life Break Card",
                        unlocked: profile.badges.includes("Relaxation Guru") || profile.purchasedItems.includes("real_life_break"),
                        category: "Mental"
                      },
                      {
                        key: "Perfect Athlete",
                        name: "Perfect Athlete",
                        desc: "Complete 100% of all exercises in a day",
                        unlocked: profile.perfectDaysCount >= 1 || profile.badges.includes("Perfect Athlete"),
                        category: "Fitness"
                      },
                      {
                        key: "Badminton Aspirant",
                        name: "Badminton Aspirant",
                        desc: "Train hard to reach Level 2",
                        unlocked: profile.level >= 2 || profile.badges.includes("Badminton Aspirant"),
                        category: "Rank"
                      },
                      {
                        key: "Pro Court Striker",
                        name: "Pro Court Striker",
                        desc: "Advance and achieve Level 3",
                        unlocked: profile.level >= 3 || profile.badges.includes("Pro Court Striker"),
                        category: "Rank"
                      },
                      {
                        key: "God of Badminton",
                        name: "God of Badminton",
                        desc: "Elite status reached at Level 5+",
                        unlocked: profile.level >= 5 || profile.badges.includes("God of Badminton"),
                        category: "Legendary"
                      },
                    ].map((badge) => (
                      <div
                        key={badge.key}
                        className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all duration-300 ${
                          badge.unlocked
                            ? "bg-gradient-to-br from-yellow-950/20 to-[#1A1A1A] border-yellow-500/50 shadow-[0_0_8px_rgba(234,179,8,0.15)]"
                            : "bg-[#060606]/85 border-zinc-800/80 opacity-50"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span className={`text-[7px] font-mono font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                            badge.unlocked 
                              ? "bg-yellow-950/80 border-yellow-500/30 text-yellow-400" 
                              : "bg-[#111111] border-zinc-700 text-zinc-500"
                          }`}>
                            {badge.category}
                          </span>
                          <span className="text-xs">
                            {badge.unlocked ? "🌟" : "🔒"}
                          </span>
                        </div>

                        <div className="mt-2 select-none">
                          <h4 className={`text-[10px] font-extrabold uppercase font-sans truncate ${
                            badge.unlocked ? "text-yellow-400" : "text-gray-400"
                          }`}>
                            {badge.name}
                          </h4>
                          <p className="text-[7.5px] leading-snug font-bold text-gray-500 mt-0.5 line-clamp-2">
                            {badge.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* SCREEN 3: SHOPPING BAGS / COSMETICS UPGRADES */}
            {activeTab === "shop" && (
              <motion.div
                key="shop_screen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6 text-left"
              >
                <div className="flex justify-between items-center bg-[#0D0D0D] p-4 rounded-[22px] border border-[#2C2C2C]">
                  <div>
                    <span className="text-[10px] font-mono text-gray-500 uppercase font-bold block">Current Balance</span>
                    <span className="text-xl font-black text-[#FFFFFF]">{profile.coins} Coins</span>
                  </div>
                  <ShoppingBag className="w-6 h-6 text-secondary animate-bounce" />
                </div>

                {/* Racket Smash Upgrades Level */}
                <div className="bg-[#0D0D0D] p-4 rounded-[22px] border border-[#00FFCC]/20 flex items-center justify-between">
                  <div className="space-y-1 text-left">
                    <span className="text-[10px] font-mono text-secondary uppercase font-bold tracking-wider">Passive upgrades</span>
                    <h3 className="text-xs font-bold text-white">Racket Smashing Power</h3>
                    <p className="text-[10px] text-gray-500 font-bold leading-normal">
                      Upgrades badminton power (Tier {profile.smashPowerLevel}/5). +15% hit animations.
                    </p>
                  </div>
                  <button
                    onClick={upgradeSmashLevel}
                    disabled={profile.smashPowerLevel >= 5}
                    className="bg-[#00FFCC] text-[#0D0D0D] px-4 py-2 rounded-full text-xs font-black uppercase text-shadow cursor-pointer active:scale-95 duration-100 flex items-center space-x-1"
                  >
                    <span>20 c.</span>
                  </button>
                </div>

                {/* Shop items list */}
                <div className="space-y-3.5">
                  <span className="text-[10px] font-mono text-gray-500 uppercase font-bold">COSMETICS & BADGES GEAR</span>
                  <div className="grid grid-cols-1 gap-3.5">
                    {SHOP_ITEMS.map((item) => {
                      const isOwned = profile.purchasedItems.includes(item.id);
                      const isEquipped =
                        profile.currentShirt === item.value ||
                        profile.currentPants === item.value ||
                        profile.currentRacket === item.value;

                      return (
                        <div
                          key={item.id}
                          className="p-4 rounded-[22px] border bg-[#0D0D0D]/90 border-[#2C2C2C] flex items-center justify-between text-left"
                        >
                          <div className="space-y-1 max-w-[190px]">
                            <span className="text-[8px] font-mono uppercase font-bold bg-[#1C1C1C] text-secondary px-2 py-0.5 rounded border border-[#222222]">
                              {item.category}
                            </span>
                            <h3 className="text-xs font-bold text-white">{item.name}</h3>
                            <p className="text-[10px] text-gray-500 font-bold leading-normal leading-relaxed">
                              {item.description}
                            </p>
                          </div>

                          <button
                            onClick={() => handleItemBuy(item)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase text-shadow transition-all duration-100 flex items-center space-x-1 cursor-pointer ${
                              isEquipped
                                ? "bg-secondary text-[#0D0D0D] border-2 border-secondary font-bold"
                                : isOwned
                                ? "bg-zinc-800 text-zinc-300 border border-zinc-700"
                                : "bg-primary border border-secondary text-secondary hover:bg-secondary hover:text-[#0D0D0D] font-bold"
                            }`}
                          >
                            <span>
                              {isEquipped ? "Equipped" : isOwned ? "Equip" : `${item.cost} c.`}
                            </span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* SCREEN 4: AI COACH LAB & JOURNAL PERSISTENCE */}
            {activeTab === "journal" && (
              <motion.div
                key="journal_screen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6 text-left pb-12"
              >
                {/* AI Coach Lab Main Screen Applet */}
                <AICoachLab
                  coins={profile.coins}
                  xp={profile.xp}
                  level={profile.level}
                  onAward={handleAICoachAward}
                  showToast={showToast}
                />

                {/* EXPANDABLE TRADITIONAL ATHLETE JOURNAL SECTION */}
                <div className="border-t border-[#222222] pt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xs font-black uppercase tracking-widest text-[#FFFFFF]">ATHLETE JOURNAL RECORDS</h2>
                    <span className="text-[9px] font-mono text-gray-500 font-bold uppercase">({journalEntries.length} entries logged)</span>
                  </div>

                  {/* Create diary node */}
                  <div className="p-4 bg-[#0D0D0D] rounded-[22px] border border-[#2C2C2C] space-y-3.5 text-left">
                    <span className="text-[10px] font-mono text-gray-500 uppercase font-bold">Write routine review note</span>
                    <textarea
                      value={newJournalNote}
                      onChange={(e) => setNewJournalNote(e.target.value)}
                      placeholder="Enter athletic details: e.g. studies concludes beautifully, badminton exercises smash done, 3 liters hydrated!"
                      className="w-full h-20 bg-[#141414] border border-[#2C2C2C] rounded-xl p-3 text-xs focus:outline-none focus:border-secondary text-white"
                    />
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={handleCreateJournal}
                        className="bg-secondary text-[#0D0D0D] font-black text-xs px-4 py-2 rounded-full cursor-pointer uppercase text-shadow transition-all flex items-center space-x-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Log Note</span>
                      </button>
                    </div>
                  </div>

                  {/* Displaying logs list */}
                  <div className="space-y-3.5 text-left">
                    {journalEntries.map((log, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-[#0D0D0D]/80 rounded-[22px] border border-[#2C2C2C] space-y-1.5 text-left"
                      >
                        <div className="flex justify-between items-center text-[10px] font-mono font-bold text-[#FF3366] uppercase">
                          <span>Journal Entry Log</span>
                          <span>{log.date}</span>
                        </div>
                        <p className="text-xs text-gray-200 font-sans font-medium italic select-none">
                          "{log.note}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* SCREEN 5: 'MORE COGNITIVE DRILLS' OVERLAYS SCREEN GRID */}
            {activeTab === "more" && (
              <motion.div
                key="more_screen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6 text-left"
              >
                {/* Horizontal navigation subtab drawers grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: "leaderboard", name: "Rival Leaderboard", icon: <Trophy className="w-4 h-4" /> },
                    { id: "calendar", name: "Heatmap Calendar", icon: <Calendar className="w-4 h-4" /> },
                    { id: "challenges", name: "Bounty Quests", icon: <Sparkles className="w-4 h-4" /> },
                    { id: "profile", name: "Progression Deck", icon: <Award className="w-4 h-4" /> },
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => setMoreSubTab(btn.id)}
                      className={`p-3 rounded-xl border flex items-center space-x-2.5 text-xs text-left cursor-pointer transition-all duration-100 font-bold uppercase select-none ${
                        moreSubTab === btn.id
                          ? "bg-secondary text-[#0D0D0D] border-secondary"
                          : "bg-[#0D0D0D] text-gray-400 border-[#2A2A2A] hover:border-zinc-700"
                      }`}
                    >
                      <div className={moreSubTab === btn.id ? "text-primary" : "text-secondary"}>
                        {btn.icon}
                      </div>
                      <span>{btn.name}</span>
                    </button>
                  ))}
                </div>

                <div className="border-t border-[#222222] pt-4 text-left">
                  {/* SUBTAB 1: RIVAL ATHLETIC LEADERBOARDS */}
                  {moreSubTab === "leaderboard" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-left">
                        <span className="text-[10px] font-mono text-gray-500 uppercase font-bold">ATHLETIC SCOREBOARD</span>
                        <span className="text-[9px] font-mono text-secondary uppercase font-bold">Week 20</span>
                      </div>
                      <div className="space-y-2">
                        {/* Static rival positions */}
                        {LEADERBOARD_USERS.map((usr) => (
                          <div
                            key={usr.rank}
                            className="p-3 bg-[#0D0D0D] rounded-xl border border-zinc-900 flex items-center justify-between text-left"
                          >
                            <div className="flex items-center space-x-3.5">
                              <span className="text-sm font-black font-mono text-gray-500 select-none">
                                #{usr.rank}
                              </span>
                              <div>
                                <h3 className="text-xs font-bold text-white select-none">{usr.name}</h3>
                                <span className="text-[9px] font-mono uppercase text-secondary">
                                  Racket Style: {usr.racket}
                                </span>
                              </div>
                            </div>
                            <span className="text-xs font-semibold text-gray-300 font-mono">
                              LV.{usr.level}
                            </span>
                          </div>
                        ))}

                        {/* Current User ranking row */}
                        <div className="p-3 bg-secondary/15 rounded-xl border-2 border-secondary/50 flex items-center justify-between text-left">
                          <div className="flex items-center space-x-3.5">
                            <span className="text-sm font-black font-mono text-[#00FFCC] select-none">#4</span>
                            <div>
                              <h3 className="text-xs font-bold text-white uppercase select-none">
                                {user ? user.displayName || "Active User" : "Offline Athlete"} (You)
                              </h3>
                              <span className="text-[9px] font-mono uppercase text-secondary">
                                Racket Style: {profile.currentRacket}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-[#00FFCC] font-mono">
                            LV.{profile.level}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 2: HEATMAP CALENDAR CHRONO */}
                  {moreSubTab === "calendar" && (
                    <div className="space-y-4">
                      <span className="text-[10px] font-mono text-gray-500 uppercase font-bold">7-DAY ROUTINE HEATMAP</span>
                      <div className="p-4 bg-[#0D0D0D] border border-zinc-900 rounded-[22px] select-none">
                        <div className="grid grid-cols-7 gap-2.5 pb-2 border-b border-zinc-800 text-center font-mono text-[9px] text-[#00FFCC] font-bold uppercase">
                          <span>M</span>
                          <span>T</span>
                          <span>W</span>
                          <span>T</span>
                          <span>F</span>
                          <span>S</span>
                          <span>S</span>
                        </div>
                        <div className="grid grid-cols-7 gap-2.5 pt-3 text-center">
                          {/* 7 blocks represented */}
                          {[
                            { active: true, title: "100% cleared Perfect Day" },
                            { active: true, title: "100% cleared Perfect Day" },
                            { active: false, title: "Routine missed" },
                            { active: true, title: "100% cleared Perfect Day" },
                            { active: true, title: "100% cleared Perfect Day" },
                            { active: true, title: "100% cleared Perfect Day" },
                            { active: habits.every((h) => h.completedToday), title: "In training today" },
                          ].map((day, idx) => (
                            <div
                              key={idx}
                              title={day.title}
                              className={`aspect-square rounded-lg border flex items-center justify-center ${
                                day.active
                                  ? "bg-secondary text-[#0D0D0D] border-secondary"
                                  : "bg-[#141414] border-[#2C2C2C] text-gray-600"
                              }`}
                            >
                              <span className="text-[10px] font-extrabold font-mono">{idx + 15}</span>
                            </div>
                          ))}
                        </div>
                        <span className="text-[9px] font-mono text-gray-500 block pt-3 text-left">
                          Green blocks indicate routine checklist completed entirely.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 3: EXTRA BOUNTY CHALLENGE COGNITIVE QUESTS */}
                  {moreSubTab === "challenges" && (
                    <div className="space-y-4">
                      <span className="text-[10px] font-mono text-gray-500 uppercase font-bold">BOUNTY ROADMAPS</span>
                      <div className="space-y-3">
                        {challenges.map((ch) => (
                          <div
                            key={ch.id}
                            className="p-4 bg-[#0D0D0D] border border-[#2C2C2C] rounded-[22px] text-left space-y-2"
                          >
                            <div className="flex justify-between items-start text-xs font-bold text-white">
                              <div>
                                <h3 className="text-xs font-bold select-none">{ch.name}</h3>
                                <p className="text-[10px] text-gray-500 font-bold leading-normal pt-0.5">
                                  {ch.description}
                                </p>
                              </div>
                              <span className="text-[10px] font-mono font-bold text-[#FF3366] whitespace-nowrap">
                                +{ch.rewardCoins} COINS
                              </span>
                            </div>

                            {/* Slider progression bar */}
                            <div className="flex items-center justify-between space-x-3.5 pt-1">
                              <div className="flex-1 bg-[#1C1C1C] h-1.5 rounded-full overflow-hidden border border-zinc-800">
                                <div
                                  className="bg-accent h-full"
                                  style={{ width: `${ch.completed ? 100 : (ch.current / ch.target) * 100}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-mono text-[#00FFCC] font-bold">
                                {ch.completed ? "Done" : `${ch.current}/${ch.target}`}
                              </span>
                            </div>

                            {/* Completed button check */}
                            {!ch.completed && (
                              <button
                                onClick={() => {
                                  // Perform quest simulation progression values
                                  const updated = challenges.map((c) => {
                                    if (c.id === ch.id) {
                                      const nextCur = c.current + Math.round(c.target / 3);
                                      const isDone = nextCur >= c.target;
                                      if (isDone) {
                                        sound.playCoin();
                                        setProfile((prev) => ({ ...prev, coins: prev.coins + c.rewardCoins }));
                                        showToast(`Completed Quest: ${c.name}! +${c.rewardCoins} Coins.`, "award");
                                      }
                                      return { ...c, current: nextCur, completed: isDone };
                                    }
                                    return c;
                                  });
                                  setChallenges(updated);
                                }}
                                className="bg-primary hover:bg-[#1C1C1C] border border-secondary text-secondary hover:text-white px-2.5 py-1 rounded-full text-[9px] uppercase font-bold tracking-tight scaling-active cursor-pointer"
                              >
                                Train Progress
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 4: USER ATHLETE SPEC PROFILE & ERA ADVANCEMENT */}
                  {moreSubTab === "profile" && (
                    <div className="space-y-4">
                      <span className="text-[10px] font-mono text-gray-500 uppercase font-bold">ATHLETE SPECS MATRIX</span>
                      <div className="p-4 bg-[#0D0D0D] border border-zinc-900 rounded-[22px] space-y-3.5 text-left">
                        <div className="space-y-1 text-left">
                          <span className="text-[9px] font-mono uppercase tracking-wider text-secondary font-bold">Stance Name</span>
                          <h3 className="text-sm font-extrabold text-[#FFFFFF]">ReadySETGO Protagonist</h3>
                        </div>

                        {/* Current equipped styles */}
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono font-bold text-gray-400">
                          <div>
                            <span className="text-[9px] uppercase text-gray-500 block">Shirt Gear</span>
                            <span className="text-white capitalize">{profile.currentShirt || "Casual Standard"}</span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase text-gray-500 block">Pants Style</span>
                            <span className="text-white capitalize">{profile.currentPants || "Casual Pants"}</span>
                          </div>
                          <div className="pt-2">
                            <span className="text-[9px] uppercase text-gray-500 block">Racket Class</span>
                            <span className="text-white capitalize">{profile.currentRacket || "Wooden Cadet"}</span>
                          </div>
                          <div className="pt-2">
                            <span className="text-[9px] uppercase text-gray-500 block">Personal Goal</span>
                            <span className="text-[#00FFCC]">Being Healthier & Focused</span>
                          </div>
                        </div>

                        {/* Custom visual spec specs based milestone tier */}
                        <div className="border-t border-zinc-800 pt-3.5 space-y-1 shadow-inner text-left">
                          <span className="text-[10px] font-mono text-accent uppercase font-bold block">Avatar evolution metrics</span>
                          {profile.level === 1 && (
                            <p className="text-[11px] text-gray-400 font-bold leading-relaxed">
                              Currently Level 1 (Starts appearance): Wearing casual clothes, holding a brown wooden badminton racket. Reach level 2 to evolve pro shoes and trails!
                            </p>
                          )}
                          {profile.level === 2 && (
                            <p className="text-[11px] text-gray-400 font-bold leading-relaxed">
                              Level 2 Aspirant Evolution: Wearing shoes, athletic normal racket, normal white speed trails.
                            </p>
                          )}
                          {profile.level === 3 && (
                            <p className="text-[11px] text-gray-400 font-bold leading-relaxed">
                              Level 3 Striker Evolution: Advanced blue energy trails, professional badminton pro jersey and professional sneakers active!
                            </p>
                          )}
                          {profile.level >= 4 && (
                            <p className="text-[11px] text-gray-400 font-bold leading-relaxed">
                              Level 4 Legendary Badminton God: Crowned by floating aureole halos, glittering golden aura trails, and godly tension smashing power!
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* DB CONFIGURATION & SYSTEMS CONTROL AREA */}
                <div className="border-t border-[#222222] pt-6 space-y-4">
                  <span className="text-[10px] font-mono text-gray-500 uppercase font-bold">Arena controllers</span>
                  
                  {/* Settings toggle dark / light themes */}
                  <div className="flex justify-between items-center p-4 bg-[#0D0D0D] rounded-xl border border-zinc-900 text-left">
                    <div>
                      <h3 className="text-xs font-bold text-white">Aesthetic Lighting</h3>
                      <p className="text-[9px] text-gray-500 font-bold">Toggles background ambient high luminosity</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setThemeMode((prev) => (prev === "dark" ? "light" : "dark"))}
                      className="bg-primary border border-[#2C2C2C] p-2 rounded-full text-secondary hover:text-white cursor-pointer"
                    >
                      {themeMode === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Multi-Factor Authentication Shield card */}
                  <div className="p-4 bg-[#0D0D0D] border border-zinc-900 rounded-xl text-left flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-xs font-bold text-white uppercase tracking-tight">MFA Security Shield</h3>
                        {profile.mfaEnabled ? (
                          <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded">
                            INACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] text-gray-500 font-bold mt-0.5 leading-relaxed">
                        {profile.mfaEnabled
                          ? `Secured: Authenticator Shared Key Key synced`
                          : "Fortify your court statistics & level milestones"}
                      </p>
                    </div>
                    
                    {profile.mfaEnabled ? (
                      <button
                        type="button"
                        onClick={() => {
                          setMfaInputCode("");
                          setMfaFeedbackError(false);
                          setShowMfaDisableModal(true);
                        }}
                        className="bg-primary hover:bg-zinc-900 p-2 rounded-full border border-rose-500/30 text-rose-400 hover:text-white cursor-pointer transition-colors"
                        title="Deactivate MFA Shield"
                      >
                        <ShieldAlert className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={startMfaActivation}
                        className="bg-primary hover:bg-zinc-900 p-2 rounded-full border border-secondary/30 text-secondary hover:text-white cursor-pointer transition-colors"
                        title="Enable MFA Authentication"
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Reset options panel */}
                  {!user && (
                    <div className="p-4 bg-[#0D0D0D] border border-secondary/20 rounded-xl text-left flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-white">Disconnect Guest Mode</h3>
                        <p className="text-[9px] text-gray-500 font-bold">Return to the onboarding welcome & accounts page</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setGuestOptIn(false);
                          showToast("Welcome screen enabled.", "success");
                        }}
                        className="bg-zinc-950 hover:bg-zinc-900 px-3 py-1.5 rounded-xl border border-secondary/30 text-secondary hover:text-white text-[10px] uppercase font-bold cursor-pointer transition-all duration-150"
                        title="Return to Welcome Screen"
                      >
                        Reset Login
                      </button>
                    </div>
                  )}

                  <div className="p-4 bg-[#0D0D0D] border border-[#FF3366]/20 rounded-xl text-left flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-white">Erase Memory Matrix</h3>
                      <p className="text-[9px] text-gray-500 font-bold">Wipe local storage and database progression stats</p>
                    </div>
                    <button
                      type="button"
                      onClick={triggerDataReset}
                      className="bg-primary hover:bg-zinc-900 p-2.5 rounded-full border border-red-500/30 text-red-500 hover:text-white cursor-pointer"
                      title="Request deletion of player details"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* COMPREHENSIVE FLOATING FOOTER NAVIGATION MENU */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 z-40 bg-[#0D0D0D]/95 border-t border-[#222222] shadow-[0_-10px_25px_rgba(0,0,0,0.5)] flex items-center justify-around w-full max-w-[480px] pb-safe pt-2.5 px-4 h-20">
          {[
            { id: "home", name: "Arena", icon: <Flame className="w-5 h-5" /> },
            { id: "stats", name: "Stats", icon: <TrendingUp className="w-5 h-5" /> },
            { id: "shop", name: "Shop", icon: <ShoppingBag className="w-5 h-5" /> },
            { id: "journal", name: "AI Coach", icon: <Sparkles className="w-5 h-5" /> },
            { id: "more", name: "More Specs", icon: <Grid className="w-5 h-5" /> },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id !== "more") {
                    setIsMoreOpen(false);
                  }
                }}
                className={`p-2 flex flex-col items-center justify-center space-y-0.5 cursor-pointer select-none relative transition-all active:scale-90 duration-100 min-w-[56px] ${
                  isActive ? "text-[#FF3366]" : "text-gray-400 hover:text-white"
                }`}
              >
                {/* Active Underline element */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabGlow"
                    className="absolute -top-1 w-6 h-[2.5px] bg-[#FF3366] rounded-full shadow-[0_4px_10px_#FF3366]"
                  />
                )}
                <div>{tab.icon}</div>
                <span className="text-[9px] font-mono font-bold tracking-tight uppercase leading-none select-none">
                  {tab.name}
                </span>
              </button>
            );
          })}
        </nav>

        {/* ABSOLUTE LEVEL UP DRAMATIC CINEMATIC PANEL */}
        <AnimatePresence>
          {showLevelUpCinematic !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-[#000000]/90 flex flex-col items-center justify-center p-6 text-center select-none"
            >
              {/* Confetti & Golden Star Splash overlays */}
              <div className="absolute inset-0 pointer-events-none opacity-30">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10%" cy="20%" r="5" fill="#FFE259" className="animate-ping" />
                  <circle cx="80%" cy="15%" r="7" fill="#00FFCC" className="animate-ping" />
                  <circle cx="20%" cy="80%" r="4" fill="#FF3366" className="animate-ping" />
                  <circle cx="90%" cy="75%" r="6" fill="#FFE259" className="animate-ping" />
                </svg>
              </div>

              <motion.div
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8 }}
                className="space-y-6 max-w-xs"
              >
                <span className="text-sm font-black font-mono tracking-wider text-[#00FFCC] uppercase animate-pulse">
                  EVOLUTION MILESTONE ACHIEVED
                </span>
                
                <h1 className="text-4xl font-extrabold text-[#FFFFFF] tracking-tighter uppercase leading-none drop-shadow-xl select-none">
                  LEVEL <span className="text-[#FF3366]">{showLevelUpCinematic}</span> REACHED!
                </h1>

                <div className="my-5 w-40 h-40 mx-auto rounded-full bg-[#111111] border-2 border-[#00FFCC] p-4 flex items-center justify-center shadow-2xl filter drop-shadow-[0_0_15px_#00FFCC] animate-spin-slow">
                  <span className="text-[#FFE259] font-black text-xs uppercase italic tracking-widest leading-none drop-shadow select-none">
                    GOD GEAR
                  </span>
                </div>

                <p className="text-xs text-gray-400 font-sans font-bold leading-relaxed px-2">
                  Congratulations! Your athletic performance matrix evolved successfully! New badges, equipment gear slot, and boss protection levels have been linked to your profile database.
                </p>

                <button
                  onClick={() => setShowLevelUpCinematic(null)}
                  className="bg-secondary text-[#0D0D0D] px-8 py-3 rounded-full text-xs font-sans font-black uppercase text-shadow cursor-pointer transition-all active:scale-95 duration-100"
                >
                  RETURN TO ARENA
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DYNAMIC CONFETTI/GOLDEN RINGS OVERLAY FOR PERFECT DAY BONUS */}
        <AnimatePresence>
          {showPerfectDayBonus && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 bg-[#00FFCC]/15 border-2 border-[#00FFCC] px-5 py-3 rounded-full shadow-[0_0_20px_#00FFCC] backdrop-blur-md pointer-events-none uppercase flex items-center space-x-2"
            >
              <Trophy className="w-5 h-5 text-yellow-300 animate-bounce" />
              <span className="text-xs font-black text-white text-shadow tracking-widest whitespace-nowrap">
                PERFECT DAY! +50 COINS ADDED
              </span>
            </motion.div>
          )}
        </AnimatePresence>

          </>
        )}

        {/* FORCE LOGIN OR GUEST PROMPT OVERLAY */}
        <AnimatePresence>
          {!user && !guestOptIn && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] bg-[#0D0D0D]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
            >
              <div className="w-full max-w-[340px] space-y-8 flex flex-col items-center">
                {/* Brand / Logo */}
                <BrandLogo size="xl" />

                {/* Animated Character Avatar preview to add excitement */}
                <div className="relative w-full aspect-[4/3] bg-zinc-950/80 rounded-[22px] border border-zinc-800 flex flex-col items-center justify-center p-4 overflow-hidden shadow-inner">
                  <div className="absolute inset-0 opacity-10 pointer-events-none flex flex-col justify-between p-2">
                    <div className="h-px bg-white w-full"></div>
                    <div className="h-px bg-secondary w-1/2"></div>
                  </div>
                  {/* Small badge showing Offline / Online options */}
                  <div className="absolute top-2.5 right-2 text-[8px] font-mono uppercase bg-zinc-900 border border-zinc-700 text-zinc-400 px-2 py-0.5 rounded-full font-bold">
                    Anime-Style Training
                  </div>
                  {/* Display Avatar in Cadet Stance */}
                  <div className="transform scale-90">
                    <AvatarSVG 
                      level={1} 
                      racketType="wood" 
                      shirtColor="casual" 
                      pantsColor="casual" 
                      hasBadge={false} 
                      isSmashing={false} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-extrabold tracking-tight text-white uppercase">
                    Select Your Profile Engine
                  </h3>
                  <p className="text-[11px] font-sans text-gray-400 font-medium leading-relaxed">
                    Link with Google to sync stats, achievements, and gear purchases across all viewports. Or continue as guest to store data locally in this browser.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="w-full space-y-3 pt-2">
                  <button
                    onClick={async () => {
                      await triggerGoogleLogin();
                    }}
                    className="w-full bg-[#00FFCC] text-[#0D0D0D] p-3.5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-100 hover:opacity-90 active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <span>Connect with Google Account</span>
                  </button>

                  <button
                    onClick={() => {
                      setGuestOptIn(true);
                      showToast("Continuing as Recruit (Guest State)", "success");
                    }}
                    className="w-full bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 p-3.5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-100 active:scale-[0.98] cursor-pointer flex items-center justify-center"
                  >
                    Continue as Offline Guest
                  </button>
                </div>

                {/* Troubleshooter for Google Popup Sign-in */}
                <div className="w-full text-left bg-zinc-900 border border-zinc-800 rounded-xl p-3 space-y-2">
                  <button 
                    onClick={() => setShowAuthTroubleshoot(!showAuthTroubleshoot)}
                    className="w-full flex items-center justify-between text-[10px] font-mono font-bold text-amber-500 hover:text-amber-400 uppercase tracking-wider cursor-pointer text-left"
                  >
                    <span>⚠️ popup error? (learn how to fix)</span>
                    <span className="text-[9px]">{showAuthTroubleshoot ? "▲" : "▼"}</span>
                  </button>
                  
                  {showAuthTroubleshoot && (
                    <div className="text-[10px] font-sans text-gray-400 space-y-2 pt-1 border-t border-zinc-800/60 leading-relaxed">
                      <p>
                        The error <span className="text-white font-mono font-bold">"The requested action is invalid"</span> occurs because Google Sign-In is not enabled on your brand-new Firebase project yet.
                      </p>
                      <p className="text-amber-500 font-bold">To Enable Google Sign-In:</p>
                      <ol className="list-decimal list-inside space-y-1.5 font-sans pl-1">
                        <li>
                          Open the <a href="https://console.firebase.google.com/project/artful-hold-88gvj/authentication/providers" target="_blank" rel="noopener noreferrer" className="text-[#00FFCC] underline font-bold">Firebase Authentication console</a>.
                        </li>
                        <li>
                          Click the <span className="text-white font-bold">"Sign-in method"</span> tab.
                        </li>
                        <li>
                          Click <span className="text-white font-bold">"Add new provider"</span> and select <span className="text-[#00FFCC] font-bold">Google</span>.
                        </li>
                        <li>
                          Toggle <span className="text-white font-bold">Enable</span>, pick your support email, and click <span className="text-white font-bold">Save</span>.
                        </li>
                      </ol>
                      <p className="text-[9px] text-zinc-500 italic mt-1 font-mono">
                        💡 Click "Continue as Offline Guest" above to bypass and train locally right now without configuring anything!
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer security badge */}
                <div className="text-[8px] font-mono text-gray-500 uppercase tracking-widest font-bold flex items-center space-x-1">
                  <span>🔒 Offline state is strictly sandboxed</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* GYM EYE CAPTURE SCANNER MODAL */}
        <AIVerifierModal
          habit={selectedHabitForAI}
          isOpen={selectedHabitForAI !== null}
          onClose={() => setSelectedHabitForAI(null)}
          onVerificationSuccess={triggerVerifySuccess}
          showToast={showToast}
        />

        {/* MFA SETUP TWO-FACTOR DIALOG OVERLAY */}
        <AnimatePresence>
          {showMfaSetupModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-[#070707]/95 backdrop-blur-md flex flex-col justify-end"
            >
              <motion.div
                initial={{ y: 150 }}
                animate={{ y: 0 }}
                exit={{ y: 150 }}
                className="bg-[#111111] border-t border-zinc-900 rounded-t-[28px] p-6 space-y-5 overflow-y-auto max-h-[92%]"
              >
                {/* Modal Title Banner */}
                <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                  <div className="flex items-center space-x-2 text-secondary">
                    <ShieldCheck className="w-5 h-5" />
                    <h3 className="text-sm font-black uppercase tracking-tight">Activate MFA Shield</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMfaSetupModal(false)}
                    className="text-zinc-500 hover:text-white font-mono text-[10px] uppercase font-bold px-2.5 py-1 rounded bg-zinc-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                {/* Instructions */}
                <div className="space-y-4">
                  <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 space-y-1 text-left leading-relaxed">
                    <span className="text-[10px] font-mono text-zinc-400 font-extrabold uppercase">Step 1: Scan QR or Sync Secret Key</span>
                    <p className="text-[10px] text-zinc-500 font-bold leading-relaxed">
                      Link your device with authenticator apps. Scan the virtual vector code below or manually insert the secure hash.
                    </p>
                  </div>

                  {/* SVG Code display */}
                  <div className="flex flex-col items-center justify-center space-y-3 py-1">
                    <MfaQRCodeSVG value={`otpauth://totp/ReadySetGo:${profile.email || "guest"}?secret=${mfaSetupSecret.replace(/-/g, "")}&issuer=ReadySetGo`} />
                    
                    <div className="w-full max-w-xs flex items-center justify-between bg-zinc-950 border border-zinc-900 px-3 py-2 rounded-xl text-xs font-mono">
                      <span className="text-gray-400 select-all font-bold tracking-tight text-[10px]">
                        HASH: {mfaSetupSecret}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(mfaSetupSecret);
                          showToast("Copied Shared Secret Hash!", "success");
                        }}
                        className="text-[#00FFCC] hover:text-white bg-[#00FFCC]/10 hover:bg-[#00FFCC]/20 p-1.5 rounded-lg border border-secondary/20 cursor-pointer transition-colors"
                        title="Copy Key Code"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 space-y-3 text-left">
                    <span className="text-[10px] font-mono text-zinc-400 font-extrabold uppercase">Step 2: Enter Verification OTP Code</span>
                    <p className="text-[10px] text-zinc-500 font-bold">
                      Enter the 6-digit active number from google/microsoft authenticator to verify precision.
                    </p>

                    <div className="relative pt-1 flex flex-col items-center">
                      <input
                        type="text"
                        maxLength={6}
                        value={mfaInputCode}
                        onChange={(e) => handleMfaCodeChange(e.target.value, "setup")}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10 text-center"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="••••••"
                        autoFocus
                      />
                      
                      {/* Flex display squares */}
                      <div className="flex space-x-2.5">
                        {Array.from({ length: 6 }).map((_, idx) => {
                          const digit = mfaInputCode[idx] || "";
                          const isFocused = mfaInputCode.length === idx;
                          return (
                            <div
                              key={idx}
                              className={`w-10 h-12 rounded-xl border flex items-center justify-center font-mono text-base font-extrabold transition-all duration-150 ${
                                mfaFeedbackError
                                  ? "border-rose-500 bg-rose-500/10 text-rose-500"
                                  : isFocused
                                  ? "border-secondary bg-secondary/15 shadow-[0_0_8px_rgba(0,191,156,0.3)] text-secondary"
                                  : digit
                                  ? "border-zinc-700 bg-zinc-900/80 text-white"
                                  : "border-zinc-800 bg-[#070707] text-gray-500"
                              }`}
                            >
                              {digit || "•"}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[9px] font-mono font-bold text-gray-400 pt-1.5">
                      <span>Live step cycle</span>
                      <span className="text-secondary bg-secondary/10 px-1.5 py-0.5 rounded">
                        {mfaCurrentCountdown}s left
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MFA DEACTIVATE TWO-FACTOR DIALOG OVERLAY */}
        <AnimatePresence>
          {showMfaDisableModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-[#070707]/95 backdrop-blur-md flex flex-col justify-end"
            >
              <motion.div
                initial={{ y: 150 }}
                animate={{ y: 0 }}
                exit={{ y: 150 }}
                className="bg-[#111111] border-t border-zinc-800 rounded-t-[28px] p-6 space-y-6"
              >
                {/* Header title */}
                <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                  <div className="flex items-center space-x-2 text-rose-400">
                    <ShieldAlert className="w-5 h-5" />
                    <h3 className="text-sm font-black uppercase tracking-tight">Disable Security Shield</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMfaDisableModal(false);
                      setMfaInputCode("");
                    }}
                    className="text-zinc-500 hover:text-white font-mono text-[10px] uppercase font-bold px-2.5 py-1 rounded bg-zinc-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-4 text-center">
                  <p className="text-[11px] text-gray-400 font-medium leading-relaxed max-w-xs mx-auto">
                    Warning! Disabling Two-Factor protection exposes your stats to potential manipulation. Verify validation code to proceed.
                  </p>

                  <div className="relative pt-2 flex flex-col items-center">
                    <input
                      type="text"
                      maxLength={6}
                      value={mfaInputCode}
                      onChange={(e) => handleMfaCodeChange(e.target.value, "disable")}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                    
                    {/* Grid Display */}
                    <div className="flex space-x-2.5">
                      {Array.from({ length: 6 }).map((_, idx) => {
                        const digit = mfaInputCode[idx] || "";
                        const isFocused = mfaInputCode.length === idx;
                        return (
                          <div
                            key={idx}
                            className={`w-10 h-12 rounded-xl border flex items-center justify-center font-mono text-base font-extrabold transition-all duration-150 ${
                              mfaFeedbackError
                                ? "border-rose-500 bg-rose-500/10 text-rose-500"
                                : isFocused
                                ? "border-rose-400 bg-rose-400/10 shadow-[0_0_8px_rgba(239,68,68,0.3)] text-rose-400"
                                : digit
                                ? "border-zinc-700 bg-zinc-900/80 text-white"
                                : "border-zinc-800 bg-[#070707] text-gray-500"
                            }`}
                          >
                            {digit || "•"}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[9px] font-mono font-bold text-gray-400 px-3">
                    <span>Validation sequence speed</span>
                    <span className="text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
                      {mfaCurrentCountdown}s remaining
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TOAST SYSTEM OUTLET */}
        <NotificationToast toasts={toasts} removeToast={removeToast} />

      </div>
    </div>
  );
}
