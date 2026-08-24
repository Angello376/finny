import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("uses the real authenticated app shell instead of the starter preview", async () => {
  const [page, layout, authShell] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/AuthShell.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(page, /import AuthShell from "\.\/AuthShell"/);
  assert.match(page, /return <AuthShell \/>/);
  assert.match(layout, /title:\s*"Cards Financeiros"/);
  assert.match(authShell, /session && user/);
  assert.match(authShell, /<CardsFinanceirosApp/);
  assert.doesNotMatch(authShell, /FinnyMascot|LoginFinny|LOGIN_FINNY/);
  assert.doesNotMatch(page + layout + authShell, /_sites-preview|SkeletonPreview|react-loading-skeleton/);
});

test("uses the requested animated login palette without mascot UI", async () => {
  const [authShell, css] = await Promise.all([
    readFile(new URL("../app/AuthShell.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(css, /\.login-page::before/);
  assert.match(css, /\.login-page::after/);
  assert.match(css, /--login-panel:\s*#f8fafc/);
  assert.match(css, /--login-muted:\s*#e5e7eb/);
  assert.match(css, /--login-gray:\s*#374151/);
  assert.match(css, /--login-navy:\s*#0d182a/);
  assert.match(css, /--login-blue-strong:\s*#1e3aba/);
  assert.match(css, /--login-blue:\s*#2563eb/);
  assert.match(css, /--login-green:\s*#22c55e/);
  assert.match(css, /--login-yellow:\s*#ffc107/);
  assert.match(css, /\.login-page\s*\{[\s\S]*background:\s*[\s\S]*var\(--login-navy\);/);
  assert.match(css, /\.login-panel\s*\{[\s\S]*var\(--login-panel\)/);
  assert.match(css, /\.login-form span\s*\{[\s\S]*color:\s*var\(--login-gray\)/);
  assert.match(css, /\.login-form input\s*\{[\s\S]*background:\s*#ffffff/);
  assert.match(css, /\.login-page \.eyebrow\s*\{[\s\S]*color:\s*var\(--login-yellow\)/);
  assert.match(css, /\.login-button\s*\{[\s\S]*background:\s*var\(--login-blue\)/);
  assert.match(css, /\.login-form input:focus\s*\{[\s\S]*rgba\(37, 99, 235, 0\.68\)/);
  assert.match(css, /@keyframes login-aurora-drift/);
  assert.match(css, /@keyframes login-grid-drift/);
  assert.match(css, /\.login-loading/);
  assert.match(css, /\.login-loading-media/);
  assert.match(css, /\.login-loading-image/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(authShell, /PendingAuthAction/);
  assert.match(authShell, /isSubmitting/);
  assert.match(authShell, /<LoginLoadingScreen message=\{authLoadingMessage/);
  assert.match(authShell, /function LoginLoadingScreen/);
  assert.match(authShell, /function LoadingCharacterImage/);
  assert.match(css, /\.login-loading-screen/);
  assert.match(css, /\.login-loading-screen \.login-loading-message/);
  assert.match(authShell, /Validando acesso/);
  assert.match(authShell, /className="login-loading-image"/);
  assert.match(authShell, /src="\/assets\/login\/loading-character\.png"/);
  assert.doesNotMatch(authShell, /removeConnectedSolidBackground|isRemovableBackground|getImageData|putImageData/);
  assert.match(authShell, /Esqueci minha senha/);
  assert.match(authShell, /Primeiro acesso\? Criar senha/);
  assert.match(authShell, /Criar minha senha/);
  assert.match(authShell, /Eye,/);
  assert.match(authShell, /EyeOff,/);
  assert.match(authShell, /aria-label=\{showPassword \? "Ocultar senha" : "Mostrar senha"\}/);
  assert.match(authShell, /isPasswordFocused/);
  assert.match(authShell, /setIsPasswordFocused\(true\)/);
  assert.match(authShell, /passwordCharacterActive=\{isPasswordCharacterActive\}/);
  assert.match(authShell, /className=\{`login-character-stage/);
  assert.match(authShell, /login-character-image is-welcome/);
  assert.match(authShell, /login-character-image is-password/);
  assert.match(authShell, /src="\/assets\/login\/welcome-character\.png"/);
  assert.match(authShell, /src="\/assets\/login\/password-character\.png"/);
  assert.match(css, /\.login-character-stage/);
  assert.match(css, /\.login-character-image/);
  assert.match(css, /\.login-character-stage\.is-password \.login-character-image\.is-password/);
  assert.match(css, /@keyframes login-character-enter/);
  assert.match(css, /@keyframes login-character-float/);
  assert.match(css, /prefers-reduced-motion[\s\S]*\.login-character-stage/);
  assert.match(css, /prefers-reduced-motion[\s\S]*\.login-character-image/);
  assert.doesNotMatch(authShell, /<h1 id="login-title">Cards Financeiros<\/h1>/);
  assert.doesNotMatch(authShell + css, /Finny|finny|mascot|assets\/mascot/);
});

test("keeps the local login preview aligned with the app login", async () => {
  const [authShell, css, preview] = await Promise.all([
    readFile(new URL("../app/AuthShell.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../work/login-background-preview.html", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(authShell + css + preview, /Finny|finny|mascot|assets\/mascot/);
  assert.doesNotMatch(authShell + css + preview, /login-finny|finny-login|finny-mascot/);
  assert.match(preview, /aurora-drift/);
  assert.match(preview, /grid-drift/);
  assert.match(preview, /login-loading/);
  assert.match(preview, /Esqueci minha senha/);
  assert.match(preview, /Primeiro acesso\? Criar senha/);
  assert.match(preview, /Criar minha senha/);
  assert.match(preview, /panel\.hidden = true/);
  assert.match(preview, /loadingScreen\.hidden = false/);
  assert.match(preview, /login-loading-screen/);
  assert.match(preview, /\.login-loading-screen \.login-loading-message/);
  assert.match(preview, /login-loading-media/);
  assert.match(preview, /login-loading-image/);
  assert.match(preview, /src="\.\.\/public\/assets\/login\/loading-character\.png"/);
  assert.doesNotMatch(preview, /renderTransparentLoadingFrame|removeConnectedSolidBackground|isRemovableBackground|getImageData|putImageData/);
  assert.doesNotMatch(authShell + css + preview, /login-loader|loader-ring|loader-scan|loader-bars/);
  assert.match(preview, /class="login-character-stage"/);
  assert.match(preview, /login-character-image is-welcome/);
  assert.match(preview, /login-character-image is-password/);
  assert.match(preview, /src="\.\.\/public\/assets\/login\/welcome-character\.png"/);
  assert.match(preview, /src="\.\.\/public\/assets\/login\/password-character\.png"/);
  assert.match(preview, /password\.addEventListener\("focus", syncCharacterPose\)/);
  assert.match(preview, /password\.addEventListener\("input", syncCharacterPose\)/);
  assert.match(preview, /classList\.toggle\(\s*"is-password"/);
  assert.match(preview, /character-enter/);
  assert.match(preview, /character-float/);
  assert.match(preview, /--panel:\s*#f8fafc/);
  assert.match(preview, /--muted:\s*#e5e7eb/);
  assert.match(preview, /--gray:\s*#374151/);
  assert.match(preview, /body\s*\{[\s\S]*background:\s*[\s\S]*var\(--navy\);/);
  assert.match(preview, /\.login-panel\s*\{[\s\S]*var\(--panel\)/);
  assert.match(preview, /color:\s*var\(--gray\)/);
  assert.match(preview, /color:\s*var\(--yellow\)/);
  assert.match(preview, /--blue:\s*#2563eb/);
  assert.match(preview, /background:\s*var\(--blue\)/);
  assert.doesNotMatch(preview, />Cards Financeiros</);
  assert.match(preview, /<svg viewBox="0 0 24 24" aria-hidden="true">/);
  assert.match(preview, /aria-label="Mostrar senha"/);
  assert.doesNotMatch(preview, />Ver<\/button>|>Ocultar<\/button>/);
});
