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
import storage, {
  CourseProgress,
  getProgress,
  initializeLesson,
} from "../utils/storage";
import CloseButton from "../components/CloseButton";
import { OfflineWarning } from "../components/OfflineWarning";

interface Completions {
  [key: string]: number;
}
const CoursePage: React.FC = () => {
  let history = useHistory();
  let { id } = useParams<{ id: string }>();

  let [progress, setProgress] = useState<CourseProgress>();
  let [info, setInfo] = useState<Course>();
  let [completions, setCompletions] = useState<Completions>({});
  useEffect(() => {
    const fetchInfo = async () => {
      let infoModule = await import(`../courses/${id}.json`);
      let info: Course = infoModule.default;
      let progress = await getProgress();
      let completions = (await storage.getLocal(`completions-${id}`)) ?? {};
      setCompletions(completions);
      setProgress(progress[id]);
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
            let isCompletedUnit = unitIndex < (progress?.unit ?? 0);
            return (
              <IonAccordion
                value={unitIndex.toString()}
                disabled={unitIndex > (progress?.unit ?? 0)}
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
                              completions[unitIndex + "-" + index]
                            }`
                          );
                        }}
                        disabled={
                          !isCompletedUnit && index > (progress?.lesson ?? 0)
                        }
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
