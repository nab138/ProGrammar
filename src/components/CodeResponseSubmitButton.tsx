import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
} from "@ionic/react";
import "./SubmitQuestionButton.css";
import "./CodeResponseSubmitButton.css";
import { ElementRef, useEffect, useRef, useState } from "react";
import useSound from "use-sound";

import correctSfx from "../sfx/correct.mp3";
import wrongSfx from "../sfx/wrong.mp3";
import storage from "../utils/storage";
import { hapticsImpactHeavy } from "../utils/haptics";
import { CodeQuestion } from "../utils/structures";
import execute from "../utils/piston";
import Draggable, { ControlPosition } from "react-draggable";

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

  let card = useRef<HTMLIonCardElement>(null);
  let draggableRef = useRef<Draggable>(null);
  useEffect(() => {
    if (showExplanation) {
      card.current!.className = "code-response-card";
    }
  }, [showExplanation]);

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
      let correct = false;
      if (Array.isArray(question.answer)) {
        let trimmed = question.answer.map((a) => a.trim());
        if (trimmed.includes(output.trim())) {
          correct = true;
        }
      } else if (output.trim() === question.answer.trim()) {
        correct = true;
      }
      setIsCorrect(correct);
      setColor(correct ? "success" : "danger");
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

  const handleDragStop = (draggedY: number) => {
    const dismissThreshold = 100; // Adjust this value based on your preference

    if (draggedY > dismissThreshold) {
      card.current!.className = "code-response-card-out";
      setTimeout(() => {
        setShowExplanation(false);
      }, 300);
    } else {
      // If not meeting the threshold, reset the position immediately
      if (draggableRef.current) {
        draggableRef.current.setState({ x: 0, y: 0 });
      }
    }
  };

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
            let correct = false;
            if (Array.isArray(question.answer)) {
              let trimmed = question.answer.map((a) => a.trim());
              if (trimmed.includes(output.run.output.trim())) {
                correct = true;
              }
            } else if (output.run.output.trim() === question.answer.trim()) {
              correct = true;
            }

            if (correct) {
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
        <Draggable
          ref={draggableRef}
          bounds={{ top: 0 }}
          axis="y"
          onStop={(e, data) => handleDragStop(data.y)}
        >
          <IonCard className="code-response-card" ref={card}>
            <IonCardHeader>
              <IonCardTitle>
                {isCorrect ? "Good Job!" : "So Close!"}
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {isCorrect
                ? "Correct!"
                : "Try again, you'll get it! The expected output was \"" +
                  (Array.isArray(question.answer)
                    ? question.answer.join('" or "')
                    : question.answer) +
                  '"'}
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
        </Draggable>
      )}
    </div>
  );
};

export default CodeResponseSubmitButton;
