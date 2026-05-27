/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  userId: string;
  email: string;
  xp: number;
  coins: number;
  level: number;
  hp: number; // Player Health/Stamina out of 100 for HUD and Boss battle penalties
  streak: number;
  perfectDaysCount: number;
  smashPowerLevel: number;
  lastCheckDate: string; // YYYY-MM-DD
  purchasedItems: string[]; // itemIds bought
  currentRacket: string; // 'wood' | 'normal' | 'pro' | 'godly'
  currentShirt: string; // 'casual' | 'blue' | 'purple' | 'godly'
  currentPants: string; // 'casual' | 'sport' | 'gold_pants'
  badges: string[]; // Earned achievement badges
  statsWeeklyXP: number[]; // 7 days of XP history e.g. [120, 80, 50, 150, 200, 140, 90]
}

export interface Habit {
  id: string; // 'habit1' | 'habit2' | 'habit3'
  name: string;
  category: string;
  difficulty: "Medium" | "Hard";
  xpReward: number;
  streakCount: number;
  completedToday: boolean;
  timesCompleted: number; // Count of completions used to check "First completion ever"
}

export interface HistoryLog {
  logId: string; // YYYY-MM-DD
  date: string;
  completedHabits: string[]; // ['habit1', 'habit2']
  xpEarned: number;
  coinsEarned: number;
}

export interface ShopItem {
  id: string;
  name: string;
  category: "shirt" | "pants" | "racket" | "badge" | "power";
  cost: number;
  description: string;
  value: string; // customization detail (e.g. hex color, string design)
}

export interface Enemy {
  name: string;
  minXp: number;
  maxXp: number;
  imageStyle: string;
  fierceness: number; // 2/5 etc
  description: string;
  attackEffect: string;
  visual: string;
}

export interface ChallengeQuest {
  id: string;
  name: string;
  description: string;
  target: number;
  current: number;
  rewardCoins: number;
  completed: boolean;
}
