import {
  IonAlert,
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonPage,
  IonTitle,
  IonToggle,
  IonToolbar,
} from "@ionic/react";
import "./Settings.css";
import storage from "../utils/storage";
import { useEffect, useState } from "react";
import { App, AppInfo } from "@capacitor/app";
import { auth, changePassword, logout } from "../utils/firebase";
import { logOutOutline } from "ionicons/icons";
import { useAuthState } from "react-firebase-hooks/auth";
import { OfflineWarning } from "../components/OfflineWarning";

export interface SettingsProps {
  setDevWidgetEnabled: (enabled: boolean) => void;
}
const Settings: React.FC<SettingsProps> = ({ setDevWidgetEnabled }) => {
  const [version, setVersion] = useState("");
  const [appInfo, setAppInfo] = useState<AppInfo>();
  const [showModal, setShowModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [username, setUsername] = useState("");
  const [devWidgetEnabled, setDevWidgetEnabledState] = useState(false);

  const [user, loading, error] = useAuthState(auth);

  useEffect(() => {
    const fetchInfo = async () => {
      let versionModule = await import(`../version.json`);
      setVersion(versionModule.default.version);
      const info = await App.getInfo();
      setAppInfo(info);
    };
    fetchInfo();
  }, []);

  useEffect(() => {
    const loadUsername = async () => {
      setUsername(await storage.get("name"));
      const devWidgetEnabled = await storage.get("devWidgetEnabled");
      setDevWidgetEnabledState(devWidgetEnabled);
    };
    loadUsername();
  }, [user, loading]);
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
          <OfflineWarning />
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
          <IonItem color="light">
            <IonLabel>Enable DevWidget</IonLabel>
            <IonToggle
              slot="end"
              checked={devWidgetEnabled}
              onIonChange={(e) => {
                setDevWidgetEnabled(e.detail.checked);
                setDevWidgetEnabledState(e.detail.checked);
                storage.set("devWidgetEnabled", e.detail.checked);
              }}
            />
          </IonItem>
        </IonList>
        <IonList color="light" inset>
          <IonItem color="light">
            <IonLabel>Username: {username}</IonLabel>
          </IonItem>
          <IonItem
            color="light"
            onClick={async () => {
              setShowModal(true);
            }}
          >
            <IonLabel>Change Password</IonLabel>
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
          <IonItem id="present-clear-alert" color="danger">
            <IonLabel>Danger: Clear all saved data</IonLabel>
          </IonItem>
        </IonList>
        <IonAlert
          trigger="present-clear-alert"
          header="Clear Saved Data"
          message="This will reset all saved progress, achievements, and more. This cannot be undone. Are you sure?"
          buttons={[
            "Cancel",
            {
              text: "Confirm",
              handler: async () => {
                await storage.clear();
              },
            },
          ]}
        ></IonAlert>
        <IonModal isOpen={showModal}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Change Password</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonItem>
              <IonLabel position="floating">New Password</IonLabel>
              <IonInput
                type="password"
                value={newPassword}
                onInput={(e) =>
                  setNewPassword((e.target as HTMLInputElement).value!)
                }
              ></IonInput>
            </IonItem>
            <IonButton
              expand="full"
              onClick={async () => {
                let res = await changePassword(newPassword);
                if (res) setShowModal(false);
              }}
            >
              Change Password
            </IonButton>
            <IonButton
              expand="full"
              fill="clear"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </IonButton>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};
export default Settings;
