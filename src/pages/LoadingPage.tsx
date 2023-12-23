import { IonContent, IonLabel, IonPage, IonSpinner } from "@ionic/react";
import "./LoadingPage.css";
const LoadingPage: React.FC = () => {
  return (
    <IonPage>
      <IonContent>
        <div className="loading-screen ion-text-center">
          <IonLabel className="loading-label">Loading...</IonLabel>
          <IonSpinner className="loading-spinner" name="circular"></IonSpinner>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LoadingPage;
