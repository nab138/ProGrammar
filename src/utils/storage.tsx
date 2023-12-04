import { Storage } from "@ionic/storage";
import { Course, Lesson, Unit } from "./structures";
import triggerAchievement from "./achievements";

const store = new Storage();
let hasInit = false;

export default function getStorage(): Storage {
  if (!hasInit) {
    store.create();
    hasInit = true;
  }
  return store;
}

export async function incrementLessonIfOlder(
  course: string,
  curUnit: number,
  curLesson: number,
  courseInfo: Course
): Promise<string> {
  let storedUnit = parseInt(await getStorage().get(`unit-progress-${course}`));
  let storedLesson = parseInt(
    await getStorage().get(`lesson-progress-${course}`)
  );
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
    await getStorage().set(`unit-progress-${course}`, unit);
    await getStorage().set(`lesson-progress-${course}`, lesson);
  }

  return result;
}

export async function initializeLesson(course: string) {
  let storedUnit = await getStorage().get(`unit-progress-${course}`);
  let storedLesson = await getStorage().get(`lesson-progress-${course}`);
  if (storedUnit == null || storedLesson == null) {
    await getStorage().set(`unit-progress-${course}`, 0);
    await getStorage().set(`lesson-progress-${course}`, 0);
    triggerAchievement("course-start");
  }
  await getStorage().set("current-course", course);
}
