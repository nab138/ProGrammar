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
}
const BackButton: React.FC<BackButtonProps> = ({
  lesson,
  setCurrentQuestion,
  currentQuestion,
  actualProgress,
}) => {
  return (
    <div>
      <IonIcon
        icon={chevronBack}
        slot="start"
        className={
          lesson.type !== "learn" || currentQuestion === 0
            ? "hidden"
            : "back-button"
        }
        onClick={() => {
          if (lesson.type === "learn") {
            setCurrentQuestion(currentQuestion - 1);
          }
        }}
      />
      <IonIcon
        icon={chevronForward}
        slot="start"
        className={
          lesson.type !== "learn" || currentQuestion >= actualProgress
            ? "hidden"
            : "back-button"
        }
        onClick={() => {
          if (
            lesson.type === "learn" &&
            actualProgress >= currentQuestion + 1
          ) {
            setCurrentQuestion(currentQuestion + 1);
          }
        }}
      />
    </div>
  );
};

export default BackButton;
