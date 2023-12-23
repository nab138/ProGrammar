import {
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
import "./Settings.css";
import getStorage from "../utils/storage";
import { useEffect, useState } from "react";
import { App, AppInfo } from "@capacitor/app";
import { logout } from "../utils/firebase";
import { logOut, logOutOutline } from "ionicons/icons";

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
          <IonItem color="light">
            <IonLabel>Native version: {appInfo?.version}</IonLabel>
          </IonItem>
          <IonItem color="light">
            <IonLabel>Native Build: {appInfo?.build}</IonLabel>
          </IonItem>
          <IonItem color="light">
            {/* Get version from appflows live update patch */}
            <IonLabel>JS Bundle version: {version}</IonLabel>
          </IonItem>
        </IonList>
        <IonList color="light" inset>
          <IonItem
            color="danger"
            onClick={async () => {
              await (await getStorage()).clear();
            }}
          >
            <IonLabel>Danger: Clear all saved data</IonLabel>
          </IonItem>
          <IonItem
            color="light"
            onClick={async () => {
              await logout();
            }}
          >
            <IonIcon slot="start" icon={logOutOutline} />
            <IonLabel>Sign Out</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Settings;
