import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemDivider,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import "./Lessons.css";
import coursesList from "../courses/courses.json";
import { useEffect, useState } from "react";
import getStorage from "../utils/storage";

const Lessons: React.FC = () => {
  let [courses, setCourses] = useState<Course[]>([]);
  useEffect(() => {
    const fetchCourses = async () => {
      let coursesTemp = [];
      for (let course of coursesList) {
        let infoModule = await import(`../courses/${course}/info.json`);
        let info: Course = infoModule.default;
        info.currentUnit = await getStorage().get(`unit-progress-${course}`);
        info.currentLesson = await getStorage().get(
          `lesson-progress-${course}`
        );
        coursesTemp.push(info);
        console.log(info);
      }
      setCourses(coursesTemp);
    };

    fetchCourses();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Lessons</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <h4>Select a Course</h4>
        {courses.map((course, index) => {
          return (
            <IonCard key={index}>
              <IonCardHeader>
                <IonCardTitle>{course.name}</IonCardTitle>
                <IonCardSubtitle>
                  {course.units.length} Unit{course.units.length > 1 ? "s" : ""}{" "}
                  |{" "}
                  {course.currentLesson != null && course.currentUnit != null
                    ? `Unit ${course.currentUnit + 1}, Lesson ${
                        course.currentLesson + 1
                      }`
                    : "Not Started"}
                </IonCardSubtitle>
              </IonCardHeader>
              <IonCardContent>{course.description}</IonCardContent>
              <div className="course-buttons">
                <IonButton
                  fill="clear"
                  onClick={async () => {
                    await getStorage().set(`unit-progress-${course.id}`, 0);
                    await getStorage().set(`lesson-progress-${course.id}`, 0);
                  }}
                >
                  Start Course
                </IonButton>
              </div>
            </IonCard>
          );
        })}
      </IonContent>
    </IonPage>
  );
};

export default Lessons;

interface Course {
  name: string;
  description: string;
  currentUnit: number;
  currentLesson: number;
  units: Unit[];
  id: string;
}

interface Unit {
  name: string;
  description: string;
  sections: Lesson[];
}

interface Lesson {
  name: string;
  type: "quiz" | "code";
  file: string;
}
