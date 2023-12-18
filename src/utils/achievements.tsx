import getStorage from "./storage";
import { toast } from "sonner";

import { App } from "@capacitor/app";

App.addListener("appStateChange", (state) => {
  // state.isActive contains the active state
  if (state.isActive) {
    triggerDailyStreak();
  }
});

export type AchievementCategory =
  | "lesson-complete"
  | "unit-complete"
  | "course-start"
  | "course-complete"
  | "hard-question"
  | "no-mistakes-lesson"
  | "no-mistakes-lesson-streak"
  | "daily-streak";

export interface Achievement {
  name: string;
  description: string;
  gotDate?: string;
}

interface AchievementTable {
  [key: string]: Achievement;
}

const achievements: AchievementTable = {
  "daily-streak.2": {
    name: "Returning Visitor",
    description: "Open the app 2 days in a row",
  },
  "daily-streak.5": {
    name: "Dedicated Learner",
    description: "Open the app 5 days in a row",
  },
  "daily-streak.10": {
    name: "Consistent Scholar",
    description: "Open the app 10 days in a row",
  },
  "lesson-complete.2": {
    name: "New Learner",
    description: "Complete 2 lessons",
  },
  "lesson-complete.5": {
    name: "Getting Started",
    description: "Complete 5 lessons",
  },
  "lesson-complete.10": {
    name: "Sticking With It",
    description: "Complete 10 lessons",
  },
  "unit-complete.1": {
    name: "Knowledge Builder",
    description: "Complete your first unit",
  },
  "unit-complete.3": {
    name: "Unit Master",
    description: "Complete 3 units",
  },
  "unit-complete.6": {
    name: "Advanced Explorer",
    description: "Complete 6 units",
  },
  "course-start.1": {
    name: "Journey Begins",
    description: "Start a new course",
  },
  "course-complete.1": {
    name: "Course Conqueror",
    description: "Successfully complete a course",
  },
  "hard-question.1": {
    name: "Challenge Accepted",
    description: "Correctly answer a difficult question",
  },
  "hard-question.5": {
    name: "Problem Solver",
    description: "Correctly answer 5 difficult questions",
  },
  "no-mistakes-lesson.1": {
    name: "Flawless Execution",
    description: "Complete a lesson without making any mistakes",
  },
  "no-mistakes-lesson.5": {
    name: "Flawless Scholar",
    description: "Complete 5 lessons without making any mistakes",
  },
  "no-mistakes-lesson-streak.3": {
    name: "Straight-A Student",
    description: "Complete 3 lessons in a row without making any mistakes",
  },
  "no-mistakes-lesson-streak.10": {
    name: "Do you really need this app?",
    description: "Complete 10 lessons in a row without making any mistakes",
  },
};

/**
 * Increment the counters of certain achievement categories, if applicable.
 * @param category The achievement category to trigger
 * @param id A unique id representing a specific action which triggered the achievement, used to ensure the same action cannot increment the same achievement multiple times
 */
export default async function triggerAchievement(
  category: AchievementCategory,
  id: string,
  override = false
) {
  let shouldAllow = await shouldAllowTrigger(category + "-" + id);
  if (!override && !shouldAllow) return;
  let count = await increment(category);
  let achievement = achievements[category + "." + count];
  if (achievement) {
    let existingAchievements: Achievement[] =
      (await (await getStorage()).get("achievements")) ?? [];
    achievement.gotDate = new Date().toLocaleDateString();
    existingAchievements.push(achievement);
    await (await getStorage()).set("achievements", existingAchievements);
    // Display a toast
    toast(achievement.name + " - Achievement Unlocked!", {
      description: achievement.description,
      duration: 2500,
    });
  }
}

export async function resetCategory(achievement: AchievementCategory) {
  await (await getStorage()).set("achievement-category-" + achievement, 0);
}

export async function getAchievements() {
  return (await (await getStorage()).get("achievements")) ?? [];
}

async function increment(achievement: AchievementCategory) {
  let storage = await getStorage();
  let count: number =
    (await storage.get("achievement-category-" + achievement)) ?? 0;
  count++;
  await storage.set("achievement-category-" + achievement, count);
  return count;
}

export async function shouldAllowTrigger(id: string) {
  let storage = await getStorage();
  let triggered = await storage.get("achievement-triggered-" + id);
  if (triggered) return false;
  await storage.set("achievement-triggered-" + id, true);
  return true;
}

export async function triggerStreakAchievement(
  category: AchievementCategory,
  id: string,
  shouldBreak: boolean,
  override = false
) {
  let shouldAllow = await shouldAllowTrigger(category + "-" + id);
  if (!override && !shouldAllow) return;
  let storage = await getStorage();
  let streakCount: number =
    (await storage.get("achievement-streak-" + category)) ?? 0;

  if (shouldBreak) {
    // If the streak should be broken, reset the streak count
    await storage.set("achievement-streak-" + category, 0);
  } else {
    // If the streak should not be broken, increment the streak count
    streakCount++;
    await storage.set("achievement-streak-" + category, streakCount);

    // Check if there's an achievement for the current streak count
    let achievement = achievements[category + "." + streakCount];
    if (achievement) {
      let existingAchievements: Achievement[] =
        (await storage.get("achievements")) ?? [];
      if (existingAchievements.find((a) => a.name === achievement.name)) return;
      achievement.gotDate = new Date().toLocaleDateString();
      existingAchievements.push(achievement);
      await storage.set("achievements", existingAchievements);

      // Display a toast
      toast(achievement.name + " - Achievement Unlocked!", {
        description: achievement.description,
        duration: 2500,
      });
    }
  }
}

export async function triggerDailyStreak() {
  let storage = await getStorage();
  let lastDateStr = await storage.get("last-daily-streak");
  let today = new Date();
  let todayStr = today.toLocaleDateString();

  if (lastDateStr === todayStr) return; // If the app was already opened today
  await storage.set("last-daily-streak", todayStr); // Update the last streak date

  if (lastDateStr) {
    let lastDate = new Date(lastDateStr);
    let diff = new Date(todayStr).getTime() - lastDate.getTime();
    let diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Trigger the streak achievement with break set to false
      triggerStreakAchievement("daily-streak", "", false, true);
    } else {
      // If it's been more than 1 day, reset the streak counter
      await storage.set("streak-count", 0);
      // Break the streak
      triggerStreakAchievement("daily-streak", "", true, true);
    }
  } else {
    // Trigger the streak achievement with break set to false
    triggerStreakAchievement("daily-streak", "", false, true);
  }
}
