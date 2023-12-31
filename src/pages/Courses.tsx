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
} from "@ionic/react";
import "./Courses.css";
import coursesList from "../courses/courses.json";
import { useEffect, useState } from "react";
import storage, { getProgress, initializeLesson } from "../utils/storage";
import { useHistory, useLocation } from "react-router-dom";
import { Course, difficultyLookup } from "../utils/structures";
import LoadingCourseCard from "../components/LoadingCourseCard";
import { OfflineWarning } from "../components/OfflineWarning";
import { useSupabaseAuth } from "../utils/supabaseClient";

const Courses: React.FC = () => {
  const { pathname } = useLocation();
  let history = useHistory();

  let [courses, setCourses] = useState<Course[]>([]);
  let [session, loading, error] = useSupabaseAuth();
  let [retrievingCourses, setRetrievingCourses] = useState(false);
  let [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      let timeoutId;
      if (!hasLoadedOnce) {
        timeoutId = setTimeout(() => setRetrievingCourses(true), 15);
      }
      let userProgress = await getProgress();
      let coursesTemp = [];
      for (let course of coursesList) {
        let infoModule = await import(`../courses/${course}.json`);
        let info: Course = infoModule.default;
        let courseProgress = userProgress[course] ?? {};
        info.currentUnit = courseProgress.unit;
        info.currentLesson = courseProgress.lesson;
        coursesTemp.push(info);
      }
      if (!hasLoadedOnce) {
        clearTimeout(timeoutId);
        setRetrievingCourses(false);
        setHasLoadedOnce(true);
      }
      setCourses(coursesTemp);
    };

    fetchCourses();
  }, [pathname]);

  let isLoading = loading || retrievingCourses;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Courses</IonTitle>
          <OfflineWarning />
        </IonToolbar>
      </IonHeader>
      <IonContent className="courses-page">
        <h4>Select a Course!</h4>
        {!isLoading &&
          courses.map((course, index) => {
            let hasStarted =
              course.currentLesson != null && course.currentUnit != null;
            return (
              <IonCard key={index}>
                <IonCardHeader>
                  <IonCardTitle>{course.name}</IonCardTitle>
                  <IonCardSubtitle>
                    {course.units.length} Unit
                    {course.units.length > 1 ? "s" : ""} |{" "}
                    {hasStarted
                      ? `Unit ${course.currentUnit + 1}, Lesson ${
                          course.currentLesson + 1
                        }`
                      : "Not Started"}
                    <br />
                    {difficultyLookup[course.difficulty]}
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
        {isLoading && (
          <>
            <LoadingCourseCard key="skeleton-0" />
            <LoadingCourseCard key="skeleton-1" />
            <LoadingCourseCard key="skeleton-2" />
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Courses;
