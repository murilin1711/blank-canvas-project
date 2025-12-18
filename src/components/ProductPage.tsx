import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";

interface ProductPageProps {
  schoolName: string;
  productName: string;
  productDescription: string;
  price: string;
  images: string[];
  sizes?: string[];
}

export default function ProductPage({
  schoolName,
  productName,
  productDescription,
  price,
  images,
  sizes = ["PP", "P", "M", "G", "GG"],
}: ProductPageProps) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [openFitFinder, setOpenFitFinder] = useState(false);
  const [fitStep, setFitStep] = useState(1);
  const [altura, setAltura] = useState(175);
  const [peso, setPeso] = useState(74);
  const [sexo, setSexo] = useState<"m" | "f" | null>(null);

  const computeRecommendedSize = (): string => {
    const h = altura / 100;
    const bmi = peso / (h * h);
    const adjust = sexo === "f" ? -0.2 : 0;
    const score = bmi + adjust;
    if (score < 20) return "P";
    if (score < 24.5) return "M";
    if (score < 29) return "G";
    return "GG";
  };

  const recommended = computeRecommendedSize();
  const nextImage = () => setActiveIndex((s) => (s + 1) % images.length);

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Voltar */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#2e3091] hover:text-[#252a7a] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-body-regular font-medium">Voltar</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* ===== GALERIA ===== */}
          <div className="space-y-4">
            <div
              className="relative w-full aspect-[3/4] bg-gray-50 rounded-2xl overflow-hidden cursor-pointer border border-gray-100"
              onClick={nextImage}
              role="button"
              aria-label="Avançar imagem"
            >
              <img
                src={images[activeIndex]}
                alt="Imagem principal do produto"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {images.map((img, i) => (
                <div
                  key={img + i}
                  onClick={() => setActiveIndex(i)}
                  className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all ${
                    activeIndex === i
                      ? "scale-105 ring-2 ring-[#2e3091]"
                      : "hover:scale-[1.03] border border-gray-100"
                  }`}
                  role="button"
                  aria-label={`Mostrar imagem ${i + 1}`}
                >
                  <img
                    src={img}
                    alt={`Imagem ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ===== INFORMAÇÕES ===== */}
          <div className="flex flex-col">
            <span className="uppercase text-xs tracking-widest text-[#2e3091] mb-2 font-medium">
              {schoolName}
            </span>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 leading-tight">
              {productName}
            </h1>
            <p className="mt-4 text-xl font-bold text-gray-900">{price}</p>
            <p className="mt-4 text-sm text-gray-600 leading-relaxed">
              {productDescription}
            </p>

            {/* ===== TAMANHOS ===== */}
            <div className="mt-6">
              <div className="text-sm font-medium mb-2 text-gray-900">
                Escolha o tamanho
              </div>
              <div className="flex gap-2 flex-wrap">
                {sizes.map((size) => {
                  const selected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-md text-sm transition-all ${
                        selected
                          ? "bg-[#2e3091] text-white font-semibold shadow-md"
                          : "bg-white text-gray-800 border border-gray-200 hover:shadow-md hover:border-[#2e3091]"
                      }`}
                      aria-pressed={selected}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>

              {/* Botões de ação */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setOpenFitFinder(true);
                    setFitStep(1);
                  }}
                  className="flex-1 bg-[#2e3091] text-white py-3 px-6 rounded-lg text-sm font-semibold hover:bg-[#252a7a] hover:shadow-lg transition-all"
                >
                  Encontrar minha medida ideal
                </button>
                <button className="flex-1 border-2 border-[#2e3091] text-[#2e3091] py-3 px-6 rounded-lg text-sm font-semibold hover:bg-[#2e3091] hover:text-white transition-all">
                  Adicionar ao carrinho
                </button>
              </div>
            </div>

            <div className="mt-6 text-sm text-gray-500 flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              Frete grátis a partir de R$ 200 · Troca ou devolução grátis
            </div>
          </div>
        </div>
      </div>

      {/* =========================
         FIT FINDER (PAINEL LATERAL)
      ========================= */}
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
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 p-6 flex flex-col shadow-2xl"
              role="dialog"
              aria-modal="true"
            >
              {/* Progresso */}
              <div className="h-1 w-full bg-gray-100 rounded mb-6 overflow-hidden">
                <div
                  className="h-full bg-[#2e3091] transition-all"
                  style={{ width: `${(fitStep / 2) * 100}%` }}
                />
              </div>

              {/* ETAPA 1: perfil */}
              {fitStep === 1 && (
                <div className="flex flex-col gap-6 flex-1">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Seu perfil
                  </h2>
                  <div>
                    <label className="text-sm block mb-2 text-gray-700">
                      Altura:{" "}
                      <span className="font-medium text-gray-900">
                        {altura} cm
                      </span>
                    </label>
                    <input
                      type="range"
                      min={150}
                      max={200}
                      value={altura}
                      onChange={(e) => setAltura(Number(e.target.value))}
                      className="w-full accent-[#2e3091]"
                    />
                  </div>
                  <div>
                    <label className="text-sm block mb-2 text-gray-700">
                      Peso:{" "}
                      <span className="font-medium text-gray-900">
                        {peso} kg
                      </span>
                    </label>
                    <input
                      type="range"
                      min={45}
                      max={140}
                      value={peso}
                      onChange={(e) => setPeso(Number(e.target.value))}
                      className="w-full accent-[#2e3091]"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSexo("m")}
                      className={`flex-1 py-3 border rounded-lg text-sm font-semibold transition ${
                        sexo === "m"
                          ? "border-[#2e3091] text-[#2e3091] bg-blue-50"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Masculino
                    </button>
                    <button
                      onClick={() => setSexo("f")}
                      className={`flex-1 py-3 border rounded-lg text-sm font-semibold transition ${
                        sexo === "f"
                          ? "border-[#2e3091] text-[#2e3091] bg-blue-50"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Feminino
                    </button>
                  </div>
                  <div className="flex gap-3 mt-auto">
                    <button
                      onClick={() => setOpenFitFinder(false)}
                      className="flex-1 border border-gray-200 py-3 rounded-lg text-sm hover:shadow-sm text-gray-700"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => setFitStep(2)}
                      disabled={!sexo}
                      className="flex-1 bg-[#2e3091] text-white py-3 rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-[#252a7a] hover:shadow-lg transition-all"
                    >
                      Ver resultado
                    </button>
                  </div>
                </div>
              )}

              {/* ETAPA 2: resultado */}
              {fitStep === 2 && (
                <div className="flex flex-col gap-4 flex-1">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-green-800">
                      Caimento ideal identificado
                    </h3>
                    <p className="mt-2 text-lg font-bold text-gray-900">
                      Tamanho recomendado:{" "}
                      <span className="text-green-700">{recommended}</span>
                    </p>
                    <p className="mt-2 text-sm text-gray-600">
                      Desenvolvido para sua altura e proporção corporal.
                    </p>
                  </div>
                  <div className="flex gap-3 mt-auto">
                    <button
                      onClick={() => setFitStep(1)}
                      className="flex-1 border border-gray-200 py-3 rounded-lg text-sm hover:shadow-sm text-gray-700"
                    >
                      Voltar
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSize(recommended);
                        setOpenFitFinder(false);
                      }}
                      className="flex-1 bg-[#2e3091] text-white py-3 rounded-lg text-sm font-semibold hover:bg-[#252a7a] hover:shadow-lg transition-all"
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

      <Footer />
    </main>
  );
}
