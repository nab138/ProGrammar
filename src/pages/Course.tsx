import {
  IonAccordion,
  IonAccordionGroup,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import "./Course.css";
import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { Course } from "./Courses";
import getStorage from "../utils/storage";
import CloseButton from "../components/CloseButton";

const CoursePage: React.FC = () => {
  let { id } = useParams<{ id: string }>();

  let [curUnit, setCurUnit] = useState<number>();
  let [curLesson, setCurLesson] = useState<number>();
  let [info, setInfo] = useState<Course>();
  useEffect(() => {
    const fetchInfo = async () => {
      let infoModule = await import(`../courses/${id}/info.json`);
      let info: Course = infoModule.default;
      let unit = await getStorage().get(`unit-progress-${id}`);
      let lesson = await getStorage().get(`lesson-progress-${id}`);
      setCurUnit(unit);
      setCurLesson(lesson);
      setInfo(info);
    };
    fetchInfo();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{info?.name}</IonTitle>
          <CloseButton />
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonAccordionGroup multiple>
          {info?.units.map((unit, index) => {
            return (
              <IonAccordion
                value={index.toString()}
                disabled={index > (curUnit ?? 0)}
                key={index}
              >
                <IonItem slot="header" color="light" key={index}>
                  <IonLabel>
                    Unit {index + 1} - {unit.name}
                  </IonLabel>
                </IonItem>
                <IonList className="ion-no-padding" slot="content">
                  {unit.lessons.map((lesson, index) => {
                    return (
                      <IonItem
                        routerLink={`/lesson/${id}.${curUnit}.${index}`}
                        routerDirection="forward"
                        disabled={index > (curLesson ?? 0)}
                        key={index}
                      >
                        <IonLabel>{lesson.name}</IonLabel>
                      </IonItem>
                    );
                  })}
                </IonList>
              </IonAccordion>
            );
          })}
        </IonAccordionGroup>
      </IonContent>
    </IonPage>
  );
};

export default CoursePage;
