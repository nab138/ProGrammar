import { Course } from "./structures";
import triggerAchievement from "./achievements";
import { auth, db } from "./firebase";
import {
  deleteField,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { toast } from "sonner";
import { Storage as IonicStorage } from "@ionic/storage";

class Storage {
  private docRefs: { [key: string]: any } = {};
  private local: IonicStorage;

  constructor() {
    this.local = new IonicStorage();
    this.local.create();
  }

  private async getDocRef(uid: string) {
    if (!this.docRefs[uid]) {
      this.docRefs[uid] = doc(db, "users", uid);
    }
    return this.docRefs[uid];
  }

  async get(key: string): Promise<any> {
    const user = auth.currentUser;
    if (user) {
      const docRef = await this.getDocRef(user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as { [key: string]: any };
        if (typeof data === "object" && data !== null && key in data) {
          return data[key];
        } else {
          // console.log("No such key in document: " + key);
          return null;
        }
      } else {
        console.log("No such document: " + user.uid);
        return null;
      }
    } else {
      // console.log("No user is signed in");
      return null;
    }
  }

  async set(key: string, value: any): Promise<void> {
    const user = auth.currentUser;
    if (user) {
      const docRef = await this.getDocRef(user.uid);
      try {
        await setDoc(docRef, { [key]: value }, { merge: true });
      } catch (e) {
        console.log(e);
      }
    } else {
      console.log("No user is signed in");
    }
  }

  async clear(): Promise<void> {
    const user = auth.currentUser;
    if (user) {
      const docRef = await this.getDocRef(user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as { [key: string]: any };
        if (typeof data === "object" && data !== null) {
          const updates: { [key: string]: any } = {};
          for (const key in data) {
            if (
              ![
                "username",
                "displayName",
                "email",
                "uid",
                "authProvider",
              ].includes(key)
            ) {
              updates[key] = deleteField();
            }
          }
          await updateDoc(docRef, updates);
        } else {
          console.log("No such document!");
        }
      } else {
        console.log("No such document!");
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
