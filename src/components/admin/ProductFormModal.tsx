import React, { useState, useRef } from "react";
import { motion, Reorder } from "framer-motion";
import { X, Plus, Upload, Trash2, Save, GripVertical, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
// Opção de variação com preço opcional
interface VariationOption {
  value: string;
  price: number | null; // null = usa preço base do produto
  image?: string | null; // URL da foto associada (opcional)
}

interface Variation {
  id: string;
  name: string;
  options: (string | VariationOption)[]; // Suporta formato antigo (string) e novo (objeto)
}

interface ProductFormData {
  name: string;
  price: string;
  description: string;
  images: string[];
  category: string;
  variations: Variation[];
  is_active: boolean;
  school_slug: string;
  similar_products: number[];
  allows_embroidery: boolean;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any, isNew: boolean) => void;
  editingProduct: any | null;
  availableCategories?: string[];
  allProducts?: { id: number; name: string; image_url?: string | null; images?: string[] | null }[];
}

export default function ProductFormModal({
  isOpen,
  onClose,
  onSave,
  editingProduct,
  availableCategories = [],
  allProducts = [],
}: ProductFormModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const getInitialForm = (): ProductFormData => {
    if (editingProduct) {
      return {
        name: editingProduct.name || "",
        price: String(editingProduct.price || ""),
        description: editingProduct.description || "",
        images: editingProduct.images || (editingProduct.image_url ? [editingProduct.image_url] : []),
        category: editingProduct.category || "",
        variations: editingProduct.variations || [],
        is_active: editingProduct.is_active !== false,
        school_slug: editingProduct.school_slug || "colegio-militar",
        similar_products: editingProduct.similar_products || [],
        allows_embroidery: editingProduct.allows_embroidery || false,
      };
    }
    return {
      name: "",
      price: "",
      description: "",
      images: [],
      category: "",
      variations: [],
      is_active: true,
      school_slug: "colegio-militar",
      similar_products: [],
      allows_embroidery: false,
    };
  };

  const [form, setForm] = useState<ProductFormData>(getInitialForm);
  const [newVariationName, setNewVariationName] = useState("");
  const [newOptionValue, setNewOptionValue] = useState<Record<string, string>>({});
  const [newOptionPrice, setNewOptionPrice] = useState<Record<string, string>>({});

  // Helper para extrair valor de opção (suporta string e VariationOption)
  const getOptionValue = (option: string | VariationOption): string => {
    return typeof option === 'string' ? option : option.value;
  };

  // Helper para extrair preço de opção
  const getOptionPrice = (option: string | VariationOption): number | null => {
    return typeof option === 'string' ? null : option.price;
  };

  // Helper para extrair imagem de opção
  const getOptionImage = (option: string | VariationOption): string | null => {
    return typeof option === 'string' ? null : (option.image || null);
  };

  // Reset form when modal opens/closes or editingProduct changes
  React.useEffect(() => {
    if (isOpen) {
      setForm(getInitialForm());
      setNewVariationName("");
      setNewOptionValue({});
      setNewOptionPrice({});
    }
  }, [isOpen, editingProduct]);

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, file);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          toast.error(`Erro ao enviar ${file.name}`);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));

      if (uploadedUrls.length > 0) {
        toast.success(`${uploadedUrls.length} imagem(ns) enviada(s)`);
      }
    } catch (error) {
      console.error("Error uploading:", error);
      toast.error("Erro ao enviar imagens");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Move image left or right (for mobile)
  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= form.images.length) return;
    
    const newImages = [...form.images];
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    setForm(prev => ({ ...prev, images: newImages }));
  };

  const isMobile = useIsMobile();

  const addVariation = () => {
    if (!newVariationName.trim()) {
      toast.error("Digite o nome da variação");
      return;
    }

    const newVariation: Variation = {
      id: Date.now().toString(),
      name: newVariationName.trim(),
      options: [],
    };

    setForm((prev) => ({
      ...prev,
      variations: [...prev.variations, newVariation],
    }));
    setNewVariationName("");
  };

  const removeVariation = (variationId: string) => {
    setForm((prev) => ({
      ...prev,
      variations: prev.variations.filter((v) => v.id !== variationId),
    }));
  };

  const addOption = (variationId: string) => {
    const optionValue = newOptionValue[variationId]?.trim();
    if (!optionValue) return;

    const priceStr = newOptionPrice[variationId]?.trim();
    const price = priceStr ? parseFloat(priceStr.replace(',', '.')) : null;

    const newOption: VariationOption = {
      value: optionValue,
      price: price && !isNaN(price) ? price : null,
    };

    setForm((prev) => ({
      ...prev,
      variations: prev.variations.map((v) =>
        v.id === variationId
          ? { ...v, options: [...v.options, newOption] }
          : v
      ),
    }));
    setNewOptionValue((prev) => ({ ...prev, [variationId]: "" }));
    setNewOptionPrice((prev) => ({ ...prev, [variationId]: "" }));
  };

  const removeOption = (variationId: string, optionIndex: number) => {
    setForm((prev) => ({
      ...prev,
      variations: prev.variations.map((v) =>
        v.id === variationId
          ? { ...v, options: v.options.filter((_, i) => i !== optionIndex) }
          : v
      ),
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Digite o nome do produto");
      return;
    }
    if (!form.price || parseFloat(form.price) <= 0) {
      toast.error("Digite um preço válido");
      return;
    }

    setSaving(true);

    try {
      // Extrair os valores de tamanho para o campo sizes (compatibilidade)
      const sizeVariation = form.variations.find((v) => 
        v.name.toLowerCase() === "tamanho" || v.name.toLowerCase() === "tamanhos"
      );
      const sizes = sizeVariation
        ? sizeVariation.options.map(opt => getOptionValue(opt))
        : ["P", "M", "G", "GG"];

      const productData = {
        name: form.name.trim(),
        price: parseFloat(form.price),
        description: form.description.trim() || null,
        image_url: form.images[0] || null,
        images: form.images,
        category: form.category.trim() || null,
        variations: form.variations,
        sizes,
        is_active: form.is_active,
        school_slug: form.school_slug,
        similar_products: form.similar_products,
        allows_embroidery: form.allows_embroidery,
      };

      if (editingProduct) {
        onSave({ ...productData, id: editingProduct.id }, false);
      } else {
        onSave(productData, true);
      }
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Erro ao salvar produto");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingProduct ? "Editar Produto" : "Novo Produto"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Produto *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Camisa Polo Masculina"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#2e3091]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="89.90"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#2e3091]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Descrição detalhada do produto..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#2e3091] resize-none"
            />
          </div>

          {/* Images with Reordering */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagens do Produto
            </label>
            <p className="text-xs text-gray-500 mb-3">
              {isMobile 
                ? "Use as setas para reordenar. A primeira imagem será a principal."
                : "Arraste para reordenar. A primeira imagem será a principal."
              }
            </p>
            
            <div className="flex flex-wrap gap-3 items-start">
              {/* Mobile: Simple grid with arrow buttons */}
              {isMobile ? (
                <div className="flex flex-wrap gap-3">
                  {form.images.map((url, index) => (
                    <div key={url} className="relative">
                      {/* Move buttons */}
                      <div className="absolute top-1 left-1 right-1 z-10 flex justify-between">
                        <button
                          type="button"
                          onClick={() => moveImage(index, 'left')}
                          disabled={index === 0}
                          className="w-7 h-7 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center disabled:opacity-30 active:bg-black/80"
                          aria-label="Mover para esquerda"
                        >
                          <ChevronLeft className="w-4 h-4 text-white" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveImage(index, 'right')}
                          disabled={index === form.images.length - 1}
                          className="w-7 h-7 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center disabled:opacity-30 active:bg-black/80"
                          aria-label="Mover para direita"
                        >
                          <ChevronRight className="w-4 h-4 text-white" />
                        </button>
                      </div>
                      
                      {/* Delete button - ALWAYS VISIBLE */}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 z-20 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md active:bg-red-600"
                        aria-label="Remover imagem"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <img
                        src={url}
                        alt={`Imagem ${index + 1}`}
                        className="w-28 h-28 object-cover rounded-lg border border-gray-200"
                        draggable={false}
                      />
                      
                      {/* Principal badge */}
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 text-[10px] bg-[#2e3091] text-white px-1.5 py-0.5 rounded font-medium">
                          Principal
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                /* Desktop: Drag-and-drop with Reorder */
                <Reorder.Group
                  axis="x"
                  values={form.images}
                  onReorder={(newOrder) => setForm((prev) => ({ ...prev, images: newOrder }))}
                  className="flex flex-wrap gap-3"
                >
                  {form.images.map((url, index) => (
                    <Reorder.Item
                      key={url}
                      value={url}
                      className="relative cursor-grab active:cursor-grabbing"
                    >
                      <div className="relative">
                        {/* Drag handle indicator */}
                        <div className="absolute top-1 left-1 z-10 w-5 h-5 bg-black/50 backdrop-blur-sm rounded flex items-center justify-center">
                          <GripVertical className="w-3 h-3 text-white" />
                        </div>
                        
                        {/* Delete button - ALWAYS VISIBLE */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(index);
                          }}
                          className="absolute -top-2 -right-2 z-20 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                          aria-label="Remover imagem"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        
                        <img
                          src={url}
                          alt={`Imagem ${index + 1}`}
                          className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                          draggable={false}
                        />
                        
                        {/* Principal badge */}
                        {index === 0 && (
                          <span className="absolute bottom-1 left-1 text-[10px] bg-[#2e3091] text-white px-1.5 py-0.5 rounded font-medium">
                            Principal
                          </span>
                        )}
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className={`${isMobile ? 'w-28 h-28' : 'w-24 h-24'} border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-[#2e3091] hover:text-[#2e3091] transition-colors disabled:opacity-50`}
              >
                {uploading ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Upload className="w-6 h-6 mb-1" />
                    <span className="text-xs">Adicionar</span>
                  </>
                )}
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImageUpload(e.target.files)}
              className="hidden"
            />
          </div>

          {/* Category and School */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#2e3091] bg-white appearance-none"
                >
                  <option value="">Selecione uma categoria</option>
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Gerencie categorias no menu acima
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Escola
              </label>
              <select
                value={form.school_slug}
                onChange={(e) => setForm({ ...form, school_slug: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#2e3091] bg-white"
              >
                <option value="colegio-militar">Colégio Militar</option>
              </select>
            </div>
          </div>

          {/* Variations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Variações (Tamanhos, Cores, Números, etc.)
            </label>

            {/* Add new variation */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newVariationName}
                onChange={(e) => setNewVariationName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addVariation()}
                placeholder="Ex: Tamanho, Cor, Número"
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#2e3091]"
              />
              <button
                type="button"
                onClick={addVariation}
                className="px-4 py-2 bg-[#2e3091] text-white rounded-lg font-medium hover:bg-[#252a7a] transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </div>

            {/* Existing variations */}
            <div className="space-y-4">
              {form.variations.map((variation) => (
                <div
                  key={variation.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-900">
                      {variation.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeVariation(variation.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Options com preço e imagem */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {variation.options.map((option, optIndex) => {
                      const optValue = getOptionValue(option);
                      const optPrice = getOptionPrice(option);
                      const optImage = getOptionImage(option);
                      return (
                        <span
                          key={optIndex}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm"
                        >
                          {optImage && (
                            <img src={optImage} alt={optValue} className="w-6 h-6 object-cover rounded" />
                          )}
                          <span className="font-medium">{optValue}</span>
                          {optPrice !== null && (
                            <span className="text-green-600 text-xs">
                              R$ {optPrice.toFixed(2).replace('.', ',')}
                            </span>
                          )}
                          {/* Select image from product images */}
                          {form.images.length > 0 && (
                            <select
                              value={optImage || ""}
                              onChange={(e) => {
                                const newImage = e.target.value || null;
                                setForm(prev => ({
                                  ...prev,
                                  variations: prev.variations.map(v =>
                                    v.id === variation.id
                                      ? {
                                          ...v,
                                          options: v.options.map((o, i) =>
                                            i === optIndex
                                              ? { value: getOptionValue(o), price: getOptionPrice(o), image: newImage }
                                              : o
                                          ),
                                        }
                                      : v
                                  ),
                                }));
                              }}
                              className="text-xs border border-gray-200 rounded px-1 py-0.5 bg-white max-w-[80px]"
                              title="Associar foto"
                            >
                              <option value="">📷 --</option>
                              {form.images.map((img, imgIdx) => (
                                <option key={imgIdx} value={img}>
                                  Foto {imgIdx + 1}
                                </option>
                              ))}
                            </select>
                          )}
                          <button
                            type="button"
                            onClick={() => removeOption(variation.id, optIndex)}
                            className="text-gray-400 hover:text-red-500 transition-colors ml-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>

                  {/* Add option com preço opcional */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={newOptionValue[variation.id] || ""}
                      onChange={(e) =>
                        setNewOptionValue((prev) => ({
                          ...prev,
                          [variation.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) =>
                        e.key === "Enter" && addOption(variation.id)
                      }
                      placeholder={`Nome (ex: ${variation.name === 'Tamanho' ? 'GG' : '42'})`}
                      className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#2e3091]"
                    />
                    <input
                      type="text"
                      value={newOptionPrice[variation.id] || ""}
                      onChange={(e) =>
                        setNewOptionPrice((prev) => ({
                          ...prev,
                          [variation.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) =>
                        e.key === "Enter" && addOption(variation.id)
                      }
                      placeholder="Preço (opcional)"
                      className="w-24 sm:w-28 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#2e3091]"
                    />
                    <button
                      type="button"
                      onClick={() => addOption(variation.id)}
                      className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Deixe o preço vazio para usar o preço base do produto
                  </p>
                </div>
              ))}
            </div>

            {form.variations.length === 0 && (
              <p className="text-sm text-gray-500 italic">
                Adicione variações como "Tamanho" com opções PP, P, M, G, GG ou "Número" com 36, 37, 38, etc.
              </p>
            )}
          </div>

          {/* Similar Products - Multi-Select with Checkboxes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Produtos Similares ({form.similar_products.length} selecionados)
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Marque os produtos que aparecerão na seção "Você Pode Precisar" desta página.
            </p>
            
            {/* Grid with checkboxes for multi-select */}
            <div className="border border-gray-200 rounded-lg p-3 max-h-64 overflow-y-auto">
              {allProducts.filter(p => p.id !== editingProduct?.id).length === 0 ? (
                <p className="text-sm text-gray-500 italic text-center py-4">
                  Nenhum outro produto disponível
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {allProducts
                    .filter(p => p.id !== editingProduct?.id)
                    .map(product => {
                      const isSelected = form.similar_products.includes(product.id);
                      const productImage = product.images?.[0] || product.image_url;
                      return (
                        <label
                          key={product.id}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-[#2e3091]/10 border border-[#2e3091]/30' 
                              : 'hover:bg-gray-50 border border-transparent'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setForm(prev => ({
                                ...prev,
                                similar_products: isSelected
                                  ? prev.similar_products.filter(id => id !== product.id)
                                  : [...prev.similar_products, product.id]
                              }));
                            }}
                            className="w-4 h-4 accent-[#2e3091] rounded flex-shrink-0"
                          />
                          {productImage && (
                            <img
                              src={productImage}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded flex-shrink-0"
                            />
                          )}
                          <span className="text-sm text-gray-700 truncate">
                            {product.name}
                          </span>
                        </label>
                      );
                    })
                  }
                </div>
              )}
            </div>
            
            {/* Quick clear button if any selected */}
            {form.similar_products.length > 0 && (
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, similar_products: [] }))}
                className="mt-2 text-xs text-red-500 hover:text-red-600 transition-colors"
              >
                Limpar seleção
              </button>
            )}
          </div>

          {/* Embroidery toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.allows_embroidery}
              onChange={(e) => setForm({ ...form, allows_embroidery: e.target.checked })}
              className="w-5 h-5 accent-[#2e3091] rounded"
            />
            <div>
              <span className="text-sm text-gray-700 font-medium">Permite bordado</span>
              <p className="text-xs text-gray-500">Cliente pode adicionar nome bordado na peça</p>
            </div>
          </label>

          {/* Active toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-5 h-5 accent-[#2e3091] rounded"
            />
            <span className="text-sm text-gray-700">Produto ativo (visível na loja)</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#2e3091] text-white rounded-lg font-medium hover:bg-[#252a7a] transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Salvando..." : "Salvar Produto"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
