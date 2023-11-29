import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonFab,
  IonFooter,
} from "@ionic/react";
import "./SubmitQuestionButton.css";
import { useState } from "react";
interface SubmitQuestionButtonProps {
  disabled: boolean;
  isCorrect: () => boolean;
  getExplanation: () => string;
  onCorrect: () => void;
  onIncorrect: () => void;
  onFirstClick: () => void;
  text?: string;
}
const SubmitQuestionButton: React.FC<SubmitQuestionButtonProps> = ({
  isCorrect,
  onCorrect,
  onIncorrect,
  onFirstClick,
  getExplanation,
  disabled,
  text,
}) => {
  const [showExplanation, setShowExplanation] = useState(false);
  let [curText, setCurText] = useState<string>(text ?? "Submit");
  let [firstClick, setFirstClick] = useState<boolean>(true);
  let [color, setColor] = useState<string>("primary");
  return (
    <div
      className="submit-button-container"
    >
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
            } else {
              setColor("danger");
            }
            setFirstClick(false);
            onFirstClick();
            setCurText("Next");
            setShowExplanation(true);
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
