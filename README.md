# Finny

Aplicativo financeiro para criar cards de recebimentos, registrar pagamentos,
acompanhar saldo, consultar historico e compartilhar resumos.

## Estrutura

- `app/`: telas, autenticacao, APIs e experiencia principal.
- `db/`: conexao e schema Drizzle.
- `drizzle/`: migracoes do banco.
- `public/`: icones PWA, imagens da marca e assets da tela de login.
- `worker/`: entrada Cloudflare Worker usada pelo Vinext/Sites.
- `build/`: plugin local para empacotar metadados do Sites no build.
- `tests/`: verificacoes de estrutura, login, PWA e assets principais.

## Comandos

```bash
npm install
npm run dev
npm run build
npm test
npm run lint
```

## Publicacao

O projeto usa OpenAI Sites com a configuracao em `.openai/hosting.json`.
Antes de publicar, rode `npm test` e `npm run lint`.
