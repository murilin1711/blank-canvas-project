import Link from "next/link";

const produtos = [
  {
    name: "Uniforme Tradicional – Colégio Militar",
    price: "R$ 219,90",
    description: "Conjunto clássico com acabamento premium e caimento impecável.",
    tags: ["Linha oficial", "Tecido respirável", "Costura reforçada"],
    code: "CM-01"
  },
  {
    name: "Camisa de Educação Física – Colégio Militar",
    price: "R$ 129,90",
    description: "Dry-fit leve com proteção UV para treinos diários.",
    tags: ["Secagem rápida", "UV 50+", "Malha macia"],
    code: "CM-02"
  },
  {
    name: "Agasalho Oficial – Colégio Militar",
    price: "R$ 289,90",
    description: "Jaqueta e calça com forro macio e detalhes dourados.",
    tags: ["Térmico", "Zíper reforçado", "Bolsos funcionais"],
    code: "CM-03"
  },
  {
    name: "Calça Militar Masculina/Feminina",
    price: "R$ 189,90",
    description: "Modelagem reta com cintura anatômica e tecido resistente.",
    tags: ["Unissex", "Antivincos", "Tecido premium"],
    code: "CM-04"
  },
  {
    name: "Moletom Personalizado – Colégio Militar",
    price: "R$ 199,90",
    description: "Moletom felpado com personalização do brasão.",
    tags: ["Personalizável", "Conforto térmico", "Cores institucionais"],
    code: "CM-05"
  }
];

