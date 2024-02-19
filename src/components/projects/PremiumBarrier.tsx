import {
  IonButton,
  IonContent,
  IonHeader,
  IonLabel,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { OfflineWarning } from "../OfflineWarning";
import { toast } from "sonner";
import "./PremiumBarrier.css";

const PremiumBarrier = ({
  onDismiss,
}: {
  onDismiss: (data?: string | null | undefined | number, role?: string) => void;
}) => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Premium Required</IonTitle>
          <OfflineWarning />
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="ion-padding premium-barrier">
          <div className="premium-header">
            <h1>Interactive Projects are a premium feature!</h1>
            <p>
              Interactive mode can help you debug your code and see it in
              action. It's a great way to learn and experiment with new
              technologies. Get premium to unlock this feature and more!
            </p>
          </div>
          <p>
            Premium includes: <br />
            - No ads <br />
            - Interactive Projects <br />
            - Cloud Sync for Projects <br />- And more!
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
          <IonButton
            color="light"
            expand="block"
            onClick={() => {
              onDismiss();
            }}
          >
            <IonLabel>Maybe Later</IonLabel>
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PremiumBarrier;
