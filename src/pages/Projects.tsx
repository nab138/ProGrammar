import {
  IonAccordion,
  IonAccordionGroup,
  IonButton,
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
import "./Projects.css";
import { OfflineWarning } from "../components/OfflineWarning";
import { hammer } from "ionicons/icons";
import { useHistory } from "react-router";
import { useEffect, useState } from "react";
import { ProjectLanguage } from "../utils/structures";
import storage from "../utils/storage";
import { toast } from "sonner";
const Projects: React.FC = () => {
  let history = useHistory();
  let [languages, setLanguages] = useState<ProjectLanguage[]>([]);
  let [isPremium, setIsPremium] = useState(false);
  useEffect(() => {
    const fetchLanguages = async () => {
      let languages = (await import("../projects/languages.json")).default;
      let projectLanguages = [];
      for (let language of languages) {
        let infoModule = await import(`../projects/${language}.json`);
        let info: ProjectLanguage = infoModule.default;
        projectLanguages.push(info);
      }
      setLanguages(projectLanguages);
    };
    const fetchPremium = async () => {
      let isPremium = await storage.get("is_premium");
      setIsPremium(isPremium);
    };
    fetchLanguages();
    fetchPremium();
  }, []);
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Projects</IonTitle>
          <OfflineWarning />
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {isPremium ? (
          <IonAccordionGroup multiple>
            {languages.map((lang) => {
              return (
                <IonAccordion key={lang.id}>
                  <IonItem slot="header" color="light">
                    <IonLabel>{lang.name}</IonLabel>
                  </IonItem>
                  <IonList className="ion-no-padding" slot="content">
                    <IonItem
                      key={"sandbox-" + lang.id}
                      button
                      onClick={() => {
                        history.push("/sandbox/" + lang.id + "/Sandbox");
                      }}
                    >
                      <IonLabel>
                        {" "}
                        <IonIcon icon={hammer} /> Sandbox
                      </IonLabel>
                    </IonItem>
                    {lang.projects.map((project) => {
                      return (
                        <IonItem key={project.name} button onClick={() => {}}>
                          <IonLabel>{project.name}</IonLabel>
                        </IonItem>
                      );
                    })}
                  </IonList>
                </IonAccordion>
              );
            })}
          </IonAccordionGroup>
        ) : (
          <div className="ion-padding premium-barrier">
            <div className="premium-header">
              <h1>Projects are a premium feature!</h1>
              <p>
                Pojects are a great way to grow your programming skill, allowing
                you to write real code and see it work in real time.
              </p>
            </div>
            <p>
              Premium includes: <br />
              - No ads <br />
              - Projects <br />
              - Code Sandboxes <br />
              - And more!
            </p>
            <IonButton
              expand="block"
              onClick={() => {
                toast.success("Coming soon!", {
                  description:
                    "Thanks for your interest in premium! It's still being worked on, but it should be available soon (Note: for testing, enable Premium Account in settings and reload. Requires a cloud account).",
                  duration: 5000,
                });
              }}
            >
              <IonLabel>Get Premium</IonLabel>
            </IonButton>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Projects;
