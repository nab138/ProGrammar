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

const Tab3: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
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
      </IonContent>
    </IonPage>
  );
};

export default Tab3;
