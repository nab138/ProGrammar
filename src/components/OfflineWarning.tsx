import "./OfflineWarning.css";
import { IonIcon, IonLabel } from "@ionic/react";
import { cloudOffline } from "ionicons/icons";
import { useEffect, useState } from "react";

export function OfflineWarning() {
  let [shouldShow, setShouldShow] = useState<boolean>(!navigator.onLine);
  useEffect(() => {
    const updateOnlineStatus = () => {
      setShouldShow(!navigator.onLine);
    };
    const updateOfflineStatus = () => {
      setShouldShow(!navigator.onLine);
    };

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOfflineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOfflineStatus);
    };
  }, []);
  return (
    <IonLabel
      color="danger"
      className={"offline-warning-label" + (shouldShow ? "" : "-hidden")}
    >
      <IonIcon icon={cloudOffline} /> Offline
    </IonLabel>
  );
}
