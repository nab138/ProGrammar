import { AuthError, Session, createClient } from "@supabase/supabase-js";
import { toast } from "sonner";
import { useState, useEffect } from "react";

const supabaseUrl = "https://gvhmhavitqrsbtjsryej.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2aG1oYXZpdHFyc2J0anNyeWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQwNjUyNjIsImV4cCI6MjAxOTY0MTI2Mn0.QZNpfGfLp1iy5Qp82fwdOsY01KXbsxaNYCkONCP5Oiw";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function login(email: string, password: string) {
  try {
    let { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      throw error;
    }
    return data;
  } catch (err) {
    logErrors(err);
  }
}

export async function signup(
  username: string,
  email: string,
  displayName: string,
  password: string
) {
  try {
    let { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          username,
          display_name: displayName,
        },
      },
    });

    if (error) throw error;
    toast.success("Account Created!", {
      description: "Please check your email for a verification code.",
    });

    return data;
  } catch (err) {
    logErrors(err);
    return null;
  }
}

export async function verifyEmail(otp: string, email: string) {
  try {
    let { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "signup",
    });
    if (error) {
      throw error;
    }
    return data;
  } catch (err) {
    logErrors(err);
  }
}

export async function logInWithOTP(otp: string, email: string) {
  try {
    let { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "recovery",
    });
    if (error) {
      throw error;
    }
    return data;
  } catch (err) {
    logErrors(err);
  }
}

export const useSupabaseAuth = (): [
  Session | null,
  boolean,
  AuthError | null
] => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      setLoading(true);
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setError(error);
      } else {
        setSession(data.session);
      }

      setLoading(false);
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return [session, loading, error];
};

export async function signout() {
  try {
    let { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  } catch (err) {
    logErrors(err);
  }
}

// TODO: Doesn't work yet
export async function resetPassword(email: string) {
  try {
    let { data, error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      throw error;
    }
    toast.success("Password reset email sent!", {
      description:
        "Please check your inbox for further instructions (including spam folder).",
      duration: 5000,
    });
    return data;
  } catch (err) {
    logErrors(err);
    return null;
  }
}

export async function changePassword(password: string) {
  try {
    let { data, error } = await supabase.auth.updateUser({
      password: password,
    });
    if (error) {
      throw error;
    }
    toast.success("Password changed!", {
      description: "Your password has been changed.",
      duration: 5000,
    });
    return data;
  } catch (err) {
    logErrors(err);
  }
}
function logErrors(e: any) {
  let title = "An error occured:";
  let msg = e.error_description || e.message;
  if (
    msg.includes("Password should be at least 6 characters.") ||
    msg.includes("Password should contain at least one character of each:")
  ) {
    title = "Invalid Password";
    msg =
      "Password should be at least 6 characters and contain at least 1 lowercase letter, 1 uppercase letter, and 1 number.";
  } else if (msg.includes("Failed to fetch")) {
    title = "Unable to connect";
    msg = "Check your internet connection and try again in a few minutes.";
  } else if (msg.includes("duplicate key value violates unique constraint")) {
    if (msg.includes("profiles_username_key")) {
      title = "Username already taken";
      msg = "Please try a different username.";
    }
  }
  toast.error(title, {
    description: msg,
    duration: 5000,
  });
}
