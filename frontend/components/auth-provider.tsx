"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient, supabaseConfigured } from "@/lib/supabase";

type AuthState = {
  client: SupabaseClient | null;
  session: Session | null;
  loading: boolean;
  configured: boolean;
  error: string;
};

const AuthContext = createContext<AuthState>({
  client: null,
  session: null,
  loading: true,
  configured: supabaseConfigured,
  error: "",
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    client: null,
    session: null,
    loading: true,
    configured: supabaseConfigured,
    error: "",
  });

  useEffect(() => {
    let active = true;
    const client = getSupabaseClient();
    if (!client) {
      setState({
        client: null,
        session: null,
        loading: false,
        configured: false,
        error: "",
      });
      return;
    }
    // Do not await other Supabase methods inside this SDK callback.
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      if (active)
        setState({
          client,
          session,
          loading: false,
          configured: true,
          error: "",
        });
    });
    client.auth
      .getSession()
      .then(({ data, error }) => {
        if (active)
          setState({
            client,
            session: data.session,
            loading: false,
            configured: true,
            error: error
              ? "Your session could not be restored. Please sign in again."
              : "",
          });
      })
      .catch(() => {
        if (active)
          setState({
            client,
            session: null,
            loading: false,
            configured: true,
            error: "Cannot reach the account service. Please try again.",
          });
      });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
