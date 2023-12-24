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

class Storage {
  private docRefs: { [key: string]: any } = {};

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
            if (!["name", "email", "uid", "authProvider"].includes(key)) {
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
}
const storage = new Storage();
export default storage;

export async function incrementLessonIfOlder(
  course: string,
  curUnit: number,
  curLesson: number,
  courseInfo: Course
): Promise<string> {
  let storedUnit = parseInt(await storage.get(`unit-progress-${course}`));
  let storedLesson = parseInt(await storage.get(`lesson-progress-${course}`));
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
    await storage.set(`unit-progress-${course}`, unit);
    await storage.set(`lesson-progress-${course}`, lesson);
  }

  return result;
}

export async function initializeLesson(course: string) {
  let storedUnit = await storage.get(`unit-progress-${course}`);
  let storedLesson = await storage.get(`lesson-progress-${course}`);
  if (storedUnit == null || storedLesson == null) {
    await storage.set(`unit-progress-${course}`, 0);
    await storage.set(`lesson-progress-${course}`, 0);
    triggerAchievement("course-start", course);
  }
  await storage.set("current-course", course);
}
