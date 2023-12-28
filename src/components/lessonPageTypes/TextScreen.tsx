import "./TextScreen.css";
import RichDisplay from "../RichDisplay";
import { Question } from "../../utils/structures";
import SubmitQuestionButton from "../SubmitQuestionButton";

interface TextScreenProps {
  question: Question;
  onCorrect: () => void;
}
const TextScreen: React.FC<TextScreenProps> = ({ question, onCorrect }) => {
  return (
    <>
      <div className="lesson-content-container">
        <RichDisplay
          content={question.question}
          richDisplay={question.rich ?? false}
        />
      </div>
      <SubmitQuestionButton
        text="Continue"
        disabled={false}
        isCorrect={() => {
          return true;
        }}
        getExplanation={() => {
          return "pass";
        }}
        onCorrect={onCorrect}
        onIncorrect={onCorrect}
        onFirstClick={onCorrect}
        isNotQuestion={true}
      />
    </>
  );
};

export default TextScreen;
