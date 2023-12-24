import {
  IonButton,
  IonContent,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonList,
  IonModal,
  IonPopover,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { bug } from "ionicons/icons";
import React, { useContext, useEffect, useState } from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import { LessonContext } from "../LessonContext";
import "./DevWidget.css";
interface DragInfo {
  x: number;
  y: number;
  time: number;
}
interface DevWidgetProps {
  hideDevWidget: () => void;
}
const DevWidget: React.FC<DevWidgetProps> = ({ hideDevWidget }) => {
  const [showModal, setShowModal] = useState(false);
  const [consoleLog, setConsoleLog] = useState("");

  useEffect(() => {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    console.log = function (message, ...optionalParams) {
      setConsoleLog(
        (prevLog) =>
          prevLog +
          `<br/><span class="log">${message} ${optionalParams.join(" ")}</span>`
      );
      originalLog.apply(console, [message, ...optionalParams]);
    };

    console.warn = function (message, ...optionalParams) {
      setConsoleLog(
        (prevLog) =>
          prevLog +
          `<br/><span class="warn">WARN: ${message} ${optionalParams.join(
            " "
          )}</span>`
      );
      originalWarn.apply(console, [message, ...optionalParams]);
    };

    console.error = function (message, ...optionalParams) {
      setConsoleLog(
        (prevLog) =>
          prevLog +
          `<br/><span class="error">ERROR: ${message} ${optionalParams.join(
            " "
          )}</span>`
      );
      originalError.apply(console, [message, ...optionalParams]);
    };

    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

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
              onClick={() => {
                skipToEnd();
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
            <IonItem
              button={true}
              detail={false}
              onClick={() => {
                setShowModal(true);
              }}
            >
              View Console
            </IonItem>
            <IonItem
              button={true}
              detail={false}
              onClick={() => {
                hideDevWidget();
              }}
            >
              Hide Dev Widget
            </IonItem>
          </IonList>
        </IonPopover>
        <IonModal isOpen={showModal}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Console Log</IonTitle>
              <IonButton slot="end" onClick={() => setShowModal(false)}>
                Close
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent color="dark">
            <div
              dangerouslySetInnerHTML={{ __html: consoleLog }}
              className="debug-console"
            />
          </IonContent>
        </IonModal>
      </IonFabButton>
    </Draggable>
  );
};

export default DevWidget;
