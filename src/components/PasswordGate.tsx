import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

const STORAGE_KEY = 'gm-minas-unlocked';
const PASSWORD = 'goiasminasfechado';

export function PasswordGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === '1';
  });
  const [input, setInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  if (unlocked) return <>{children}</>;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input === PASSWORD) {
      localStorage.setItem(STORAGE_KEY, '1');
      setUnlocked(true);
    } else {
      setError(true);
      setInput('');
    }
  }

  return (
    <div className="min-h-screen bg-[#2A2826] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        <img src="/logo-white.png" alt="GM Minas" className="h-16 object-contain" />

        <div className="text-center">
          <p className="text-white/60 text-sm tracking-widest uppercase mb-2">Em breve</p>
          <h1 className="text-white text-2xl font-semibold">Estamos quase lá</h1>
          <p className="text-white/50 text-sm mt-2">
            Nosso site está sendo preparado com muito cuidado.<br />Em breve estará disponível para todos.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(false); }}
              placeholder="Senha de acesso"
              className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-lg pl-10 pr-10 py-3 text-sm outline-none focus:border-white/50 transition-colors"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center">Senha incorreta. Tente novamente.</p>
          )}

          <button
            type="submit"
            className="w-full bg-white text-[#2A2826] font-semibold rounded-lg py-3 text-sm hover:bg-white/90 transition-colors"
          >
            Entrar
          </button>
        </form>

        <p className="text-white/20 text-xs">© {new Date().getFullYear()} GM Minas</p>
      </div>
    </div>
  );
}
