import { IonAlert, IonIcon, IonProgressBar } from "@ionic/react";
import "./LessonHeader.css";
import { Lesson, LessonInfo } from "../utils/structures";
import { alertCircle } from "ionicons/icons";

interface LessonHeaderProps {
  displayState: string;
  currentQuestion: number;
  totalIncorrect: number;
  currentIncorrect: number;
  lesson: Lesson;
  lessonInfo: LessonInfo;
  hard: boolean;
}
const LessonHeader: React.FC<LessonHeaderProps> = ({
  displayState,
  currentQuestion,
  lesson,
  lessonInfo,
  totalIncorrect,
  currentIncorrect,
  hard,
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
            {lessonInfo.type == "learn" ? "Part" : "Question"}{" "}
            {currentQuestionCount + 1}/{questionCount}
          </h4>
        </div>
        {hard && <h4 className="hard-text">Hard Question!</h4>}
      </div>
      <IonProgressBar
        color={inReviewMode ? "warning" : ""}
        value={currentQuestionCount / questionCount}
      />
    </div>
  );
};

export default LessonHeader;
