import { Redirect, Route } from "react-router-dom";
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  createAnimation,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { book, cog, list } from "ionicons/icons";

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
import Lesson from "./pages/Lesson";
import Course from "./pages/Course";
import LessonContainer from "./pages/LessonContainer";

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet
          animation={(baseEl, opts) => {
            const enteringAnimation = createAnimation()
              .addElement(opts.enteringEl)
              .fromTo("opacity", 0, 1)
              .duration(250);

            const leavingAnimation = createAnimation()
              .addElement(opts.leavingEl)
              .fromTo("opacity", 1, 0)
              .duration(250);

            const animation = createAnimation()
              .addAnimation(enteringAnimation)
              .addAnimation(leavingAnimation);

            return animation;
          }}
        >
          <Route exact path="/courses" component={Courses}></Route>
          <Route exact path="/stats" component={Stats}></Route>
          <Route path="/settings" component={Settings}></Route>
          <Route exact path="/">
            <Redirect to="/courses" />
          </Route>
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
          <IonTabButton tab="tab1" href="/courses">
            <IonIcon aria-hidden="true" icon={book} />
            <IonLabel>Courses</IonLabel>
          </IonTabButton>
          <IonTabButton tab="tab2" href="/stats">
            <IonIcon aria-hidden="true" icon={list} />
            <IonLabel>Stats</IonLabel>
          </IonTabButton>
          <IonTabButton tab="tab3" href="/settings">
            <IonIcon aria-hidden="true" icon={cog} />
            <IonLabel>Settings</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
      <Route path="/lesson/:id">
        <LessonContainer />
      </Route>
      <Route path="/course/:id" component={Course}></Route>
    </IonReactRouter>
  </IonApp>
);

export default App;
