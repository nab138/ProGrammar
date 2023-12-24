import { Redirect, Route, useLocation } from "react-router-dom";
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { book, cog, hammer, list } from "ionicons/icons";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";
import Courses from "./pages/Courses";
import Stats from "./pages/Stats";
import Settings from "./pages/Settings";
import Course from "./pages/Course";
import LessonContainer from "./pages/LessonContainer";
import { useEffect, useRef } from "react";
import { Toaster, toast } from "sonner";
import { triggerDailyStreak } from "./utils/achievements";
import CodeEditor from "./pages/CodeEditor";
import "./utils/firebase";
import { auth } from "./utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import LoginModal from "./components/LoginModal";
import { useState } from "react";
import { useHistory } from "react-router";
import LoadingPage from "./pages/LoadingPage";
import DevWidget from "./components/DevWidget";
import storage from "./utils/storage";
import { LessonContext } from "./LessonContext";
setupIonicReact();

const TabRoutes: React.FC = () => {
  const location = useLocation();
  const outlet = useRef<HTMLIonRouterOutletElement>(null);

  let [showDevWidget, setShowDevWidget] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => {
      toast.dismiss();
      toast.success("You're back online!");
    };
    const updateOfflineStatus = () =>
      toast.warning("You've gone offline", {
        description:
          "Progress will not be saved, and the app may not work as expected.",
      });

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOfflineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOfflineStatus);
    };
  }, []);

  useEffect(() => {
    if (outlet.current == null) return;
    outlet.current.swipeHandler = undefined;
    triggerDailyStreak();

    const loadDevWidget = async () => {
      let devWidgetEnabled = await storage.get("devWidgetEnabled");
      setShowDevWidget(devWidgetEnabled);
    };

    loadDevWidget();
  }, []);

  return (
    <>
      <IonTabs>
        <IonRouterOutlet ref={outlet}>
          <Route exact path="/courses" component={Courses}></Route>
          <Route exact path="/stats">
            <Stats key="stats" />
          </Route>
          <Route exact path="/loading" component={LoadingPage}></Route>
          <Route path="/settings">
            <Settings setDevWidgetEnabled={setShowDevWidget} />
          </Route>
          <Route path="/lesson/:id">
            <LessonContainer />
          </Route>
          <Route exact path="/editor" component={CodeEditor}></Route>
          <Route path="/course/:id" component={Course}></Route>
          <Route exact path="/">
            <Redirect to="/courses" />
          </Route>
        </IonRouterOutlet>
        <IonTabBar
          slot="bottom"
          style={
            location.pathname.startsWith("/course/") ||
            location.pathname.startsWith("/lesson/")
              ? {
                  display: "none",
                }
              : {}
          }
        >
          <IonTabButton tab="tab1" href="/courses">
            <IonIcon aria-hidden="true" icon={book} />
            <IonLabel>Courses</IonLabel>
          </IonTabButton>
          <IonTabButton tab="tab2" href="/editor">
            <IonIcon aria-hidden="true" icon={hammer} />
            <IonLabel>Sandbox</IonLabel>
          </IonTabButton>
          <IonTabButton tab="tab3" href="/stats">
            <IonIcon aria-hidden="true" icon={list} />
            <IonLabel>Stats</IonLabel>
          </IonTabButton>
          <IonTabButton tab="tab4" href="/settings">
            <IonIcon aria-hidden="true" icon={cog} />
            <IonLabel>Settings</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
      {showDevWidget && <DevWidget />}
    </>
  );
};

const LoginStuff: React.FC = () => {
  let historya = useHistory();
  const [user, loading, error] = useAuthState(auth);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setShowLoginModal(true);
    } else {
      setShowLoginModal(false);
    }
  }, [user, loading]);

  return (
    <>
      <TabRoutes key={user?.uid} />
      <LoginModal
        isOpen={showLoginModal}
        onClosed={() => {
          if (user) {
            historya.push("/courses");
          }
        }}
      />
    </>
  );
};

const AppC: React.FC = () => {
  const [skipToEnd, setSkipToEnd] = useState(() => () => {});
  return (
    <LessonContext.Provider value={{ skipToEnd, setSkipToEnd }}>
      <IonApp>
        <IonReactRouter>
          <LoginStuff />
        </IonReactRouter>
        <Toaster richColors expand />
      </IonApp>
    </LessonContext.Provider>
  );
};

export default AppC;
