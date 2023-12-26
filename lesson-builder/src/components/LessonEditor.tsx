import { useEffect, useState } from "react";
import {
  Course,
  Lesson,
  MultipleChoiceQuestion,
  Question,
} from "../structures";
import MDEditor from "@uiw/react-md-editor";
import "./LessonEditor.css";

interface LessonEditorProps {
  lesson: Lesson;
  updateJSON: (lesson: Course) => void;
  originalJSON: Course;
  unitIndex: number;
  lessonIndex: number;
}
const LessonEditor: React.FC<LessonEditorProps> = ({
  lesson,
  updateJSON,
  originalJSON,
  unitIndex,
  lessonIndex,
}) => {
  const [selectedQuestion, setSelectedQuestion] = useState<Question>();
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>();

  useEffect(() => {
    if (selectedQuestion !== undefined && selectedQuestionIndex !== undefined) {
      const newLesson = { ...lesson };
      newLesson.questions[selectedQuestionIndex] = selectedQuestion;
      const newCourse = { ...originalJSON };
      newCourse.units[unitIndex].lessons[lessonIndex] = newLesson;
      updateJSON(newCourse);
    }
  }, [selectedQuestion]);

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
                setSelectedQuestionIndex(index);
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
          <div className="settings">
            {/* Add a checkbox for rich */}
            <label htmlFor="rich">Rich:</label>
            <input
              type="checkbox"
              id="rich"
              checked={!!selectedQuestion.rich}
              onChange={(event) => {
                setSelectedQuestion({
                  ...selectedQuestion,
                  rich: event.target.checked,
                });
              }}
            />
          </div>
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
            <textarea
              className="question-input"
              value={selectedQuestion.question}
              onChange={(e) => {
                setSelectedQuestion({
                  ...selectedQuestion,
                  question: e.target.value,
                });
              }}
            />
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
