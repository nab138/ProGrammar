import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
import "./Courses.css";
import coursesList from "../courses/courses.json";
import { useEffect, useState } from "react";
import getStorage, { initializeLesson } from "../utils/storage";
import { useHistory, useLocation } from "react-router-dom";
import { Course } from "../utils/structures";

const Courses: React.FC = () => {
  const { pathname } = useLocation();
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
  }, [pathname]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Courses</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="courses-page">
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
                <IonButton fill="clear" routerLink={`/course/${course.id}`}>
                  View Course
                </IonButton>
                <IonButton
                  fill="clear"
                  onClick={async () => {
                    await initializeLesson(course.id);
                    history.push(
                      `/lesson/${course.id}$${
                        hasStarted ? course.currentUnit : 0
                      }$${hasStarted ? course.currentLesson : 0}`
                    );
                  }}
                >
                  {hasStarted ? "Resume" : "Start"}
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
