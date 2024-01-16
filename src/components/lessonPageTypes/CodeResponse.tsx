import { CodeQuestion, langToHighlight } from "../../utils/structures";
import "./CodeResponse.css";
import RichDisplay from "../RichDisplay";
import CodeMirror from "@uiw/react-codemirror";
import root from "react-shadow";
import { useCallback, useEffect, useState } from "react";
import CodeResponseSubmitButton from "../CodeResponseSubmitButton";
import { HighlightedMarkdown } from "../HighlightedMarkdown";

interface CodeResponseProps {
  question: CodeQuestion;
  onCorrect: () => void;
  onIncorrect: () => void;
  skipToNext: () => void;
  setWaitingToClick: (waiting: boolean) => void;
  isRevisiting: boolean;
}

// The build response question will allow a user to select the blocks in the right order to "build" a line or several lines of code.
// When the user taps on a block, it will be added to the "answer" section. The user can then tap on the blocks in the answer section to remove them.
// The user can also add spaces and newlines to the answer section.
const CodeResponse: React.FC<CodeResponseProps> = ({
  question,
  onCorrect,
  onIncorrect,
  skipToNext,
  setWaitingToClick,
  isRevisiting = false,
}) => {
  let [lastOutput, setLastOutput] = useState("");
  let [value, setValue] = useState("");
  let [isDisabled, setIsDisabled] = useState(false);

  const onChange = useCallback((val: string) => {
    setValue(val);
    sessionStorage.setItem(question.id + "c", val);
  }, []);

  useEffect(() => {
    if (isRevisiting) {
      setValue(sessionStorage.getItem(question.id + "c") ?? "");
    }
  }, [isRevisiting]);

  return (
    <>
      <div className="lesson-content-container">
        <RichDisplay
          className="code-question-rich-display"
          smallHeader={true}
          content={question.question}
          richDisplay={question.rich ?? false}
        />
        <root.div className="code-editor-root">
          <CodeMirror
            editable={!isDisabled}
            style={{ height: "100%" }}
            height="100%"
            value={value}
            extensions={
              langToHighlight[question.language]
                ? [langToHighlight[question.language]()]
                : []
            }
            onChange={onChange}
            theme={
              window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light"
            }
          />
        </root.div>
        <div className="sandbox-output">
          <h3 className="ion-padding sandbox-output-header">
            Output <span className="powered-by">- Powered by Piston API</span>
          </h3>
          <HighlightedMarkdown className="ion-padding sandbox-output-content">
            {"```\n" + lastOutput + "\n```"}
          </HighlightedMarkdown>
        </div>
      </div>

      <CodeResponseSubmitButton
        code={value}
        question={question}
        setLastOutput={setLastOutput}
        isRevisiting={isRevisiting}
        skipToNext={skipToNext}
        onCorrect={onCorrect}
        onIncorrect={onIncorrect}
        setIsDisabled={setIsDisabled}
      />
    </>
  );
};

export default CodeResponse;
