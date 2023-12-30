import { IonIcon, IonProgressBar } from "@ionic/react";
import "./LessonHeader.css";
import { Lesson } from "../utils/structures";
import { alertCircle } from "ionicons/icons";
import BackButton from "./BackButton";

interface LessonHeaderProps {
  displayState: string;
  currentQuestion: number;
  totalIncorrect: number;
  currentIncorrect: number;
  lesson: Lesson;
  hard: boolean;
  setCurrentQuestion: React.Dispatch<React.SetStateAction<number>>;
  actualProgress: number;
  waitingToClick: boolean;
}
const LessonHeader: React.FC<LessonHeaderProps> = ({
  displayState,
  currentQuestion,
  lesson,
  totalIncorrect,
  currentIncorrect,
  hard,
  setCurrentQuestion,
  actualProgress,
  waitingToClick,
}) => {
  let inReviewMode = displayState == "review";
  let questionCount = inReviewMode
    ? totalIncorrect
    : lesson?.questions.length ?? 1;
  let currentQuestionCount = inReviewMode ? currentIncorrect : currentQuestion;

  if (displayState == "complete") return null;
  return (
    <div className={"ion-padding lesson-header" + (hard ? " hard" : " easy")}>
      <div className="header-text">
        <div className="hard-q-text">
          {hard && (
            <IonIcon
              className="hard-icon"
              icon={alertCircle}
              color="danger"
              size="large"
            />
          )}
          <h4>
            {inReviewMode ? "Review " : ""}{" "}
            {lesson.type == "learn" ? "Part" : "Question"}{" "}
            {currentQuestionCount + 1}/{questionCount}
          </h4>
        </div>
        <div className="hardAndBack">
          {hard && <h4 className="hard-text">Hard Question!</h4>}
          {!inReviewMode && lesson.type == "learn" && (
            <BackButton
              lesson={lesson}
              waitingToClick={waitingToClick}
              currentQuestion={currentQuestion}
              setCurrentQuestion={setCurrentQuestion}
              actualProgress={actualProgress}
            />
          )}
        </div>
      </div>
      <IonProgressBar
        color={inReviewMode ? "warning" : ""}
        value={currentQuestionCount / questionCount}
      />
    </div>
  );
};

export default LessonHeader;
