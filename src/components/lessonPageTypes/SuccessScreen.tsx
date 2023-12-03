import { IonButton } from "@ionic/react";
import "./SuccessScreen.css";
import { useHistory } from "react-router";

interface SuccessScreenProps {
  totalIncorrect: number;
  curInfo: string[];
  completeType: string;
}
const SuccessScreen: React.FC<SuccessScreenProps> = ({
  totalIncorrect,
  curInfo,
  completeType,
}) => {
  let completedText = "Lesson";
  let shouldHaveNext = true;
  if (completeType === "end-unit") completedText = "Unit";
  if (completeType === "end-course") {
    completedText = "Course";
    shouldHaveNext = false;
  }

  return (
    <div className="lesson-complete-screen">
      <h2 className="ion-padding">{completedText} Complete!</h2>
      <div className="lesson-complete-buttons">
        {(() => {
          if (totalIncorrect > 0) {
            return (
              <>
                <p className="ion-padding">
                  You finished that lesson with {totalIncorrect} wrong answer
                  {totalIncorrect > 1 ? "s" : ""}. If you want, you can try
                  again.
                </p>
                <IonButton
                  expand="block"
                  color="warning"
                  onClick={() => {
                    /* Reload the page */
                    history.go(0);
                  }}
                >
                  Try Again
                </IonButton>
              </>
            );
          }
        })()}
        {shouldHaveNext ? (
          <IonButton
            expand="block"
            routerLink={`/lesson/${curInfo[0]}$${
              parseInt(curInfo[1]) + (completedText == "Unit" ? 1 : 0)
            }$${
              completedText == "Unit"
                ? 0
                : parseInt(curInfo[2]) + (completedText == "Lesson" ? 1 : 0)
            }`}
            color="success"
          >
            Next {completedText}
          </IonButton>
        ) : (
          <> </>
        )}
        <IonButton expand="block" routerLink="/courses">
          Back to Home
        </IonButton>
      </div>
    </div>
  );
};

export default SuccessScreen;
