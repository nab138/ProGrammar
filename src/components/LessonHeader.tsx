import { IonAlert, IonIcon, IonProgressBar } from "@ionic/react";
import "./LessonHeader.css";
import { Lesson, LessonInfo } from "../utils/structures";

interface LessonHeaderProps {
  displayState: string;
  currentQuestion: number;
  totalIncorrect: number;
  currentIncorrect: number;
  lesson: Lesson;
  lessonInfo: LessonInfo;
}
const LessonHeader: React.FC<LessonHeaderProps> = ({
  displayState,
  currentQuestion,
  lesson,
  lessonInfo,
  totalIncorrect,
  currentIncorrect,
}) => {
  let inReviewMode = displayState == "review";
  let questionCount = inReviewMode
    ? totalIncorrect
    : lesson?.questions.length ?? 1;
  let currentQuestionCount = inReviewMode ? currentIncorrect : currentQuestion;

  if (displayState == "complete") return null;
  return (
    <div className="ion-padding lesson-header">
      <h4>
        {inReviewMode ? "Review " : ""}{" "}
        {lessonInfo.type == "learn" ? "Part" : "Question"}{" "}
        {currentQuestionCount + 1}/{questionCount}
      </h4>
      <IonProgressBar
        color={inReviewMode ? "warning" : ""}
        value={currentQuestionCount / questionCount}
      />
    </div>
  );
};

export default LessonHeader;
