import { useState } from "react";
import { Lesson, MultipleChoiceQuestion, Question } from "../structures";
import MDEditor from "@uiw/react-md-editor";
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
              <div style={{ display: "flex", gap: "15px" }}>
                <h3>{question.type}</h3>
                <h4>{question.question}</h4>
              </div>
              <p>{question.answer}</p>
            </div>
          ))}
        </div>
      </div>
      {selectedQuestion !== undefined && (
        <div className="question-editor">
          {selectedQuestion.rich ? (
            <MDEditor
              data-color-mode="dark"
              className="markdown-editor"
              value={selectedQuestion.question}
              height={selectedQuestion.type === "text" ? "100%" : "50%"}
              onChange={(val) => {
                if (val !== null && val !== undefined) {
                  setSelectedQuestion({
                    ...selectedQuestion,
                    question: val,
                  });
                }
              }}
            />
          ) : (
            <h1>{selectedQuestion.question}</h1>
          )}
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
