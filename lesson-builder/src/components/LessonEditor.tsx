import { useEffect, useState } from "react";
import {
  BuildQuestion,
  Course,
  Lesson,
  MultipleChoiceQuestion,
  Question,
} from "../structures";
import MDEditor from "@uiw/react-md-editor";
import "./LessonEditor.css";

interface LessonEditorProps {
  updateJSON: React.Dispatch<React.SetStateAction<Course | undefined>>;
  originalJSON: Course;
  unitIndex: number;
  lessonIndex: number;
}
const LessonEditor: React.FC<LessonEditorProps> = ({
  updateJSON,
  originalJSON,
  unitIndex,
  lessonIndex,
}) => {
  const [selectedQuestion, setSelectedQuestion] = useState<Question>();
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>();
  const [lesson, setLesson] = useState<Lesson>(
    originalJSON.units[unitIndex].lessons[lessonIndex]
  );
  const [lessonName, setLessonName] = useState<string>(lesson.name);
  const [lessonId, setLessonId] = useState<string>(lesson.id);
  const [lessonType, setLessonType] = useState<"learn" | "quiz">(lesson.type);

  useEffect(() => {
    setLesson(originalJSON.units[unitIndex].lessons[lessonIndex]);
  }, [originalJSON, unitIndex, lessonIndex]);
  useEffect(() => {
    if (selectedQuestion !== undefined && selectedQuestionIndex !== undefined) {
      const newLesson = { ...lesson };
      newLesson.questions[selectedQuestionIndex] = selectedQuestion;
      const newCourse = { ...originalJSON };
      newCourse.units[unitIndex].lessons[lessonIndex] = newLesson;
      updateJSON(newCourse);
      setLesson(newLesson);
    }
  }, [selectedQuestion]);

  useEffect(() => {
    const newLesson = { ...lesson };
    newLesson.name = lessonName;
    const newCourse = { ...originalJSON };
    newCourse.units[unitIndex].lessons[lessonIndex] = newLesson;
    updateJSON(newCourse);
    setLesson(newLesson);
  }, [lessonName]);

  useEffect(() => {
    const newLesson = { ...lesson };
    newLesson.id = lessonId;
    const newCourse = { ...originalJSON };
    newCourse.units[unitIndex].lessons[lessonIndex] = newLesson;
    updateJSON(newCourse);
    setLesson(newLesson);
  }, [lessonId]);

  useEffect(() => {
    const newLesson = { ...lesson };
    newLesson.type = lessonType;
    const newCourse = { ...originalJSON };
    newCourse.units[unitIndex].lessons[lessonIndex] = newLesson;
    updateJSON(newCourse);
    setLesson(newLesson);
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
            <div key={index}>
              <div
                className="add-inbetween-question"
                onClick={() => {
                  const newLesson = { ...lesson };
                  newLesson.questions.splice(index, 0, {
                    type: "text",
                    question: "",
                  });
                  const newCourse = { ...originalJSON };
                  newCourse.units[unitIndex].lessons[lessonIndex] = newLesson;
                  updateJSON(newCourse);
                }}
              >
                +
              </div>
              <div
                className={
                  "question" +
                  (index === selectedQuestionIndex ? " selected" : "")
                }
                key={index}
                onClick={() => {
                  setSelectedQuestion(question);
                  setSelectedQuestionIndex(index);
                }}
              >
                {index > 0 && (
                  <div
                    className="move-question up"
                    onClick={() => {
                      updateJSON((old) => {
                        if (old === undefined) return old;
                        const newLesson = JSON.parse(
                          JSON.stringify(
                            old.units[unitIndex].lessons[lessonIndex]
                          )
                        );
                        const toMoveUp = newLesson.questions[index];
                        const toMoveDown = newLesson.questions[index - 1];
                        newLesson.questions[index] = toMoveDown;
                        newLesson.questions[index - 1] = toMoveUp;
                        const newCourse = JSON.parse(JSON.stringify(old));
                        newCourse.units[unitIndex].lessons[lessonIndex] =
                          newLesson;
                        return newCourse;
                      });
                    }}
                  >
                    ↑
                  </div>
                )}
                <div style={{ display: "flex", gap: "15px" }}>
                  <h3>{question.type}</h3>
                  <h4>{question.question}</h4>
                  <button
                    className={"deleteBtn"}
                    onClick={() => {
                      const newLesson = { ...lesson };
                      newLesson.questions.splice(index, 1);
                      const newCourse = { ...originalJSON };
                      newCourse.units[unitIndex].lessons[lessonIndex] =
                        newLesson;
                      updateJSON(newCourse);
                    }}
                  >
                    -
                  </button>
                </div>
                {question.answer !== undefined && <p>{question.answer}</p>}
                {index < lesson.questions.length - 1 && (
                  <div
                    className="move-question down"
                    onClick={() => {
                      updateJSON((old) => {
                        if (old === undefined) return old;
                        const newLesson = JSON.parse(
                          JSON.stringify(
                            old.units[unitIndex].lessons[lessonIndex]
                          )
                        );
                        const toMoveUp = newLesson.questions[index + 1];
                        const toMoveDown = newLesson.questions[index];
                        newLesson.questions[index + 1] = toMoveDown;
                        newLesson.questions[index] = toMoveUp;
                        const newCourse = JSON.parse(JSON.stringify(old));
                        newCourse.units[unitIndex].lessons[lessonIndex] =
                          newLesson;
                        return newCourse;
                      });
                    }}
                  >
                    ↓
                  </div>
                )}
              </div>
            </div>
          ))}
          <div
            className={"question addQuestionBtn"}
            onClick={() => {
              const newLesson = { ...lesson };
              newLesson.questions.push({
                type: "text",
                question: "",
              });
              const newCourse = { ...originalJSON };
              newCourse.units[unitIndex].lessons[lessonIndex] = newLesson;
              updateJSON(newCourse);
            }}
          >
            <h2>Add Question +</h2>
          </div>
        </div>
      </div>
      {selectedQuestionIndex !== undefined && (
        <div
          className="next-question-button"
          onClick={() => {
            if (selectedQuestionIndex + 1 >= lesson.questions.length) {
              const newLesson = { ...lesson };
              newLesson.questions.push({
                type: "text",
                question: "",
              });
              const newCourse = { ...originalJSON };
              newCourse.units[unitIndex].lessons[lessonIndex] = newLesson;
              updateJSON(newCourse);
            }
            setSelectedQuestion(lesson.questions[selectedQuestionIndex + 1]);
            setSelectedQuestionIndex(selectedQuestionIndex + 1);
            // Scroll to bottom of sidebar
            const questions = document.getElementsByClassName(
              "lesson-editor-sidebar"
            )[0];
            if (questions !== undefined) {
              questions.scrollTop = questions.scrollHeight;
            }
          }}
        >
          Next Question
        </div>
      )}
      {selectedQuestion !== undefined && (
        <div className="question-editor">
          <div className="settings">
            <div>
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
            <div>
              <label htmlFor="hard">Hard:</label>
              <input
                type="checkbox"
                id="hard"
                checked={!!selectedQuestion.hard}
                onChange={(event) => {
                  setSelectedQuestion({
                    ...selectedQuestion,
                    hard: event.target.checked,
                  });
                }}
              />
            </div>
            <div>
              <label htmlFor="q-type">Question Type:</label>
              <select
                id="q-type"
                value={selectedQuestion.type}
                onChange={(e) => {
                  const newQuestion = { ...selectedQuestion };
                  if (e.target.value === "mc") {
                    newQuestion.choices = [];
                    newQuestion.explanations = [];
                    newQuestion.answer = "";
                  }
                  if (e.target.value === "build") {
                    newQuestion.choices = [];
                    newQuestion.answer = "";
                  }
                  newQuestion.type = e.target.value as "mc" | "build" | "text";
                  setSelectedQuestion(newQuestion);
                }}
              >
                <option value="text">Text</option>
                <option value="mc">Multiple Choice</option>
                <option value="build">Build</option>
              </select>
            </div>
          </div>
          {selectedQuestion.rich ? (
            <MDEditor
              data-color-mode="dark"
              className="markdown-editor"
              value={selectedQuestion.question}
              height={selectedQuestion.type === "text" ? "95%" : "50%"}
              onChange={(val) => {
                if (val !== null && val !== undefined) {
                  setSelectedQuestion({
                    ...selectedQuestion,
                    question: val,
                  });
                }
              }}
              onBlur={() => {
                if (
                  selectedQuestion.question !== null &&
                  selectedQuestion.question !== undefined
                ) {
                  // Automatically replace spaces in URLs with %20
                  const updatedVal = selectedQuestion.question.replace(
                    /\[(.*?)\]\((.*?)\)/g,
                    (match, title, link) => {
                      return `[${title}](${link.replace(/ /g, "%20")})`;
                    }
                  );

                  setSelectedQuestion({
                    ...selectedQuestion,
                    question: updatedVal,
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
            (selectedQuestion as MultipleChoiceQuestion).choices.map(
              (choice, index) => (
                <div
                  className={
                    "choice" +
                    (choice === selectedQuestion.answer && choice !== ""
                      ? " correct"
                      : "")
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
                      const newQuestion = {
                        ...selectedQuestion,
                      } as MultipleChoiceQuestion;
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
                      const newQuestion = {
                        ...selectedQuestion,
                      } as MultipleChoiceQuestion;
                      newQuestion.choices.splice(index, 1);
                      (
                        newQuestion as MultipleChoiceQuestion
                      ).explanations.splice(index, 1);
                      setSelectedQuestion(newQuestion);
                    }}
                  >
                    -
                  </button>
                </div>
              )
            )}
          {selectedQuestion.type === "mc" && (
            <button
              onClick={() => {
                const newQuestion = {
                  ...selectedQuestion,
                } as MultipleChoiceQuestion;
                newQuestion.choices.push("");
                (newQuestion as MultipleChoiceQuestion).explanations.push("");
                setSelectedQuestion(newQuestion);
              }}
              className="add-choice"
            >
              Add
            </button>
          )}
          {selectedQuestion.type === "build" && (
            <>
              <label htmlFor="build-answer">Answer:</label>
              <textarea
                id="build-answer"
                value={selectedQuestion.answer}
                onChange={(e) => {
                  const newQuestion = {
                    ...selectedQuestion,
                  } as BuildQuestion;
                  newQuestion.answer = e.target.value;
                  setSelectedQuestion(newQuestion);
                }}
              />
            </>
          )}
          {selectedQuestion.type === "build" && (
            <div className="build-choices">
              {(selectedQuestion as BuildQuestion).choices.map(
                (choice, index) => (
                  <div className={"build-choice"} key={index}>
                    <input
                      type="text"
                      value={choice}
                      onChange={(e) => {
                        const newQuestion = {
                          ...selectedQuestion,
                        } as BuildQuestion;
                        newQuestion.choices[index] = e.target.value;
                        setSelectedQuestion(newQuestion);
                      }}
                    />
                    <button
                      onClick={() => {
                        const newQuestion = {
                          ...selectedQuestion,
                        } as BuildQuestion;
                        newQuestion.choices.splice(index, 1);
                        setSelectedQuestion(newQuestion);
                      }}
                    >
                      -
                    </button>
                  </div>
                )
              )}
              <button
                onClick={() => {
                  const newQuestion = {
                    ...selectedQuestion,
                  } as BuildQuestion;
                  newQuestion.choices.push("");
                  setSelectedQuestion(newQuestion);
                }}
                className="build-choice add-build-choice"
              >
                Add
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LessonEditor;

function hashCode(s: string) {
  return s.split("").reduce(function (a, b) {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);
}
