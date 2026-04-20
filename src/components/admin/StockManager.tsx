import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RefreshCw, Package, RotateCcw } from "lucide-react";

interface VariationOption {
  value: string;
  price: number | null;
  image?: string | null;
}

interface Variation {
  id: string;
  name: string;
  options: (string | VariationOption)[];
}

interface Product {
  id: number;
  name: string;
  sizes: string[] | null;
  variations: Variation[] | null;
  image_url: string | null;
  images: string[] | null;
  is_active: boolean;
}

interface StockEntry {
  product_id: number;
  size: string;
  quantity: number;
}

interface StockManagerProps {
  products: Product[];
}

function getOptionValue(opt: string | VariationOption): string {
  return typeof opt === "string" ? opt : opt.value;
}

function getProductSizes(product: Product): string[] {
  // Prioriza a variação "Tamanho"/"Tamanhos" (igual ao ProductFormModal)
  if (product.variations && product.variations.length > 0) {
    const sizeVar = product.variations.find(
      (v) => v.name.toLowerCase() === "tamanho" || v.name.toLowerCase() === "tamanhos"
    );
    if (sizeVar && sizeVar.options.length > 0) {
      return sizeVar.options.map(getOptionValue);
    }
  }
  // Fallback para o campo sizes
  if (product.sizes && product.sizes.length > 0) return product.sizes;
  return [];
}

