import { toastController } from "@ionic/core";
import getStorage from "./storage";

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
  "lesson-complete.1": {
    name: "New Learner",
    description: "Complete your first lesson",
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
 */
export default async function triggerAchievement(
  category: AchievementCategory
) {
  console.log("hi");
  let count = await increment(category);
  console.log(count);
  let achievement = achievements[category + "." + count];
  console.log(achievement);
  if (achievement) {
    let existingAchievements = (await getStorage().get("achievements")) ?? [];
    achievement.gotDate = new Date().toLocaleDateString();
    existingAchievements.push(achievement);
    await getStorage().set("achievements", existingAchievements);
    // Display a toast
    const toast = await toastController.create({
      header: `Achievement Unlocked!`,
      message: achievement.name + " - " + achievement.description,
      duration: 2000,
    });
    toast.present();
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
