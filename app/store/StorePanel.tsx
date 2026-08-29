"use client";

import { BarChart3, Boxes, CheckCircle2, PackageMinus, PackagePlus, Pencil, Plus, RefreshCw, Save, Search, Trash2, Wallet, X } from "lucide-react";
import { useMemo, useState } from "react";

type StoreFlavor = { id: string; name: string; stockQuantity: number };
type StoreProduct = {
  id: string; name: string; category: string; sku: string; costCents: number; priceCents: number;
  stockQuantity: number; minStockQuantity: number; flavors: StoreFlavor[]; active: boolean;
  createdAt: string; updatedAt: string; createdByUserId: string; updatedByUserId: string;
};
type StoreInventoryMovement = {
  id: string; productId: string; type: "entry" | "sale" | "adjustment" | "initial";
  quantityDelta: number; quantityAfter: number; unitAmountCents: number; flavorId: string; flavorName: string;
  note: string; createdAt: string; createdByUserId: string; createdByName: string;
};
type StoreProductDraft = {
  id: string; name: string; category: string; sku: string; costCents: number; priceCents: number;
  stockQuantity: number; minStockQuantity: number; flavors: StoreFlavor[]; markupPercent: number;
};
type StoreMovementInput = { productId?: string; type?: "entry" | "sale"; quantity?: number; note?: string; flavorId?: string };

