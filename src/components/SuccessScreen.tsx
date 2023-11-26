import { IonButton } from "@ionic/react";
import "./SuccessScreen.css";
import { useHistory } from "react-router";

interface SuccessScreenProps {
  totalIncorrect: number;
  curInfo: string[];
}
const SuccessScreen: React.FC<SuccessScreenProps> = ({
  totalIncorrect,
  curInfo,
}) => {
  let history = useHistory();
  return (
    <div className="lesson-complete-screen">
      <h2 className="ion-padding">Lesson Complete!</h2>
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
        <IonButton
          expand="block"
          onClick={() => {
            history.push(
              `/lesson/${curInfo[0]}$${curInfo[1]}$${parseInt(curInfo[2]) + 1}`
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
};

export default SuccessScreen;
