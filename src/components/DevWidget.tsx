import {
  IonButton,
  IonFab,
  IonFabButton,
  IonIcon,
  IonItem,
  IonList,
  IonPopover,
} from "@ionic/react";
import { bug } from "ionicons/icons";
import React, { useContext, useState } from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import { useHistory } from "react-router";
import { LessonContext } from "../LessonContext";
import { toast } from "sonner";
interface DragInfo {
  x: number;
  y: number;
  time: number;
}
const DevWidget: React.FC = () => {
  const { skipToEnd } = useContext(LessonContext);
  const fab = React.useRef<HTMLIonFabButtonElement>(null);
  const [showPopover, setShowPopover] = useState<{
    open: boolean;
    event: React.MouseEvent | undefined;
  }>({ open: false, event: undefined });
  let [dragInfo, setDragInfo] = useState<DragInfo>();

  let handleDragStart = (e: DraggableEvent, data: DraggableData) => {
    setDragInfo({
      x: data.x,
      y: data.y,
      time: Date.now(),
    });
  };

  let handleDragStop = (e: DraggableEvent, data: DraggableData) => {
    if (!dragInfo) return;
    let change = {
      x: Math.abs(data.x - dragInfo.x),
      y: Math.abs(data.y - dragInfo.y),
      time: Date.now() - dragInfo.time,
    };
    if (change.x + change.y <= 10 && change.time < 300) {
      fab.current?.click();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    setShowPopover({ open: true, event: e });
  };
  return (
    <Draggable
      defaultPosition={{ x: 50, y: 100 }}
      disabled={showPopover.open}
      onStart={handleDragStart}
      onStop={handleDragStop}
      nodeRef={fab}
    >
      <IonFabButton ref={fab} onClick={handleClick}>
        <IonIcon icon={bug} />
        <IonPopover
          isOpen={showPopover.open}
          event={showPopover.event}
          onDidDismiss={() => setShowPopover({ open: false, event: undefined })}
        >
          <IonList>
            <IonItem
              button={true}
              detail={false}
              onClick={async () => {
                await skipToEnd();
              }}
            >
              Skip to end of lesson
            </IonItem>
            <IonItem
              button={true}
              detail={false}
              onClick={() => {
                history.go(0);
              }}
            >
              Reload (Wipe State)
            </IonItem>
          </IonList>
        </IonPopover>
      </IonFabButton>
    </Draggable>
  );
};

export default DevWidget;
