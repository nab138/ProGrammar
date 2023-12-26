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
  const [lessonName, setLessonName] = useState<string>(lesson.name);
  const [lessonId, setLessonId] = useState<string>(lesson.id);
  const [lessonType, setLessonType] = useState<"learn" | "quiz">(lesson.type);
  useEffect(() => {
    if (selectedQuestion !== undefined && selectedQuestionIndex !== undefined) {
      const newLesson = { ...lesson };
      newLesson.questions[selectedQuestionIndex] = selectedQuestion;
      const newCourse = { ...originalJSON };
      newCourse.units[unitIndex].lessons[lessonIndex] = newLesson;
      updateJSON(newCourse);
    }
  }, [selectedQuestion]);

  useEffect(() => {
    const newLesson = { ...lesson };
    newLesson.name = lessonName;
    const newCourse = { ...originalJSON };
    newCourse.units[unitIndex].lessons[lessonIndex] = newLesson;
    updateJSON(newCourse);
  }, [lessonName]);

  useEffect(() => {
    const newLesson = { ...lesson };
    newLesson.id = lessonId;
    const newCourse = { ...originalJSON };
    newCourse.units[unitIndex].lessons[lessonIndex] = newLesson;
    updateJSON(newCourse);
  }, [lessonId]);

  useEffect(() => {
    const newLesson = { ...lesson };
    newLesson.type = lessonType;
    const newCourse = { ...originalJSON };
    newCourse.units[unitIndex].lessons[lessonIndex] = newLesson;
    updateJSON(newCourse);
  }, [lessonType]);

  return (
    <div className="lesson-editor">
      <div className="lesson-editor-sidebar">
        <label htmlFor="lesson-name">Lesson Name:</label>
        <input
          type="text"
          id="lesson-name"
          value={lessonName}
          onChange={(e) => {
            setLessonName(e.target.value);
          }}
        />
        <label htmlFor="lesson-id">Lesson ID:</label>
        <input
          type="text"
          id="lesson-id"
          value={lessonId}
          onChange={(e) => {
            setLessonId(e.target.value);
          }}
        />
        <label htmlFor="lesson-type">Lesson Type:</label>
        {/* Dropdown for type */}
        <select
          id="lesson-type"
          value={lessonType}
          onChange={(e) => {
            setLessonType(e.target.value as "learn" | "quiz");
          }}
        >
          <option value="learn">Learn</option>
          <option value="quiz">Quiz</option>
        </select>
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
                onDoubleClick={() => {
                  const newQuestion = { ...selectedQuestion };
                  newQuestion.answer = choice;
                  setSelectedQuestion(newQuestion);
                }}
              >
                <textarea
                  value={choice}
                  onChange={(e) => {
                    const newQuestion = { ...selectedQuestion };
                    newQuestion.choices[index] = e.target.value;
                    if (newQuestion.answer === choice) {
                      newQuestion.answer = e.target.value;
                    }
                    setSelectedQuestion(newQuestion);
                  }}
                />
                <textarea
                  value={
                    (selectedQuestion as MultipleChoiceQuestion).explanations[
                      index
                    ]
                  }
                  onChange={(e) => {
                    const newQuestion = { ...selectedQuestion };
                    (newQuestion as MultipleChoiceQuestion).explanations[
                      index
                    ] = e.target.value;
                    setSelectedQuestion(newQuestion);
                  }}
                />
                <button
                  onClick={() => {
                    const newQuestion = { ...selectedQuestion };
                    newQuestion.choices.splice(index, 1);
                    (newQuestion as MultipleChoiceQuestion).explanations.splice(
                      index,
                      1
                    );
                    setSelectedQuestion(newQuestion);
                  }}
                >
                  -
                </button>
              </div>
            ))}
          {selectedQuestion.type === "mc" && (
            <button
              onClick={() => {
                const newQuestion = { ...selectedQuestion };
                newQuestion.choices.push("");
                (newQuestion as MultipleChoiceQuestion).explanations.push("");
                setSelectedQuestion(newQuestion);
              }}
              className="add-choice"
            >
              Add
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default LessonEditor;
