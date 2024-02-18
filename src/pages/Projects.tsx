import {
  IonAccordion,
  IonAccordionGroup,
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import "./Projects.css";
import { OfflineWarning } from "../components/OfflineWarning";
import { hammer, play, playCircle } from "ionicons/icons";
import { useHistory, useParams } from "react-router";
import { useEffect, useState } from "react";
import { PistonResponse, ProjectLanguage, Script } from "../utils/structures";
import storage from "../utils/storage";
import { HighlightedMarkdown } from "../components/HighlightedMarkdown";
import execute from "../utils/piston";
import ProjectsBackButton from "../components/ProjectsBackButton";
import triggerAchievement from "../utils/achievements";
import PremiumBarrier from "../components/PremiumBarrier";
import Terminal from "../components/Terminal";
import jdoodleExecute, {
  jdoodleLanguageVersions,
  submitInput,
} from "../utils/jdoodle";

const Projects: React.FC = () => {
  const { lang, id } = useParams<{ lang: string; id: string }>();
  let history = useHistory();
  let [languages, setLanguages] = useState<ProjectLanguage[]>([]);
  let [isPremium, setIsPremium] = useState(false);
  let [lastOutput, setLastOutput] = useState("");
  let [displayState, setDisplayState] = useState("");
  let [loading, setLoading] = useState(true);
  let [interactive, setInteractive] = useState(false);
  useEffect(() => {
    const fetchLanguages = async () => {
      let languages = (await import("../projects/languages.json")).default;
      let projectLanguages = [];
      for (let language of languages) {
        let infoModule = await import(`../projects/${language}.json`);
        let info: ProjectLanguage = infoModule.default;
        projectLanguages.push(info);
      }
      setLanguages(projectLanguages);
    };
    const fetchPremium = async () => {
      let isPremium = await storage.get("is_premium");
      setIsPremium(isPremium);
    };
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchPremium(), fetchLanguages()]);
      setLoading(false);
    };
    load();
  }, []);

  const project = languages
    .find((l) => l.id === lang)
    ?.projects.find((project) => project.id === id);

  const runProject = async (interactive: boolean) => {
    if (project === undefined) {
      return;
    }
    setInteractive(interactive);
    setLastOutput("Running...");

    let files = await Promise.all(
      project.files.map(async (file) => {
        return {
          name: file.name,
          content: await storage.getLocalWithDefault(
            `${lang}-${id}-${file.name}`,
            file.template
          ),
        } as Script;
      })
    );

    let output: PistonResponse;
    if (interactive) {
      let jdoodleOutput = await jdoodleExecute(
        project.interactive,
        files,
        lang
      );
      output = {
        language: lang,
        version: jdoodleLanguageVersions[lang] ?? 0,
        run: {
          output: jdoodleOutput.output,
          stderr: "",
          stdout: jdoodleOutput.output,
          code: jdoodleOutput.statusCode,
          signal: null,
        },
      };
    } else {
      output = await execute(project.autograder, files, lang);
    }
    setLastOutput(output.run.output);
    let lines = output.run.output.trim().split("\n");
    if (lines[lines.length - 1] === "Project Test Successful!") {
      await triggerAchievement("project-success", project.id);
      setDisplayState("success");
    } else {
      setDisplayState("failure");
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Projects</IonTitle>
            <OfflineWarning />
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonAccordionGroup multiple disabled>
            {[0, 1, 2, 3].map((i) => {
              return (
                <IonAccordion key={`loading-lang-${i}`}>
                  <IonItem slot="header" color="light">
                    <IonLabel>
                      <IonSkeletonText
                        animated
                        style={{ width: "100px" }}
                      ></IonSkeletonText>
                    </IonLabel>
                  </IonItem>
                </IonAccordion>
              );
            })}
          </IonAccordionGroup>
        </IonContent>
      </IonPage>
    );
  }
  if (!isPremium) {
    return <PremiumBarrier />;
  } else if (
    id === null ||
    id === undefined ||
    lang === null ||
    lang === undefined ||
    project === null ||
    project === undefined
  ) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Projects</IonTitle>
            <OfflineWarning />
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonAccordionGroup multiple>
            {languages.map((lang) => {
              return (
                <IonAccordion key={lang.id}>
                  <IonItem slot="header" color="light">
                    <IonLabel>{lang.name}</IonLabel>
                  </IonItem>
                  <IonList className="ion-no-padding" slot="content">
                    <IonItem
                      key={"sandbox-" + lang.id}
                      button
                      onClick={() => {
                        history.push(
                          "/projects/sandbox/" + lang.id + "/Sandbox"
                        );
                      }}
                    >
                      <IonLabel>
                        {" "}
                        <IonIcon icon={hammer} /> Sandbox
                      </IonLabel>
                    </IonItem>
                    {lang.projects.map((project) => {
                      return (
                        <IonItem
                          key={project.name}
                          button
                          onClick={() => {
                            history.push(
                              "/projects/" + lang.id + "/" + project.id + "/"
                            );
                          }}
                        >
                          <IonLabel>{project.name}</IonLabel>
                        </IonItem>
                      );
                    })}
                  </IonList>
                </IonAccordion>
              );
            })}
          </IonAccordionGroup>
        </IonContent>
      </IonPage>
    );
  } else {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <ProjectsBackButton />
            <IonTitle>{project.name}</IonTitle>
            <OfflineWarning />
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className="projects-tab">
            <div className="project-files-header">
              <h1 className="">Files</h1>
              <p>
                These are all the files contained in this project. Click on one
                to see what to do in it!{" "}
                <span className="stored-locally">
                  Projects are stored locally, not synced to the cloud.
                </span>
              </p>
            </div>
            <IonList className="ion-no-padding">
              {project.files.map((file) => (
                <IonItem
                  key={file.id}
                  button
                  onClick={() => {
                    history.push(
                      "/projects/" +
                        lang +
                        "/" +
                        project.id +
                        "/" +
                        file.name +
                        "/"
                    );
                  }}
                >
                  <IonLabel>{file.name}</IonLabel>
                </IonItem>
              ))}
            </IonList>
            <div className="project-files-header">
              <h1 className="">Run</h1>
              <p>
                Ready to run your project? Click the run button to try it, and
                when you're happy, click test to see if you've completed the
                project!
              </p>
            </div>
            <div className="run-buttons">
              <IonButton
                className="runBtn"
                color={"primary"}
                onClick={() => runProject(true)}
                expand="block"
              >
                <IonIcon icon={play} />
                <IonLabel>Run{displayState != "" ? " Again" : ""}</IonLabel>
              </IonButton>
              <IonButton
                className="runBtn"
                color={
                  displayState === ""
                    ? "primary"
                    : displayState === "success"
                    ? "success"
                    : "danger"
                }
                onClick={() => runProject(false)}
                expand="block"
              >
                <IonIcon icon={playCircle} />
                <IonLabel>Test</IonLabel>
              </IonButton>
            </div>
            <div className="project-output">
              <h3 className="ion-padding project-output-header">
                Output{" "}
                {!interactive && (
                  <span className="powered-by">- Powered by Piston API</span>
                )}
              </h3>
              {interactive ? (
                <Terminal
                  lastOutput={lastOutput}
                  className="ion-padding project-output-content"
                  onEnter={async (input) => {
                    return (await submitInput(input)).output;
                  }}
                />
              ) : (
                <HighlightedMarkdown className="ion-padding project-output-content">
                  {"```\n" + lastOutput + "\n```"}
                </HighlightedMarkdown>
              )}
            </div>
          </div>
        </IonContent>
      </IonPage>
    );
  }
};

export default Projects;