export default function ColegioMilitarPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f7f7fb] via-[#eef1f7] to-[#e6ebf5]">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-12 lg:py-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b1d2b] via-[#132d46] to-[#0b1d2b] text-white border border-[#c9a04f]/50 shadow-[0_35px_120px_-50px_rgba(0,0,0,0.75)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(201,160,79,0.18),transparent_35%)]"></div>
          <div className="absolute top-0 right-0 h-full w-[55%] bg-[radial-gradient(circle_at_80%_20%,rgba(201,160,79,0.35),transparent_35%)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.06),transparent_40%)]"></div>

          <div className="relative p-8 md:p-12 lg:p-14 space-y-8">
            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold">
              <span className="px-4 py-2 rounded-full bg-white/10 backdrop-blur text-white/90">Coleção Especial</span>
              <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/80">Colegio Militar</span>
              <span className="px-4 py-2 rounded-full bg-[#c9a04f]/20 text-[#f7e8c6]">Disponível agora</span>
            </div>

            <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-8 md:gap-10 lg:gap-12 items-center">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-sm uppercase tracking-[0.35em] text-white/60">Uniformes oficiais</p>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight tracking-tight">Colégio Militar</h1>
                  <p className="text-white/80 text-base md:text-lg max-w-2xl leading-relaxed">
                    Linha completa de uniformes com acabamento premium, pensada para destacar a tradição do Colégio Militar com conforto e presença.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="#produtos"
                    className="px-5 md:px-6 py-3 rounded-full bg-[#c9a04f] text-[#0b1d2b] font-semibold shadow-[0_18px_55px_-20px_rgba(201,160,79,0.9)] hover:shadow-[0_22px_65px_-18px_rgba(201,160,79,0.95)] transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    Comprar agora
                  </Link>
                  <Link
                    href="/"
                    className="px-5 md:px-6 py-3 rounded-full border border-white/20 text-white/90 hover:border-white/50 transition-colors duration-300"
                  >
                    Voltar ao início
                  </Link>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-white/80">
                  <span className="px-4 py-2 rounded-full bg-white/10 border border-white/10">Uniformes oficiais</span>
                  <span className="px-4 py-2 rounded-full bg-white/10 border border-white/10">Entrega para todo o Brasil</span>
                  <span className="px-4 py-2 rounded-full bg-white/10 border border-white/10">Confecção premium</span>
                </div>
              </div>

              <div className="relative bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur">
                <div className="grid grid-cols-2 gap-4 text-sm md:text-base font-semibold text-white/90">
                  <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                    <p className="text-xs text-white/60">Tempo de mercado</p>
                    <p className="text-2xl font-bold text-[#c9a04f] mt-1">+40 anos</p>
                  </div>
                  <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                    <p className="text-xs text-white/60">Clientes atendidos</p>
                    <p className="text-2xl font-bold mt-1">+10.000</p>
                  </div>
                  <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                    <p className="text-xs text-white/60">Escolas parceiras</p>
                    <p className="text-2xl font-bold mt-1">+11</p>
                  </div>
                  <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                    <p className="text-xs text-white/60">Coleção</p>
                    <p className="text-2xl font-bold mt-1">2025</p>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3 text-sm text-white/70">
                  <div className="h-10 w-10 rounded-full bg-[#c9a04f]/20 border border-[#c9a04f]/30 flex items-center justify-center text-[#c9a04f] font-bold">
                    CM
                  </div>
                  <p className="leading-relaxed">Materiais selecionados, personalização refinada e padrões que respeitam a identidade do Colégio Militar.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="produtos" className="mt-12 md:mt-14 space-y-5">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.3em] text-[#0b1d2b]/60">Linha oficial</p>
              <h2 className="text-2xl md:text-3xl font-semibold text-[#0b1d2b]">Produtos Colégio Militar</h2>
              <p className="text-sm md:text-base text-[#0b1d2b]/70">Seleção pronta para compra com entrega rápida e acabamento premium.</p>
            </div>
            <Link
              href="/"
              className="text-sm font-semibold text-[#0b1d2b] border border-[#0b1d2b]/15 px-4 py-2 rounded-full hover:border-[#0b1d2b] transition-colors"
            >
              Ver todas as escolas
            </Link>
          </div>

          <div className="grid gap-6 md:gap-7">
            {produtos.map((produto) => (
              <div
                key={produto.code}
                className="group bg-white rounded-2xl border border-[#0b1d2b]/8 shadow-[0_25px_60px_-40px_rgba(0,0,0,0.45)] overflow-hidden transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="flex-1 p-6 md:p-7 lg:p-8 space-y-4">
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="px-3 py-1 rounded-full bg-[#c9a04f]/15 text-[#0b1d2b] font-semibold">{produto.price}</span>
                      <span className="px-3 py-1 rounded-full bg-[#0b1d2b]/5 text-[#0b1d2b]/80 border border-[#0b1d2b]/10 font-medium">Código {produto.code}</span>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl md:text-2xl font-semibold text-[#0b1d2b] leading-tight">{produto.name}</h3>
                      <p className="text-sm md:text-base text-[#0b1d2b]/80 leading-relaxed">{produto.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {produto.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs md:text-sm px-3 py-1 rounded-full bg-[#f5f7fb] text-[#0b1d2b] border border-[#0b1d2b]/10"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-3 pt-2">
                      <button className="px-5 py-2.5 rounded-full bg-[#0b1d2b] text-white font-semibold shadow-[0_12px_30px_-12px_rgba(11,29,43,0.8)] transition-transform duration-300 hover:-translate-y-0.5">Comprar agora</button>
                      <button className="px-5 py-2.5 rounded-full border border-[#0b1d2b]/20 text-[#0b1d2b] font-semibold hover:border-[#0b1d2b] transition-colors">Detalhes</button>
                    </div>
                  </div>

                  <div className="md:w-64 lg:w-72 relative bg-gradient-to-br from-[#0b1d2b] via-[#132d46] to-[#0b1d2b]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(201,160,79,0.25),transparent_45%)]"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(201,160,79,0.12),transparent_40%)]"></div>
                    <div className="h-full w-full flex items-center justify-center">
                      <div className="w-28 h-28 md:w-32 md:h-32 rounded-[30px] bg-gradient-to-br from-white/15 via-white/5 to-transparent border border-white/15 shadow-[0_25px_60px_-30px_rgba(0,0,0,0.7)] backdrop-blur-sm flex items-center justify-center text-white text-sm font-semibold tracking-[0.2em]">
                        {produto.code}
                      </div>
                    </div>
                    <div className="absolute bottom-5 right-5 text-[11px] uppercase tracking-[0.25em] text-[#c9a04f] font-semibold">Coleção 2025</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
