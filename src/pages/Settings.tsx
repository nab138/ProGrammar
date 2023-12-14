import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import "./Settings.css";
import getStorage from "../utils/storage";
import { useEffect, useState } from "react";
import { App, AppInfo } from "@capacitor/app";

const Settings: React.FC = () => {
  const [version, setVersion] = useState("");
  const [appInfo, setAppInfo] = useState<AppInfo>();

  useEffect(() => {
    const fetchInfo = async () => {
      let versionModule = await import(`../version.json`);
      setVersion(versionModule.default.version);
      const info = await App.getInfo();
      setAppInfo(info);
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
      <IonContent>
        <IonList inset>
          <IonItem>
            <IonLabel>Native version: {version}</IonLabel>
          </IonItem>
          <IonItem>
            {/* Get version from appflows live update patch */}
            <IonLabel>JS Bundle version: {appInfo?.version}</IonLabel>
          </IonItem>
        </IonList>
        <IonList inset>
          <IonItem
            color="danger"
            onClick={async () => {
              await getStorage().clear();
            }}
          >
            <IonLabel className="ion-padding">
              Danger: Clear all saved data
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel className="ion-padding">
              Force User Onboarding Flow
            </IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Settings;
