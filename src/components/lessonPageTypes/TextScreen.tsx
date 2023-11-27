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
      <RichDisplay
        content={question.rich ? question.content ?? "" : question.question}
        richDisplay={question.rich ?? false}
      />
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
      />
    </>
  );
};

export default TextScreen;
