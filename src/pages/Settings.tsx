import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import "./Settings.css";
import getStorage from "../utils/storage";
import { useEffect, useState } from "react";

const Settings: React.FC = () => {
  const [version, setVersion] = useState("");

  useEffect(() => {
    const fetchInfo = async () => {
      let versionModule = await import(`../version.json`);
      setVersion(versionModule.default.version);
    };
    fetchInfo();
  }, []);
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent color="light">
        <IonButton
          expand="block"
          color="danger"
          size="large"
          onClick={async () => {
            await getStorage().clear();
          }}
        >
          DANGER: RESET ALL SAVED DATA
        </IonButton>
        <p className="ion-padding">Version {version}</p>
      </IonContent>
    </IonPage>
  );
};

export default Settings;
