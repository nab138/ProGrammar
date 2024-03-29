import {
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSkeletonText,
  IonThumbnail,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
} from "@ionic/react";
import "./Social.css";
import {
  getAchievements,
  lookupAchievements,
} from "../utils/achievements";
import { useEffect, useState } from "react";
import { OfflineWarning } from "../components/OfflineWarning";
import { person } from "ionicons/icons";
import { useSupabaseAuth } from "../utils/supabaseClient";
interface UserProfile {
  username: string;
  displayName: string;
}
const Social: React.FC = () => {
  let [achievements, setAchievements] = useState<any[]>([]);
  let [session, loading, error] = useSupabaseAuth();
  let [retrievingAchievements, setRetrievingAchievements] = useState(false);
  let [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  let [userProfile, setUserProfile] = useState<UserProfile>();

  useEffect(() => {
    if (session) {
      let username = session.user.user_metadata.username;
      let displayName = session.user.user_metadata.display_name;
      setUserProfile({ username, displayName });
    }
  }, [session, loading, error]);
  useIonViewWillEnter(() => {
    const fetchAchievements = async () => {
      let timeoutId;
      if (!hasLoadedOnce) {
        timeoutId = setTimeout(() => setRetrievingAchievements(true), 50);
      }
      let achievementKeys = await getAchievements();
      let achievements = lookupAchievements(achievementKeys);
      setAchievements(achievements);
      if (!hasLoadedOnce) {
        clearTimeout(timeoutId);
        setRetrievingAchievements(false);
        setHasLoadedOnce(true);
      }
    };
    fetchAchievements();
  });

  let isLoadingAchievements = loading || retrievingAchievements;
  let isLoadingProfile = loading || !userProfile;
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Social</IonTitle>
          <OfflineWarning />
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="stats-header ion-padding">
          <h1>My Profile</h1>
        </div>
        <IonItem>
          <IonThumbnail slot="start">
            {!isLoadingProfile && (
              <IonIcon
                style={{ width: "100%", height: "100%" }}
                icon={person}
              ></IonIcon>
            )}
            {isLoadingProfile && <IonSkeletonText animated={true} />}
          </IonThumbnail>
          <IonLabel>
            {!isLoadingProfile && (
              <>
                <h2>{userProfile?.displayName}</h2>
                <p>{userProfile?.username}</p>
              </>
            )}
            {isLoadingProfile && (
              <>
                <IonSkeletonText style={{ width: "40%" }} animated />
                <IonSkeletonText style={{ width: "30%" }} animated />
              </>
            )}
          </IonLabel>
        </IonItem>
        <div className="achievement-container">
          <div className="stats-header ion-padding">
            <h2>Achievements</h2>
            <p>Here you can find all of your earned achievements! </p>
          </div>
          {!isLoadingAchievements && (
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
              {achievements.length == 0 && (
                <IonItem color="light">
                  <IonLabel class="ion-text-wrap">
                    <p className="ion-text-wrap">No achievements yet. Get out there and achieve!</p>
                  </IonLabel>
                </IonItem>
              )}
            </IonList>
          )}
          {isLoadingAchievements && (
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
