import {
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
} from "@ionic/react";
import "./Social.css";
import { Achievement, getAchievements } from "../utils/achievements";
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../utils/firebase";
import { OfflineWarning } from "../components/OfflineWarning";

const Social: React.FC = () => {
  let [achievements, setAchievements] = useState<Achievement[]>([]);
  let [user, loading, error] = useAuthState(auth);
  let [retrievingAchievements, setRetrievingAchievements] = useState(false);
  let [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useIonViewWillEnter(() => {
    const fetchAchievements = async () => {
      let timeoutId;
      if (!hasLoadedOnce) {
        timeoutId = setTimeout(() => setRetrievingAchievements(true), 25);
      }
      let achievements = await getAchievements();
      setAchievements(achievements);
      if (!hasLoadedOnce) {
        clearTimeout(timeoutId);
        setRetrievingAchievements(false);
        setHasLoadedOnce(true);
      }
    };
    fetchAchievements();
  });

  let isLoading = loading || retrievingAchievements;
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Social</IonTitle>
          <OfflineWarning />
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="achievement-container">
          <div className="stats-header ion-padding">
            <h2>Achievements</h2>
            <p>Here you can find all of your earned achievements! </p>
          </div>
          {!isLoading && (
            <IonList className="achievement-list" inset>
              {achievements.map((achievement, index) => {
                return (
                  <IonItem color="light" key={achievement.name}>
                    <IonLabel>
                      <h3 className="ion-text-wrap">
                        {achievement.name} - {achievement.description}
                      </h3>
                      {achievement.gotDate && (
                        <p>Recieved on {achievement.gotDate}</p>
                      )}
                    </IonLabel>
                  </IonItem>
                );
              })}
            </IonList>
          )}
          {isLoading && (
            <IonList className="achievement-list" inset>
              <IonItem color="light">
                <IonLabel>
                  <IonSkeletonText animated />
                  <IonSkeletonText animated style={{ width: "60%" }} />
                </IonLabel>
              </IonItem>
              <IonItem color="light">
                <IonLabel>
                  <IonSkeletonText animated />
                  <IonSkeletonText animated style={{ width: "60%" }} />
                </IonLabel>
              </IonItem>
              <IonItem color="light">
                <IonLabel>
                  <IonSkeletonText animated />
                  <IonSkeletonText animated style={{ width: "60%" }} />
                </IonLabel>
              </IonItem>
            </IonList>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Social;
