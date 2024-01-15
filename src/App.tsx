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
import { book, cog, folder, people } from "ionicons/icons";

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
import Social from "./pages/Social";
import Settings from "./pages/Settings";
import Course from "./pages/Course";
import LessonContainer from "./pages/LessonContainer";
import { useEffect, useRef } from "react";
import { Toaster, toast } from "sonner";
import { triggerDailyStreak } from "./utils/achievements";
import CodeEditor from "./pages/CodeEditor";
import LoginModal from "./components/LoginModal";
import { useState } from "react";
import { useHistory } from "react-router";
import LoadingPage from "./pages/LoadingPage";
import DevWidget from "./components/DevWidget";
import storage from "./utils/storage";
import { LessonContext } from "./LessonContext";
import Projects from "./pages/Projects";
import { useSupabaseAuth } from "./utils/supabaseClient";
import { applySavedTheme, applyTheme, getCurrentTheme } from "./utils/themes";
import CodeEditorContainer from "./pages/CodeEditorContainer";
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
      let devWidgetEnabled = await storage.getLocal("devWidgetEnabled");
      setShowDevWidget(devWidgetEnabled);
    };

    loadDevWidget();
  }, []);

  return (
    <>
      <IonTabs>
        <IonRouterOutlet ref={outlet}>
          <Route exact path="/courses" component={Courses} />
          <Route exact path="/social" component={Social} />
          <Route exact path="/loading" component={LoadingPage} />
          <Route path="/settings">
            <Settings setDevWidgetEnabled={setShowDevWidget} />
          </Route>
          <Route path="/lesson/:id">
            <LessonContainer />
          </Route>
          <Route exact path="/projects" component={Projects} />
          <Route exact path="/projects/:lang/:id" component={Projects} />
          <Route
            exact
            path="/projects/:lang/:id/:filename"
            component={CodeEditorContainer}
          />
          <Route path="/course/:id" component={Course} />
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
          <IonTabButton tab="tab2" href="/projects">
            <IonIcon aria-hidden="true" icon={folder} />
            <IonLabel>Projects</IonLabel>
          </IonTabButton>
          <IonTabButton tab="tab3" href="/social">
            <IonIcon aria-hidden="true" icon={people} />
            <IonLabel>Social</IonLabel>
          </IonTabButton>
          <IonTabButton tab="tab4" href="/settings">
            <IonIcon aria-hidden="true" icon={cog} />
            <IonLabel>Settings</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
      {showDevWidget && (
        <DevWidget
          hideDevWidget={() => {
            setShowDevWidget(false);
            storage.setLocal("devWidgetEnabled", false);
          }}
        />
      )}
    </>
  );
};

const LoginStuff: React.FC = () => {
  let history = useHistory();
  const [session, loading, error] = useSupabaseAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (session !== null) {
      setShowLoginModal(false);
    } else {
      setShowLoginModal(true);
    }
  }, [session, loading, error]);

  return (
    <>
      <TabRoutes key={session?.user.id} />
      <LoginModal
        isOpen={showLoginModal}
        onClosed={() => {
          if (session) {
            history.push("/courses");
          }
        }}
      />
    </>
  );
};

const AppC: React.FC = () => {
  const [skipToEnd, setSkipToEnd] = useState(() => () => {});

  useEffect(() => {
    applySavedTheme();
  }, []);
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
