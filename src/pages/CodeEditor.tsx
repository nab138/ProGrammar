import { useCallback, useEffect, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { java } from "@codemirror/lang-java";
import root from "react-shadow";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { play } from "ionicons/icons";
import execute from "../utils/piston";
import "./CodeEditor.css";
import { HighlightedMarkdown } from "../components/HighlightedMarkdown";
import { OfflineWarning } from "../components/OfflineWarning";
import { toast } from "sonner";
import ProjectsBackButton from "../components/ProjectsBackButton";
import { ProjectLanguage, langToHighlight } from "../utils/structures";
import storage from "../utils/storage";

const defaultCode: { [key: string]: string } = {
  java: `public class MyClass {
  public static void main(String args[]) {
    System.out.println("Hello World!");
  }
}`,
  rust: `fn main() {
  println!("Hello World!");
}`
};

export interface CodeEditorProps {
  lang: string;
  filename: string;
  id: string;
}
const CodeEditor: React.FC<CodeEditorProps> = ({ lang, filename, id }) => {
  let isSandbox = filename === "Sandbox";
  if (isSandbox) lang = id;
  const [value, setValue] = useState(isSandbox ? defaultCode[lang] ?? "" : "");

  const onChange = useCallback((val: string) => {
    setValue(val);
    if (isSandbox) storage.setLocal("sandbox", val);
    else storage.setLocal(`${lang}-${id}-${filename}`, val);
  }, []);

  useEffect(() => {
    if (langToHighlight[lang] === undefined) {
      toast.error("Invalid language", {
        duration: 5000,
      });
    }
  }, [lang]);

  const [lastOutput, setLastOutput] = useState("");

  const [task, setTask] = useState("");

  useEffect(() => {
    const fetchTask = async () => {
      if (isSandbox) {
        setValue(
          await storage.getLocalWithDefault("sandbox", defaultCode[lang] ?? "")
        );
        return;
      }
      let languages = (await import("../projects/languages.json")).default;
      let projectLanguages = [];
      for (let language of languages) {
        let infoModule = await import(`../projects/${language}.json`);
        let info: ProjectLanguage = infoModule.default;
        projectLanguages.push(info);
      }
      const project = projectLanguages
        .find((l) => l.id === lang)
        ?.projects.find((project) => project.id === id);
      let file = project?.files.find((file) => file.name === filename);
      setTask(file?.task ?? "");
      setValue(
        await storage.getLocalWithDefault(
          `${lang}-${id}-${filename}`,
          file?.template ?? ""
        )
      );
    };
    fetchTask();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <ProjectsBackButton
            backTo={isSandbox ? "/projects" : `/projects/${lang}/${id}/`}
          />
          <IonTitle>{filename}</IonTitle>
          <OfflineWarning />
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="sandbox-container">
          <root.div className="code-editor-root">
            <CodeMirror
              style={{ height: "100%" }}
              height="100%"
              value={value}
              extensions={
                langToHighlight[lang] ? [langToHighlight[lang]()] : []
              }
              onChange={onChange}
              theme={
                window.matchMedia("(prefers-color-scheme: dark)").matches
                  ? "dark"
                  : "light"
              }
            />
          </root.div>
          {isSandbox && (
            <>
              <IonButton
                onClick={async () => {
                  setLastOutput("Running...");
                  let output = await execute(
                    {
                      name: filename,
                      content: value,
                    },
                    [],
                    lang
                  );
                  setLastOutput(output.run.output);
                }}
              >
                <IonIcon icon={play} />
                <IonLabel>Run</IonLabel>
              </IonButton>
              <div className="sandbox-output">
                <h3 className="ion-padding sandbox-output-header">
                  Output{" "}
                  <span className="powered-by">- Powered by Piston API</span>
                </h3>
                <HighlightedMarkdown className="ion-padding sandbox-output-content">
                  {"```\n" + lastOutput + "\n```"}
                </HighlightedMarkdown>
              </div>
            </>
          )}
          {!isSandbox && (
            <div className="task ion-padding">
              <h3>Your task:</h3>
              <p>{task}</p>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CodeEditor;
