import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, AlertCircle, Check, Shield, Lock, X, Eye, EyeOff, Loader2, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface BolsaUniformePaymentProps {
  onComplete: (data: { qrCodeImage: string; password: string; amount: number }) => Promise<void>;
  onCancel: () => void;
  suggestedAmount: number; // valor sugerido (saldo restante, máx R$970)
  maxAmount: number;       // valor máximo permitido neste cartão
  cardNumber: number;      // número do cartão (1, 2 ou 3)
}

type Step = "amount" | "photo" | "password" | "consent";

const STEPS: Step[] = ["amount", "photo", "password", "consent"];

export function BolsaUniformePayment({
  onComplete,
  onCancel,
  suggestedAmount,
  maxAmount,
  cardNumber,
}: BolsaUniformePaymentProps) {
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState<string>(suggestedAmount.toFixed(2).replace(".", ","));
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parsedAmount = parseFloat(amount.replace(",", ".")) || 0;
  const stepIndex = STEPS.indexOf(step);

  const stepLabel = {
    amount: `Passo 1 de 4 - Valor`,
    photo: `Passo 2 de 4 - Foto do QR Code`,
    password: `Passo 3 de 4 - Senha`,
    consent: `Passo 4 de 4 - Confirmação`,
  }[step];

  /* ---------- Amount ---------- */
  const handleAmountChange = (val: string) => {
    // Permite apenas números e vírgula/ponto
    const clean = val.replace(/[^0-9.,]/g, "").replace(".", ",");
    setAmount(clean);
  };

  const handleAmountSubmit = () => {
    if (parsedAmount <= 0) {
      toast.error("Digite um valor válido");
      return;
    }
    if (parsedAmount > maxAmount) {
      toast.error(`O valor máximo para este cartão é R$ ${maxAmount.toFixed(2).replace(".", ",")}`);
      return;
    }
    setStep("photo");
  };

  /* ---------- Photo ---------- */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Arquivo muito grande. Máximo 10MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setQrCodeImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoSubmit = () => {
    if (!qrCodeImage) {
      toast.error("Por favor, tire uma foto do QR Code");
      return;
    }
    setStep("password");
  };

  /* ---------- Password ---------- */
  const handlePasswordSubmit = () => {
    if (password.length < 4) {
      toast.error("A senha deve ter pelo menos 4 dígitos");
      return;
    }
    setStep("consent");
  };

  /* ---------- Consent ---------- */
  const handleConsent = async () => {
    setIsProcessing(true);
    try {
      await onComplete({ qrCodeImage: qrCodeImage!, password, amount: parsedAmount });
    } catch {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={!isProcessing ? onCancel : undefined} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white p-6 pb-4 border-b border-gray-100 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Bolsa Uniforme — Cartão {cardNumber}
              </h2>
              <p className="text-sm text-gray-500 mt-1">{stepLabel}</p>
            </div>
            <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          {/* Progress bar */}
          <div className="flex gap-2 mt-4">
            {STEPS.map((s, i) => (
              <div
                key={s}
                className={`flex-1 h-1 rounded-full transition-colors ${
                  stepIndex >= i ? "bg-[#2e3091]" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">

            {/* Step 1: Valor */}
            {step === "amount" && (
              <motion.div
                key="amount"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#2e3091]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-8 h-8 text-[#2e3091]" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Quanto usar neste cartão?</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Máximo de R$ {maxAmount.toFixed(2).replace(".", ",")} (limite R$ 970,00 por cartão)
                  </p>
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="w-full text-center text-2xl font-semibold px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:border-[#2e3091] focus:ring-2 focus:ring-[#2e3091]/20"
                    placeholder="0,00"
                  />
                </div>

                {/* Atalhos rápidos */}
                <div className="flex gap-2 flex-wrap justify-center">
                  {[suggestedAmount, suggestedAmount / 2, suggestedAmount / 3]
                    .filter((v, i, arr) => v > 0 && arr.indexOf(v) === i && v !== suggestedAmount || i === 0)
                    .slice(0, 3)
                    .map((v) => (
                      <button
                        key={v}
                        onClick={() => setAmount(v.toFixed(2).replace(".", ","))}
                        className="px-3 py-1.5 text-sm border border-[#2e3091] text-[#2e3091] rounded-full hover:bg-[#2e3091]/5 transition-colors"
                      >
                        R$ {v.toFixed(2).replace(".", ",")}
                      </button>
                    ))}
                </div>

                <button
                  onClick={handleAmountSubmit}
                  disabled={parsedAmount <= 0 || parsedAmount > maxAmount}
                  className="w-full bg-[#2e3091] text-white py-4 rounded-full font-medium hover:bg-[#252a7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuar
                </button>
              </motion.div>
            )}

            {/* Step 2: Foto */}
            {step === "photo" && (
              <motion.div
                key="photo"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Atenção!</p>
                      <ul className="text-sm text-amber-700 mt-2 space-y-1">
                        <li>• Tire a foto do QR Code que fica atrás do seu cartão</li>
                        <li>• Verifique se a imagem está nítida e legível</li>
                        <li>• Certifique-se que todo o QR Code está visível</li>
                        <li>• Evite reflexos e sombras na foto</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                    qrCodeImage
                      ? "border-green-400 bg-green-50"
                      : "border-gray-300 hover:border-[#2e3091] hover:bg-gray-50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {qrCodeImage ? (
                    <div className="space-y-4">
                      <img src={qrCodeImage} alt="QR Code capturado" className="max-h-48 mx-auto rounded-lg shadow-md" />
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <Check className="w-5 h-5" />
                        <span className="text-sm font-medium">Foto capturada!</span>
                      </div>
                      <button type="button" className="text-sm text-[#2e3091] underline">
                        Tirar outra foto
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                        <Camera className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Toque para tirar foto ou selecionar</p>
                        <p className="text-xs text-gray-500 mt-1">Formatos aceitos: JPG, PNG</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep("amount")}
                    className="flex-1 py-4 border border-gray-200 rounded-full font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handlePhotoSubmit}
                    disabled={!qrCodeImage}
                    className="flex-1 bg-[#2e3091] text-white py-4 rounded-full font-medium hover:bg-[#252a7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continuar
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Senha */}
            {step === "password" && (
              <motion.div
                key="password"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#2e3091]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-[#2e3091]" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Digite sua senha</h3>
                  <p className="text-sm text-gray-500 mt-2">Insira a senha do seu cartão Bolsa Uniforme</p>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="••••••"
                    className="w-full text-center text-2xl tracking-[0.5em] px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:border-[#2e3091] focus:ring-2 focus:ring-[#2e3091]/20"
                    maxLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Shield className="w-4 h-4" />
                  <span>Sua senha é protegida por criptografia</span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep("photo")}
                    className="flex-1 py-4 border border-gray-200 rounded-full font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handlePasswordSubmit}
                    disabled={password.length < 4}
                    className="flex-1 bg-[#2e3091] text-white py-4 rounded-full font-medium hover:bg-[#252a7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continuar
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Consentimento */}
            {step === "consent" && (
              <motion.div
                key="consent"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Termo de Consentimento</h3>
                  <p className="text-sm text-[#2e3091] font-semibold mt-1">
                    Valor: R$ {parsedAmount.toFixed(2).replace(".", ",")}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-5 space-y-4 text-sm text-gray-700">
                  <p>
                    Ao prosseguir, você concorda que seus dados serão utilizados
                    <strong> exclusivamente</strong> para processar sua compra na loja
                    <strong> Goiás Minas Uniformes</strong>.
                  </p>

                  <div className="space-y-3 pt-2">
                    {[
                      { title: "Proteção garantida:", desc: "Seus dados são protegidos por criptografia de ponta a ponta" },
                      { title: "Uso exclusivo:", desc: "Os dados serão usados somente para processar esta compra" },
                      { title: "Exclusão automática:", desc: "Após a conclusão do processamento, todos os dados são apagados automaticamente de nossos sistemas" },
                    ].map(({ title, desc }) => (
                      <div key={title} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5 text-green-600" />
                        </div>
                        <p><strong>{title}</strong> {desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep("password")}
                    disabled={isProcessing}
                    className="flex-1 py-4 border border-gray-200 rounded-full font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleConsent}
                    disabled={isProcessing}
                    className="flex-1 bg-[#2e3091] text-white py-4 rounded-full font-medium hover:bg-[#252a7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      "Concordo e Prosseguir"
                    )}
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
