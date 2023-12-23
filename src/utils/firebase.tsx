import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  DocumentSnapshot,
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
export const auth = getAuth(app);
const db = getFirestore(app);

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
      if (err.message.includes("auth/weak-passiword")) {
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
