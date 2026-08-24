# Finny

<p align="center">
  <img src="public/assets/brand/finny-logo.png" alt="Logo do Finny" width="150" />
</p>

<p align="center">
  <strong>Controle financeiro simples, bonito e pronto para compartilhar.</strong>
</p>

<p align="center">
  <a href="https://cards-financeiros-20260805.angellomelo9.chatgpt.site">Acessar o app</a>
  ·
  <a href="#recursos">Recursos</a>
  ·
  <a href="#como-rodar-localmente">Rodar localmente</a>
  ·
  <a href="#seguranca-e-privacidade">Segurança</a>
</p>

<p align="center">
  <img alt="Status" src="https://img.shields.io/badge/status-em%20produção-22C55E?style=for-the-badge" />
  <img alt="PWA" src="https://img.shields.io/badge/PWA-iOS%20e%20Android-2563EB?style=for-the-badge" />
  <img alt="Stack" src="https://img.shields.io/badge/stack-React%20%2B%20Vinext%20%2B%20Supabase-0D182A?style=for-the-badge" />
</p>

---

## Sobre

O **Finny** é um aplicativo financeiro criado para transformar recebimentos e pagamentos em cards organizados, visuais e fáceis de consultar.

A ideia principal é simples:

```text
Recebeu dinheiro -> adicionou pagamentos -> o Finny calcula tudo -> gera o card -> salva no histórico
```

O usuário não precisa fazer contas manualmente. O app calcula saldo, total comprometido, percentual utilizado, quantidade de pagamentos e ainda mantém um histórico por mês.

---

## App em produção

O Finny está publicado em:

[https://cards-financeiros-20260805.angellomelo9.chatgpt.site](https://cards-financeiros-20260805.angellomelo9.chatgpt.site)

---

## Recursos

### Cards financeiros

- Criação de cards para salário, férias, vale, décimo terceiro, comissão, extra ou recebimento personalizado.
- Cadastro de data, valor recebido e descrição opcional.
- Lista de pagamentos com nome, valor, categoria e observação.
- Cálculo automático de total pago, saldo restante, percentual utilizado e quantidade de pagamentos.
- Aviso visual quando o valor comprometido fica alto.

### Pagamentos fixados

- Cada pagamento pode ser marcado como fixo.
- Ao duplicar um card, os pagamentos fixados continuam no novo card.
- Ideal para contas recorrentes, assinaturas, parcelas e compromissos mensais.

### Histórico inteligente

- Histórico separado por mês e ano.
- Resumo mensal com recebido, pago e saldo.
- Visual mais limpo para evitar confusão entre períodos.
- Filtro simplificado apenas por mês e ano.

### Análise Finny

- Painel com leitura simples dos recebimentos e gastos.
- Mostra alertas e sugestões baseadas nos dados cadastrados.
- Ajuda o usuário a entender o impacto dos pagamentos no saldo.
- Funciona sem depender de API externa de inteligência artificial.

### Exportação e compartilhamento

- Geração de card visual.
- Exportação em PDF.
- Compartilhamento pelo dispositivo quando disponível.
- Duplicação e exclusão de cards.

### Login e usuários

- Autenticação por e-mail e senha.
- Cada usuário acessa somente os próprios cards.
- Cadastro com primeiro nome obrigatório.
- Recuperação de senha por e-mail.
- Área administrativa separada para controle de acesso.

### PWA

- Instalável no celular e no computador.
- Preparado para iOS.
- Ícones e manifesto configurados.
- Experiência otimizada para telas pequenas.

---

## Experiência de uso

O Finny foi pensado para ser direto:

1. O usuário entra no app.
2. Clica em **Novo Card**.
3. Preenche o recebimento.
4. Adiciona os pagamentos.
5. Revisa o resumo.
6. Gera, exporta ou compartilha o card.

A interface evita excesso de opções na tela inicial e prioriza o que o usuário realmente precisa fazer.

---

## Segurança e privacidade

O projeto foi desenhado para separar os dados por usuário.

- Autenticação feita com Supabase Auth.
- Sessões validadas nas APIs internas.
- Dados financeiros vinculados ao usuário autenticado.
- Área administrativa separada do fluxo financeiro.
- Senhas não são acessíveis pelo administrador.
- Chaves sensíveis não devem ser expostas no repositório.

> Observação: segurança depende também das regras do banco, das variáveis de ambiente e das políticas de acesso configuradas no ambiente de produção.

---

## Tecnologias

- **React**
- **Next.js**
- **Vinext**
- **TypeScript**
- **Supabase Auth**
- **Drizzle ORM**
- **Cloudflare D1**
- **Cloudflare R2**
- **OpenAI Sites**
- **Tailwind CSS**
- **Lucide React**

---

## Estrutura do projeto

```text
app/
  AuthShell.tsx              # Login, cadastro, recuperação e sessão
  CardsFinanceirosApp.tsx    # Aplicação principal do Finny
  api/                       # Rotas internas da aplicação
  globals.css                # Estilos globais e responsividade

db/
  schema.ts                  # Schema Drizzle
  index.ts                   # Conexão com o banco

drizzle/
  *.sql                      # Migrações

public/
  assets/                    # Imagens da marca e login
  icons/                     # Ícones PWA
  manifest.webmanifest       # Manifesto do app
  sw.js                      # Service Worker

tests/
  rendered-html.test.mjs     # Testes de estrutura, PWA e fluxos principais

worker/
  index.ts                   # Entrada do worker
```

---

## Como rodar localmente

### Requisitos

- Node.js `>= 22.13.0`
- npm

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Testes

```bash
npm test
```

### Lint

```bash
npm run lint
```

---

## Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o ambiente local de desenvolvimento |
| `npm run build` | Gera o build de produção |
| `npm run start` | Inicia a versão de produção local |
| `npm test` | Executa build e testes estruturais |
| `npm run lint` | Executa o ESLint |
| `npm run db:generate` | Gera migrações do Drizzle |

---

## Publicação

O app usa **OpenAI Sites** para hospedagem.

A configuração do projeto fica em:

```text
.openai/hosting.json
```

Antes de publicar uma nova versão, rode:

```bash
npm test
npm run lint
```

---

## Princípios do projeto

- Interface simples antes de interface cheia.
- Poucos cliques para criar um card.
- Dados financeiros separados por usuário.
- App utilizável no celular como PWA.
- Visual moderno, mas sem confundir o usuário.
- Recursos novos devem melhorar clareza, não poluir a experiência.

---

## Roadmap possível

- Relatórios mensais mais completos.
- Categorias personalizadas.
- Exportação avançada.
- Backup e sincronização aprimorados.
- Notificações de vencimento.
- Análise Finny com recomendações mais detalhadas.

---

## Autor

Projeto desenvolvido por **Angello** com apoio do Codex.

---

<p align="center">
  <strong>Finny</strong><br />
  Seu financeiro mais organizado, visual e fácil de entender.
</p>
