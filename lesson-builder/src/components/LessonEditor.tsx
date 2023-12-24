import { useState } from "react";
import { Lesson, MultipleChoiceQuestion, Question } from "../structures";
import "./LessonEditor.css";

interface LessonEditorProps {
  lesson: Lesson;
}
const LessonEditor: React.FC<LessonEditorProps> = ({ lesson }) => {
  const [selectedQuestion, setSelectedQuestion] = useState<Question>();
  return (
    <div className="lesson-editor">
      <div className="lesson-editor-sidebar">
        <h1>Lesson: {lesson.name}</h1>
        <h3>Parts</h3>
        <div className="questions">
          {lesson.questions.map((question, index) => (
            <div
              className="question"
              key={index}
              onClick={() => {
                setSelectedQuestion(question);
                console.log(question);
              }}
            >
              <h4>{question.question}</h4>
              <p>{question.answer}</p>
            </div>
          ))}
        </div>
      </div>
      {selectedQuestion !== undefined && (
        <div className="question-editor">
          <h1>Question: {selectedQuestion.question}</h1>
          {selectedQuestion.type === "mc" &&
            selectedQuestion.choices.map((choice, index) => (
              <div
                className={
                  "choice" +
                  (choice === selectedQuestion.answer ? " correct" : "")
                }
                key={index}
              >
                <p>{choice}</p>
                <p>
                  {
                    (selectedQuestion as MultipleChoiceQuestion).explanations[
                      index
                    ]
                  }
                </p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default LessonEditor;
