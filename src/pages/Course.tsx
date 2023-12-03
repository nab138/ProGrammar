import {
  IonAccordion,
  IonAccordionGroup,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
import "./Course.css";
import { useHistory, useParams } from "react-router";
import { useEffect, useState } from "react";
import { Course } from "../utils/structures";
import getStorage, { initializeLesson } from "../utils/storage";
import CloseButton from "../components/CloseButton";

const CoursePage: React.FC = () => {
  let history = useHistory();
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
      if (unit == null) unit = 0;
      if (lesson == null) lesson = 0;
      setCurUnit(unit);
      setCurLesson(lesson);
      setInfo(info);
    };
    fetchInfo();
  });

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
          {info?.units.map((unit, unitIndex) => {
            let isCompletedUnit = unitIndex < (curUnit ?? 0);
            return (
              <IonAccordion
                value={unitIndex.toString()}
                disabled={unitIndex > (curUnit ?? 0)}
                key={unitIndex}
              >
                <IonItem slot="header" color="light" key={unitIndex}>
                  <IonLabel>
                    Unit {unitIndex + 1} - {unit.name}
                  </IonLabel>
                </IonItem>
                <IonList className="ion-no-padding" slot="content">
                  {unit.lessons.map((lesson, index) => {
                    return (
                      <IonItem
                        onClick={async () => {
                          await initializeLesson(id);
                          history.push(`/lesson/${id}$${unitIndex}$${index}`);
                        }}
                        disabled={!isCompletedUnit && index > (curLesson ?? 0)}
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
