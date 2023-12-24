import {
  IonCard,
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
import { Achievement, getAchievements } from "../utils/achievements";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../utils/firebase";
import { OfflineWarning } from "../components/OfflineWarning";
import storage from "../utils/storage";
import { person } from "ionicons/icons";
interface UserProfile {
  username: string;
  displayName: string;
}
const Social: React.FC = () => {
  let [achievements, setAchievements] = useState<Achievement[]>([]);
  let [user, loading, error] = useAuthState(auth);
  let [retrievingAchievements, setRetrievingAchievements] = useState(false);
  let [loadingProfile, setLoadingProfile] = useState(false);
  let [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  let [userProfile, setUserProfile] = useState<UserProfile>();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        setLoadingProfile(true);
        let username = await storage.get("username");
        let displayName = await storage.get("displayName");
        setUserProfile({ username, displayName });
        setLoadingProfile(false);
      }
    };
    fetchUserProfile();
  }, [user, loading]);
  useIonViewWillEnter(() => {
    const fetchAchievements = async () => {
      let timeoutId;
      if (!hasLoadedOnce) {
        timeoutId = setTimeout(() => setRetrievingAchievements(true), 50);
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

  let isLoadingAchievements = loading || retrievingAchievements;
  let isLoadingProfile = loading || loadingProfile || !userProfile;
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
                  <IonLabel>
                    <p>No achievements yet. Get out there and achieve!</p>
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
