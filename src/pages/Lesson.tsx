import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import "./Lesson.css";
import { useEffect, useState } from "react";
import {
  LessonInfo,
  Course,
  Lesson,
  MultipleChoiceQuestion,
  Question,
  BuildQuestion,
  prepareLesson,
} from "../utils/structures";
import MultipleChoice from "../components/lessonPageTypes/MultipleChoice";
import CloseButton from "../components/CloseButton";
import LessonHeader from "../components/LessonHeader";
import storage, { incrementLessonIfOlder } from "../utils/storage";
import SuccessScreen from "../components/lessonPageTypes/SuccessScreen";
import TextScreen from "../components/lessonPageTypes/TextScreen";
import BuildResponse from "../components/lessonPageTypes/BuildResponse";
import triggerAchievement, {
  shouldAllowTrigger,
  triggerStreakAchievement,
} from "../utils/achievements";

interface LessonPageParams {
  id: string;
}
const LessonPage: React.FC<LessonPageParams> = ({ id }) => {
  // id is in the format course$unit$lesson
  let curInfo = id.split("$");
  let curCourse = curInfo[0];
  let curUnit = parseInt(curInfo[1]);
  let curLesson = parseInt(curInfo[2]);
  let [lessonInfo, setLessonInfo] = useState<LessonInfo>();
  let [info, setInfo] = useState<Course>();
  let [lesson, setLesson] = useState<Lesson>();
  let [incorrectQuestions, setIncorrectQuestions] = useState<number[]>([]);
  let [currentQuestion, setCurrentQuestion] = useState<number>(0);
  let [displayState, setDisplayState] = useState<string>("question");
  let [totalIncorrect, setTotalIncorrect] = useState<number>(0);
  let [currentIncorrect, setCurrentIncorrect] = useState<number>(0);
  let [awaitingSave, setAwaitingSave] = useState<boolean>(true);
  let [completeType, setCompleteType] = useState<string>("continue");

  useEffect(() => {
    const fetchInfo = async () => {
      let infoModule = await import(`../courses/${curCourse}/info.json`);
      let info: Course = infoModule.default;
      let unit = info.units[curUnit];
      let lessonInfo = unit.lessons[curLesson];
      let lessonModule = await import(
        `../courses/${curCourse}/${unit.id}/${lessonInfo.id}.json`
      );
      let lesson = await prepareLesson(
        lessonModule.default,
        info,
        unit,
        lessonInfo
      );

      setLesson(lesson);
      setInfo(info);
      setLessonInfo(lessonInfo);
    };
    fetchInfo();
  }, [id]);

  // If the last question was answered incorrectly, it would not be added to the incorrectQuestions array when toNextQuestion()
  // is called, so instead we call it when the totalIncorrect changes
  useEffect(() => {
    if (displayState == "review") return;
    toNextQuestion();
  }, [totalIncorrect, incorrectQuestions]);

  const toNextQuestion = async () => {
    if (!lessonInfo || !lesson) return <></>;
    // If we are in review mode, we need to check if we are done reviewing, and if not, go to the next incorrect question
    if (displayState == "review") {
      if (incorrectQuestions.length == 1) {
        saveProgress();
        let shouldTriggerAchievements = await shouldAllowTrigger(
          "lesson-complete-" + lessonInfo.id
        );
        if (shouldTriggerAchievements) {
          triggerAchievement("lesson-complete", lessonInfo.id);
          triggerStreakAchievement(
            "no-mistakes-lesson-streak",
            lessonInfo.id,
            true,
            true
          );
        }
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
          (async () => {
            await saveProgress();
            let shouldTriggerAchievements = await shouldAllowTrigger(
              "lesson-complete-" + lessonInfo.id
            );
            if (shouldTriggerAchievements) {
              await triggerAchievement("lesson-complete", lessonInfo.id, true);
              await triggerAchievement(
                "no-mistakes-lesson",
                lessonInfo.id,
                true
              );
              await triggerStreakAchievement(
                "no-mistakes-lesson-streak",
                lessonInfo.id,
                false,
                true
              );
            }
            setDisplayState("complete");
          })();
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
    let res = await incrementLessonIfOlder(curCourse, curUnit, curLesson, info);
    let completions = (await storage.get(`completions-${curCourse}`)) ?? {};
    completions[`${curUnit}-${curLesson}`] = Date.now();
    await storage.set(`completions-${curCourse}`, completions);
    setAwaitingSave(false);
    setCompleteType(res);
  };

  if (!lessonInfo || !lesson) return <></>;
  const getQuestion = (question: Question, isReview = false) => {
    switch (question?.type) {
      case "mc":
        return (
          <MultipleChoice
            key={currentQuestion + (isReview ? "r" : "")}
            question={question as MultipleChoiceQuestion}
            onCorrect={toNextQuestion}
            onIncorrect={function (): void {
              if (isReview) {
                toNextQuestion();
                return;
              }
              setTotalIncorrect(totalIncorrect + 1);
              setIncorrectQuestions([...incorrectQuestions, currentQuestion]);
            }}
          />
        );
      case "text":
        return (
          <TextScreen
            key={currentQuestion}
            question={question}
            onCorrect={toNextQuestion}
          />
        );
      case "build":
        return (
          <BuildResponse
            key={currentQuestion + (isReview ? "r" : "")}
            question={question as BuildQuestion}
            onCorrect={() => {
              if (question.hard ?? false) {
                triggerAchievement("hard-question", question.id);
              }
              toNextQuestion();
            }}
            onIncorrect={function (): void {
              if (isReview) {
                toNextQuestion();
                return;
              }
              setTotalIncorrect(totalIncorrect + 1);
              setIncorrectQuestions([...incorrectQuestions, currentQuestion]);
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
            {curUnit + 1}.{curLesson + 1} - {lessonInfo?.name}
          </IonTitle>
          <CloseButton key={awaitingSave.toString()} isLesson={awaitingSave} />
        </IonToolbar>
      </IonHeader>
      <IonContent className="lesson-page">
        <LessonHeader
          displayState={displayState}
          currentQuestion={currentQuestion}
          totalIncorrect={totalIncorrect}
          currentIncorrect={currentIncorrect}
          lesson={lesson}
          lessonInfo={lessonInfo}
          hard={lesson.questions[currentQuestion].hard ?? false}
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
              return getQuestion(reviewQuestion, true);
            case "complete":
              return (
                <SuccessScreen
                  totalIncorrect={totalIncorrect}
                  curInfo={curInfo}
                  completeType={completeType}
                />
              );
          }
        })()}
      </IonContent>
    </IonPage>
  );
};

export default LessonPage;
