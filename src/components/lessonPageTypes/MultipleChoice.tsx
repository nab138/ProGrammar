import { IonButton, IonRadio, IonRadioGroup, IonTitle } from "@ionic/react";
import { MultipleChoiceQuestion } from "../../utils/structures";
import "./MultipleChoice.css";
import { useEffect, useRef, useState } from "react";
import SubmitQuestionButton from "../SubmitQuestionButton";
import RichDisplay from "../RichDisplay";

interface MultipleChoiceProps {
  question: MultipleChoiceQuestion;
  onCorrect: () => void;
  onIncorrect: () => void;
  skipToNext: () => void;
  setWaitingToClick: (waiting: boolean) => void;
  isRevisiting: boolean;
}
const MultipleChoice: React.FC<MultipleChoiceProps> = ({
  question,
  onCorrect,
  onIncorrect,
  skipToNext,
  setWaitingToClick,
  isRevisiting = false,
}) => {
  let [selected, setSelected] = useState<string>("");
  let [disabled, setDisabled] = useState<boolean>(false);
  let correctAnswer = useRef<HTMLIonRadioElement>(null);
  const selectedRef = useRef(selected);

  useEffect(() => {
    if (isRevisiting) {
      setSelected(sessionStorage.getItem(question.id) ?? "");
    }
  }, [isRevisiting]);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);
  return (
    <>
      <div className="lesson-content-container">
        <RichDisplay
          content={question.question}
          richDisplay={question.rich ?? false}
        />
        <IonRadioGroup
          className="choices"
          onIonChange={(event) => {
            setSelected(event.detail.value);
          }}
          value={selected}
        >
          {question.choices.map((choice, i) => {
            return (
              <div key={i}>
                <IonRadio
                  className={
                    "choice ion-padding " +
                    (disabled && selected == choice && choice != question.answer
                      ? "incorrect-answer"
                      : "")
                  }
                  value={choice}
                  key={i}
                  labelPlacement="end"
                  justify="start"
                  disabled={disabled}
                  ref={
                    i === question.choices.indexOf(question.answer)
                      ? correctAnswer
                      : null
                  }
                >
                  <span className="ion-text-wrap">{choice}</span>
                </IonRadio>
                <br />
              </div>
            );
          })}
        </IonRadioGroup>
      </div>
      <SubmitQuestionButton
        disabled={selected == "" && !isRevisiting}
        isCorrect={() => {
          return selected === question.answer;
        }}
        getExplanation={() => {
          return question.explanations[question.choices.indexOf(selected)];
        }}
        onCorrect={onCorrect}
        onIncorrect={onIncorrect}
        onFirstClick={() => {
          if (!isRevisiting) {
            setWaitingToClick(true);
            sessionStorage.setItem(question.id, selectedRef.current);
          }
          setDisabled(true);
          correctAnswer.current?.classList.add("correct-answer");
        }}
        isRevisiting={isRevisiting}
        skipToNext={skipToNext}
      />
    </>
  );
};

export default MultipleChoice;
