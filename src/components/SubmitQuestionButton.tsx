import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
} from "@ionic/react";
import "./SubmitQuestionButton.css";
import { useState } from "react";
interface SubmitQuestionButtonProps {
  isCorrect: () => boolean;
  getExplanation: () => string;
  onCorrect: () => void;
  onIncorrect: () => void;
  onFirstClick: () => void;
}
const SubmitQuestionButton: React.FC<SubmitQuestionButtonProps> = ({
  isCorrect,
  onCorrect,
  onIncorrect,
  onFirstClick,
  getExplanation,
}) => {
  const [showExplanation, setShowExplanation] = useState(false);
  let [text, setText] = useState<string>("Submit");
  let [firstClick, setFirstClick] = useState<boolean>(true);
  let [color, setColor] = useState<string>("primary");
  return (
    <>
      <IonButton
        size="large"
        expand="full"
        color={color}
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
            setText("Next");
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
        {text}
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
    </>
  );
};

export default SubmitQuestionButton;
