import { Course } from "./structures";
import triggerAchievement from "./achievements";
import { toast } from "sonner";
import { Storage as IonicStorage } from "@ionic/storage";
import { supabase } from "./supabaseClient";
import { Session } from "@supabase/supabase-js";

interface Data {
  [key: string]: any;
}
class Storage {
  private local: IonicStorage;
  private session: Session | null = null;

  private async getSession() {
    if (this.session == null) {
      this.session = (await supabase.auth.getSession()).data.session;
    }
    return this.session;
  }

  constructor() {
    this.local = new IonicStorage();
    this.local.create();
    supabase.auth.onAuthStateChange(async (event, session) => {
      this.session = session;
    });
  }

  async get(key: string): Promise<any> {
    const user = (await this.getSession())?.user;
    if (user) {
      const { data, error } = await supabase
        .from("profiles")
        .select(key)
        .eq("id", user.id)
        .single();

      if (error) {
        console.log(error.message);
        return null;
      }

      return (data as Data)[key];
    } else {
      console.log("No user is signed in");
      return null;
    }
  }

  async set(key: string, value: any): Promise<void> {
    const user = (await this.getSession())?.user;
    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({ [key]: value })
        .eq("id", user.id);

      if (error) {
        console.log(error.message);
      }
    } else {
      console.log("No user is signed in");
    }
  }

  async clear(): Promise<void> {
    const user = (await this.getSession())?.user;
    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({
          progress: {},
          achievements: [],
          achievement_counts: {},
          achievement_streaks: {},
          achievement_triggers: {},
          last_daily_streak: null,
        })
        .eq("id", user.id);

      if (error) {
        console.log(error.message);
      }
    } else {
      console.log("No user is signed in");
    }
  }

  async getLocal(key: string): Promise<any> {
    return await this.local.get(key);
  }

  async getLocalWithDefault(key: string, defaultValue: any): Promise<any> {
    let result = await this.local.get(key);
    if (result == null) {
      result = defaultValue;
      await this.local.set(key, result);
    }
    return result;
  }

  async setLocal(key: string, value: any): Promise<void> {
    await this.local.set(key, value);
  }

  async clearLocal(): Promise<void> {
    await this.local.clear();
  }
}

const storage = new Storage();
export default storage;

export interface UserProgress {
  [key: string]: CourseProgress;
}

export interface CourseProgress {
  unit: number;
  lesson: number;
}

export async function getProgress() {
  let progress = (await storage.get("progress")) as UserProgress;
  if (!progress) {
    progress = {};
    await storage.set("progress", progress);
  }
  return progress;
}

// export async function getCourseProgress(course: string) {
//   let progress = await getProgress();
//   if(!progress[course]) {
//     progress[course] = {
//       unit: 0,
//       lesson: 0,
//     }
//     await storage.set("progress", progress);
//   }
//   return progress[course];
// }

export async function incrementLessonIfOlder(
  course: string,
  curUnit: number,
  curLesson: number,
  courseInfo: Course
): Promise<string> {
  let progress = await getProgress();
  let storedUnit = progress[course]?.unit;
  let storedLesson = progress[course]?.lesson;
  if (storedUnit == null || storedLesson == null) {
    toast("You haven't started this course yet!", {
      description: "How did you finish a lesson without starting the course?",
    });
    return "end-course";
  }
  let unit = curUnit;
  let lesson = curLesson + 1;

  let numLessonsInUnit = courseInfo.units[curUnit].lessons.length - 1;

  let result = "continue";
  let shouldSave = true;
  if (
    storedUnit > curUnit ||
    (storedUnit == curUnit && storedLesson > curLesson)
  ) {
    shouldSave = false;
  }
  if (curLesson == numLessonsInUnit) {
    if (courseInfo.units.length - 1 > curUnit) {
      unit = curUnit + 1;
      lesson = 0;
      result = "end-unit";
    } else {
      lesson = curLesson;
      result = "end-course";
    }
  } else {
    lesson = curLesson + 1;
  }
  if (shouldSave) {
    progress[course] = {
      unit,
      lesson,
    };
    await storage.set("progress", progress);
  }

  return result;
}

export async function initializeLesson(course: string) {
  let progress = await getProgress();
  let storedUnit = progress[course]?.unit;
  let storedLesson = progress[course]?.lesson;
  if (storedUnit == null || storedLesson == null) {
    progress[course] = {
      unit: 0,
      lesson: 0,
    };
    await storage.set("progress", progress);
    triggerAchievement("course-start", course);
  }
  await storage.setLocal("current-course", course);
}
