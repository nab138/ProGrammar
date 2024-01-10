import React, { useEffect, useState } from "react";
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
  IonList,
} from "@ionic/react";
import "./LoginModal.css";
import { toast } from "sonner";

import {
  logInWithOTP,
  login,
  resetPassword,
  signup,
  verifyEmail,
} from "../utils/supabaseClient";
import OtpInput from "./OtpInput";
import storage from "../utils/storage";

interface LoginModalProps {
  isOpen: boolean;
  onClosed?: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClosed }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [otp, setOtp] = useState("");
  const [noAccount, setNoAccount] = useState(false);

  const [displayState, setDisplayState] = useState("signup");

  const handleLogin = async () => {
    login(email, password);
  };

  const handleSignup = async () => {
    if (username.length < 3) {
      toast.warning("Invalid Username", {
        description: "Username must be at least 3 characters long.",
      });
      return;
    }
    if (displayName.length < 2) {
      toast.warning("Invalid Display Name", {
        description: "Display name must be at least 2 characters long.",
      });
      return;
    }
    let data = await signup(username, email, displayName, password);
    if (data !== null) setDisplayState("verifyEmail");
  };

  const handleVerifyEmail = () => {
    if (displayState === "verifyEmailLogin") {
      logInWithOTP(otp, email);
      return;
    }
    verifyEmail(otp, email);
  };

  const handleResetPassword = async () => {
    let data = await resetPassword(email);
    if (data !== null) setDisplayState("verifyEmailLogin");
  };

  return (
    <IonModal isOpen={isOpen && !noAccount} onDidDismiss={onClosed}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login to ProGrammar</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="login-modal-content">
          {(displayState === "verifyEmail" ||
            displayState === "verifyEmailLogin") && (
              <h1 className="ion-text-center login-header">
                Enter the code sent to your email:
              </h1>
            )}
          {(displayState === "signup" || displayState === "login") && (
            <h1 className="ion-text-center login-header">
              Welcome {displayState === "login" ? "back" : ""} to ProGrammar!
            </h1>
          )}
          <IonList className="login-buttons">
            {displayState === "signup" && (
              <>
                <IonItem color={window.matchMedia('(prefers-color-scheme: dark)').matches ? "light" : ""}>
                  <IonLabel position="floating">Username</IonLabel>
                  <IonInput
                    value={username}
                    onInput={(e) =>
                      setUsername((e.target as HTMLInputElement).value)
                    }
                    type="text"
                  />
                </IonItem>
                <IonItem color={window.matchMedia('(prefers-color-scheme: dark)').matches ? "light" : ""}>
                  <IonLabel position="floating">Display Name</IonLabel>
                  <IonInput
                    value={displayName}
                    onInput={(e) =>
                      setDisplayName((e.target as HTMLInputElement).value)
                    }
                    type="text"
                  />
                </IonItem>
              </>
            )}
            {displayState === "resetPassword" && (
              <p className="ion-padding ion-text-center reset-password-text">
                Enter your email below and we'll send you a code to log into the
                app. After, you can change your password in settings.
              </p>
            )}
            {(displayState === "signup" ||
              displayState === "login" ||
              displayState === "resetPassword") && (
              <IonItem color={window.matchMedia('(prefers-color-scheme: dark)').matches ? "light" : ""}>
                  <IonLabel position="floating">Email</IonLabel>
                  <IonInput
                    value={email}
                    onInput={(e) =>
                      setEmail((e.target as HTMLInputElement).value)
                    }
                    type="email"
                  />
                </IonItem>
              )}
            {(displayState === "signup" || displayState === "login") && (
              <IonItem color={window.matchMedia('(prefers-color-scheme: dark)').matches ? "light" : ""}>
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
            {(displayState === "verifyEmail" ||
              displayState === "verifyEmailLogin") && (
                <IonItem>
                  <OtpInput value={otp} onChange={(value) => setOtp(value)} />
                </IonItem>
              )}
            {displayState === "resetPassword" && (
              <IonButton expand="block" onClick={handleResetPassword}>
                Send Reset Email
              </IonButton>
            )}
            {(displayState === "verifyEmail" ||
              displayState === "verifyEmailLogin") && (
                <IonButton expand="block" onClick={handleVerifyEmail}>
                  Verify
                </IonButton>
              )}
            {displayState === "signup" && (
              <IonButton expand="block" onClick={handleSignup}>
                Create Account
              </IonButton>
            )}
            {displayState === "login" && (
              <IonButton expand="block" onClick={handleLogin}>
                Log in
              </IonButton>
            )}
            <div className="login-links">
              {displayState === "login" && (
                <>
                  <p
                    className="clickable-link"
                    onClick={() => {
                      setDisplayState("signup");
                    }}
                  >
                    Don't have an account? Sign up!
                  </p>
                  <p
                    className="clickable-link"
                    onClick={() => {
                      setDisplayState("resetPassword");
                    }}
                  >
                    Forgot Your Password?
                  </p>
                </>
              )}
              {displayState === "signup" && (
                <p
                  className="clickable-link"
                  onClick={() => {
                    setDisplayState("login");
                  }}
                >
                  Already have an account? Log in!
                </p>
              )}
              {displayState === "resetPassword" && (
                <p
                  className="clickable-link"
                  onClick={() => {
                    setDisplayState("login");
                  }}
                >
                  Back to login
                </p>
              )}
              {displayState !== "verifyEmail" && displayState !== "resetPassword" && (
                <p
                  className="clickable-link"
                  onClick={() => {
                    storage.enableNoAcccountMode();
                    setNoAccount(true);
                  }}
                >
                  Use without an account (one session)
                </p>
              )}
            </div>
          </IonList>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default LoginModal;
