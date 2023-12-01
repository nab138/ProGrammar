import { BuildQuestion } from "../../utils/structures";
import "./BuildResponse.css";
import SubmitQuestionButton from "../SubmitQuestionButton";
import RichDisplay from "../RichDisplay";
import { IonButton } from "@ionic/react";
import { useState } from "react";
import { HighlightedMarkdown } from "../HighlightedMarkdown";

interface BuildResponseProps {
  question: BuildQuestion;
  onCorrect: () => void;
  onIncorrect: () => void;
}

// The build response question will allow a user to select the blocks in the right order to "build" a line or several lines of code.
// When the user taps on a block, it will be added to the "answer" section. The user can then tap on the blocks in the answer section to remove them.
// The user can also add spaces and newlines to the answer section.
const BuildResponse: React.FC<BuildResponseProps> = ({
  question,
  onCorrect,
  onIncorrect,
}) => {
  let [answer, setAnswer] = useState<string[]>([]);
  let [disabled, setDisabled] = useState<boolean>(false);
  return (
    <>
      <div className="lesson-content-container">
        <RichDisplay content={question.question} richDisplay={false} />
        <div className="build-answer">
          {answer.map((choice, i) => {
            return (
              <IonButton
                disabled={disabled}
                className="build-choice"
                fill="outline"
                key={choice + i}
                mode="ios"
                onClick={() => {
                  setAnswer(answer.filter((_, j) => i !== j));
                }}
              >
                {choice}
              </IonButton>
            );
          })}
          <div className="underline" />
          <HighlightedMarkdown>
            {"```java\n" + answer.join("") + "\n```"}
          </HighlightedMarkdown>
        </div>
        <div className="choices">
          {question.choices.map((choice, i) => {
            return (
              <IonButton
                disabled={disabled}
                className={
                  "build-choice" + (answer.includes(choice) ? " hidden" : "")
                }
                mode="ios"
                shape="round"
                fill="outline"
                key={choice + i}
                onClick={() => {
                  setAnswer([...answer, choice]);
                }}
              >
                {choice}
              </IonButton>
            );
          })}
        </div>

        <IonButton
          className="add-space"
          autoCapitalize="off"
          expand="block"
          onClick={() => {
            setAnswer([...answer, " "]);
          }}
        >
          Space
        </IonButton>
      </div>
      <SubmitQuestionButton
        disabled={false}
        isCorrect={() => {
          return answer.join("") == question.answer;
        }}
        getExplanation={() => {
          let isCorrect = answer.join("") == question.answer;
          return isCorrect ? "Correct!" : question.answer;
        }}
        onCorrect={onCorrect}
        onIncorrect={onIncorrect}
        onFirstClick={() => {
          setDisabled(true);
        }}
      />
    </>
  );
};

export default BuildResponse;
