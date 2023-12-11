import { toastController } from "@ionic/core";
import getStorage from "./storage";
import { toast } from "sonner";

export type AchievementCategory =
  | "lesson-complete"
  | "unit-complete"
  | "course-start"
  | "course-complete"
  | "hard-question"
  | "no-mistakes-lesson"
  | "no-mistakes-lesson-streak";

export interface Achievement {
  name: string;
  description: string;
  gotDate?: string;
}

interface AchievementTable {
  [key: string]: Achievement;
}

const achievements: AchievementTable = {
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
  let shouldAllow = await shouldAllowTrigger(category + id);
  if (override || !shouldAllow) return;
  let count = await increment(category);
  let achievement = achievements[category + "." + count];
  if (achievement) {
    let existingAchievements = (await getStorage().get("achievements")) ?? [];
    achievement.gotDate = new Date().toLocaleDateString();
    existingAchievements.push(achievement);
    await getStorage().set("achievements", existingAchievements);
    // Display a toast
    toast("Achievement Unlocked!", {
      description: achievement.name + " - " + achievement.description,
      duration: 3000,
    });
  }
}

export async function resetCategory(achievement: AchievementCategory) {
  await getStorage().set("achievement-category-" + achievement, 0);
}

export async function getAchievements() {
  return (await getStorage().get("achievements")) ?? [];
}

async function increment(achievement: AchievementCategory) {
  let storage = getStorage();
  let count: number =
    (await storage.get("achievement-category-" + achievement)) ?? 0;
  count++;
  await storage.set("achievement-category-" + achievement, count);
  return count;
}

export async function shouldAllowTrigger(id: string) {
  let storage = getStorage();
  let triggered = await storage.get("achievement-triggered-" + id);
  if (triggered) return false;
  await storage.set("achievement-triggered-" + id, true);
  return true;
}