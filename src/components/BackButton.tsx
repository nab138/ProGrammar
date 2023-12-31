import { IonAlert, IonIcon } from "@ionic/react";
import "./BackButton.css";
import { chevronBack, chevronForward } from "ionicons/icons";
import { useHistory } from "react-router";
import { Lesson } from "../utils/structures";

interface BackButtonProps {
  lesson: Lesson;
  setCurrentQuestion: React.Dispatch<React.SetStateAction<number>>;
  currentQuestion: number;
  actualProgress: number;
  waitingToClick: boolean;
}
const BackButton: React.FC<BackButtonProps> = ({
  lesson,
  setCurrentQuestion,
  currentQuestion,
  actualProgress,
  waitingToClick,
}) => {
  let backDisabled = lesson.type !== "learn" || currentQuestion === 0;
  let forwardDisabled =
    lesson.type !== "learn" || currentQuestion >= actualProgress;
  return (
    <div>
      <IonIcon
        icon={chevronBack}
        slot="start"
        className={backDisabled ? "back-button disabled-btn" : "back-button"}
        onClick={() => {
          if (backDisabled || waitingToClick) return;
          if (lesson.type === "learn") {
            setCurrentQuestion(currentQuestion - 1);
          }
        }}
      />
      <IonIcon
        icon={chevronForward}
        slot="start"
        className={
          forwardDisabled ? "forward-button disabled-btn" : "forward-button"
        }
        onClick={() => {
          if (
            lesson.type === "learn" &&
            actualProgress >= currentQuestion + 1
          ) {
            if (forwardDisabled || waitingToClick) return;
            setCurrentQuestion(currentQuestion + 1);
          }
        }}
      />
    </div>
  );
};

export default BackButton;
