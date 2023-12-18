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
import execute from "../utils/jdoodle";
import "./CodeEditor.css";
import { HighlightedMarkdown } from "../components/HighlightedMarkdown";
const CodeEditor: React.FC = () => {
  const [value, setValue] = useState(
    'public class MyClass {\n    public static void main(String args[]) {\n      int x=10;\n      int y=25;\n      int z=x+y;\n\n      System.out.println("Sum of x+y = " + z);\n    }\n}'
  );
  const onChange = useCallback((val: string) => {
    setValue(val);
  }, []);

  const [lastOutput, setLastOutput] = useState("");
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Sandbox</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="sandbox-container">
          <root.div className="code-editor-root">
            <CodeMirror
              style={{ height: "100%" }}
              height="100%"
              value={value}
              extensions={[java()]}
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
              setLastOutput("Running... (this can take a few seconds)");
              setLastOutput((await execute(value, "java")).output);
            }}
          >
            <IonIcon icon={play} />
            <IonLabel>Run</IonLabel>
          </IonButton>
          <div className="sandbox-output">
            <h3 className="ion-padding sandbox-output-header">Output</h3>
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
