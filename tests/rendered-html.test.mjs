import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("uses the real authenticated app shell instead of the starter preview", async () => {
  const [page, layout, authShell, appShell, manifest] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/AuthShell.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/CardsFinanceirosApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"),
  ]);

  assert.match(page, /import AuthShell from "\.\/AuthShell"/);
  assert.match(page, /return <AuthShell \/>/);
  assert.match(layout, /title:\s*"Finny"/);
  assert.match(layout, /applicationName:\s*"Finny"/);
  assert.match(layout, /icon:\s*"\/favicon\.png"/);
  assert.match(manifest, /"name":\s*"Finny"/);
  assert.match(manifest, /"short_name":\s*"Finny"/);
  assert.match(appShell, /<strong>Finny<\/strong>/);
  assert.match(appShell, /src="\/assets\/brand\/finny-logo\.png"/);
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

test("keeps Finny PWA branding and removes obsolete starter assets", async () => {
  const [layout, appShell, manifest, offline, serviceWorker] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/CardsFinanceirosApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"),
    readFile(new URL("../public/offline.html", import.meta.url), "utf8"),
    readFile(new URL("../public/sw.js", import.meta.url), "utf8"),
  ]);

  const pwaSurface = layout + appShell + manifest + offline + serviceWorker;

  assert.match(layout, /title:\s*"Finny"/);
  assert.match(appShell, /\/assets\/brand\/finny-logo\.png/);
  assert.match(manifest, /"name":\s*"Finny"/);
  assert.match(manifest, /"short_name":\s*"Finny"/);
  assert.match(offline, /<h1>Finny<\/h1>/);
  assert.match(serviceWorker, /finny-pwa-v4/);
  assert.doesNotMatch(
    pwaSurface,
    /favicon\.svg|window\.svg|file\.svg|globe\.svg|assets\/mascot|loading-character\.mp4/,
  );
});

test("keeps the authenticated app usable on mobile screens", async () => {
  const [appShell, css] = await Promise.all([
    readFile(new URL("../app/CardsFinanceirosApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  const mobileCss = css.slice(css.indexOf("@media (max-width: 620px)"));

  assert.match(appShell, /className="mobile-bottom-nav"/);
  assert.match(appShell, /aria-label="Menu principal mobile"/);
  assert.match(appShell, /className=\{`mobile-nav-item/);
  assert.match(mobileCss, /\.mobile-bottom-nav\s*\{[\s\S]*position:\s*fixed/);
  assert.match(mobileCss, /\.mobile-bottom-nav\s*\{[\s\S]*display:\s*flex/);
  assert.match(mobileCss, /\.workspace\s*\{[\s\S]*padding-bottom:\s*calc\(104px \+ env\(safe-area-inset-bottom\)\)/);
  assert.match(mobileCss, /\.payment-item \.icon-button\s*\{[\s\S]*width:\s*100%/);
  assert.match(mobileCss, /\.access-row\s*\{[\s\S]*grid-template-columns:\s*1fr/);
  assert.match(css, /@media \(max-width: 420px\)[\s\S]*\.summary-panel\s*\{[\s\S]*grid-template-columns:\s*1fr/);
});

test("keeps the usability test flow focused and guided", async () => {
  const [appShell, css] = await Promise.all([
    readFile(new URL("../app/CardsFinanceirosApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(appShell, /type EditorStepId = "receipt" \| "payments" \| "review"/);
  assert.match(appShell, /const editorSteps/);
  assert.match(appShell, /function EditorStepper/);
  assert.match(appShell, /function ReviewStep/);
  assert.match(appShell, /function duplicateCard/);
  assert.match(appShell, /Continuar/);
  assert.match(appShell, /Revisar card/);
  assert.match(appShell, /Finalizar card/);
  assert.match(appShell, /Gerar Card/);
  assert.match(appShell, /Exportar PDF/);
  assert.match(appShell, /Compartilhar/);
  assert.match(appShell, /Duplicar card/);
  assert.match(appShell, /Excluir card/);
  assert.doesNotMatch(appShell, /Exportar PNG|Exportar JPG|Copiar imagem/);
  assert.match(appShell, /className="quick-search"/);
  assert.match(appShell, /className="home-disclosure"/);
  assert.match(appShell, /className=\{`status-pill/);
  assert.match(appShell, /type HistoryMonthGroup/);
  assert.match(appShell, /function formatHistorySummaryCurrency/);
  assert.match(appShell, /className="history-month-summary"/);
  assert.match(appShell, /Sobrou/);
  assert.match(appShell, /Recebido/);
  assert.match(appShell, /Pago/);
  assert.match(css, /\.editor-stepper/);
  assert.match(css, /\.stepper-item\.is-active/);
  assert.match(css, /\.review-grid/);
  assert.match(css, /\.quick-search/);
  assert.match(css, /\.home-disclosure/);
  assert.match(css, /\.status-pill\.success/);
  assert.match(css, /\.history-group\s*\{/);
  assert.match(css, /border-left:\s*4px solid rgba\(34, 197, 94, 0\.82\)/);
  assert.match(css, /\.history-month-header/);
  assert.match(css, /\.history-month-title h3::before/);
  assert.match(css, /\.history-month-pill\.success/);
  assert.match(css, /\.history-card-row/);
  assert.doesNotMatch(css, /\.card-preview-frame|\.versions-list|\.format-select/);
});
