"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function Produto1Page() {
  const productImages = [
    "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=80",
  ];
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
    let adjust = sexo === "f" ? -0.2 : 0;
    const score = bmi + adjust;
    if (score < 20) return "P";
    if (score < 24.5) return "M";
    if (score < 29) return "G";
    return "GG";
  };

  const recommended = computeRecommendedSize();
  const nextImage = () => setActiveIndex((s) => (s + 1) % productImages.length);
  const sizes = ["PP", "P", "M", "G", "GG"];

  return (
    <main className="max-w-6xl mx-auto px-6 py-10 bg-background">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div
            className="relative w-full aspect-[3/4] bg-muted rounded-2xl overflow-hidden cursor-pointer"
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
                className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-transform transform ${
                  activeIndex === i ? "scale-105 ring-2 ring-primary" : "hover:scale-[1.03]"
                }`}
                role="button"
                aria-label={`Mostrar imagem ${i + 1}`}
              >
                <img src={img} alt={`Imagem ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <span className="uppercase text-xs tracking-widest text-primary mb-2 font-medium">
            Colégio Militar
          </span>
          <h1 className="text-h2 text-foreground leading-tight">
            Camisa Nature Jacquard Atoalhado
          </h1>
          <p className="mt-4 text-xl font-bold text-foreground">R$ 697,00</p>
          <p className="mt-4 text-body-regular text-muted-foreground leading-relaxed">
            Camisa confeccionada em jacquard atoalhado de algodão com textura exclusiva. 
            Modelagem confortável e acabamento premium.
          </p>

          {/* Size Selection */}
          <div className="mt-6">
            <div className="text-sm font-medium mb-2 text-foreground">Escolha o tamanho</div>
            <div className="flex gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`cursor-pointer px-4 py-2 rounded-md text-sm transition-shadow focus:outline-none ${
                    selectedSize === size
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-background text-foreground border border-border hover:shadow-md"
                  }`}
                  aria-pressed={selectedSize === size}
                >
                  {size}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex gap-3">
              <Button
                onClick={() => { setOpenFitFinder(true); setFitStep(1); }}
                className="flex-1"
              >
                Encontrar minha medida ideal
              </Button>
              <Button
                variant="outline"
                className="flex-1"
              >
                Adicionar ao carrinho
              </Button>
            </div>
          </div>

          <div className="mt-6 text-sm text-muted-foreground">
            Frete grátis a partir de R$ 200 · Troca ou devolução grátis
          </div>
        </div>
      </div>

      {/* Fit Finder Modal */}
      <AnimatePresence>
        {openFitFinder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.36 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40 cursor-pointer"
              onClick={() => setOpenFitFinder(false)}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.38, ease: "easeInOut" }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-background z-50 p-6 flex flex-col"
              role="dialog"
              aria-modal="true"
            >
              {/* Progress Bar */}
              <div className="h-1 w-full bg-muted rounded mb-6 overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${(fitStep / 2) * 100}%` }}
                />
              </div>

              {fitStep === 1 && (
                <div className="flex flex-col gap-6">
                  <h2 className="text-h3 text-foreground">Seu perfil</h2>
                  <div>
                    <label className="text-sm block mb-1 text-foreground">
                      Altura: <span className="font-medium">{altura} cm</span>
                    </label>
                    <input
                      type="range"
                      min={150}
                      max={200}
                      value={altura}
                      onChange={(e) => setAltura(Number(e.target.value))}
                      className="w-full cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-sm block mb-1 text-foreground">
                      Peso: <span className="font-medium">{peso} kg</span>
                    </label>
                    <input
                      type="range"
                      min={45}
                      max={140}
                      value={peso}
                      onChange={(e) => setPeso(Number(e.target.value))}
                      className="w-full cursor-pointer"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSexo("m")}
                      className={`cursor-pointer flex-1 py-3 border rounded-md text-sm font-semibold transition ${
                        sexo === "m"
                          ? "border-primary text-primary bg-primary/10"
                          : "border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      Masculino
                    </button>
                    <button
                      onClick={() => setSexo("f")}
                      className={`cursor-pointer flex-1 py-3 border rounded-md text-sm font-semibold transition ${
                        sexo === "f"
                          ? "border-primary text-primary bg-primary/10"
                          : "border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      Feminino
                    </button>
                  </div>
                  <div className="flex gap-3 mt-auto">
                    <Button
                      variant="outline"
                      onClick={() => setOpenFitFinder(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => setFitStep(2)}
                      disabled={!sexo}
                      className="flex-1"
                    >
                      Ver resultado
                    </Button>
                  </div>
                </div>
              )}

              {fitStep === 2 && (
                <div className="flex flex-col gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-green-800">
                      Caimento ideal identificado
                    </h3>
                    <p className="mt-2 text-lg font-bold text-foreground">
                      Tamanho recomendado: <span className="text-green-700">{recommended}</span>
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Desenvolvido para sua altura e proporção corporal.
                    </p>
                  </div>
                  <div className="flex gap-3 mt-auto">
                    <Button
                      variant="outline"
                      onClick={() => setFitStep(1)}
                      className="flex-1"
                    >
                      Voltar
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedSize(recommended);
                        setOpenFitFinder(false);
                      }}
                      className="flex-1"
                    >
                      Usar tamanho recomendado
                    </Button>
                  </div>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
