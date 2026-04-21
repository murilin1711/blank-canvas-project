import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Footer from "@/components/sections/footer";
import { User, Mail, Phone, CreditCard, LogOut, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

const maskPhone = (v: string) =>
  v.replace(/\D/g, '').slice(0, 11)
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2');

const maskCPF = (v: string) =>
  v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

interface Profile {
  name: string;
  email: string;
  phone: string | null;
  cpf: string | null;
}

export default function MeusDadosPage() {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [form, setForm] = useState<Profile>({ name: "", email: "", phone: "", cpf: "" });
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("name, email, phone, cpf")
        .eq("user_id", user.id)
        .maybeSingle();

      setForm({
        name: data?.name || user.user_metadata?.name || "",
        email: data?.email || user.email || "",
        phone: data?.phone || "",
        cpf: data?.cpf || "",
      });
      setLoadingProfile(false);
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({ user_id: user.id, name: form.name, email: form.email, phone: form.phone || null, cpf: form.cpf || null }, { onConflict: "user_id" });
      if (error) throw error;
      toast.success("Dados salvos com sucesso!");
    } catch {
      toast.error("Erro ao salvar dados.");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading || loadingProfile) {
    return (
      <main className="min-h-screen bg-gray-50 pt-[120px]">
        <div className="max-w-lg mx-auto px-6 py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-48 bg-gray-200 rounded" />
          </div>
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gray-50 pt-[120px]">
      <div className="max-w-lg mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-[#2e3091] flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Meus Dados</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              <User className="w-4 h-4 text-gray-400" />
              Nome completo
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2e3091]/20 focus:border-[#2e3091]"
              placeholder="Seu nome"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              <Mail className="w-4 h-4 text-gray-400" />
              E-mail
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2e3091]/20 focus:border-[#2e3091]"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              <Phone className="w-4 h-4 text-gray-400" />
              Telefone
            </label>
            <input
              type="tel"
              value={form.phone || ""}
              onChange={(e) => setForm((f) => ({ ...f, phone: maskPhone(e.target.value) }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2e3091]/20 focus:border-[#2e3091]"
              placeholder="(62) 99999-9999"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              <CreditCard className="w-4 h-4 text-gray-400" />
              CPF
            </label>
            <input
              type="text"
              value={form.cpf || ""}
              onChange={(e) => setForm((f) => ({ ...f, cpf: maskCPF(e.target.value) }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2e3091]/20 focus:border-[#2e3091]"
              placeholder="000.000.000-00"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#2e3091] text-white rounded-xl font-medium hover:bg-[#252a7a] transition-colors disabled:opacity-50"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Salvando...</>
            ) : (
              <><Save className="w-4 h-4" />Salvar alterações</>
            )}
          </button>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full mt-4 flex items-center justify-center gap-2 py-3 border border-gray-200 bg-white text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair da conta
        </button>
      </div>
      <Footer />
    </main>
  );
}
