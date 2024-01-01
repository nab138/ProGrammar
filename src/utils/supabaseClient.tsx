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
          displayName,
        },
      },
    });
    if (error) {
      throw error;
    }

    if (data.session?.user) {
      const { data: insertData, error: insertError } = await supabase
        .from("users")
        .insert([{ uid: data.session.user.id, created_at: new Date() }]);

      if (insertError) {
        throw insertError;
      }
    } else {
      toast.error("An auth error has occured", {
        description:
          "Please try again. If you just created your account, please wait a few minutes and try to login.",
        duration: 5000,
      });
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
  } catch (err) {
    logErrors(err);
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
  toast.error("An error occured: ", {
    description: e.error_description || e.message,
    duration: 5000,
  });
}
