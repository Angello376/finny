"use client";

import { createClient, type Session } from "@supabase/supabase-js";
import {
  BadgeDollarSign,
  LockKeyhole,
  LogIn,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import CardsFinanceirosApp from "./CardsFinanceirosApp";
import {
  SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_URL,
} from "./supabase-config";
import type { FormEvent, ReactNode } from "react";

type AppUser = {
  id: string;
  displayName: string;
  email: string;
  role: "admin" | "user";
  status: "active" | "blocked";
};

type AuthMode = "signin" | "signup";

export default function AuthShell() {
  const supabase = useMemo(
    () => createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY),
    [],
  );
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let alive = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setSession(data.session);
      if (data.session) {
        loadAppUser(data.session.access_token);
      } else {
        setIsLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
        setUser(null);
        if (nextSession) {
          loadAppUser(nextSession.access_token);
        } else {
          setIsLoading(false);
        }
      },
    );

    return () => {
      alive = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  async function loadAppUser(accessToken: string) {
    setIsLoading(true);
    setStatusMessage("");

    try {
      const response = await fetch("/api/session", {
        headers: { authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
      const data = (await response.json().catch(() => ({}))) as {
        user?: AppUser;
        error?: string;
      };

      if (!response.ok || !data.user) {
        setStatusMessage(data.error ?? "Nao foi possivel validar seu acesso.");
        setUser(null);
        return;
      }

      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage("");

    try {
      const credentials = { email: email.trim().toLowerCase(), password };
      const result =
        mode === "signin"
          ? await supabase.auth.signInWithPassword(credentials)
          : await supabase.auth.signUp(credentials);

      if (result.error) {
        setStatusMessage(result.error.message);
        return;
      }

      if (result.data.session) {
        setSession(result.data.session);
        await loadAppUser(result.data.session.access_token);
      } else {
        setStatusMessage(
          "Conta criada. Se o Supabase pedir confirmacao, verifique seu e-mail antes de entrar.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setPassword("");
    setStatusMessage("");
  }

  if (isLoading) {
    return <LoginShell message="Carregando acesso..." />;
  }

  if (session && user) {
    return (
      <CardsFinanceirosApp
        accessToken={session.access_token}
        onSignOut={handleSignOut}
        user={user}
      />
    );
  }

  return (
    <LoginShell>
      <form className="login-form" onSubmit={handleSubmit}>
        <label>
          <span>E-mail</span>
          <input
            autoComplete="email"
            inputMode="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="seu@email.com"
            required
            type="email"
            value={email}
          />
        </label>

        <label>
          <span>Senha</span>
          <input
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            minLength={6}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Digite sua senha"
            required
            type="password"
            value={password}
          />
        </label>

        {statusMessage ? <p className="login-message">{statusMessage}</p> : null}

        <button className="login-button" disabled={isSubmitting} type="submit">
          {mode === "signin" ? (
            <LogIn size={19} aria-hidden="true" />
          ) : (
            <UserPlus size={19} aria-hidden="true" />
          )}
          {mode === "signin" ? "Entrar" : "Criar minha senha"}
        </button>
      </form>

      <button
        className="login-switch"
        type="button"
        onClick={() => {
          setMode(mode === "signin" ? "signup" : "signin");
          setStatusMessage("");
        }}
      >
        {mode === "signin"
          ? "Primeiro acesso? Criar senha"
          : "Ja tenho senha"}
      </button>
    </LoginShell>
  );
}

function LoginShell({
  children,
  message,
}: {
  children?: ReactNode;
  message?: string;
}) {
  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-mark">
          <BadgeDollarSign size={32} aria-hidden="true" />
        </div>

        <span className="eyebrow">Acesso protegido</span>
        <h1 id="login-title">Cards Financeiros</h1>
        <p>
          Entre com e-mail e senha. Cada usuario ve somente os proprios cards,
          recebimentos, pagamentos e imagens geradas.
        </p>

        {message ? <p className="login-message">{message}</p> : children}

        <div className="login-assurances" aria-label="Garantias de privacidade">
          <span>
            <LockKeyhole size={17} aria-hidden="true" />
            Senha escolhida pelo usuario
          </span>
          <span>
            <ShieldCheck size={17} aria-hidden="true" />
            Admin libera ou bloqueia acessos
          </span>
        </div>
      </section>
    </main>
  );
}
