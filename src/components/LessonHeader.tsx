import { IonAlert, IonIcon, IonProgressBar } from "@ionic/react";
import "./LessonHeader.css";
import { Lesson } from "../utils/structures";

interface LessonHeaderProps {
  displayState: string;
  currentQuestion: number;
  totalIncorrect: number;
  currentIncorrect: number;
  lesson: Lesson;
}
const LessonHeader: React.FC<LessonHeaderProps> = ({
  displayState,
  currentQuestion,
  lesson,
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
        {inReviewMode ? "Review " : ""} Question {currentQuestionCount}/
        {questionCount}
      </h4>
      <IonProgressBar
        color={inReviewMode ? "warning" : ""}
        value={currentQuestionCount / questionCount}
      />
    </div>
  );
};

export default LessonHeader;
