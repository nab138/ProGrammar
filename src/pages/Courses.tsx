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
import "./Courses.css";
import coursesList from "../courses/courses.json";
import { useEffect, useState } from "react";
import getStorage from "../utils/storage";
import { useHistory } from "react-router-dom";

const Courses: React.FC = () => {
  let history = useHistory();

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
      }
      setCourses(coursesTemp);
    };

    fetchCourses();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Courses</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <h4>Select a Course</h4>
        {courses.map((course, index) => {
          let hasStarted =
            course.currentLesson != null && course.currentUnit != null;
          return (
            <IonCard key={index}>
              <IonCardHeader>
                <IonCardTitle>{course.name}</IonCardTitle>
                <IonCardSubtitle>
                  {course.units.length} Unit{course.units.length > 1 ? "s" : ""}{" "}
                  |{" "}
                  {hasStarted
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
                    if (!hasStarted) {
                      await getStorage().set(`unit-progress-${course.id}`, 0);
                      await getStorage().set(`lesson-progress-${course.id}`, 0);
                      course.currentUnit = 0;
                      course.currentLesson = 0;
                    }
                    await getStorage().set("current-course", course.id);
                    history.push(`/course/${course.id}`);
                  }}
                >
                  {hasStarted ? "Resume" : "Start"} Course
                </IonButton>
              </div>
            </IonCard>
          );
        })}
      </IonContent>
    </IonPage>
  );
};

export default Courses;

export interface Course {
  name: string;
  description: string;
  currentUnit: number;
  currentLesson: number;
  units: Unit[];
  id: string;
}

export interface Unit {
  name: string;
  description: string;
  id: string;
  lessons: LessonInfo[];
}

export interface LessonInfo {
  name: string;
  type: "quiz" | "code";
  id: string;
}

export interface Lesson {
  questions: Question[];
}

export interface Question {
  question: string;
  type: "mc" | "fill";
  choices: string[];
  answer: string;
  explanations?: string[];
}

export interface MultipleChoiceQuestion {
  question: string;
  type: "mc";
  choices: string[];
  answer: string;
  explanations: string[];
}
