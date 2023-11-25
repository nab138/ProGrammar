import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonProgressBar,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import "./Lesson.css";
import { useHistory, useParams } from "react-router";
import { useEffect, useState } from "react";
import {
  LessonInfo,
  Course,
  Lesson,
  MultipleChoiceQuestion,
  Question,
  randomizeLesson,
} from "../utils/structures";
import MultipleChoice from "../components/MultipleChoice";
import CloseButton from "../components/CloseButton";
import LessonHeader from "../components/LessonHeader";
import getStorage, { incrementLessonIfOlder } from "../utils/storage";

interface LessonPageParams {
  id: string;
}
const LessonPage: React.FC<LessonPageParams> = ({ id }) => {
  let history = useHistory();
  let curInfo = id.split("$");

  let [lessonInfo, setLessonInfo] = useState<LessonInfo>();
  let [info, setInfo] = useState<Course>();
  let [lesson, setLesson] = useState<Lesson>();
  let [incorrectQuestions, setIncorrectQuestions] = useState<number[]>([]);
  useEffect(() => {
    const fetchInfo = async () => {
      let infoModule = await import(`../courses/${curInfo[0]}/info.json`);
      let info: Course = infoModule.default;
      let unit = info.units[parseInt(curInfo[1])];
      let lessonInfo = unit.lessons[parseInt(curInfo[2])];
      let lessonModule = await import(
        `../courses/${curInfo[0]}/${unit.id}/${lessonInfo.id}.json`
      );
      let lesson: Lesson = randomizeLesson(lessonModule.default);
      setLesson(lesson);
      setInfo(info);
      setLessonInfo(lessonInfo);
    };
    fetchInfo();
  }, [id]);

  let [currentQuestion, setCurrentQuestion] = useState<number>(0);
  let [displayState, setDisplayState] = useState<string>("question");
  let [totalIncorrect, setTotalIncorrect] = useState<number>(0);
  let [currentIncorrect, setCurrentIncorrect] = useState<number>(0);
  let [awaitingSave, setAwaitingSave] = useState<boolean>(true);

  const toNextQuestion = () => {
    if (!lessonInfo || !lesson) return <></>;
    // If we are in review mode, we need to check if we are done reviewing, and if not, go to the next incorrect question
    if (displayState == "review") {
      if (incorrectQuestions.length == 1) {
        setDisplayState("complete");
        return;
      }
      setIncorrectQuestions(incorrectQuestions.slice(1));
      setCurrentQuestion(incorrectQuestions[1]);
      setCurrentIncorrect(currentIncorrect + 1);
      return;
    } else {
      // If we are not in review mode, we need to check if we are done with the lesson, and if not, go to the next question
      if (
        lesson?.questions.length &&
        currentQuestion >= lesson?.questions.length - 1
      ) {
        // If there are no incorrect questions, we are done with the lesson
        if (incorrectQuestions.length === 0) {
          setDisplayState("complete");
        } else {
          // Otherwise, we need to go into review mode
          setDisplayState("review");
          setCurrentQuestion(incorrectQuestions[0]);
        }
      } else {
        setCurrentQuestion(currentQuestion + 1);
      }
    }
  };

  const saveProgress = async () => {
    if (!info) return;
    await incrementLessonIfOlder(
      curInfo[0],
      parseInt(curInfo[1]),
      parseInt(curInfo[2]),
      info
    );
    setAwaitingSave(false);
  };

  if (!lessonInfo || !lesson) return <></>;
  const getQuestion = (question: Question) => {
    switch (question?.type) {
      case "mc":
        return (
          <MultipleChoice
            key={currentQuestion}
            question={question as MultipleChoiceQuestion}
            onCorrect={function (): void {
              toNextQuestion();
            }}
            onIncorrect={function (): void {
              setIncorrectQuestions([...incorrectQuestions, currentQuestion]);
              setTotalIncorrect(totalIncorrect + 1);
              toNextQuestion();
            }}
          />
        );
    }
  };
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            {parseInt(curInfo[1]) + 1}.{parseInt(curInfo[2]) + 1} -{" "}
            {lessonInfo?.name}
          </IonTitle>
          <CloseButton isLesson={awaitingSave} />
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <LessonHeader
          displayState={displayState}
          currentQuestion={currentQuestion}
          totalIncorrect={totalIncorrect}
          currentIncorrect={currentIncorrect}
          lesson={lesson}
        />
        {(() => {
          switch (displayState) {
            case "question":
              let question = lesson?.questions[currentQuestion];
              if (!question) return <></>;
              return getQuestion(question);
            case "review":
              let reviewQuestion = lesson?.questions[currentQuestion];
              if (!reviewQuestion) return <></>;
              return getQuestion(reviewQuestion);
            case "complete":
              saveProgress();
              return (
                <div className="lesson-complete-screen">
                  <h2 className="ion-padding">Lesson Complete!</h2>
                  <div className="lesson-complete-buttons">
                    {(() => {
                      if (totalIncorrect > 0) {
                        return (
                          <>
                            <p className="ion-padding">
                              You finished that lesson with {totalIncorrect}{" "}
                              wrong answer{totalIncorrect > 1 ? "s" : ""}. If
                              you want, you can try again.
                            </p>
                            <IonButton
                              expand="block"
                              color="warning"
                              onClick={() => {
                                history.push(
                                  `/lesson/${curInfo[0]}$${curInfo[1]}$${curInfo[2]}`
                                );
                              }}
                            >
                              Try Again
                            </IonButton>
                          </>
                        );
                      }
                    })()}
                    <IonButton
                      expand="block"
                      onClick={() => {
                        history.push(
                          `/lesson/${curInfo[0]}$${curInfo[1]}$${
                            parseInt(curInfo[2]) + 1
                          }`
                        );
                      }}
                      color="success"
                    >
                      Next Lesson
                    </IonButton>
                    <IonButton
                      expand="block"
                      onClick={() => {
                        history.push(`/courses`);
                      }}
                    >
                      Back to Home
                    </IonButton>
                  </div>
                </div>
              );
          }
        })()}
      </IonContent>
    </IonPage>
  );
};

export default LessonPage;