export function StorePanel({
  isLoading, message, movementNote, movementQuantity, movementType, productDraft, products, selectedProductId,
  movements, onArchiveProduct, onCancelProductEdit, onEditProduct, onMovementNoteChange, onMovementQuantityChange,
  onMovementTypeChange, onProductDraftChange, onRefresh, onSaveMovement, onSaveProduct, onSelectProduct,
}: {
  isLoading: boolean; message: string; movementNote: string; movementQuantity: string; movementType: "entry" | "sale";
  productDraft: StoreProductDraft; products: StoreProduct[]; selectedProductId: string; movements: StoreInventoryMovement[];
  onArchiveProduct: (product: StoreProduct) => void; onCancelProductEdit: () => void; onEditProduct: (product: StoreProduct) => void;
  onMovementNoteChange: (value: string) => void; onMovementQuantityChange: (value: string) => void;
  onMovementTypeChange: (value: "entry" | "sale") => void; onProductDraftChange: (draft: StoreProductDraft) => void;
  onRefresh: () => void; onSaveMovement: (input?: StoreMovementInput) => Promise<boolean>; onSaveProduct: () => Promise<boolean>;
  onSelectProduct: (productId: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(selectedProductId);
  const [panel, setPanel] = useState<"product" | "movement" | null>(null);
  const [movementFlavorId, setMovementFlavorId] = useState("");
  const normalized = search.trim().toLocaleLowerCase("pt-BR");
  const visible = useMemo(() => normalized ? products.filter((p) => `${p.name} ${p.category}`.toLocaleLowerCase("pt-BR").includes(normalized)) : products, [products, normalized]);
  const totalUnits = products.reduce((sum, p) => sum + p.stockQuantity, 0);
  const invested = products.reduce((sum, p) => sum + p.stockQuantity * p.costCents, 0);
  const projectedRevenue = products.reduce((sum, p) => sum + p.stockQuantity * p.priceCents, 0);
  const projectedProfit = projectedRevenue - invested;
  const selected = products.find((p) => p.id === selectedProductId) ?? null;
  const saleHistory = movements.filter((m) => m.type === "sale");

  const currency = (cents: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
  const setDraft = (patch: Partial<StoreProductDraft>) => onProductDraftChange({ ...productDraft, ...patch });
  const setMarkup = (percent: number) => setDraft({ markupPercent: percent, priceCents: Math.round(productDraft.costCents * (1 + percent / 100)) });

  function startProduct(product?: StoreProduct) {
    if (product) onEditProduct(product); else onCancelProductEdit();
    setPanel("product");
  }
  function startMovement(product: StoreProduct, type: "entry" | "sale") {
    onSelectProduct(product.id); onMovementTypeChange(type); onMovementQuantityChange("1"); onMovementNoteChange("");
    setMovementFlavorId(product.flavors[0]?.id ?? ""); setPanel("movement");
  }
  async function saveMovement() {
    const ok = await onSaveMovement({ productId: selected?.id, type: movementType, quantity: Number(movementQuantity) || 0, note: movementNote, flavorId: movementFlavorId });
    if (ok) setPanel(null);
  }
  async function quickSale(product: StoreProduct) {
    if (!product.flavors.length || product.stockQuantity <= 0) return;
    onSelectProduct(product.id); setMovementFlavorId(product.flavors.find((f) => f.stockQuantity > 0)?.id ?? product.flavors[0].id);
    const ok = await onSaveMovement({ productId: product.id, type: "sale", quantity: 1, note: "", flavorId: product.flavors.find((f) => f.stockQuantity > 0)?.id ?? product.flavors[0].id });
    if (ok) setPanel(null);
  }

  return (
    <section className="store-page">
      <section className="store-summary" aria-label="Resumo da loja">
        <MetricTile icon={<Boxes size={19} />} label="Produtos" value={String(products.length)} />
        <MetricTile icon={<PackagePlus size={19} />} label="Em estoque" value={`${totalUnits} un.`} tone={totalUnits ? "success" : "neutral"} />
        <MetricTile icon={<Wallet size={19} />} label="Investido" value={currency(invested)} />
        <MetricTile icon={<BarChart3 size={19} />} label="Faturamento potencial" value={currency(projectedRevenue)} hint={`${currency(projectedProfit)} de lucro`} tone={projectedProfit >= 0 ? "success" : "danger"} />
      </section>

      {message ? <div className="notice store-notice" role="status"><CheckCircle2 size={18} />{message}</div> : null}

      <div className="store-quick-layout">
        <section className="store-inventory-panel store-products-panel" aria-labelledby="store-products-title">
          <div className="section-heading">
            <div><span className="eyebrow">Estoque</span><h2 id="store-products-title">Produtos</h2></div>
            <div className="store-heading-actions">
              <button className="ghost-action" type="button" onClick={onRefresh} disabled={isLoading}><RefreshCw size={16} />Atualizar</button>
              <button className="secondary-action" type="button" onClick={() => startProduct()}><Plus size={17} />Novo produto</button>
            </div>
          </div>
          <label className="store-search"><Search size={17} /><span className="sr-only">Buscar produto</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar produto..." />{search ? <button type="button" onClick={() => setSearch("")} aria-label="Limpar busca"><X size={16} /></button> : null}</label>

          {visible.length ? <div className="store-product-list store-product-list-quick">
            {visible.map((product) => {
              const expanded = expandedId === product.id;
              return <article className={`store-product-row store-product-card ${expanded ? "is-expanded" : ""}`} key={product.id}>
                <button className="store-product-open" type="button" onClick={() => { setExpandedId(expanded ? "" : product.id); onSelectProduct(product.id); }}>
                  <span className="store-product-icon"><Boxes size={18} /></span>
                  <span className="store-product-main"><strong>{product.name}</strong><small>{product.category || "Sem categoria"} · {product.flavors.length} {product.flavors.length === 1 ? "sabor" : "sabores"}</small></span>
                  <span className="store-product-numbers"><strong>{product.stockQuantity} un.</strong><small>Custo {currency(product.costCents)} · Venda {currency(product.priceCents)}</small></span>
                </button>
                {expanded ? <div className="store-flavor-grid" aria-label={`Sabores de ${product.name}`}>
                  {product.flavors.map((flavor) => <div className="store-flavor-card" key={flavor.id}><div><strong>{flavor.name}</strong><span>{flavor.stockQuantity} unidade(s)</span></div><button className="ghost-action compact" type="button" onClick={() => { startMovement(product, "sale"); setMovementFlavorId(flavor.id); }} disabled={!flavor.stockQuantity}><PackageMinus size={15} />Vender</button></div>)}
                  {!product.flavors.length ? <p className="store-empty-flavors">Nenhum sabor cadastrado.</p> : null}
                </div> : null}
                <div className="store-product-quick-actions">
                  <button className="primary-action compact" type="button" onClick={() => void quickSale(product)} disabled={isLoading || product.stockQuantity <= 0}><PackageMinus size={16} />Vendi 1</button>
                  <button className="ghost-action compact" type="button" onClick={() => startMovement(product, "entry")}><PackagePlus size={16} />Entrada</button>
                  <button className="ghost-action compact" type="button" onClick={() => startProduct(product)}><Pencil size={16} />Editar</button>
                  <button className="icon-button danger" type="button" onClick={() => onArchiveProduct(product)} aria-label={`Arquivar ${product.name}`}><Trash2 size={16} /></button>
                </div>
              </article>;
            })}
          </div> : <EmptyState icon={<Search size={26} />} title={products.length ? "Nenhum produto encontrado" : "Estoque vazio"} text={products.length ? "Limpe a busca ou procure outro nome." : "Cadastre seu primeiro produto para começar."} />}
        </section>

        <aside className="store-side-panel" aria-label="Ações da loja">
          {panel === "product" ? <form className="store-action-panel store-product-form" onSubmit={(e) => { e.preventDefault(); void onSaveProduct().then((ok) => ok && setPanel(null)); }}>
            <div className="section-heading"><div><span className="eyebrow">Cadastro</span><h2>{productDraft.id ? "Editar produto" : "Novo produto"}</h2></div><button className="icon-button" type="button" onClick={() => { onCancelProductEdit(); setPanel(null); }} aria-label="Fechar"><X size={16} /></button></div>
            <div className="form-grid store-compact-form">
              <label className="field field-wide"><span>Produto</span><input value={productDraft.name} onChange={(e) => setDraft({ name: e.target.value })} placeholder="Ex.: Elfbar 30K" autoFocus /></label>
              <label className="field"><span>Categoria</span><input value={productDraft.category} onChange={(e) => setDraft({ category: e.target.value })} placeholder="Pods" /></label>
              <label className="field"><span>Quanto você pagou</span><input inputMode="numeric" value={productDraft.costCents ? currency(productDraft.costCents) : ""} onChange={(e) => setDraft({ costCents: Number(e.target.value.replace(/\D/g, "")), priceCents: Math.round(Number(e.target.value.replace(/\D/g, "")) * (1 + productDraft.markupPercent / 100)) })} placeholder="R$ 0,00" /></label>
            </div>
            <div className="store-pricing-box"><div><strong>Preço de venda</strong><span>Escolha sua margem sobre o valor pago</span></div><div className="store-price-presets"><button type="button" className={productDraft.markupPercent === 50 ? "is-active" : ""} onClick={() => setMarkup(50)}>50%<small>{currency(Math.round(productDraft.costCents * 1.5))}</small></button><button type="button" className={productDraft.markupPercent === 70 ? "is-active" : ""} onClick={() => setMarkup(70)}>70%<small>{currency(Math.round(productDraft.costCents * 1.7))}</small></button><button type="button" className={productDraft.markupPercent !== 50 && productDraft.markupPercent !== 70 ? "is-active" : ""} onClick={() => setMarkup(productDraft.markupPercent)}>Personalizar<small>{productDraft.markupPercent}% · {currency(productDraft.priceCents)}</small></button></div><label className="field"><span>Margem personalizada (%)</span><input inputMode="decimal" type="number" min="0" value={productDraft.markupPercent} onChange={(e) => setMarkup(Number(e.target.value) || 0)} /></label></div>
            <div className="store-flavor-editor"><div className="section-heading"><div><span className="eyebrow">Variações</span><h3>Sabores</h3></div><button className="secondary-action compact" type="button" onClick={() => setDraft({ flavors: [...productDraft.flavors, { id: crypto.randomUUID(), name: "", stockQuantity: 0 }] })}><Plus size={15} />Adicionar sabor</button></div>{productDraft.flavors.map((flavor, index) => <div className="store-flavor-edit-row" key={flavor.id}><input value={flavor.name} onChange={(e) => setDraft({ flavors: productDraft.flavors.map((f, i) => i === index ? { ...f, name: e.target.value } : f) })} placeholder={`Sabor ${index + 1}`} /><input inputMode="numeric" value={flavor.stockQuantity || ""} onChange={(e) => setDraft({ flavors: productDraft.flavors.map((f, i) => i === index ? { ...f, stockQuantity: Number(e.target.value.replace(/\D/g, "")) || 0 } : f) })} placeholder="Qtd." /><button className="icon-button danger" type="button" onClick={() => setDraft({ flavors: productDraft.flavors.filter((f) => f.id !== flavor.id) })} aria-label={`Remover sabor ${flavor.name || index + 1}`}><Trash2 size={15} /></button></div>)}{!productDraft.flavors.length ? <p className="store-helper">Adicione os sabores que você vende e informe a quantidade de cada um.</p> : null}</div>
            <div className="store-panel-footer"><button className="ghost-action" type="button" onClick={() => { onCancelProductEdit(); setPanel(null); }}>Cancelar</button><button className="secondary-action" type="submit" disabled={isLoading}><Save size={17} />Salvar produto</button></div>
          </form> : null}

          {panel === "movement" ? <form className="store-action-panel store-movement-form" onSubmit={(e) => { e.preventDefault(); void saveMovement(); }}>
            <div className="section-heading"><div><span className="eyebrow">Estoque</span><h2>{movementType === "sale" ? "Registrar venda" : "Registrar entrada"}</h2></div><button className="icon-button" type="button" onClick={() => setPanel(null)} aria-label="Fechar"><X size={16} /></button></div>
            <div className="store-selected-product"><strong>{selected?.name ?? "Produto"}</strong><span>{selected?.stockQuantity ?? 0} unidade(s) no total</span></div>
            <div className="store-mode-toggle"><button type="button" className={movementType === "sale" ? "is-active" : ""} onClick={() => onMovementTypeChange("sale")}><PackageMinus size={16} />Venda</button><button type="button" className={movementType === "entry" ? "is-active" : ""} onClick={() => onMovementTypeChange("entry")}><PackagePlus size={16} />Entrada</button></div>
            <label className="field"><span>Sabor</span><select value={movementFlavorId} onChange={(e) => setMovementFlavorId(e.target.value)}><option value="">Selecione o sabor</option>{selected?.flavors.map((flavor) => <option key={flavor.id} value={flavor.id}>{flavor.name} · {flavor.stockQuantity} un.</option>)}</select></label>
            <div className="form-grid store-compact-form"><label className="field"><span>Quantidade</span><input inputMode="numeric" value={movementQuantity} onChange={(e) => onMovementQuantityChange(e.target.value.replace(/\D/g, ""))} /></label><label className="field"><span>Observação</span><input value={movementNote} onChange={(e) => onMovementNoteChange(e.target.value)} placeholder="Opcional" /></label></div>
            <button className="primary-action full" type="submit" disabled={isLoading || !selected || !movementFlavorId}>{movementType === "sale" ? <PackageMinus size={18} /> : <PackagePlus size={18} />}{movementType === "sale" ? "Registrar venda" : "Registrar entrada"}</button>
          </form> : null}

          {!panel ? <div className="store-action-panel store-side-empty"><Boxes size={32} /><h2>Controle da loja</h2><p>Selecione um produto para ver os sabores e quantidades, ou cadastre um novo produto.</p><button className="primary-action" type="button" onClick={() => startProduct()}><Plus size={18} />Novo produto</button>{saleHistory.length ? <small>{saleHistory.length} venda(s) registrada(s) no histórico.</small> : null}</div> : null}
        </aside>
      </div>
      <style jsx>{`
        .store-flavor-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px;padding:12px 14px;border-top:1px solid var(--border,#2a2f3a)}
        .store-flavor-card{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px;border:1px solid var(--border,#2a2f3a);border-radius:12px;background:var(--surface-soft,#121722)}
        .store-flavor-card div{display:grid;gap:3px}.store-flavor-card span,.store-helper,.store-empty-flavors{font-size:13px;opacity:.72}
        .store-pricing-box{display:grid;gap:14px;margin-top:18px;padding:16px;border:1px solid var(--border,#2a2f3a);border-radius:14px}.store-pricing-box>div:first-child{display:grid;gap:3px}.store-pricing-box>div:first-child span{font-size:13px;opacity:.7}.store-price-presets{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.store-price-presets button{border:1px solid var(--border,#2a2f3a);background:transparent;border-radius:11px;padding:11px;text-align:left;font-weight:700;cursor:pointer}.store-price-presets button.is-active{outline:2px solid currentColor}.store-price-presets small{display:block;margin-top:5px;font-weight:500;opacity:.7}.store-flavor-editor{margin-top:18px}.store-flavor-edit-row{display:grid;grid-template-columns:1fr 90px 38px;gap:8px;margin-top:8px}.store-flavor-edit-row input{min-width:0}.store-side-empty{display:grid;place-items:start;gap:10px;text-align:left}.store-side-empty p{margin:0;opacity:.72}.store-side-empty small{opacity:.6}
        @media(max-width:900px){.store-price-presets{grid-template-columns:1fr}.store-flavor-edit-row{grid-template-columns:1fr 75px 38px}}
      `}</style>
    </section>
  );
}

function MetricTile({ icon, label, value, hint, tone = "neutral" }: { icon: React.ReactNode; label: string; value: string; hint?: string; tone?: "neutral"|"success"|"danger" }) {
  return <div className={`metric-tile ${tone}`}><span className="metric-icon">{icon}</span><span>{label}</span><strong>{value}</strong>{hint ? <small className="metric-hint">{hint}</small> : null}</div>;
}
function EmptyState({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="empty-state"><span className="empty-state-icon">{icon}</span><strong>{title}</strong><p>{text}</p></div>;
}
