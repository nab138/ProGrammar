import { Storage } from "@ionic/storage";
import { Course } from "./structures";

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
) {
  let storedUnit = parseInt(await getStorage().get(`unit-progress-${course}`));
  let storedLesson = parseInt(
    await getStorage().get(`lesson-progress-${course}`)
  );
  let unit = curUnit;
  let lesson = curLesson + 1;

  let numLessonsInUnit = courseInfo.units[curUnit].lessons.length - 1;
  if (
    storedUnit > curUnit ||
    (storedUnit == curUnit && storedLesson > curLesson)
  )
    return;
  if (curLesson == numLessonsInUnit) {
    if (courseInfo.units.length - 1 > curUnit) {
      unit = curUnit + 1;
      lesson = 0;
    } else {
    }
  } else {
    lesson = curLesson + 1;
  }
  await getStorage().set(`unit-progress-${course}`, unit);
  await getStorage().set(`lesson-progress-${course}`, lesson);
}

export async function initializeLesson(course: string) {
  let storedUnit = await getStorage().get(`unit-progress-${course}`);
  let storedLesson = await getStorage().get(`lesson-progress-${course}`);
  if (storedUnit == null || storedLesson == null) {
    await getStorage().set(`unit-progress-${course}`, 0);
    await getStorage().set(`lesson-progress-${course}`, 0);
  }
  await getStorage().set("current-course", course);
}
