import { initializeApp } from "firebase/app";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  initializeAuth,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import {
  collection,
  addDoc,
  persistentLocalCache,
  initializeFirestore,
} from "firebase/firestore";
import { toast } from "sonner";

const firebaseConfig = {
  apiKey: "AIzaSyDttcOHxCo3Cpp4QnMYeBS50JqIZOKk67I",
  authDomain: "programmar-1d600.firebaseapp.com",
  projectId: "programmar-1d600",
  storageBucket: "programmar-1d600.appspot.com",
  messagingSenderId: "503970654989",
  appId: "1:503970654989:web:36dce781ed44dc96ec9e44",
  measurementId: "G-LE77NH4206",
};

const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
});

export async function logInWithEmailAndPassword(
  email: string,
  password: string
) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    logErrors(err);
  }
}

export async function registerWithEmailAndPassword(
  name: string,
  email: string,
  password: string
) {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    await updateProfile(user, { displayName: name });
    await addDoc(collection(db, "users"), {
      uid: user.uid,
      name,
      authProvider: "local",
      email,
    });
  } catch (err) {
    logErrors(err);
  }
}

export async function sendPasswordReset(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
    toast("Password reset email sent!", {
      description:
        "Please check your inbox for further instructions (including spam folder).",
      duration: 5000,
    });
  } catch (err) {
    logErrors(err);
  }
}

export async function logout() {
  try {
    await signOut(auth);
  } catch (err) {
    logErrors(err);
  }
}

export async function changePassword(password: string) {
  if (!auth.currentUser) {
    toast("Not logged in", {
      description:
        "You must be logged in to change your password. How did you get to this screen anyways?",
      duration: 4000,
    });
    return;
  }
  try {
    await updatePassword(auth.currentUser, password);
    return true;
  } catch (err) {
    logErrors(err);
    return false;
  }
}

function logErrors(err: any) {
  console.error(err);
  if (err instanceof Error) {
    if (err.name === "FirebaseError") {
      if (err.message.includes("auth/invalid-email")) {
        toast("Invalid email address", {
          description: "Please check the email address you entered.",
          duration: 4000,
        });
        return;
      }
      if (err.message.includes("auth/missing-password")) {
        toast("Missing password", {
          description: "Please check the password you entered.",
          duration: 4000,
        });
        return;
      }
      if (err.message.includes("auth/invalid-credential")) {
        toast("Incorrect Login", {
          description: "Your email or password is incorrect.",
          duration: 4000,
        });
        return;
      }
      if (err.message.includes("auth/weak-password")) {
        toast("Password too weak", {
          description: "Your password must be at least 6 characters long.",
          duration: 4000,
        });
        return;
      }
      if (err.message.includes("auth/email-already-in-use")) {
        toast("Email already in use", {
          description:
            "The email you entered is already in use by another account.",
          duration: 4000,
        });
        return;
      }
    }
    toast("An unkown error has occured.", {
      description: err.message,
      duration: 5000,
    });
  }
}
