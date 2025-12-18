import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import Footer from "@/components/sections/footer";
import { ArrowLeft, Minus, Plus, Check, ChevronDown } from "lucide-react";
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
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCart();
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
    { key: "cart", label: "Sacola" },
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

  const completeStep = () => {
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

  const renderStepContent = (stepKey: CheckoutStep) => {
    switch (stepKey) {
      case "cart":
        return (
          <div className="py-4">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Sua sacola está vazia</p>
                <button
                  onClick={() => navigate("/")}
                  className="text-gray-900 underline hover:no-underline text-sm"
                >
                  Continuar comprando
                </button>
              </div>
            ) : (
              <div className="space-y-0">
                {items.map((item, index) => (
                  <div
                    key={`${item.productId}-${item.size}`}
                    className={`flex gap-4 py-6 ${index !== items.length - 1 ? "border-b border-gray-100" : ""}`}
                  >
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-20 h-28 object-cover bg-gray-50"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm">
                          {item.productName}
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {item.size}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-gray-200 rounded">
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, Math.max(1, item.quantity - 1))}
                            className="p-2 hover:bg-gray-50 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                            className="p-2 hover:bg-gray-50 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col justify-between items-end">
                      <p className="font-medium text-gray-900 text-sm">
                        R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}
                      </p>
                      <button
                        onClick={() => removeItem(item.productId, item.size)}
                        className="text-xs text-gray-500 border border-gray-200 rounded px-3 py-1 hover:bg-gray-50 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "personal":
        return (
          <div className="py-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nome *"
                value={personal.name}
                onChange={(e) => setPersonal({ ...personal, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
              />
              <input
                type="text"
                placeholder="Sobrenome *"
                value={personal.lastName}
                onChange={(e) => setPersonal({ ...personal, lastName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="CPF"
                value={personal.cpf}
                onChange={(e) => setPersonal({ ...personal, cpf: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
              />
              <input
                type="text"
                placeholder="Telefone"
                value={personal.phone}
                onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
              />
            </div>
            <input
              type="email"
              placeholder="E-mail *"
              value={personal.email}
              onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
            />
          </div>
        );

      case "address":
        return (
          <div className="py-6 space-y-4">
            <input
              type="text"
              placeholder="CEP *"
              value={address.cep}
              onChange={(e) => setAddress({ ...address, cep: e.target.value })}
              className="w-full md:w-1/3 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
            />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Rua *"
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                className="md:col-span-3 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
              />
              <input
                type="text"
                placeholder="Número *"
                value={address.number}
                onChange={(e) => setAddress({ ...address, number: e.target.value })}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Complemento"
                value={address.complement}
                onChange={(e) => setAddress({ ...address, complement: e.target.value })}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
              />
              <input
                type="text"
                placeholder="Bairro *"
                value={address.neighborhood}
                onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Cidade *"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
              />
              <input
                type="text"
                placeholder="Estado *"
                value={address.state}
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
              />
            </div>
          </div>
        );

      case "shipping":
        return (
          <div className="py-6 space-y-3">
            <label
              className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition ${
                shippingMethod === "standard"
                  ? "border-gray-900 bg-gray-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  checked={shippingMethod === "standard"}
                  onChange={() => setShippingMethod("standard")}
                  className="accent-gray-900"
                />
                <div>
                  <p className="font-medium text-sm">Envio Padrão</p>
                  <p className="text-xs text-gray-500">5-10 dias úteis</p>
                </div>
              </div>
              <span className={`text-sm ${subtotal >= 200 ? "text-green-600" : ""}`}>
                {subtotal >= 200 ? "Grátis" : "R$ 15,00"}
              </span>
            </label>

            <label
              className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition ${
                shippingMethod === "express"
                  ? "border-gray-900 bg-gray-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  checked={shippingMethod === "express"}
                  onChange={() => setShippingMethod("express")}
                  className="accent-gray-900"
                />
                <div>
                  <p className="font-medium text-sm">Envio Expresso</p>
                  <p className="text-xs text-gray-500">2-3 dias úteis</p>
                </div>
              </div>
              <span className="text-sm">R$ 25,00</span>
            </label>
          </div>
        );

      case "payment":
        return (
          <div className="py-6 space-y-3">
            <label
              className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition ${
                paymentMethod === "pix"
                  ? "border-gray-900 bg-gray-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                checked={paymentMethod === "pix"}
                onChange={() => setPaymentMethod("pix")}
                className="accent-gray-900"
              />
              <div>
                <p className="font-medium text-sm">PIX</p>
                <p className="text-xs text-gray-500">Aprovação imediata</p>
              </div>
            </label>

            <label
              className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition ${
                paymentMethod === "credit"
                  ? "border-gray-900 bg-gray-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                checked={paymentMethod === "credit"}
                onChange={() => setPaymentMethod("credit")}
                className="accent-gray-900"
              />
              <div>
                <p className="font-medium text-sm">Cartão de Crédito</p>
                <p className="text-xs text-gray-500">Em até 12x sem juros</p>
              </div>
            </label>

            <label
              className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition ${
                paymentMethod === "boleto"
                  ? "border-gray-900 bg-gray-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                checked={paymentMethod === "boleto"}
                onChange={() => setPaymentMethod("boleto")}
                className="accent-gray-900"
              />
              <div>
                <p className="font-medium text-sm">Boleto Bancário</p>
                <p className="text-xs text-gray-500">Vencimento em 3 dias</p>
              </div>
            </label>

            {/* Final summary */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Frete</span>
                  <span className={shipping === 0 ? "text-green-600" : ""}>
                    {shipping === 0 ? "Grátis" : `R$ ${shipping.toFixed(2).replace(".", ",")}`}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-100 font-medium">
                  <span>Total</span>
                  <span>R$ {total.toFixed(2).replace(".", ",")}</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepSummary = (stepKey: CheckoutStep): string | null => {
    const idx = steps.findIndex((s) => s.key === stepKey);
    if (idx >= stepIndex) return null;

    switch (stepKey) {
      case "cart":
        return `${items.length} ${items.length === 1 ? "item" : "itens"}`;
      case "personal":
        return personal.name && personal.lastName ? `${personal.name} ${personal.lastName}` : null;
      case "address":
        return address.city && address.state ? `${address.city}, ${address.state}` : null;
      case "shipping":
        return shippingMethod === "express" ? "Envio Expresso" : "Envio Padrão";
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-white pt-[100px]">
      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Back button */}
        <button
          type="button"
          onClick={() => {
            if (currentStep === "cart") {
              navigate(-1);
            } else {
              const stepOrder: CheckoutStep[] = ["cart", "personal", "address", "shipping", "payment"];
              const currentIndex = stepOrder.indexOf(currentStep);
              if (currentIndex > 0) {
                setCurrentStep(stepOrder[currentIndex - 1]);
              }
            }
          }}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Voltar</span>
        </button>

        {/* Accordion Steps */}
        <div className="space-y-0">
          {steps.map((step, index) => {
            const isActive = step.key === currentStep;
            const isPast = index < stepIndex;
            const isFuture = index > stepIndex;
            const summary = getStepSummary(step.key);

            return (
              <div key={step.key} className="border-b border-gray-100">
                {/* Step Header */}
                <button
                  onClick={() => {
                    if (isPast) goToStep(step.key);
                  }}
                  disabled={isFuture}
                  className={`w-full text-left py-4 flex items-center justify-between transition-colors ${
                    isFuture ? "cursor-not-allowed" : isPast ? "cursor-pointer hover:bg-gray-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Step indicator */}
                    {isPast ? (
                      <div className="w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    ) : isActive ? (
                      <div className="w-5 h-5 border-2 border-gray-900 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-gray-900 rounded-full" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 border border-gray-300 rounded-full" />
                    )}

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium ${
                          isFuture ? "text-gray-300" : "text-gray-900"
                        }`}
                      >
                        {step.label}
                      </span>
                      {step.key === "cart" && items.length > 0 && (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                          {items.length}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isPast && summary && (
                      <span className="text-sm text-gray-500">{summary}</span>
                    )}
                    {isActive && (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Step Content */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      {renderStepContent(step.key)}

                      {/* Continue button inside step */}
                      <div className="pb-6">
                        <button
                          onClick={completeStep}
                          className="w-full bg-gray-900 text-white py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors text-sm"
                        >
                          {currentStep === "payment" ? "Finalizar pedido" : "Continuar"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Summary bar fixed at bottom on mobile */}
        {items.length > 0 && currentStep !== "payment" && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Subtotal ({items.length} {items.length === 1 ? "item" : "itens"})</span>
              <span className="font-medium">R$ {subtotal.toFixed(2).replace(".", ",")}</span>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
