import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-white px-4 pt-[80px]">
      <div className="max-w-md w-full text-center">

        {/* Logo GM */}
        <img
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/ROTEIRO_EUROPA-removebg-preview-1765225025878.png"
          alt="Goiás Minas Uniformes"
          className="w-32 h-32 object-contain mx-auto mb-6 opacity-30"
        />

        {/* 404 */}
        <p className="text-8xl font-bold text-[#2e3091]/10 leading-none mb-2 select-none">
          404
        </p>

        <h1 className="text-2xl font-semibold text-gray-900 mb-3">
          Página não encontrada
        </h1>
        <p className="text-gray-500 mb-8 text-sm leading-relaxed">
          A página que você está procurando não existe ou foi removida.
          <br />
          Confira o endereço ou volte para a loja.
        </p>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 bg-[#2e3091] text-white px-6 py-3 rounded-full font-medium hover:bg-[#252a7a] transition-colors"
          >
            <Home className="w-4 h-4" />
            Ir para a Home
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 border border-gray-200 text-gray-700 px-6 py-3 rounded-full font-medium hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
        </div>

        {/* Links úteis */}
        <div className="mt-10 pt-8 border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-4">Talvez você esteja procurando:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { label: 'Colégio Militar', href: '/escolas/colegio-militar' },
              { label: 'Uniformes Empresariais', href: '/empresarial' },
              { label: 'Personalização', href: '/personalizacao' },
              { label: 'Favoritos', href: '/favoritos' },
            ].map((link) => (
              <button
                key={link.href}
                onClick={() => navigate(link.href)}
                className="text-xs text-[#2e3091] bg-[#2e3091]/5 hover:bg-[#2e3091]/10 px-3 py-1.5 rounded-full transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
