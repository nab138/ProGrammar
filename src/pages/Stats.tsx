import {
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
} from "@ionic/react";
import "./Stats.css";
import { Achievement, getAchievements } from "../utils/achievements";
import { useEffect, useState } from "react";

const Stats: React.FC = () => {
  let [achievements, setAchievements] = useState<Achievement[]>([]);

  useIonViewWillEnter(() => {
    const fetchAchievements = async () => {
      let achievements = await getAchievements();
      setAchievements(achievements);
    };
    fetchAchievements();
  });
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Stats</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="achievement-container">
          <div className="stats-header ion-padding">
            <h2>Achievements</h2>
            <p>Here you can find all of your earned achievements! </p>
          </div>
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
        </div>
        <div className="themes-container">
          <div className="stats-header ion-padding">
            <h2>Themes</h2>
            <p>Here you can change your theme!</p>
          </div>
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
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Stats;
