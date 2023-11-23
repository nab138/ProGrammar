import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import "./Lesson.css";
import { useHistory, useParams } from "react-router";
import { useEffect, useState } from "react";
import {
  LessonInfo,
  Unit,
  Course,
  Lesson,
  MultipleChoiceQuestion,
} from "./Courses";
import { close } from "ionicons/icons";
import MultipleChoice from "../components/MultipleChoice";
import CloseButton from "../components/CloseButton";

const LessonPage: React.FC = () => {
  let history = useHistory();
  let { id } = useParams<{ id: string }>();
  let curInfo = id.split(".");

  let [lessonInfo, setLessonInfo] = useState<LessonInfo>();
  let [lesson, setLesson] = useState<Lesson>();
  let [incorrectQuestions, setIncorrectQuestions] = useState<number[]>([]);
  useEffect(() => {
    const fetchInfo = async () => {
      let infoModule = await import(`../courses/${curInfo[0]}/info.json`);
      let info: Course = infoModule.default;
      let unit = info.units[parseInt(curInfo[1])];
      let lessonInfo = unit.lessons[parseInt(curInfo[2])];
      let lessonModule = await import(
        `../courses/${curInfo[0]}/${unit.id}/${lessonInfo.filename}`
      );
      let lesson: Lesson = lessonModule.default;
      setLesson(lesson);
      setLessonInfo(lessonInfo);
    };
    fetchInfo();
  }, []);

  let [currentQuestion, setCurrentQuestion] = useState<number>(0);
  let [displayState, setDisplayState] = useState<string>("question");

  const toNextQuestion = () => {
    if (
      lesson?.questions.length &&
      currentQuestion >= lesson?.questions.length - 1
    ) {
      if (incorrectQuestions.length === 0) {
        setDisplayState("complete");
      }
    } else {
      setCurrentQuestion(currentQuestion + 1);
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
          <CloseButton isLesson />
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {(() => {
          switch (displayState) {
            case "question":
              let question = lesson?.questions[currentQuestion];
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
                        setIncorrectQuestions([
                          ...incorrectQuestions,
                          currentQuestion,
                        ]);
                        toNextQuestion();
                      }}
                    />
                  );
                default:
                  return <></>;
              }
            case "complete":
              return (
                <>
                  <h2 className="ion-padding">Lesson Complete!</h2>
                  <IonButton expand="full">Next Lesson</IonButton>
                  <IonButton expand="full">Back to Home</IonButton>
                </>
              );
          }
        })()}
      </IonContent>
    </IonPage>
  );
};

export default LessonPage;
