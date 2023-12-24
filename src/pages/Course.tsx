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
} from "@ionic/react";
import "./Course.css";
import { useHistory, useParams } from "react-router";
import { useEffect, useState } from "react";
import { Course } from "../utils/structures";
import storage, { initializeLesson } from "../utils/storage";
import CloseButton from "../components/CloseButton";
import { OfflineWarning } from "../components/OfflineWarning";

interface Completions {
  [key: string]: number;
}
const CoursePage: React.FC = () => {
  let history = useHistory();
  let { id } = useParams<{ id: string }>();

  let [curUnit, setCurUnit] = useState<number>();
  let [curLesson, setCurLesson] = useState<number>();
  let [info, setInfo] = useState<Course>();
  let [completions, setCompletions] = useState<Completions>({});
  useEffect(() => {
    const fetchInfo = async () => {
      let infoModule = await import(`../courses/${id}.json`);
      let info: Course = infoModule.default;
      let unit = (await storage.get(`unit-progress-${id}`)) ?? 0;
      let lesson = (await storage.get(`lesson-progress-${id}`)) ?? 0;
      let completions = (await storage.get(`completions-${id}`)) ?? {};
      setCompletions(completions);
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
          <OfflineWarning />
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
                          history.push(
                            `/lesson/${id}$${unitIndex}$${index}$${
                              completions[curUnit + "-" + index]
                            }`
                          );
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
