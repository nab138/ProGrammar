import { IonButton, IonContent, IonHeader, IonLabel, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import { OfflineWarning } from "./OfflineWarning";
import { toast } from "sonner";
import "./PremiumBarrier.css";

const PremiumBarrier: React.FC = () => {
    return <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>Premium Required</IonTitle>
        <OfflineWarning />
      </IonToolbar>
    </IonHeader>
    <IonContent>
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
          - Code Sandboxes <br />- And more!
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
    </IonContent>
  </IonPage>;
  };
  
  export default PremiumBarrier;
