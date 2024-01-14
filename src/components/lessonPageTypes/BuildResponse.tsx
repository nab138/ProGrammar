import { BuildQuestion } from "../../utils/structures";
import "./BuildResponse.css";
import SubmitQuestionButton from "../SubmitQuestionButton";
import RichDisplay from "../RichDisplay";
import { IonButton } from "@ionic/react";
import { useEffect, useRef, useState } from "react";
import { HighlightedMarkdown } from "../HighlightedMarkdown";

interface BuildResponseProps {
  question: BuildQuestion;
  onCorrect: () => void;
  onIncorrect: () => void;
  skipToNext: () => void;
  setWaitingToClick: (waiting: boolean) => void;
  isRevisiting: boolean;
}

// The build response question will allow a user to select the blocks in the right order to "build" a line or several lines of code.
// When the user taps on a block, it will be added to the "answer" section. The user can then tap on the blocks in the answer section to remove them.
// The user can also add spaces and newlines to the answer section.
const BuildResponse: React.FC<BuildResponseProps> = ({
  question,
  onCorrect,
  onIncorrect,
  skipToNext,
  setWaitingToClick,
  isRevisiting = false,
}) => {
  let answerButtons = useRef<HTMLDivElement>(null);

  let [answer, setAnswer] = useState<number[]>([]);
  let [disabled, setDisabled] = useState<boolean>(false);
  let answerRef = useRef<number[]>([]);

  useEffect(() => {
    // Using requestAnimationFrame to ensure the scroll operation occurs after the DOM update
    requestAnimationFrame(() => {
      if (answerButtons.current) {
        answerButtons.current.scrollLeft = answerButtons.current.scrollWidth;
      }
    });
    answerRef.current = answer;
  }, [answer]);

  useEffect(() => {
    if (isRevisiting) {
      setAnswer(
        (JSON.parse(sessionStorage.getItem(question.id) ?? "") ??
          []) as number[]
      );
    }
  }, [isRevisiting]);

  const isCorrect = () => {
    let ans = answer
      .map((index) => (index === -1 ? " " : question.choices[index]))
      .join("");
    if (question.answer == ans) {
      return true;
    }
    if (Array.isArray(question.answer)) {
      return question.answer.includes(ans);
    }
    return false;
  }

  return (
    <>
      <div className="lesson-content-container">
        <RichDisplay
          className="build-question-rich-display"
          smallHeader={true}
          content={question.question}
          richDisplay={question.rich ?? false}
        />
        <div className="build-question-test">
          <div className="build-answer">
            <div className="build-answer-buttons" ref={answerButtons}>
              {answer.map((index, i) => {
                let choice = index === -1 ? " " : question.choices[index];
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
            </div>
            <div className="underline" />
            <HighlightedMarkdown className="build-q-code" key={answer.join("")}>
              {"```java\n" +
                answer
                  .map((index) =>
                    index === -1 ? " " : question.choices[index]
                  )
                  .join("") +
                "\n```"}
            </HighlightedMarkdown>
          </div>
          <div className="choices">
            {question.choices.map((choice, i) => {
              return (
                <IonButton
                  disabled={disabled}
                  className={
                    "build-choice" + (answer.includes(i) ? " hidden" : "")
                  }
                  mode="ios"
                  shape="round"
                  fill="outline"
                  key={choice + i}
                  onClick={() => {
                    setAnswer([...answer, i]);
                  }}
                >
                  {choice}
                </IonButton>
              );
            })}
          </div>

          <div className="add-space-container">
            <IonButton
              className="add-space"
              autoCapitalize="off"
              expand="block"
              color="secondary"
              onClick={() => {
                setAnswer([...answer, -1]);
              }}
            >
              Space
            </IonButton>
          </div>
        </div>
      </div>
      <SubmitQuestionButton
        isRevisiting={isRevisiting}
        skipToNext={skipToNext}
        disabled={answer.length == 0}
        isCorrect={isCorrect}
        getExplanation={() => {
          return isCorrect() ? "Correct!" : question.answer;
        }}
        onCorrect={onCorrect}
        onIncorrect={onIncorrect}
        onFirstClick={() => {
          if (!isRevisiting) {
            sessionStorage.setItem(
              question.id,
              JSON.stringify(answerRef.current)
            );
            setWaitingToClick(true);
          }

          setDisabled(true);
        }}
      />
    </>
  );
};

export default BuildResponse;
