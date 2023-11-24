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
}
const SubmitQuestionButton: React.FC<SubmitQuestionButtonProps> = ({
  isCorrect,
  onCorrect,
  onIncorrect,
  onFirstClick,
  getExplanation,
  disabled,
}) => {
  const [showExplanation, setShowExplanation] = useState(false);
  let [text, setText] = useState<string>("Submit");
  let [firstClick, setFirstClick] = useState<boolean>(true);
  let [color, setColor] = useState<string>("primary");
  return (
    <IonFab
      vertical="bottom"
      horizontal="center"
      slot="fixed"
      className="submit-button-container"
    >
      <IonButton
        disabled={disabled}
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
    </IonFab>
  );
};

export default SubmitQuestionButton;
