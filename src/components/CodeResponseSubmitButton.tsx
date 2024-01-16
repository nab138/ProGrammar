import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
} from "@ionic/react";
import "./SubmitQuestionButton.css";
import { useEffect, useState } from "react";
import useSound from "use-sound";

import correctSfx from "../sfx/correct.mp3";
import wrongSfx from "../sfx/wrong.mp3";
import storage from "../utils/storage";
import { hapticsImpactHeavy } from "../utils/haptics";
import { CodeQuestion } from "../utils/structures";
import execute from "../utils/piston";

interface CodeResponseSubmitButtonProps {
  code: string;
  question: CodeQuestion;
  onCorrect: () => void;
  onIncorrect: () => void;
  skipToNext: () => void;
  setLastOutput: (output: string) => void;
  setIsDisabled: (disabled: boolean) => void;
  isNotQuestion?: boolean;
  isRevisiting?: boolean;
}
const CodeResponseSubmitButton: React.FC<CodeResponseSubmitButtonProps> = ({
  code,
  question,
  onCorrect,
  onIncorrect,
  skipToNext,
  setIsDisabled,
  setLastOutput,
  isRevisiting = false,
}) => {
  const [showExplanation, setShowExplanation] = useState(false);
  let [numClicks, setNumClicks] = useState<number>(0);
  let [color, setColor] = useState<string>("primary");
  let [isCorrect, setIsCorrect] = useState<boolean>(false);

  let [playCorrect] = useSound(correctSfx);
  let [playWrong] = useSound(wrongSfx);

  let [sfxEnabled, setSfxEnabled] = useState<boolean>(true);
  let [hapticsEnabled, setHapticsEnabled] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      let [sfxEnabled, hapticsEnabled] = await Promise.all([
        storage.getLocalWithDefault("sfxEnabled", true),
        storage.getLocalWithDefault("hapticsEnabled", false),
      ]);
      setSfxEnabled(sfxEnabled);
      setHapticsEnabled(hapticsEnabled);
    })();
  }, []);

  useEffect(() => {
    if (isRevisiting) {
      let output = sessionStorage.getItem(question.id) ?? "";
      setLastOutput(output);
      setNumClicks(2);
      setShowExplanation(true);
      setIsDisabled(true);
      if (output.trim() === question.answer.trim()) {
        setIsCorrect(true);
        setColor("success");
      } else {
        setIsCorrect(false);
        setColor("danger");
      }
    }
  }, [isRevisiting]);

  const runCode = async () => {
    setLastOutput("Running...");
    let codeToRun = question.template.replace(/{{code}}/g, code);
    let output = await execute(
      {
        name: "CodeQuestion",
        content: codeToRun,
      },
      [],
      question.language
    );
    setLastOutput(output.run.output);
    sessionStorage.setItem(question.id, output.run.output);
    return output;
  };

  //   useEffect(() => {
  //     if (isRevisiting === true) {
  //       setCurText("Next");
  //       setColor("primary");
  //       setShowExplanation(true);
  //       setFirstClick(false);
  //     }
  //   }, [isRevisiting]);
  return (
    <div className="submit-button-container">
      <IonButton
        size="large"
        color={color}
        expand="block"
        className="submit-button"
        disabled={isRevisiting && !isCorrect}
        onClick={async () => {
          if (numClicks === 0 || (numClicks > 0 && !isCorrect)) {
            setShowExplanation(false);
            let output = await runCode();
            if (output.run.output.trim() === question.answer.trim()) {
              setColor("success");
              if (sfxEnabled) playCorrect();
              if (hapticsEnabled) hapticsImpactHeavy();
              setIsCorrect(true);
              setShowExplanation(true);
              setIsDisabled(true);
            } else {
              setColor("danger");
              if (sfxEnabled) playWrong();
              if (hapticsEnabled) hapticsImpactHeavy();
              setIsCorrect(false);
              setShowExplanation(true);
            }
            setNumClicks(numClicks + 1);
          } else {
            if (!isRevisiting) onCorrect();
            else skipToNext();
          }
        }}
      >
        {numClicks > 0 ? (isCorrect ? "Next" : "Run Again") : "Run"}
      </IonButton>
      {showExplanation && (
        <IonCard className="animate-in">
          <IonCardHeader>
            <IonCardTitle>{isCorrect ? "Good Job!" : "So Close!"}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {isCorrect
              ? "Good Job!"
              : "Try again, you'll get it! The expected output was \"" +
                question.answer +
                '".'}
            {numClicks > 1 && !isCorrect && (
              <IonButton
                expand="block"
                color="light"
                onClick={() => {
                  if (!isRevisiting) onIncorrect();
                  else skipToNext();
                }}
              >
                Skip
              </IonButton>
            )}
          </IonCardContent>
        </IonCard>
      )}
    </div>
  );
};

export default CodeResponseSubmitButton;
