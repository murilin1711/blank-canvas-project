import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Footer from "@/components/sections/footer";
import { User, Mail, Phone, CreditCard, LogOut, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Profile {
  name: string;
  email: string;
  phone: string | null;
  cpf: string | null;
}

export default function MeusDadosPage() {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState<Profile>({ name: "", email: "", phone: "", cpf: "" });
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("name, email, phone, cpf")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setProfile(data);
        setForm({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          cpf: data.cpf || "",
        });
      } else {
        setForm({
          name: user.user_metadata?.name || "",
          email: user.email || "",
          phone: "",
          cpf: "",
        });
      }
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
        .upsert({
          user_id: user.id,
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          cpf: form.cpf || null,
        }, { onConflict: "user_id" });

      if (error) throw error;
      toast.success("Dados salvos com sucesso!");
      setProfile({ ...form });
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5] font-suisse">

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-[#2A2826] flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Meus Dados</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
          {/* Nome */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              <User className="w-4 h-4 text-gray-400" />
              Nome completo
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A2826]/20 focus:border-[#2A2826]"
              placeholder="Seu nome"
            />
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              <Mail className="w-4 h-4 text-gray-400" />
              E-mail
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A2826]/20 focus:border-[#2A2826]"
              placeholder="seu@email.com"
            />
          </div>

          {/* Telefone */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              <Phone className="w-4 h-4 text-gray-400" />
              Telefone
            </label>
            <input
              type="tel"
              value={form.phone || ""}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A2826]/20 focus:border-[#2A2826]"
              placeholder="(62) 99999-9999"
            />
          </div>

          {/* CPF */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              <CreditCard className="w-4 h-4 text-gray-400" />
              CPF
            </label>
            <input
              type="text"
              value={form.cpf || ""}
              onChange={(e) => setForm((f) => ({ ...f, cpf: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A2826]/20 focus:border-[#2A2826]"
              placeholder="000.000.000-00"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#2A2826] text-white rounded-xl font-medium hover:bg-[#3a3734] transition-colors disabled:opacity-50"
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
      </main>

      <Footer />
    </div>
  );
}
