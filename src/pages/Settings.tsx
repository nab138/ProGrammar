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
import { logOutOutline } from "ionicons/icons";
import { OfflineWarning } from "../components/OfflineWarning";
import {
  hapticsImpactHeavy,
  hapticsImpactLight,
  hapticsImpactMedium,
  hapticsSelectionChanged,
  hapticsSelectionEnd,
  hapticsSelectionStart,
  hapticsVibrate,
} from "../utils/haptics";
import {
  changePassword,
  signout,
  useSupabaseAuth,
} from "../utils/supabaseClient";

export interface SettingsProps {
  setDevWidgetEnabled: (enabled: boolean) => void;
}
const Settings: React.FC<SettingsProps> = ({ setDevWidgetEnabled }) => {
  const [version, setVersion] = useState("");
  const [appInfo, setAppInfo] = useState<AppInfo>();
  const [showModal, setShowModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [devWidgetEnabled, setDevWidgetEnabledState] = useState<boolean>();
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>();
  const [sfxEnabled, setSfxEnabled] = useState<boolean>();
  const [isPremium, setIsPremium] = useState<boolean>();

  const [session, loading, error] = useSupabaseAuth();

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
      const [devWidgetEnabled, hapticsEnabled, sfxEnabled, isPremium] =
        await Promise.all([
          storage.getLocal("devWidgetEnabled"),
          storage.getLocal("hapticsEnabled"),
          storage.getLocalWithDefault("sfxEnabled", true),
          storage.get("isPremium"),
        ]);
      setDevWidgetEnabledState(devWidgetEnabled);
      setHapticsEnabled(hapticsEnabled);
      setSfxEnabled(sfxEnabled);
      setIsPremium(isPremium);
    };
    loadUsername();
  }, [session, loading]);
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
            <IonToggle
              slot="end"
              checked={sfxEnabled}
              className="settings-toggle"
              onIonChange={(e) => {
                setSfxEnabled(e.detail.checked);
                storage.setLocal("sfxEnabled", e.detail.checked);
              }}
            >
              SFX
            </IonToggle>
          </IonItem>
          <IonItem color="light">
            <IonToggle
              slot="end"
              checked={hapticsEnabled}
              className="settings-toggle"
              onIonChange={(e) => {
                setHapticsEnabled(e.detail.checked);
                storage.setLocal("hapticsEnabled", e.detail.checked);
                if (e.detail.checked) {
                  hapticsImpactHeavy();
                }
              }}
            >
              Haptics
            </IonToggle>
          </IonItem>
        </IonList>
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
            <IonToggle
              slot="end"
              checked={devWidgetEnabled}
              className="settings-toggle"
              onIonChange={(e) => {
                setDevWidgetEnabled(e.detail.checked);
                setDevWidgetEnabledState(e.detail.checked);
                storage.setLocal("devWidgetEnabled", e.detail.checked);
              }}
            >
              Enable DevWidget
            </IonToggle>
          </IonItem>
          <IonItem color="light">
            <IonToggle
              slot="end"
              checked={isPremium}
              className="settings-toggle"
              onIonChange={(e) => {
                setIsPremium(e.detail.checked);
                storage.set("isPremium", e.detail.checked);
              }}
            >
              Premium Account (Requires Reload)
            </IonToggle>
          </IonItem>
        </IonList>
        <IonList color="light" inset>
          <IonItem color="light">
            <IonLabel>
              Username: {session?.user.user_metadata.username}
            </IonLabel>
          </IonItem>
          <IonItem
            color="light"
            onClick={async () => {
              setShowModal(true);
            }}
            button={true}
          >
            <IonLabel>Change Password</IonLabel>
          </IonItem>
          <IonItem
            color="light"
            onClick={async () => {
              await signout();
            }}
            button={true}
          >
            <IonIcon slot="start" icon={logOutOutline} />
            <IonLabel>Sign Out</IonLabel>
          </IonItem>
          <IonItem button={true} id="present-clear-alert" color="danger">
            <IonLabel>Danger: Clear all saved data (Cloud)</IonLabel>
          </IonItem>
          <IonItem button={true} id="present-clear-local-alert" color="danger">
            <IonLabel>Danger: Clear all saved data (Local)</IonLabel>
          </IonItem>
        </IonList>
        <IonList inset>
          <IonItem color="light" button onClick={hapticsImpactHeavy}>
            <IonLabel>Test Heavy Haptics</IonLabel>
          </IonItem>
          <IonItem color="light" button onClick={hapticsImpactMedium}>
            <IonLabel>Test Medium Haptics</IonLabel>
          </IonItem>
          <IonItem color="light" button onClick={hapticsImpactLight}>
            <IonLabel>Test Light Haptics</IonLabel>
          </IonItem>
          <IonItem color="light" button onClick={hapticsVibrate}>
            <IonLabel>Test Vibrate</IonLabel>
          </IonItem>
          <IonItem color="light" button onClick={hapticsSelectionStart}>
            <IonLabel>Test Selection Start</IonLabel>
          </IonItem>
          <IonItem color="light" button onClick={hapticsSelectionChanged}>
            <IonLabel>Test Selection Changed</IonLabel>
          </IonItem>
          <IonItem color="light" button onClick={hapticsSelectionEnd}>
            <IonLabel>Test Selection End</IonLabel>
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
        <IonAlert
          trigger="present-clear-local-alert"
          header="Clear Local Saved Data"
          message="This will reset some data, such as settings, completions, and more. This cannot be undone. Are you sure?"
          buttons={[
            "Cancel",
            {
              text: "Confirm",
              handler: async () => {
                await storage.clearLocal();
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
