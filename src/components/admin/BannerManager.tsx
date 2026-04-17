import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Save,
  Upload,
  X,
  GripVertical,
  Eye,
  EyeOff,
  Edit,
  Image,
  Video,
  ChevronUp,
  ChevronDown,
  Monitor,
  Smartphone,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;
import { toast } from "sonner";

interface BannerSlide {
  id: number;
  type: "video" | "image";
  url: string;
  mobile_url: string | null;
  title: string | null;
  link: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

interface SlideForm {
  type: "video" | "image";
  url: string;
  mobile_url: string;
  title: string;
  link: string;
  display_order: number;
  is_active: boolean;
}

const emptyForm = (): SlideForm => ({
  type: "image",
  url: "",
  mobile_url: "",
  title: "",
  link: "",
  display_order: 0,
  is_active: true,
});

interface BannerManagerProps {
  slides: BannerSlide[];
  loading: boolean;
  onRefresh: () => void;
}

export default function BannerManager({ slides, loading, onRefresh }: BannerManagerProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState<BannerSlide | null>(null);
  const [form, setForm] = useState<SlideForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileFileInputRef = useRef<HTMLInputElement>(null);

  const openAdd = () => {
    setEditingSlide(null);
    const nextOrder = slides.length > 0 ? Math.max(...slides.map((s) => s.display_order)) + 1 : 0;
    setForm({ ...emptyForm(), display_order: nextOrder });
    setShowModal(true);
  };

  const openEdit = (slide: BannerSlide) => {
    setEditingSlide(slide);
    setForm({
      type: slide.type,
      url: slide.url,
      mobile_url: slide.mobile_url || "",
      title: slide.title || "",
      link: slide.link || "",
      display_order: slide.display_order,
      is_active: slide.is_active,
    });
    setShowModal(true);
  };

  const handleUpload = async (
    files: FileList | null,
    field: "url" | "mobile_url",
    setIsUploading: (v: boolean) => void
  ) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setIsUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const filePath = `banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);

      if (uploadError) {
        toast.error("Erro ao enviar imagem");
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(filePath);

      setForm((prev) => ({ ...prev, [field]: publicUrl }));
      toast.success("Imagem enviada com sucesso");
    } catch {
      toast.error("Erro ao enviar imagem");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.url.trim()) {
      toast.error("URL é obrigatória");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        type: form.type,
        url: form.url.trim(),
        mobile_url: form.mobile_url.trim() || null,
        title: form.title.trim(),
        link: form.link.trim(),
        display_order: form.display_order,
        is_active: form.is_active,
      };

      if (editingSlide) {
        const { error } = await db
          .from("banner_slides")
          .update(payload)
          .eq("id", editingSlide.id);
        if (error) throw error;
        toast.success("Slide atualizado");
      } else {
        const { error } = await db.from("banner_slides").insert(payload);
        if (error) throw error;
        toast.success("Slide adicionado");
      }

      setShowModal(false);
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar slide");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este slide?")) return;
    const { error } = await db.from("banner_slides").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir slide");
    } else {
      toast.success("Slide excluído");
      onRefresh();
    }
  };

  const handleToggleActive = async (slide: BannerSlide) => {
    const newValue = !slide.is_active;
    const { error, data } = await db
      .from("banner_slides")
      .update({ is_active: newValue })
      .eq("id", slide.id)
      .select();
    if (error) {
      console.error("Toggle error:", error);
      toast.error(`Erro ao atualizar status: ${error.message}`);
    } else {
      console.log("Toggle success:", data);
      toast.success(newValue ? "Slide ativado" : "Slide desativado");
      onRefresh();
    }
  };

  const sorted = [...slides].sort((a, b) => a.display_order - b.display_order);

  const handleMove = async (idx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;

    const a = sorted[idx];
    const b = sorted[targetIdx];

    // Swap display_order values
    const [orderA, orderB] = [a.display_order, b.display_order];

    const { error: errA } = await db
      .from("banner_slides")
      .update({ display_order: orderB })
      .eq("id", a.id);
    const { error: errB } = await db
      .from("banner_slides")
      .update({ display_order: orderA })
      .eq("id", b.id);

    if (errA || errB) {
      toast.error("Erro ao reordenar slides");
    } else {
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Slides do Banner</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Gerencie os slides exibidos no banner principal da home.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#2e3091] text-white rounded-xl text-sm font-medium hover:bg-[#252a7a] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Slide
        </button>
      </div>

      {/* Slides List */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <div className="w-6 h-6 border-2 border-[#2e3091] border-t-transparent rounded-full animate-spin mr-3" />
            Carregando slides...
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Image className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm">Nenhum slide cadastrado ainda.</p>
            <button
              onClick={openAdd}
              className="mt-4 text-sm text-[#2e3091] font-medium hover:underline"
            >
              Adicionar primeiro slide
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sorted.map((slide, idx) => (
              <div
                key={slide.id}
                className={`flex items-center gap-4 p-4 transition-colors ${
                  slide.is_active ? "" : "opacity-50"
                }`}
              >
                {/* Order controls */}
                <div className="flex flex-col items-center gap-0.5 shrink-0">
                  <button
                    onClick={() => handleMove(idx, "up")}
                    disabled={idx === 0}
                    className="p-0.5 rounded hover:bg-gray-100 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                    title="Mover para cima"
                  >
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  </button>
                  <span className="text-xs font-mono text-gray-400 leading-none">{idx + 1}</span>
                  <button
                    onClick={() => handleMove(idx, "down")}
                    disabled={idx === sorted.length - 1}
                    className="p-0.5 rounded hover:bg-gray-100 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                    title="Mover para baixo"
                  >
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                {/* Preview */}
                <div className="w-20 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  {slide.type === "video" ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                      <Video className="w-5 h-5 text-white opacity-60" />
                    </div>
                  ) : (
                    <img
                      src={slide.url}
                      alt="Banner preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        slide.type === "video"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {slide.type === "video" ? "Vídeo" : "Imagem"}
                    </span>
                    {slide.title && (
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {slide.title}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{slide.url}</p>
                  {slide.link && (
                    <p className="text-xs text-blue-500 truncate">Link: {slide.link}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleActive(slide)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    title={slide.is_active ? "Desativar" : "Ativar"}
                  >
                    {slide.is_active ? (
                      <Eye className="w-4 h-4 text-green-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => openEdit(slide)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(slide.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info box */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <strong>Dica:</strong> Os slides são exibidos na ordem do campo "Ordem". Apenas slides
        ativos aparecem no site. Alterações entram em vigor imediatamente ao recarregar a página.
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingSlide ? "Editar Slide" : "Novo Slide"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Modal body */}
              <div className="p-6 space-y-5">
                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                  <div className="flex gap-3">
                    {(["image", "video"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, type: t }))}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                          form.type === t
                            ? "bg-[#2e3091] text-white border-[#2e3091]"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {t === "image" ? (
                          <Image className="w-4 h-4" />
                        ) : (
                          <Video className="w-4 h-4" />
                        )}
                        {t === "image" ? "Imagem" : "Vídeo"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* URL fields */}
                {form.type === "video" ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">URL do Vídeo</label>
                    <input
                      type="text"
                      value={form.url}
                      onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                      placeholder="/videos/hero-video.mp4"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2e3091]/30"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Desktop */}
                    <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-[#2e3091]" />
                        <span className="text-sm font-semibold text-gray-800">Computador</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={form.url}
                          onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                          placeholder="https://..."
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2e3091]/30"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 shrink-0"
                        >
                          {uploading ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          Upload
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleUpload(e.target.files, "url", setUploading)}
                        />
                      </div>
                      {form.url && (
                        <div className="w-full h-28 rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={form.url}
                            alt="Preview desktop"
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Mobile */}
                    <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-[#2e3091]" />
                        <span className="text-sm font-semibold text-gray-800">Celular</span>
                        <span className="text-xs text-gray-400">(se não informado, usa a imagem do computador)</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={form.mobile_url}
                          onChange={(e) => setForm((f) => ({ ...f, mobile_url: e.target.value }))}
                          placeholder="https://..."
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2e3091]/30"
                        />
                        <button
                          type="button"
                          onClick={() => mobileFileInputRef.current?.click()}
                          disabled={uploadingMobile}
                          className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 shrink-0"
                        >
                          {uploadingMobile ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          Upload
                        </button>
                        <input
                          ref={mobileFileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleUpload(e.target.files, "mobile_url", setUploadingMobile)}
                        />
                      </div>
                      {form.mobile_url && (
                        <div className="w-24 h-36 rounded-lg overflow-hidden bg-gray-100 mx-auto">
                          <img
                            src={form.mobile_url}
                            alt="Preview mobile"
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título <span className="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Texto exibido sobre o slide"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2e3091]/30"
                  />
                </div>

                {/* Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link <span className="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.link}
                    onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                    placeholder="/escolas/colegio-militar"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2e3091]/30"
                  />
                </div>

                {/* Active toggle */}
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <div
                      onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
                      className={`relative w-10 h-6 rounded-full transition-colors ${
                        form.is_active ? "bg-[#2e3091]" : "bg-gray-200"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          form.is_active ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Ativo</span>
                  </label>
                </div>
              </div>

              {/* Modal footer */}
              <div className="flex gap-3 p-6 pt-0">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.url.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2e3091] text-white rounded-xl text-sm font-medium hover:bg-[#252a7a] transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
