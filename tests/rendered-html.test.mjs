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
  assert.match(authShell, /requiresProfileName/);
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
  assert.match(css, /\.login-form input,\s*[\s\S]*\.login-form textarea\s*\{[\s\S]*background:\s*#ffffff/);
  assert.match(css, /\.login-page \.eyebrow\s*\{[\s\S]*color:\s*var\(--login-yellow\)/);
  assert.match(css, /\.login-button\s*\{[\s\S]*background:\s*var\(--login-blue\)/);
  assert.match(css, /\.login-form input:focus,\s*[\s\S]*\.login-form textarea:focus\s*\{[\s\S]*rgba\(37, 99, 235, 0\.68\)/);
  assert.match(css, /@keyframes login-aurora-drift/);
  assert.match(css, /@keyframes login-grid-drift/);
  assert.match(css, /\.login-loading/);
  assert.match(css, /\.login-loading-media/);
  assert.match(css, /\.login-loading-image/);
  assert.match(css, /\.login-loading-progress/);
  assert.match(css, /@keyframes login-loading-progress/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(authShell, /const SIGNIN_LOADING_MIN_MS = 5000/);
  assert.match(authShell, /function waitForMinimumLoadingTime/);
  assert.match(authShell, /waitForMinimumLoadingTime\(loadingStartedAt, SIGNIN_LOADING_MIN_MS\)/);
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
  assert.match(authShell, /firstName/);
  assert.match(authShell, /profileFirstName/);
  assert.match(authShell, /Primeiro nome/);
  assert.match(authShell, /handleProfileNameSubmit/);
  assert.match(authShell, /Salvar e abrir Finny/);
  assert.match(authShell, /supabase\.auth\.updateUser\(\{\s*data: createProfileNameMetadata/);
  assert.match(authShell, /data: createProfileNameMetadata\(normalizedFirstName\)/);
  assert.match(authShell, /function isValidProfileName/);
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
  assert.doesNotMatch(authShell + css, /FinnyMascot|mascot|assets\/mascot/);
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
  assert.match(serviceWorker, /finny-pwa-v5/);
  assert.match(serviceWorker, /const API_PREFIX = "\/api\/";/);
  assert.match(serviceWorker, /url\.pathname\.startsWith\(API_PREFIX\)\) return/);
  assert.match(serviceWorker, /networkFirstAsset\(request\)/);
  assert.doesNotMatch(serviceWorker, /staleWhileRevalidate/);
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
  assert.match(mobileCss, /\.payment-actions \.icon-button\s*\{[\s\S]*flex:\s*1 1 120px/);
  assert.match(mobileCss, /\.access-row\s*\{[\s\S]*grid-template-columns:\s*1fr/);
  assert.match(css, /@media \(max-width: 420px\)[\s\S]*\.summary-panel\s*\{[\s\S]*grid-template-columns:\s*1fr/);
});

test("adds shared store inventory for admin and partner users", async () => {
  const [
    appShell,
    css,
    schema,
    storeStorage,
    supabaseAuth,
    adminUsersRoute,
    apiError,
    shopIdRepairMigration,
  ] = await Promise.all([
    readFile(new URL("../app/CardsFinanceirosApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/store/store-storage.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/supabase-auth.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/admin/users/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/api-error.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0007_repair_empty_shop_product_ids.sql", import.meta.url), "utf8"),
  ]);

  assert.match(appShell, /"home" \| "editor" \| "store" \| "support" \| "admin"/);
  assert.match(appShell, /const STORE_SYNC_INTERVAL_MS = 12000/);
  assert.match(appShell, /type StoreMovementInput/);
  assert.match(appShell, /const canAccessStore = user\.role === "admin" \|\| user\.role === "socio"/);
  assert.match(appShell, /screen !== "store" \|\| \(user\.role !== "admin" && user\.role !== "socio"\)/);
  assert.match(appShell, /loadStoreInventory\(\{ silent: true \}\)/);
  assert.match(appShell, /<StorePanel/);
  assert.match(appShell, /store-quick-layout/);
  assert.match(appShell, /store-search/);
  assert.match(appShell, /Buscar produto/);
  assert.match(appShell, /Vendi 1/);
  assert.match(appShell, /Leitura rápida/);
  assert.match(appShell, /Vendidas/);
  assert.match(appShell, /Margem/);
  assert.match(appShell, /Última saída/);
  assert.match(appShell, /handleQuickSale/);
  assert.match(appShell, /onSaveMovement\(\{[\s\S]*type: "sale",[\s\S]*quantity: 1/);
  assert.match(appShell, /store-history-disclosure/);
  assert.match(appShell, /movements\.slice\(0, 8\)/);
  assert.match(appShell, /Quantidade inicial/);
  assert.match(appShell, /Investido/);
  assert.match(appShell, /Faturamento/);
  assert.match(appShell, /formatProjectedProfitHint/);
  assert.match(appShell, /Se vender tudo: lucro/);
  assert.match(appShell, /stockRevenueCents/);
  assert.match(appShell, /projectedProfitCents/);
  assert.match(appShell, /className=\{`store-movement-row \$\{[\s\S]*is-sale[\s\S]*is-entry/);
  assert.match(appShell, /movement-quantity/);
  assert.doesNotMatch(appShell, /<span>Código<\/span>|Código opcional/);
  assert.match(appShell, /<option value="socio">Sócio<\/option>/);
  assert.match(appShell, /if \(role === "socio"\) return "Sócio"/);

  assert.match(css, /\.store-page/);
  assert.match(css, /\.store-summary/);
  assert.match(css, /\.store-quick-layout/);
  assert.match(css, /\.store-search/);
  assert.match(css, /\.store-side-panel/);
  assert.match(css, /\.store-action-panel/);
  assert.match(css, /\.store-insight-panel/);
  assert.match(css, /\.store-mini-metrics/);
  assert.match(css, /\.store-product-quick-actions/);
  assert.match(css, /\.store-history-disclosure/);
  assert.match(css, /\.metric-hint/);
  assert.match(css, /\.store-product-row/);
  assert.match(css, /\.store-movement-row/);
  assert.match(css, /\.store-heading-actions \.secondary-action[\s\S]*#ffc107/);
  assert.match(css, /\.store-movement-row\.is-entry/);
  assert.match(css, /\.store-movement-row\.is-sale/);
  assert.match(css, /\.movement-quantity\.success/);
  assert.match(css, /\.movement-quantity\.danger/);
  assert.doesNotMatch(css, /\.store-action-empty/);
  assert.doesNotMatch(css, /\.store-stepper/);
  assert.match(css, /\.support-message\.is-user,[\s\S]*\.support-message\.is-visitor\s*\{[\s\S]*justify-self:\s*end/);
  assert.match(css, /\.support-message\.is-admin\s*\{[\s\S]*justify-self:\s*start/);
  assert.match(css, /@media \(max-width: 1180px\)[\s\S]*\.store-quick-layout\s*\{[\s\S]*grid-template-columns:\s*1fr/);
  assert.match(css, /@media \(max-width: 860px\)[\s\S]*\.store-summary,/);

  assert.match(schema, /export const shopProducts = sqliteTable/);
  assert.match(schema, /export const shopInventoryMovements = sqliteTable/);
  assert.match(schema, /idx_shop_products_active/);
  assert.match(schema, /idx_shop_inventory_movements_product_id/);

  assert.match(storeStorage, /export async function listStoreInventory/);
  assert.match(storeStorage, /export async function upsertStoreProduct/);
  assert.match(storeStorage, /export async function createStoreMovement/);
  assert.match(storeStorage, /existingProduct\?\.id \|\| product\.id \|\| crypto\.randomUUID\(\)/);
  assert.match(storeStorage, /quantityAfter < 0/);
  assert.match(storeStorage, /Estoque inicial/);
  assert.match(storeStorage, /Ajuste manual/);

  assert.match(supabaseAuth, /export type AppRole = "admin" \| "socio" \| "user"/);
  assert.match(supabaseAuth, /export async function requireStoreUser/);
  assert.match(supabaseAuth, /user\.role !== "admin" && user\.role !== "socio"/);
  assert.match(supabaseAuth, /Apenas administradores e sócios podem acessar a loja/);
  assert.match(adminUsersRoute, /role\?: "admin" \| "socio" \| "user"/);
  assert.match(adminUsersRoute, /payload\.role === "socio"/);

  assert.match(apiError, /technicalErrorPattern/);
  assert.match(apiError, /Failed query\|SQLITE_\|D1_/);
  assert.match(apiError, /Não foi possível concluir a ação agora/);
  assert.doesNotMatch(apiError, /return Response\.json\(\{ error: message \}/);

  assert.match(appShell, /Selecione um produto para arquivar/);
  assert.match(appShell, /Não foi possível concluir a ação agora/);
  assert.match(shopIdRepairMigration, /UPDATE `shop_products`/);
  assert.match(shopIdRepairMigration, /WHERE `id` = ''/);
});

test("keeps the usability test flow focused and guided", async () => {
  const [appShell, css, cardStorage, supabaseAuth] = await Promise.all([
    readFile(new URL("../app/CardsFinanceirosApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/api/cards/card-storage.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/supabase-auth.ts", import.meta.url), "utf8"),
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
  assert.match(appShell, /Pin,/);
  assert.match(appShell, /PinOff,/);
  assert.match(appShell, /pinned: false/);
  assert.match(appShell, /payment\.pinned && isMeaningfulPayment\(payment\)/);
  assert.match(appShell, /className=\{`payment-item \$\{payment\.pinned \? "is-pinned" : ""\}`\}/);
  assert.match(appShell, /className=\{`icon-button pin-toggle \$\{payment\.pinned \? "is-pinned" : ""\}`\}/);
  assert.match(appShell, /aria-pressed=\{payment\.pinned\}/);
  assert.match(appShell, /Fixar para duplicar junto/);
  assert.match(appShell, /type FilterState = \{\s*month: string;\s*year: string;\s*\}/);
  assert.match(appShell, /Mês e ano/);
  assert.match(appShell, /className="filter-toolbar"/);
  assert.match(appShell, /className="ghost-action filter-clear"/);
  assert.match(appShell, /Limpar/);
  assert.match(appShell, /function getCardDateParts/);
  assert.match(appShell, /\.then\(\(registration\) => registration\.update\(\)\)/);
  assert.match(appShell, /type ReleaseAnnouncement/);
  assert.match(appShell, /audienceRoles\?: AppRole\[\]/);
  assert.match(appShell, /type ReleaseGateStatus = "checking" \| "required" \| "cleared"/);
  assert.match(appShell, /const RELEASE_ACK_KEY_PREFIX = "finny:release-seen:"/);
  assert.match(appShell, /const currentRelease: ReleaseAnnouncement \| null/);
  assert.match(appShell, /Set to null when there is no active release note/);
  assert.match(appShell, /function releaseAckStorageKey\(userId: string, releaseId: string\)/);
  assert.match(appShell, /function getActiveReleaseForUser\(user: AppUser\)/);
  assert.match(appShell, /audienceRoles: \["socio"\]/);
  assert.match(appShell, /currentRelease\.audienceRoles\.includes\(user\.role\)/);
  assert.match(appShell, /activeRelease \? "checking" : "cleared"/);
  assert.match(appShell, /if \(!activeRelease\) \{[\s\S]*setReleaseGateStatus\("cleared"\)/);
  assert.match(appShell, /activeRelease && releaseGateStatus !== "cleared"/);
  assert.match(appShell, /function ReleaseGateLoading/);
  assert.match(appShell, /function ReleaseAnnouncementGate/);
  assert.match(appShell, /function getReleaseGreeting/);
  assert.match(appShell, /className=\{`release-gate/);
  assert.match(appShell, /\/assets\/brand\/finny-release-updates\.png/);
  assert.doesNotMatch(appShell, /<header className="release-gate-header">[\s\S]*className="release-gate-logo"/);
  assert.doesNotMatch(appShell, /Olá, \{user\.displayName\}/);
  assert.match(appShell, /title: "Atualização 1\.3"/);
  assert.match(appShell, /Novidades/);
  assert.match(appShell, /A Loja ficou mais rápida para cadastrar, vender e acompanhar o estoque/);
  assert.match(appShell, /Venda com um clique pelo botão Vendi 1/);
  assert.match(appShell, /Histórico da loja com cores mais fáceis de entender/);
  assert.match(appShell, /Faturamento e lucro ficaram mais claros/);
  assert.match(appShell, /Entre na aba Loja, se ela estiver liberada para seu usuário/);
  assert.doesNotMatch(appShell, /Primeiro nome obrigatório/);
  assert.match(appShell, /Ver passo a passo/);
  assert.match(appShell, /Entendi, abrir o app/);
  assert.doesNotMatch(appShell, /showReleaseAnnouncement/);
  assert.match(appShell, /parts\?\.month !== filters\.month/);
  assert.match(appShell, /parts\?\.year !== filters\.year/);
  assert.doesNotMatch(appShell, /card\.date\.split\("-"\)/);
  assert.doesNotMatch(appShell, /className="quick-search"/);
  assert.doesNotMatch(appShell, /filters\.(text|type|minValue|maxValue)/);
  assert.doesNotMatch(appShell, /Buscar cards|Valor mínimo|Valor máximo|Sem mínimo|Sem máximo/);
  assert.match(appShell, /className="home-disclosure"/);
  assert.match(appShell, /type FinnyAnalysis/);
  assert.match(appShell, /function buildFinnyAnalysis/);
  assert.match(appShell, /function FinnyAnalysisPanel/);
  assert.match(appShell, /Análise Finny/);
  assert.match(appShell, /Recebimento muito comprometido/);
  assert.match(appShell, /Pagamento de maior impacto/);
  assert.match(appShell, /Categoria que mais puxou/);
  assert.match(appShell, /Recorrentes preparados/);
  assert.doesNotMatch(appShell, /function StatisticsPanel|Resumo do mês|Evolução mensal|Por categoria/);
  assert.match(appShell, /className=\{`status-pill/);
  assert.match(appShell, /type HistoryMonthGroup/);
  assert.match(appShell, /function formatHistorySummaryCurrency/);
  assert.match(appShell, /className="history-month-summary"/);
  assert.match(appShell, /className="history-card-date"/);
  assert.match(appShell, /Sobrou/);
  assert.match(appShell, /Recebido/);
  assert.match(appShell, /Pago/);
  assert.doesNotMatch(appShell, /saldo \{formatCurrency\(metrics\.balanceCents\)\}/);
  assert.match(css, /\.editor-stepper/);
  assert.match(css, /\.stepper-item\.is-active/);
  assert.match(css, /\.review-grid/);
  assert.doesNotMatch(css, /\.quick-search|\.input-with-icon/);
  assert.match(css, /\.filter-toolbar/);
  assert.match(css, /\.filter-clear/);
  assert.match(css, /\.analysis-panel/);
  assert.match(css, /\.analysis-hero/);
  assert.match(css, /\.analysis-metrics/);
  assert.match(css, /\.analysis-list/);
  assert.doesNotMatch(css, /\.stats-panel|\.stats-grid|\.stat-item|\.monthly-chart|\.category-chart/);
  assert.match(css, /@media \(max-width: 860px\)[\s\S]*\.filter-toolbar\s*\{[\s\S]*grid-template-columns:\s*1fr/);
  assert.match(css, /\.home-disclosure/);
  assert.match(css, /\.status-pill\.success/);
  assert.match(css, /\.history-group\s*\{/);
  assert.match(css, /border-left:\s*4px solid rgba\(34, 197, 94, 0\.82\)/);
  assert.match(css, /\.history-month-header/);
  assert.match(css, /\.history-month-title h3::before/);
  assert.match(css, /\.history-month-pill\.success/);
  assert.match(css, /\.history-card-date/);
  assert.match(css, /\.release-gate/);
  assert.match(css, /\.release-gate-panel/);
  assert.match(css, /\.release-gate-hero/);
  assert.match(css, /\.release-gate-header\s*\{[\s\S]*display:\s*block/);
  assert.match(css, /\.release-gate-art/);
  assert.match(css, /\.release-gate-actions/);
  assert.match(css, /\.release-highlights/);
  assert.match(css, /\.release-steps/);
  assert.doesNotMatch(css, /\.release-announcement/);
  assert.match(css, /@media \(max-width: 860px\)[\s\S]*\.release-gate-loading,[\s\S]*\.release-gate-summary,[\s\S]*\.release-highlights\s*\{[\s\S]*grid-template-columns:\s*1fr/);
  assert.match(css, /\.history-card-row/);
  assert.match(css, /\.payment-actions/);
  assert.match(css, /\.payment-item\.is-pinned/);
  assert.match(css, /\.pin-toggle\.is-pinned/);
  assert.match(cardStorage, /pinned: boolean/);
  assert.match(cardStorage, /pinned: Boolean\(payment\.pinned\)/);
  assert.match(cardStorage, /parseJson<Payment\[\]>\(row\.paymentsJson, \[\]\)\.map\(normalizePayment\)/);
  assert.match(supabaseAuth, /requiresProfileName: !profileName\.hasRealName/);
  assert.match(supabaseAuth, /function getSupabaseProfileName/);
  assert.match(supabaseAuth, /metadataText\(metadata, "full_name"\)/);
  assert.match(supabaseAuth, /metadataText\(metadata, "display_name"\)/);
  assert.match(supabaseAuth, /function isRealDisplayName/);
  assert.doesNotMatch(css, /\.card-preview-frame|\.versions-list|\.format-select/);
});
