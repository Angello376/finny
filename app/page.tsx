import { BadgeDollarSign, LockKeyhole, LogIn, ShieldCheck } from "lucide-react";
import CardsFinanceirosApp from "./CardsFinanceirosApp";
import {
  chatGPTSignInPath,
  chatGPTSignOutPath,
  getChatGPTUser,
} from "./chatgpt-auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getChatGPTUser();

  if (!user) {
    return <LoginGate signInPath={chatGPTSignInPath("/")} />;
  }

  return (
    <CardsFinanceirosApp
      user={{
        displayName: user.displayName,
        email: user.email,
        signOutPath: chatGPTSignOutPath("/"),
      }}
    />
  );
}

function LoginGate({ signInPath }: { signInPath: string }) {
  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-mark">
          <BadgeDollarSign size={32} aria-hidden="true" />
        </div>

        <span className="eyebrow">Acesso protegido</span>
        <h1 id="login-title">Cards Financeiros</h1>
        <p>
          Entre para salvar seus cards em uma conta separada. Cada usuario ve
          somente os proprios recebimentos, pagamentos e imagens geradas.
        </p>

        <a className="login-button" href={signInPath}>
          <LogIn size={19} aria-hidden="true" />
          Entrar com ChatGPT
        </a>

        <div className="login-assurances" aria-label="Garantias de privacidade">
          <span>
            <LockKeyhole size={17} aria-hidden="true" />
            Historico individual
          </span>
          <span>
            <ShieldCheck size={17} aria-hidden="true" />
            Dados separados por usuario
          </span>
        </div>
      </section>
    </main>
  );
}
