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

interface SubmitQuestionButtonProps {
  disabled: boolean;
  isCorrect: () => boolean;
  getExplanation: () => string;
  onCorrect: () => void;
  onIncorrect: () => void;
  onFirstClick: () => void;
  skipToNext?: () => void;
  text?: string;
  isNotQuestion?: boolean;
  isRevisiting?: boolean;
}
const SubmitQuestionButton: React.FC<SubmitQuestionButtonProps> = ({
  isCorrect,
  onCorrect,
  onIncorrect,
  onFirstClick,
  getExplanation,
  skipToNext,
  disabled,
  text,
  isNotQuestion = false,
  isRevisiting = false,
}) => {
  const [showExplanation, setShowExplanation] = useState(false);
  let [curText, setCurText] = useState<string>(text ?? "Submit");
  let [firstClick, setFirstClick] = useState<boolean>(true);
  let [color, setColor] = useState<string>("primary");

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
    if (isRevisiting === true) {
      setCurText("Next");
      setColor("primary");
      setShowExplanation(true);
      setFirstClick(false);
      onFirstClick();
    }
  }, [isRevisiting]);
  return (
    <div className="submit-button-container">
      <IonButton
        disabled={disabled}
        size="large"
        color={color}
        expand="block"
        className="submit-button"
        onClick={() => {
          if (firstClick) {
            if (isCorrect()) {
              setColor("success");
              if (!isNotQuestion) {
                if (sfxEnabled) playCorrect();
                if (hapticsEnabled) hapticsImpactHeavy();
              }
            } else {
              setColor("danger");
              if (!isNotQuestion) {
                if (sfxEnabled) playWrong();
                if (hapticsEnabled) hapticsImpactHeavy();
              }
            }
            setFirstClick(false);
            onFirstClick();
            if (!isNotQuestion) setCurText("Next");
            if (!isNotQuestion) setShowExplanation(true);
          } else {
            if (isRevisiting && skipToNext) {
              skipToNext();
              return;
            }
            if (isCorrect()) {
              onCorrect();
            } else {
              onIncorrect();
            }
          }
        }}
      >
        {curText}
      </IonButton>
      {showExplanation && (
        <IonCard className="animate-in">
          <IonCardHeader>
            <IonCardTitle>
              {isCorrect() ? "Good Job!" : "So Close!"}
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>{getExplanation()}</IonCardContent>
        </IonCard>
      )}
    </div>
  );
};

export default SubmitQuestionButton;
