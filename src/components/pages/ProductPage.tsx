import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface ProductPageProps {
  schoolName: string;
  productName: string;
  productPrice: string;
  productDescription: string;
  productImages: string[];
  backLink: string;
}

export default function ProductPage({
  schoolName,
  productName,
  productPrice,
  productDescription,
  productImages,
  backLink,
}: ProductPageProps) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  /* FIT FINDER (painel lateral) */
  const [openFitFinder, setOpenFitFinder] = useState(false);
  const [fitStep, setFitStep] = useState(1);

  const [altura, setAltura] = useState(175);
  const [peso, setPeso] = useState(74);
  const [sexo, setSexo] = useState<"m" | "f" | null>(null);

  const computeRecommendedSize = (): string => {
    const h = altura / 100;
    const bmi = peso / (h * h);
    let adjust = 0;
    if (sexo === "m") adjust = 0;
    if (sexo === "f") adjust = -0.2;
    const score = bmi + adjust;

    if (score < 20) return "P";
    if (score < 24.5) return "M";
    if (score < 29) return "G";
    return "GG";
  };

  const recommended = computeRecommendedSize();

  const nextImage = () => {
    setActiveIndex((s) => (s + 1) % productImages.length);
  };

  const sizes = ["PP", "P", "M", "G", "GG"];

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      {/* Botão Voltar */}
      <button
        onClick={() => navigate(backLink)}
        className="flex items-center gap-2 text-[#2e3091] hover:text-[#252a7a] mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Voltar</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* ===== GALERIA ===== */}
        <div className="space-y-4">
          <div
            className="relative w-full aspect-[3/4] bg-neutral-100 rounded-2xl overflow-hidden cursor-pointer"
            onClick={nextImage}
            role="button"
            aria-label="Avançar imagem"
          >
            <img
              src={productImages[activeIndex]}
              alt="Imagem principal do produto"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {productImages.map((img, i) => (
              <div
                key={img + i}
                onClick={() => setActiveIndex(i)}
                className={`relative aspect-square rounded-xl overflow-hidden transition-transform transform cursor-pointer ${
                  activeIndex === i ? "scale-105 ring-2 ring-[#2e3091]" : "hover:scale-[1.03]"
                }`}
                role="button"
                aria-label={`Mostrar imagem ${i + 1}`}
              >
                <img src={img} alt={`Imagem ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* ===== INFORMAÇÕES ===== */}
        <div className="flex flex-col">
          <span className="uppercase text-xs tracking-widest text-[#2e3091] mb-2 font-medium">
            {schoolName}
          </span>

          <h1 className="text-2xl font-semibold text-neutral-900 leading-tight">
            {productName}
          </h1>

          <p className="mt-4 text-xl font-bold text-neutral-900">
            {productPrice}
          </p>

          <p className="mt-4 text-sm text-neutral-600 leading-relaxed font-light">
            {productDescription}
          </p>

          {/* ===== TAMANHOS ===== */}
          <div className="mt-6">
            <div className="text-sm font-medium mb-2">Escolha o tamanho</div>
            <div className="flex gap-2">
              {sizes.map((size) => {
                const selected = selectedSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-md text-sm transition-shadow focus:outline-none ${
                      selected
                        ? "bg-[#2e3091] text-white font-semibold"
                        : "bg-white text-neutral-800 border border-neutral-200 hover:shadow-md"
                    } cursor-pointer`}
                    aria-pressed={selected}
                    role="button"
                  >
                    {size}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => {
                  setOpenFitFinder(true);
                  setFitStep(1);
                }}
                className="flex-1 bg-[#2e3091] text-white py-3 rounded-md text-sm font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                Encontrar minha medida ideal
              </button>

              <button
                className="flex-1 border border-neutral-300 py-3 rounded-md text-sm font-semibold hover:shadow-md transition-transform hover:-translate-y-0.5 cursor-pointer bg-white text-neutral-900"
                onClick={() => {}}
              >
                Adicionar ao carrinho
              </button>
            </div>
          </div>

          <div className="mt-6 text-sm text-neutral-500">
            Frete grátis a partir de R$ 200 · Troca ou devolução grátis
          </div>
        </div>
      </div>

      {/* FIT FINDER (PAINEL LATERAL) */}
      <AnimatePresence>
        {openFitFinder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.36 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setOpenFitFinder(false)}
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.38, ease: "easeInOut" }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 p-6 flex flex-col"
              role="dialog"
              aria-modal="true"
            >
              <div className="h-1 w-full bg-neutral-100 rounded mb-6 overflow-hidden">
                <div
                  className="h-full bg-[#2e3091] transition-all"
                  style={{ width: `${(fitStep / 2) * 100}%` }}
                />
              </div>

              {fitStep === 1 && (
                <div className="flex flex-col gap-6">
                  <h2 className="text-lg font-semibold">Seu perfil</h2>

                  <div>
                    <label className="text-sm block mb-1">Altura: <span className="font-medium">{altura} cm</span></label>
                    <input
                      type="range"
                      min={150}
                      max={200}
                      value={altura}
                      onChange={(e) => setAltura(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm block mb-1">Peso: <span className="font-medium">{peso} kg</span></label>
                    <input
                      type="range"
                      min={45}
                      max={140}
                      value={peso}
                      onChange={(e) => setPeso(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setSexo("m")}
                      className={`flex-1 py-3 border rounded-md text-sm font-semibold transition ${
                        sexo === "m"
                          ? "border-[#2e3091] text-[#2e3091] bg-blue-50"
                          : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                      } cursor-pointer`}
                    >
                      Masculino
                    </button>

                    <button
                      onClick={() => setSexo("f")}
                      className={`flex-1 py-3 border rounded-md text-sm font-semibold transition ${
                        sexo === "f"
                          ? "border-[#2e3091] text-[#2e3091] bg-blue-50"
                          : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                      } cursor-pointer`}
                    >
                      Feminino
                    </button>
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <button
                      onClick={() => setOpenFitFinder(false)}
                      className="flex-1 border border-neutral-200 py-3 rounded-md text-sm hover:shadow-sm cursor-pointer"
                    >
                      Cancelar
                    </button>

                    <button
                      onClick={() => setFitStep(2)}
                      disabled={!sexo}
                      className="flex-1 bg-[#2e3091] text-white py-3 rounded-md text-sm font-semibold disabled:opacity-50 cursor-pointer hover:shadow-lg transition-all"
                    >
                      Ver resultado
                    </button>
                  </div>
                </div>
              )}

              {fitStep === 2 && (
                <div className="flex flex-col gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-green-800">Caimento ideal identificado</h3>

                    <p className="mt-2 text-lg font-bold">
                      Tamanho recomendado: <span className="text-green-700">{recommended}</span>
                    </p>

                    <p className="mt-2 text-sm text-neutral-600">
                      Desenvolvido para sua altura e proporção corporal.
                    </p>

                    {recommended === "G" && (
                      <p className="mt-3 text-sm text-orange-600">
                        ⚠️ O tamanho G pode ficar desajustado ao seu corpo.
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <button
                      onClick={() => {
                        setFitStep(1);
                      }}
                      className="flex-1 border border-neutral-200 py-3 rounded-md text-sm hover:shadow-sm cursor-pointer"
                    >
                      Voltar
                    </button>

                    <button
                      onClick={() => {
                        setSelectedSize(recommended);
                        setOpenFitFinder(false);
                      }}
                      className="flex-1 bg-[#2e3091] text-white py-3 rounded-md text-sm font-semibold hover:shadow-lg transition-all cursor-pointer"
                    >
                      Usar tamanho recomendado
                    </button>
                  </div>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <style>{`
        button, [role="button"], a { cursor: pointer; }
      `}</style>
    </main>
  );
}
