import { IonButton, IonRadio, IonRadioGroup, IonTitle } from "@ionic/react";
import { MultipleChoiceQuestion } from "../pages/Courses";
import "./MultipleChoice.css";
import { useRef, useState } from "react";
import SubmitQuestionButton from "./SubmitQuestionButton";

interface MultipleChoiceProps {
  question: MultipleChoiceQuestion;
  onCorrect: () => void;
  onIncorrect: () => void;
}
const MultipleChoice: React.FC<MultipleChoiceProps> = ({
  question,
  onCorrect,
  onIncorrect,
}) => {
  let [selected, setSelected] = useState<string>("");
  let [disabled, setDisabled] = useState<boolean>(false);
  let correctAnswer = useRef<HTMLIonRadioElement>(null);
  return (
    <>
      <h3 className="ion-padding">{question.question}</h3>
      <IonRadioGroup
        className="choices"
        onIonChange={(event) => {
          setSelected(event.detail.value);
        }}
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
                {choice}
              </IonRadio>
              <br />
            </div>
          );
        })}
      </IonRadioGroup>
      <SubmitQuestionButton
        disabled={selected == ""}
        isCorrect={() => {
          return selected === question.answer;
        }}
        getExplanation={() => {
          return question.explanations[question.choices.indexOf(selected)];
        }}
        onCorrect={onCorrect}
        onIncorrect={onIncorrect}
        onFirstClick={() => {
          setDisabled(true);
          correctAnswer.current?.classList.add("correct-answer");
        }}
      />
    </>
  );
};

export default MultipleChoice;
