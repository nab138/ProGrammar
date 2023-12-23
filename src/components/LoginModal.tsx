import React, { useState } from "react";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
} from "@ionic/react";
import "./LoginModal.css";
import {
  logInWithEmailAndPassword,
  registerWithEmailAndPassword,
  sendPasswordReset,
} from "../utils/firebase";
import { toast } from "sonner";

interface LoginModalProps {
  isOpen: boolean;
  onClosed?: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClosed }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const [isSignup, setIsSignup] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);

  const handleLogin = () => {
    logInWithEmailAndPassword(email, password);
  };

  const handleSignup = () => {
    if (username.length < 3) {
      toast("Invalid Username", {
        description: "Username must be at least 3 characters long.",
        duration: 4000,
      });
      return;
    }
    registerWithEmailAndPassword(username, email, password);
  };

  const handleResetPassword = () => {
    sendPasswordReset(email);
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClosed}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login to ProGrammar</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="login-modal-content">
          <h1 className="ion-text-center">
            {isResetPassword
              ? "Reset your password"
              : `Welcome ${isSignup ? "" : "back"} to ProGrammar!`}
          </h1>
          <div className="login-buttons">
            {isSignup && (
              <IonItem>
                <IonLabel position="floating">Username</IonLabel>
                <IonInput
                  value={username}
                  onInput={(e) =>
                    setUsername((e.target as HTMLInputElement).value)
                  }
                  type="text"
                />
              </IonItem>
            )}
            <IonItem>
              <IonLabel position="floating">Email</IonLabel>
              <IonInput
                value={email}
                onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
                type="email"
              />
            </IonItem>
            {!isResetPassword && (
              <IonItem>
                <IonLabel position="floating">Password</IonLabel>
                <IonInput
                  value={password}
                  onInput={(e) =>
                    setPassword((e.target as HTMLInputElement).value)
                  }
                  type="password"
                ></IonInput>
              </IonItem>
            )}
            <IonButton
              expand="block"
              onClick={
                isResetPassword
                  ? handleResetPassword
                  : isSignup
                  ? handleSignup
                  : handleLogin
              }
            >
              {isResetPassword
                ? "Send Reset Email"
                : isSignup
                ? "Sign up"
                : "Log in"}
            </IonButton>
            {!isSignup && !isResetPassword && (
              <p
                className="ion-text-center clickable-link"
                onClick={() => {
                  setIsSignup(true);
                }}
              >
                Don't have an account? Sign up!
              </p>
            )}
            {!isSignup && !isResetPassword && (
              <p
                className="ion-text-center clickable-link"
                onClick={() => {
                  setIsResetPassword(true);
                }}
              >
                Forgot Your Password?
              </p>
            )}
            {isSignup && (
              <p
                className="ion-text-center clickable-link"
                onClick={() => {
                  setIsSignup(false);
                }}
              >
                Already have an account? Log in!
              </p>
            )}
            {isResetPassword && (
              <p
                className="ion-text-center clickable-link"
                onClick={() => {
                  setIsResetPassword(false);
                }}
              >
                Back to login
              </p>
            )}
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default LoginModal;