export default function StockManager({ products }: StockManagerProps) {
  const [stock, setStock] = useState<Record<string, number>>({});
  const [rawInputs, setRawInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [globalSyncQty, setGlobalSyncQty] = useState<string>("");
  const [globalSyncing, setGlobalSyncing] = useState(false);
  const [productSyncQty, setProductSyncQty] = useState<Record<number, string>>({});
  const [productSyncing, setProductSyncing] = useState<Record<number, boolean>>({});

  const stockKey = (productId: number, size: string) => `${productId}__${size}`;

  const loadStock = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("product_stock")
      .select("product_id, size, quantity");

    if (error) {
      toast.error("Erro ao carregar estoque");
    } else {
      const map: Record<string, number> = {};
      (data as StockEntry[]).forEach((row) => {
        map[stockKey(row.product_id, row.size)] = row.quantity;
      });
      setStock(map);
      setRawInputs({});
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadStock();
  }, [loadStock]);

  const upsertStock = async (productId: number, size: string, quantity: number) => {
    const key = stockKey(productId, size);
    setSaving((prev) => ({ ...prev, [key]: true }));

    const { error } = await supabase.from("product_stock").upsert(
      { product_id: productId, size, quantity },
      { onConflict: "product_id,size" }
    );

    if (error) {
      toast.error(`Erro ao salvar estoque de ${size}`);
    } else {
      setStock((prev) => ({ ...prev, [key]: quantity }));
    }
    setSaving((prev) => ({ ...prev, [key]: false }));
  };

  const handleQuantityChange = (productId: number, size: string, value: string) => {
    const key = stockKey(productId, size);
    setRawInputs((prev) => ({ ...prev, [key]: value }));
  };

  const handleQuantityBlur = (productId: number, size: string) => {
    const key = stockKey(productId, size);
    const raw = rawInputs[key];
    if (raw === undefined) return; // não houve edição
    const qty = parseInt(raw, 10);
    const finalQty = isNaN(qty) || qty < 0 ? 0 : qty;
    setRawInputs((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setStock((prev) => ({ ...prev, [key]: finalQty }));
    upsertStock(productId, size, finalQty);
  };

  const getDisplayValue = (productId: number, size: string): string => {
    const key = stockKey(productId, size);
    if (key in rawInputs) return rawInputs[key];
    return String(stock[key] ?? 0);
  };

  const getCommittedQty = (productId: number, size: string): number => {
    const key = stockKey(productId, size);
    return stock[key] ?? 0;
  };

  const handleGlobalSync = async () => {
    const qty = parseInt(globalSyncQty, 10);
    if (isNaN(qty) || qty < 0) {
      toast.error("Insira uma quantidade válida");
      return;
    }

    setGlobalSyncing(true);
    const rows: { product_id: number; size: string; quantity: number }[] = [];

    activeProducts.forEach((product) => {
      getProductSizes(product).forEach((size) => {
        rows.push({ product_id: product.id, size, quantity: qty });
      });
    });

    if (rows.length === 0) {
      toast.error("Nenhum produto com tamanhos cadastrados");
      setGlobalSyncing(false);
      return;
    }

    const { error } = await supabase
      .from("product_stock")
      .upsert(rows, { onConflict: "product_id,size" });

    if (error) {
      toast.error("Erro ao sincronizar estoque global");
    } else {
      const newStock = { ...stock };
      rows.forEach((r) => { newStock[stockKey(r.product_id, r.size)] = qty; });
      setStock(newStock);
      setRawInputs({});
      toast.success(`Estoque global sincronizado: ${qty} unidades por tamanho`);
      setGlobalSyncQty("");
    }
    setGlobalSyncing(false);
  };

  const handleProductSync = async (product: Product) => {
    const qty = parseInt(productSyncQty[product.id] ?? "", 10);
    if (isNaN(qty) || qty < 0) {
      toast.error("Insira uma quantidade válida");
      return;
    }

    setProductSyncing((prev) => ({ ...prev, [product.id]: true }));

    const sizes = getProductSizes(product);
    const rows = sizes.map((size) => ({ product_id: product.id, size, quantity: qty }));

    if (rows.length === 0) {
      toast.error("Produto sem tamanhos cadastrados");
      setProductSyncing((prev) => ({ ...prev, [product.id]: false }));
      return;
    }

    const { error } = await supabase
      .from("product_stock")
      .upsert(rows, { onConflict: "product_id,size" });

    if (error) {
      toast.error("Erro ao sincronizar estoque do produto");
    } else {
      const newStock = { ...stock };
      const clearedRaw = { ...rawInputs };
      rows.forEach((r) => {
        const key = stockKey(r.product_id, r.size);
        newStock[key] = qty;
        delete clearedRaw[key];
      });
      setStock(newStock);
      setRawInputs(clearedRaw);
      toast.success(`${product.name}: ${qty} unidades por tamanho`);
      setProductSyncQty((prev) => ({ ...prev, [product.id]: "" }));
    }
    setProductSyncing((prev) => ({ ...prev, [product.id]: false }));
  };

  const activeProducts = products.filter(
    (p) => p.is_active && getProductSizes(p).length > 0
  );

  const getProductImage = (p: Product) => p.images?.[0] ?? p.image_url ?? null;

  const totalItems = activeProducts.reduce((acc, p) => {
    return acc + getProductSizes(p).reduce((s, size) => {
      return s + (stock[stockKey(p.id, size)] ?? 0);
    }, 0);
  }, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Estoque</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {activeProducts.length} produtos · {totalItems} unidades no total
          </p>
        </div>
        <button
          onClick={loadStock}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </div>

      {/* Sincronização Global */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-[#2e3091]/10 rounded-lg">
            <RotateCcw className="w-5 h-5 text-[#2e3091]" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Sincronização Global</h3>
            <p className="text-xs text-gray-500">Define a mesma quantidade para todos os produtos e tamanhos</p>
          </div>
        </div>
        <div className="flex gap-3">
          <input
            type="number"
            min="0"
            value={globalSyncQty}
            onChange={(e) => setGlobalSyncQty(e.target.value)}
            placeholder="Quantidade"
            className="w-40 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#2e3091] text-sm"
          />
          <button
            onClick={handleGlobalSync}
            disabled={globalSyncing || !globalSyncQty}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2e3091] text-white rounded-lg text-sm font-medium hover:bg-[#252780] transition-colors disabled:opacity-50"
          >
            {globalSyncing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4" />
            )}
            Sincronizar Tudo
          </button>
        </div>
      </div>

      {/* Lista de Produtos */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
              <div className="h-5 bg-gray-100 rounded w-48 mb-4" />
              <div className="flex gap-3">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-16 bg-gray-100 rounded-lg w-24" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : activeProducts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>Nenhum produto ativo com tamanhos cadastrados</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeProducts.map((product) => {
            const img = getProductImage(product);
            const sizes = getProductSizes(product);
            const productTotal = sizes.reduce(
              (s, size) => s + (stock[stockKey(product.id, size)] ?? 0),
              0
            );

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-gray-200 p-5"
              >
                {/* Produto header */}
                <div className="flex items-center gap-3 mb-4">
                  {img ? (
                    <img
                      src={img}
                      alt={product.name}
                      className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Package className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-400">
                      {sizes.length} tamanhos · {productTotal} unidades
                    </p>
                  </div>

                  {/* Sincronização por produto */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <input
                      type="number"
                      min="0"
                      value={productSyncQty[product.id] ?? ""}
                      onChange={(e) =>
                        setProductSyncQty((prev) => ({ ...prev, [product.id]: e.target.value }))
                      }
                      placeholder="Qtd"
                      className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#2e3091] text-sm"
                    />
                    <button
                      onClick={() => handleProductSync(product)}
                      disabled={productSyncing[product.id] || !productSyncQty[product.id]}
                      title="Sincronizar todos os tamanhos deste produto"
                      className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      {productSyncing[product.id] ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <RotateCcw className="w-3.5 h-3.5" />
                      )}
                      Sincronizar
                    </button>
                  </div>
                </div>

                {/* Tamanhos */}
                <div className="flex flex-wrap gap-3">
                  {sizes.map((size) => {
                    const key = stockKey(product.id, size);
                    const committedQty = getCommittedQty(product.id, size);
                    const displayValue = getDisplayValue(product.id, size);
                    const isSaving = saving[key];

                    return (
                      <div
                        key={size}
                        className="flex flex-col items-center gap-1.5 bg-gray-50 rounded-xl p-3 min-w-[72px]"
                      >
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          {size}
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={displayValue}
                          onChange={(e) => handleQuantityChange(product.id, size, e.target.value)}
                          onBlur={() => handleQuantityBlur(product.id, size)}
                          className={`w-16 text-center px-2 py-1.5 border rounded-lg text-sm font-medium focus:outline-none focus:border-[#2e3091] transition-colors ${
                            committedQty === 0
                              ? "border-red-200 bg-red-50 text-red-600"
                              : "border-gray-200 bg-white text-gray-900"
                          }`}
                        />
                        {isSaving && (
                          <RefreshCw className="w-3 h-3 text-gray-400 animate-spin" />
                        )}
                        {committedQty === 0 && !isSaving && (
                          <span className="text-[10px] text-red-400">Sem estoque</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
