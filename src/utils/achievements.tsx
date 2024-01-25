import storage from "./storage";
import { toast } from "sonner";

import { App } from "@capacitor/app";

import { Mutex } from "async-mutex";

const achievementMutex = new Mutex();
const triggerMutex = new Mutex();
const categoryMutex = new Mutex();

App.addListener("appStateChange", (state) => {
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
  | "daily-streak"
  | "project-success";

export interface Achievement {
  name: string;
  description: string;
}

interface RecievedAchievement {
  gotDate: string;
  achievementKey: string;
}

const achievements: { [key: string]: Achievement } = {
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
    name: "Accomplished Scholar",
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
  "project-success.1": {
    name: "A real accomplishment",
    description: "Complete your first project",
  },
  "project-success.3": {
    name: "Master Coder",
    description: "Complete three projects",
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
  if (!override) {
    let shouldAllow = await shouldAllowTrigger(category + "-" + id);
    if (!shouldAllow) return;
  }

  const release = await achievementMutex.acquire();

  try {
    let count = await increment(category);
    let achievementKey = category + "." + count;
    let achievement = achievements[achievementKey];
    if (achievement) {
      let existingAchievements: RecievedAchievement[] =
        (await storage.get("achievements")) ?? [];
      existingAchievements.push({
        achievementKey,
        gotDate: new Date().toLocaleDateString(),
      });
      await storage.set("achievements", existingAchievements);
      // Display a toast
      toast(achievement.name + " - Achievement Unlocked!", {
        description: achievement.description,
        duration: 2500,
      });
    }
  } finally {
    release();
  }
}

export async function getAchievements(): Promise<RecievedAchievement[]> {
  return (await storage.get("achievements")) ?? [];
}

async function increment(category: AchievementCategory) {
  const release = await categoryMutex.acquire();

  try {
    let counts: Record<AchievementCategory, number> =
      (await storage.get("achievement_counts")) || {};
    counts[category] = (counts[category] || 0) + 1;
    await storage.set("achievement_counts", counts);
    return counts[category];
  } finally {
    release();
  }
}

export async function shouldAllowTrigger(id: string) {
  const release = await triggerMutex.acquire();

  try {
    let triggers = (await storage.get("achievement_triggers")) || {};
    if (triggers[id]) return false;
    triggers[id] = true;
    await storage.set("achievement_triggers", triggers);
    return true;
  } finally {
    release();
  }
}

export async function triggerStreakAchievement(
  category: AchievementCategory,
  id: string,
  shouldBreak: boolean,
  override = false
) {
  const release = await achievementMutex.acquire();

  try {
    let shouldAllow = await shouldAllowTrigger(category + "-" + id);
    if (!override && !shouldAllow) return;

    let streakCounts: Record<AchievementCategory, number> =
      (await storage.get("achievement_streaks")) || {};

    if (shouldBreak) {
      // If the streak should be broken, reset the streak count
      streakCounts[category] = 0;
    } else {
      // If the streak should not be broken, increment the streak count
      streakCounts[category] = (streakCounts[category] || 0) + 1;

      // Check if there's an achievement for the current streak count
      let achievementKey = category + "." + streakCounts[category];
      let achievement = achievements[achievementKey];
      if (achievement) {
        let existingAchievements: RecievedAchievement[] =
          (await storage.get("achievements")) ?? [];
        if (
          existingAchievements.filter((a) => a.achievementKey == achievementKey)
        )
          return;
        existingAchievements.push({
          achievementKey,
          gotDate: new Date().toLocaleDateString(),
        });
        await storage.set("achievements", existingAchievements);

        // Display a toast
        toast(achievement.name + " - Achievement Unlocked!", {
          description: achievement.description,
          duration: 2500,
        });
      }
    }

    await storage.set("achievement_streaks", streakCounts);
  } finally {
    release();
  }
}

export async function triggerDailyStreak() {
  let lastDate = await storage.get("last_daily_streak");
  let today = new Date();

  if (
    lastDate &&
    new Date(lastDate).toLocaleDateString() === today.toLocaleDateString()
  )
    return; // If the app was already opened today
  await storage.set("last_daily_streak", today); // Update the last streak date

  if (lastDate) {
    let diff = today.getTime() - new Date(lastDate).getTime();
    let diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Trigger the streak achievement with break set to false
      triggerStreakAchievement("daily-streak", "", false, true);
    } else {
      // Break the streak
      triggerStreakAchievement("daily-streak", "", true, true);
    }
  } else {
    // Trigger the streak achievement with break set to false
    triggerStreakAchievement("daily-streak", "", false, true);
  }
}

export function lookupAchievements(achievementKeys: RecievedAchievement[]) {
  return achievementKeys.map((key) => {
    let achieve = achievements[key.achievementKey];
    return {
      ...achieve,
      gotDate: key.gotDate,
    };
  });
}
