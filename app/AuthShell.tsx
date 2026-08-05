"use client";

import { createClient, type Session } from "@supabase/supabase-js";
import {
  BadgeDollarSign,
  KeyRound,
  LogIn,
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

type AuthMode = "signin" | "signup" | "update-password";

export default function AuthShell() {
  const supabase = useMemo(
    () => createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY),
    [],
  );
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailCooldown, setEmailCooldown] = useState(0);

  useEffect(() => {
    if (emailCooldown <= 0) return;

    const timer = window.setInterval(() => {
      setEmailCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [emailCooldown > 0]);

  useEffect(() => {
    let alive = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setSession(data.session);
      if (window.location.hash.includes("type=recovery")) {
        setMode("update-password");
        setIsLoading(false);
        return;
      }
      if (data.session) {
        loadAppUser(data.session.access_token);
      } else {
        setIsLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, nextSession) => {
        setSession(nextSession);
        setUser(null);
        if (event === "PASSWORD_RECOVERY") {
          setMode("update-password");
          setIsLoading(false);
          return;
        }
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

      if (mode === "signup") {
        if (emailCooldown > 0) {
          setStatusMessage(
            `Aguarde ${emailCooldown}s antes de solicitar outro e-mail.`,
          );
          return;
        }

        const { error } = await supabase.auth.signUp({
          ...credentials,
          options: { emailRedirectTo: window.location.origin },
        });

        if (error) {
          if (isEmailRateLimitError(error)) {
            setEmailCooldown(60);
            setStatusMessage(
              "O provedor de e-mail atingiu o limite temporario. Aguarde 1 minuto e tente novamente apenas uma vez.",
            );
          } else {
            setStatusMessage(authErrorMessage(error.message));
          }
          return;
        }

        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setPassword("");
        setMode("signin");
        setStatusMessage(
          "Cadastro criado. Enviamos um link de validacao para seu e-mail. Abra o link e depois entre.",
        );
        return;
      }

      const result = await supabase.auth.signInWithPassword(credentials);

      if (result.error) {
        setStatusMessage(authErrorMessage(result.error.message));
        return;
      }

      if (result.data.session) {
        setSession(result.data.session);
        await loadAppUser(result.data.session.access_token);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePasswordReset() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setStatusMessage("Informe seu e-mail para receber o link de recuperacao.");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: window.location.origin,
      });

      if (error) {
        if (isEmailRateLimitError(error)) {
          setEmailCooldown(60);
          setStatusMessage(
            "O provedor de e-mail atingiu o limite temporario. Aguarde 1 minuto antes de tentar novamente.",
          );
        } else {
          setStatusMessage(authErrorMessage(error.message));
        }
        return;
      }

      setStatusMessage("Enviamos um link para redefinir sua senha.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleNewPasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage("");

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        setStatusMessage(error.message);
        return;
      }

      await supabase.auth.signOut();
      window.history.replaceState(null, "", window.location.pathname);
      setSession(null);
      setUser(null);
      setPassword("");
      setNewPassword("");
      setMode("signin");
      setStatusMessage("Senha atualizada. Entre novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setPassword("");
    setNewPassword("");
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

  if (mode === "update-password") {
    return (
      <LoginShell>
        <form className="login-form" onSubmit={handleNewPasswordSubmit}>
          <label>
            <span>Nova senha</span>
            <input
              autoComplete="new-password"
              minLength={6}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Digite a nova senha"
              required
              type="password"
              value={newPassword}
            />
          </label>

          {statusMessage ? <p className="login-message">{statusMessage}</p> : null}

          <button className="login-button" disabled={isSubmitting} type="submit">
            <KeyRound size={19} aria-hidden="true" />
            Salvar nova senha
          </button>
        </form>
      </LoginShell>
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

        {statusMessage ? (
          <p className="login-message" role="status">
            {statusMessage}
          </p>
        ) : null}

        <button
          className="login-button"
          disabled={isSubmitting || (mode === "signup" && emailCooldown > 0)}
          type="submit"
        >
          {mode === "signin" ? (
            <LogIn size={19} aria-hidden="true" />
          ) : (
            <UserPlus size={19} aria-hidden="true" />
          )}
          {mode === "signin"
            ? "Entrar"
            : emailCooldown > 0
              ? `Tente novamente em ${emailCooldown}s`
              : "Criar minha senha"}
        </button>
      </form>

      {mode === "signin" ? (
        <button
          className="login-muted-action"
          disabled={isSubmitting}
          type="button"
          onClick={handlePasswordReset}
        >
          Esqueci minha senha
        </button>
      ) : null}

      <button
        className="login-switch"
        disabled={isSubmitting}
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

function isEmailRateLimitError(error: { message?: string; status?: number }) {
  return (
    error.status === 429 ||
    /rate limit|too many requests|email rate limit/i.test(error.message ?? "")
  );
}

function authErrorMessage(message: string) {
  if (/invalid login credentials/i.test(message)) {
    return "E-mail ou senha incorretos.";
  }

  if (/email not confirmed/i.test(message)) {
    return "Confirme seu e-mail pelo link recebido antes de entrar.";
  }

  if (/user already registered/i.test(message)) {
    return "Este e-mail ja possui cadastro. Use a opcao de entrar ou recuperar a senha.";
  }

  return message;
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

        {message ? <p className="login-message">{message}</p> : children}
      </section>
    </main>
  );
}
