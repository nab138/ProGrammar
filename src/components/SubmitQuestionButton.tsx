import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
} from "@ionic/react";
import "./SubmitQuestionButton.css";
import { useState } from "react";
import useSound from "use-sound";

import correctSfx from "../sfx/correct.mp3";
import wrongSfx from "../sfx/wrong.mp3";

interface SubmitQuestionButtonProps {
  disabled: boolean;
  isCorrect: () => boolean;
  getExplanation: () => string;
  onCorrect: () => void;
  onIncorrect: () => void;
  onFirstClick: () => void;
  text?: string;
  isNotQuestion?: boolean;
}
const SubmitQuestionButton: React.FC<SubmitQuestionButtonProps> = ({
  isCorrect,
  onCorrect,
  onIncorrect,
  onFirstClick,
  getExplanation,
  disabled,
  text,
  isNotQuestion = false,
}) => {
  const [showExplanation, setShowExplanation] = useState(false);
  let [curText, setCurText] = useState<string>(text ?? "Submit");
  let [firstClick, setFirstClick] = useState<boolean>(true);
  let [color, setColor] = useState<string>("primary");

  let [playCorrect] = useSound(correctSfx);
  let [playWrong] = useSound(wrongSfx);
  return (
    <div className="submit-button-container">
      <IonButton
        disabled={disabled}
        size="large"
        color={color}
        expand="block"
        className="submit-button"
        onClick={() => {
          if (firstClick) {
            if (isCorrect()) {
              setColor("success");
              if (!isNotQuestion) playCorrect();
            } else {
              setColor("danger");
              if (!isNotQuestion) playWrong();
            }
            setFirstClick(false);
            onFirstClick();
            if (!isNotQuestion) setCurText("Next");
            if (!isNotQuestion) setShowExplanation(true);
          } else {
            if (isCorrect()) {
              onCorrect();
            } else {
              onIncorrect();
            }
          }
        }}
      >
        {curText}
      </IonButton>
      {showExplanation && (
        <IonCard className="animate-in">
          <IonCardHeader>
            <IonCardTitle>
              {isCorrect() ? "Good Job!" : "So Close!"}
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>{getExplanation()}</IonCardContent>
        </IonCard>
      )}
    </div>
  );
};

export default SubmitQuestionButton;
