"use client";

import { createClient, type Session } from "@supabase/supabase-js";
import {
  Eye,
  EyeOff,
  KeyRound,
  LogIn,
  UserPlus,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  requiresProfileName: boolean;
  role: "admin" | "user";
  status: "active" | "blocked";
};

type AuthMode = "signin" | "signup" | "update-password";
type PendingAuthAction =
  | "signin"
  | "signup"
  | "reset-password"
  | "update-password"
  | "profile-name";

type AuthUrlState = {
  code: string | null;
  error: string | null;
  isRecovery: boolean;
};

const SIGNIN_LOADING_MIN_MS = 5000;

export default function AuthShell() {
  const supabase = useMemo(
    () => createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY),
    [],
  );
  const [mode, setMode] = useState<AuthMode>("signin");
  const [firstName, setFirstName] = useState("");
  const [profileFirstName, setProfileFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingAuthAction, setPendingAuthAction] =
    useState<PendingAuthAction | null>(null);
  const [emailCooldown, setEmailCooldown] = useState(0);
  const isPasswordCharacterActive =
    isPasswordFocused ||
    (mode === "update-password" ? newPassword.length > 0 : password.length > 0);

  const loadAppUser = useCallback(async (accessToken: string) => {
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
  }, []);

  useEffect(() => {
    if (emailCooldown <= 0) return;

    const timer = window.setInterval(() => {
      setEmailCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [emailCooldown]);

  useEffect(() => {
    let alive = true;

    async function initializeAuth() {
      const authUrlState = getAuthUrlState();

      if (!alive) return;

      if (authUrlState.error) {
        setStatusMessage(authUrlState.error);
        setIsLoading(false);
        return;
      }

      if (authUrlState.isRecovery && authUrlState.code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(
          authUrlState.code,
        );

        if (!alive) return;

        if (error || !data.session) {
          setMode("signin");
          setStatusMessage(
            "Link de recuperacao invalido ou expirado. Solicite um novo link.",
          );
          setIsLoading(false);
          return;
        }

        setSession(data.session);
        setMode("update-password");
        setIsLoading(false);
        return;
      }

      const { data } = await supabase.auth.getSession();

      if (!alive) return;

      setSession(data.session);
      if (authUrlState.isRecovery) {
        setMode("update-password");
        setIsLoading(false);
        return;
      }
      if (data.session) {
        loadAppUser(data.session.access_token);
      } else {
        setIsLoading(false);
      }
    }

    initializeAuth();

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
  }, [loadAppUser, supabase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const loadingStartedAt = Date.now();
    setIsSubmitting(true);
    setPendingAuthAction(mode === "signup" ? "signup" : "signin");
    setStatusMessage("");

    try {
      const credentials = { email: email.trim().toLowerCase(), password };

      if (mode === "signup") {
        const normalizedFirstName = normalizeProfileName(firstName);

        if (!isValidProfileName(normalizedFirstName)) {
          setStatusMessage("Informe apenas seu primeiro nome para criar o acesso.");
          return;
        }

        if (emailCooldown > 0) {
          setStatusMessage(
            `Aguarde ${emailCooldown}s antes de solicitar outro e-mail.`,
          );
          return;
        }

        const quotaResponse = await fetch("/api/signup-quota", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: credentials.email }),
        });
        const quotaData = (await quotaResponse.json()) as {
          reservationId?: string;
          error?: string;
          quota?: { nextAvailableAt: string | null };
        };
        if (!quotaResponse.ok || !quotaData.reservationId) {
          setStatusMessage(
            quotaData.quota?.nextAvailableAt
              ? `Novos e-mails serao liberados por volta de ${new Date(quotaData.quota.nextAvailableAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}.`
              : quotaData.error ?? "Nao foi possivel iniciar o cadastro.",
          );
          return;
        }

        const { error } = await supabase.auth.signUp({
          ...credentials,
          options: {
            emailRedirectTo: window.location.origin,
            data: createProfileNameMetadata(normalizedFirstName),
          },
        });

        if (error) {
          await fetch("/api/signup-quota", {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              reservationId: quotaData.reservationId,
              outcome: isEmailRateLimitError(error) ? "rate_limited" : "failed",
            }),
          });
          if (isEmailRateLimitError(error)) {
            setEmailCooldown(60);
            setStatusMessage(
              "O provedor de e-mail atingiu o limite desta hora. O contador do administrador foi atualizado; aguarde a proxima liberacao.",
            );
          } else {
            setStatusMessage(authErrorMessage(error.message));
          }
          return;
        }

        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setFirstName("");
        setPassword("");
        setShowPassword(false);
        setIsPasswordFocused(false);
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
        await Promise.all([
          loadAppUser(result.data.session.access_token),
          waitForMinimumLoadingTime(loadingStartedAt, SIGNIN_LOADING_MIN_MS),
        ]);
      }
    } finally {
      setIsSubmitting(false);
      setPendingAuthAction(null);
    }
  }

  async function handleProfileNameSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedFirstName = normalizeProfileName(profileFirstName);

    if (!isValidProfileName(normalizedFirstName)) {
      setStatusMessage("Informe apenas seu primeiro nome para continuar.");
      return;
    }

    if (!session) {
      setStatusMessage("Sua sessao expirou. Entre novamente.");
      return;
    }

    setIsSubmitting(true);
    setPendingAuthAction("profile-name");
    setStatusMessage("");

    try {
      const { error } = await supabase.auth.updateUser({
        data: createProfileNameMetadata(normalizedFirstName),
      });

      if (error) {
        setStatusMessage(authErrorMessage(error.message));
        return;
      }

      const { data } = await supabase.auth.getSession();
      const nextSession = data.session ?? session;
      setSession(nextSession);
      await loadAppUser(nextSession.access_token);
      setUser((current) =>
        current
          ? {
              ...current,
              displayName: normalizedFirstName,
              requiresProfileName: false,
            }
          : current,
      );
      setProfileFirstName("");
    } finally {
      setIsSubmitting(false);
      setPendingAuthAction(null);
    }
  }

  async function handlePasswordReset() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setStatusMessage("Informe seu e-mail para receber o link de recuperacao.");
      return;
    }

    setIsSubmitting(true);
    setPendingAuthAction("reset-password");
    setStatusMessage("");

    try {
      const quotaResponse = await fetch("/api/signup-quota", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const quotaData = (await quotaResponse.json()) as {
        reservationId?: string;
        error?: string;
        quota?: { nextAvailableAt: string | null };
      };
      if (!quotaResponse.ok || !quotaData.reservationId) {
        setStatusMessage(
          quotaData.quota?.nextAvailableAt
            ? `A recuperacao estara disponivel por volta de ${new Date(quotaData.quota.nextAvailableAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}.`
            : quotaData.error ?? "Nao foi possivel solicitar a recuperacao.",
        );
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: getPasswordRecoveryRedirectUrl(),
      });

      if (error) {
        await fetch("/api/signup-quota", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            reservationId: quotaData.reservationId,
            outcome: isEmailRateLimitError(error) ? "rate_limited" : "failed",
          }),
        });
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
      setPendingAuthAction(null);
    }
  }

  async function handleNewPasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setPendingAuthAction("update-password");
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
      setShowPassword(false);
      setShowNewPassword(false);
      setIsPasswordFocused(false);
      setMode("signin");
      setStatusMessage("Senha atualizada. Entre novamente.");
    } finally {
      setIsSubmitting(false);
      setPendingAuthAction(null);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setFirstName("");
    setProfileFirstName("");
    setPassword("");
    setNewPassword("");
    setShowPassword(false);
    setShowNewPassword(false);
    setIsPasswordFocused(false);
    setStatusMessage("");
  }

  if (isLoading || (isSubmitting && pendingAuthAction === "signin")) {
    return (
      <LoginLoadingScreen
        message={authLoadingMessage(pendingAuthAction, mode)}
      />
    );
  }

  if (session && user?.requiresProfileName) {
    return (
      <LoginShell>
        <form
          key="profile-name"
          className="login-form"
          onSubmit={handleProfileNameSubmit}
        >
          <p className="login-helper">
            Antes de abrir o Finny, informe seu primeiro nome.
          </p>

          <label>
            <span>Primeiro nome</span>
            <input
              autoComplete="given-name"
              maxLength={40}
              onChange={(event) => setProfileFirstName(event.target.value)}
              placeholder="Seu primeiro nome"
              required
              type="text"
              value={profileFirstName}
            />
          </label>

          {statusMessage ? (
            <p className="login-message" role="status">
              {statusMessage}
            </p>
          ) : null}

          <button
            className={`login-button${isSubmitting ? " is-submitting" : ""}`}
            disabled={isSubmitting}
            type="submit"
            aria-busy={isSubmitting}
          >
            <UserPlus size={19} aria-hidden="true" />
            Salvar e abrir Finny
          </button>
        </form>

        <button
          className="login-muted-action"
          disabled={isSubmitting}
          type="button"
          onClick={handleSignOut}
        >
          Trocar conta
        </button>
      </LoginShell>
    );
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

  if (isSubmitting) {
    return (
      <LoginLoadingScreen message={authLoadingMessage(pendingAuthAction, mode)} />
    );
  }

  if (mode === "update-password") {
    return (
      <LoginShell passwordCharacterActive={isPasswordCharacterActive}>
        <form
          key="update-password"
          className="login-form"
          onSubmit={handleNewPasswordSubmit}
        >
          <p className="login-helper">
            Link validado. Crie uma nova senha para acessar sua conta.
          </p>

          <label>
            <span>Nova senha</span>
            <div className="password-field">
              <input
                autoComplete="new-password"
                minLength={6}
                onBlur={() => setIsPasswordFocused(false)}
                onChange={(event) => setNewPassword(event.target.value)}
                onFocus={() => setIsPasswordFocused(true)}
                placeholder="Digite a nova senha"
                required
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((visible) => !visible)}
                aria-label={showNewPassword ? "Ocultar senha" : "Mostrar senha"}
                title={showNewPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showNewPassword ? (
                  <EyeOff size={18} aria-hidden="true" />
                ) : (
                  <Eye size={18} aria-hidden="true" />
                )}
              </button>
            </div>
          </label>

          {statusMessage ? <p className="login-message">{statusMessage}</p> : null}

          <button
            className={`login-button${isSubmitting ? " is-submitting" : ""}`}
            disabled={isSubmitting}
            type="submit"
            aria-busy={isSubmitting}
          >
            <KeyRound size={19} aria-hidden="true" />
            Salvar nova senha
          </button>
        </form>
      </LoginShell>
    );
  }

  return (
    <LoginShell passwordCharacterActive={isPasswordCharacterActive}>
      <form key={mode} className="login-form" onSubmit={handleSubmit}>
        {mode === "signup" ? (
          <label>
            <span>Primeiro nome</span>
            <input
              autoComplete="given-name"
              maxLength={40}
              onChange={(event) => setFirstName(event.target.value)}
              placeholder="Seu primeiro nome"
              required
              type="text"
              value={firstName}
            />
          </label>
        ) : null}

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
          <div className="password-field">
            <input
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              minLength={6}
              onBlur={() => setIsPasswordFocused(false)}
              onChange={(event) => setPassword(event.target.value)}
              onFocus={() => setIsPasswordFocused(true)}
              placeholder="Digite sua senha"
              required
              type={showPassword ? "text" : "password"}
              value={password}
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              title={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? (
                <EyeOff size={18} aria-hidden="true" />
              ) : (
                <Eye size={18} aria-hidden="true" />
              )}
            </button>
          </div>
        </label>

        {statusMessage ? (
          <p className="login-message" role="status">
            {statusMessage}
          </p>
        ) : null}

        <button
          className={`login-button${isSubmitting ? " is-submitting" : ""}`}
          disabled={isSubmitting || (mode === "signup" && emailCooldown > 0)}
          type="submit"
          aria-busy={isSubmitting}
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
          setFirstName("");
          setIsPasswordFocused(false);
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

function normalizeProfileName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function isValidProfileName(value: string) {
  return value.length >= 2 && !value.includes("@");
}

function createProfileNameMetadata(firstName: string) {
  return {
    first_name: firstName,
    name: firstName,
    display_name: firstName,
  };
}

function waitForMinimumLoadingTime(startedAt: number, minimumMs: number) {
  const remainingMs = Math.max(0, minimumMs - (Date.now() - startedAt));

  if (remainingMs === 0) return Promise.resolve();

  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, remainingMs);
  });
}

