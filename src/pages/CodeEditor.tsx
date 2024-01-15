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
import { useParams } from "react-router";
import { toast } from "sonner";

// Object of key sting, value CodeMirror LanguageSupport
const langToHighlight: { [key: string]: any } = {
  java: java,
};
const CodeEditor: React.FC = () => {
  const { lang, filename } = useParams<{ lang: string; filename: string }>();
  const [value, setValue] = useState(
    `public class MyClass {
  public static void main(String args[]) {
    System.out.println("Hello World!");
  }
}`
  );
  const onChange = useCallback((val: string) => {
    setValue(val);
  }, []);

  useEffect(() => {
    if (langToHighlight[lang] === undefined) {
      toast.error("Invalid language", {
        duration: 5000,
      });
    }
  }, [lang]);
  const [lastOutput, setLastOutput] = useState("");
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
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
          <IonButton
            onClick={async () => {
              setLastOutput("Running...");
              let output = await execute(
                [
                  {
                    name: filename,
                    content: value,
                  },
                ],
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
              Output <span className="powered-by">- Powered by Piston API</span>
            </h3>
            <HighlightedMarkdown className="ion-padding sandbox-output-content">
              {"```\n" + lastOutput + "\n```"}
            </HighlightedMarkdown>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CodeEditor;
