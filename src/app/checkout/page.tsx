import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import Footer from "@/components/sections/footer";
import { ArrowLeft, Plus, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

type CheckoutStep = "cart" | "personal" | "address" | "shipping" | "payment";

interface PersonalData {
  name: string;
  lastName: string;
  cpf: string;
  phone: string;
  email: string;
}

interface AddressData {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, removeItem, subtotal, clearCart } = useCart();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>("cart");
  const [personal, setPersonal] = useState<PersonalData>({
    name: "",
    lastName: "",
    cpf: "",
    phone: "",
    email: user?.email || "",
  });
  const [address, setAddress] = useState<AddressData>({
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  });
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "credit" | "boleto">("pix");

  const steps: { key: CheckoutStep; label: string }[] = [
    { key: "cart", label: "Pedido" },
    { key: "personal", label: "Informações pessoais" },
    { key: "address", label: "Endereço de entrega" },
    { key: "shipping", label: "Forma de envio" },
    { key: "payment", label: "Pagamento" },
  ];

  const stepIndex = steps.findIndex((s) => s.key === currentStep);
  const shipping = shippingMethod === "express" ? 25 : subtotal >= 200 ? 0 : 15;
  const total = subtotal + shipping;

  const goToStep = (step: CheckoutStep) => {
    const targetIndex = steps.findIndex((s) => s.key === step);
    if (targetIndex <= stepIndex) {
      setCurrentStep(step);
    }
  };

  const nextStep = () => {
    if (currentStep === "cart") {
      if (items.length === 0) {
        toast.error("Seu carrinho está vazio", { duration: 2000 });
        return;
      }
      setCurrentStep("personal");
    } else if (currentStep === "personal") {
      if (!personal.name || !personal.lastName || !personal.email) {
        toast.error("Preencha todos os campos obrigatórios", { duration: 2000 });
        return;
      }
      setCurrentStep("address");
    } else if (currentStep === "address") {
      if (!address.cep || !address.street || !address.number || !address.city || !address.state) {
        toast.error("Preencha todos os campos obrigatórios", { duration: 2000 });
        return;
      }
      setCurrentStep("shipping");
    } else if (currentStep === "shipping") {
      setCurrentStep("payment");
    } else if (currentStep === "payment") {
      toast.success("Pedido realizado com sucesso!", { duration: 2000 });
      clearCart();
      navigate("/");
    }
  };

  return (
    <main className="min-h-screen bg-white pt-[100px]">
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#2e3091] hover:text-[#252a7a] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Voltar</span>
        </button>

        {/* Step content - FIRST */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* CART STEP */}
            {currentStep === "cart" && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Confirme seu pedido
                </h2>

                {items.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500 mb-4">Seu carrinho está vazio</p>
                    <button
                      onClick={() => navigate("/")}
                      className="text-[#2e3091] hover:underline"
                    >
                      Continuar comprando
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {items.map((item) => (
                      <div
                        key={`${item.productId}-${item.size}`}
                        className="flex gap-4 pb-6 border-b border-gray-100"
                      >
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {item.productName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Tamanho: {item.size}
                          </p>
                          <p className="text-sm text-gray-500">
                            Qtd: {item.quantity}
                          </p>
                          <div className="flex gap-4 mt-2">
                            <button
                              onClick={() => navigate("/")}
                              className="text-sm text-[#2e3091] hover:underline flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              Continuar comprando
                            </button>
                            <button
                              onClick={() => removeItem(item.productId, item.size)}
                              className="text-sm text-red-500 hover:underline flex items-center gap-1"
                            >
                              <X className="w-3 h-3" />
                              Remover
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Summary */}
                    <div className="pt-4 space-y-2 text-right">
                      <div className="flex justify-end gap-8">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">
                          R$ {subtotal.toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                      <div className="flex justify-end gap-8">
                        <span className="text-[#2e3091]">Frete</span>
                        <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>
                          {shipping === 0 ? "Grátis" : `R$ ${shipping.toFixed(2).replace(".", ",")}`}
                        </span>
                      </div>
                      <div className="flex justify-end gap-8 pt-2 border-t border-gray-100">
                        <span className="font-semibold">Total</span>
                        <span className="font-bold text-lg">
                          R$ {total.toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PERSONAL STEP */}
            {currentStep === "personal" && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Informações pessoais
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Nome"
                    value={personal.name}
                    onChange={(e) => setPersonal({ ...personal, name: e.target.value })}
                    className="px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#2e3091]"
                  />
                  <input
                    type="text"
                    placeholder="Sobrenome"
                    value={personal.lastName}
                    onChange={(e) => setPersonal({ ...personal, lastName: e.target.value })}
                    className="px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#2e3091]"
                  />
                  <input
                    type="text"
                    placeholder="CPF"
                    value={personal.cpf}
                    onChange={(e) => setPersonal({ ...personal, cpf: e.target.value })}
                    className="px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#2e3091]"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Telefone"
                    value={personal.phone}
                    onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                    className="px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#2e3091]"
                  />
                  <input
                    type="email"
                    placeholder="E-mail"
                    value={personal.email}
                    onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
                    className="px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#2e3091]"
                  />
                </div>
              </div>
            )}

            {/* ADDRESS STEP */}
            {currentStep === "address" && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Endereço de entrega
                </h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="CEP"
                    value={address.cep}
                    onChange={(e) => setAddress({ ...address, cep: e.target.value })}
                    className="w-full md:w-1/3 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#2e3091]"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Rua"
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      className="md:col-span-2 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#2e3091]"
                    />
                    <input
                      type="text"
                      placeholder="Número"
                      value={address.number}
                      onChange={(e) => setAddress({ ...address, number: e.target.value })}
                      className="px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#2e3091]"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Complemento"
                      value={address.complement}
                      onChange={(e) => setAddress({ ...address, complement: e.target.value })}
                      className="px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#2e3091]"
                    />
                    <input
                      type="text"
                      placeholder="Bairro"
                      value={address.neighborhood}
                      onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
                      className="px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#2e3091]"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Cidade"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#2e3091]"
                    />
                    <input
                      type="text"
                      placeholder="Estado"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      className="px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#2e3091]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SHIPPING STEP */}
            {currentStep === "shipping" && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Forma de envio
                </h2>
                <div className="space-y-4">
                  <label
                    className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition ${
                      shippingMethod === "standard"
                        ? "border-[#2e3091] bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={shippingMethod === "standard"}
                        onChange={() => setShippingMethod("standard")}
                        className="accent-[#2e3091]"
                      />
                      <div>
                        <p className="font-medium">Envio Padrão</p>
                        <p className="text-sm text-gray-500">5-10 dias úteis</p>
                      </div>
                    </div>
                    <span className={subtotal >= 200 ? "text-green-600 font-medium" : ""}>
                      {subtotal >= 200 ? "Grátis" : "R$ 15,00"}
                    </span>
                  </label>

                  <label
                    className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition ${
                      shippingMethod === "express"
                        ? "border-[#2e3091] bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={shippingMethod === "express"}
                        onChange={() => setShippingMethod("express")}
                        className="accent-[#2e3091]"
                      />
                      <div>
                        <p className="font-medium">Envio Expresso</p>
                        <p className="text-sm text-gray-500">2-3 dias úteis</p>
                      </div>
                    </div>
                    <span>R$ 25,00</span>
                  </label>
                </div>
              </div>
            )}

            {/* PAYMENT STEP */}
            {currentStep === "payment" && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Forma de pagamento
                </h2>
                <div className="space-y-4">
                  <label
                    className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition ${
                      paymentMethod === "pix"
                        ? "border-[#2e3091] bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      checked={paymentMethod === "pix"}
                      onChange={() => setPaymentMethod("pix")}
                      className="accent-[#2e3091]"
                    />
                    <div>
                      <p className="font-medium">PIX</p>
                      <p className="text-sm text-gray-500">Aprovação imediata</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition ${
                      paymentMethod === "credit"
                        ? "border-[#2e3091] bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      checked={paymentMethod === "credit"}
                      onChange={() => setPaymentMethod("credit")}
                      className="accent-[#2e3091]"
                    />
                    <div>
                      <p className="font-medium">Cartão de Crédito</p>
                      <p className="text-sm text-gray-500">Em até 12x sem juros</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition ${
                      paymentMethod === "boleto"
                        ? "border-[#2e3091] bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      checked={paymentMethod === "boleto"}
                      onChange={() => setPaymentMethod("boleto")}
                      className="accent-[#2e3091]"
                    />
                    <div>
                      <p className="font-medium">Boleto Bancário</p>
                      <p className="text-sm text-gray-500">Vencimento em 3 dias</p>
                    </div>
                  </label>
                </div>

                {/* Final summary */}
                <div className="mt-8 p-4 bg-gray-50 rounded-xl">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Frete</span>
                      <span className={shipping === 0 ? "text-green-600" : ""}>
                        {shipping === 0 ? "Grátis" : `R$ ${shipping.toFixed(2).replace(".", ",")}`}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold">
                      <span>Total</span>
                      <span className="text-lg">R$ {total.toFixed(2).replace(".", ",")}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Continue button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={nextStep}
            className="bg-gray-900 text-white px-12 py-4 rounded-full font-semibold hover:bg-gray-800 transition-colors"
          >
            {currentStep === "payment" ? "Finalizar pedido" : "Continuar"}
          </button>
        </div>

        {/* Steps indicator - AT BOTTOM with checks */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <div className="space-y-1">
            {steps.map((step, index) => {
              const isActive = step.key === currentStep;
              const isPast = index < stepIndex;
              const isFuture = index > stepIndex;

              return (
                <div key={step.key}>
                  <button
                    onClick={() => goToStep(step.key)}
                    disabled={isFuture}
                    className={`w-full text-left py-3 px-1 border-b transition-all ${
                      isActive
                        ? "border-[#2e3091] text-gray-900 font-semibold"
                        : isPast
                        ? "border-green-500 text-green-700 cursor-pointer hover:text-green-800"
                        : "border-gray-100 text-gray-300 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isPast && (
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                        {isActive && (
                          <div className="w-5 h-5 bg-[#2e3091] rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </div>
                        )}
                        {isFuture && (
                          <div className="w-5 h-5 border-2 border-gray-200 rounded-full" />
                        )}
                        <span className={isActive ? "text-lg" : "text-base"}>
                          {step.label}
                        </span>
                      </div>
                      {isPast && <span className="text-xs text-green-600">Concluído</span>}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