function getAuthUrlState(): AuthUrlState {
  const url = new URL(window.location.href);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const type = url.searchParams.get("type") ?? hashParams.get("type");
  const errorDescription =
    url.searchParams.get("error_description") ??
    hashParams.get("error_description");

  return {
    code: url.searchParams.get("code"),
    error: errorDescription ? decodeURIComponent(errorDescription) : null,
    isRecovery:
      url.searchParams.get("auth") === "recovery" ||
      type === "recovery" ||
      window.location.pathname === "/reset-password",
  };
}

function getPasswordRecoveryRedirectUrl() {
  return `${window.location.origin}/?auth=recovery`;
}

function authLoadingMessage(
  action: PendingAuthAction | null,
  mode: AuthMode,
) {
  if (action === "reset-password") return "Enviando link seguro...";
  if (action === "update-password") return "Salvando nova senha...";
  if (action === "profile-name") return "Salvando seu perfil...";
  if (action === "signup") return "Criando acesso...";
  if (action === "signin") return "Validando acesso...";
  return mode === "update-password" ? "Preparando senha..." : "Preparando acesso...";
}

function LoginLoading({ message }: { message: string }) {
  return (
    <div className="login-loading" role="status" aria-live="polite">
      <LoadingCharacterImage />
      <div className="login-loading-progress" aria-hidden="true">
        <span />
      </div>
      <p className="login-loading-message">{message}</p>
    </div>
  );
}

function LoadingCharacterImage() {
  return (
    <div className="login-loading-media" aria-hidden="true">
      <Image
        alt=""
        className="login-loading-image"
        draggable={false}
        height={1024}
        priority
        src="/assets/login/loading-character.png"
        unoptimized
        width={1024}
      />
    </div>
  );
}

function LoginLoadingScreen({ message }: { message: string }) {
  return (
    <main className="login-page login-loading-screen">
      <LoginLoading message={message} />
    </main>
  );
}

function LoginShell({
  children,
  message,
  passwordCharacterActive = false,
}: {
  children?: ReactNode;
  message?: string;
  passwordCharacterActive?: boolean;
}) {
  return (
    <main className="login-page">
      <section className="login-panel" aria-label="Acesso protegido">
        <div
          aria-hidden="true"
          className={`login-character-stage${passwordCharacterActive ? " is-password" : ""}`}
        >
          <Image
            alt=""
            className="login-welcome-character login-character-image is-welcome"
            draggable={false}
            height={507}
            priority
            src="/assets/login/welcome-character.png"
            unoptimized
            width={760}
          />
          <Image
            alt=""
            className="login-welcome-character login-character-image is-password"
            draggable={false}
            height={1024}
            priority
            src="/assets/login/password-character.png"
            unoptimized
            width={1024}
          />
        </div>
        <span className="eyebrow">Acesso protegido</span>

        {message ? <p className="login-message">{message}</p> : children}
      </section>
    </main>
  );
}
