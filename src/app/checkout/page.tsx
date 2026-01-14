import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import CheckoutFooter from "@/components/sections/checkout-footer";
import { Check, Home, ChevronDown, CreditCard, Wallet, X } from "lucide-react";
import { BolsaUniformePayment } from "@/components/BolsaUniformePayment";
import { StripeCustomPayment } from "@/components/StripeCustomPayment";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// Input field component - MUST be outside main component to prevent focus loss
const InputField = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  required = false,
  className = "",
  type = "text"
}: { 
  label: string; 
  value: string; 
  onChange: (value: string) => void; 
  placeholder?: string;
  required?: boolean;
  className?: string;
  type?: string;
}) => (
  <div className={className}>
    <label className="block text-body-sm text-text-primary mb-2">
      {label}{required && "*"}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-5 py-4 border border-border-light rounded-full focus:outline-none focus:border-[#2e3091] text-body-sm text-text-secondary placeholder:text-text-muted bg-background-primary"
    />
  </div>
);

type CheckoutStep = "login" | "entrega" | "pagamento";

interface PersonalData {
  cpf: string;
  phone: string;
  birthDate: string;
}

interface AddressData {
  label: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  reference: string;
  city: string;
  state: string;
  recipientName: string;
  recipientPhone: string;
  isDefault: boolean;
}


export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { user, loading } = useAuth();

  // Load saved data from localStorage
  const loadSavedData = <T,>(key: string, defaultValue: T): T => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Error loading saved data:", e);
    }
    return defaultValue;
  };

  const [currentStep, setCurrentStep] = useState<CheckoutStep>(() => 
    loadSavedData("checkout_current_step", "login")
  );

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      toast.info("Faça login para continuar com a compra");
      navigate("/auth", { state: { from: "/checkout" } });
    }
  }, [user, loading, navigate]);

  const [completedSteps, setCompletedSteps] = useState<CheckoutStep[]>(() => 
    loadSavedData("checkout_completed_steps", [])
  );
  
  const [personal, setPersonal] = useState<PersonalData>(() => 
    loadSavedData("checkout_personal", {
      cpf: "",
      phone: "",
      birthDate: "",
    })
  );

  const [address, setAddress] = useState<AddressData>(() => 
    loadSavedData("checkout_address", {
      label: "",
      cep: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      reference: "",
      city: "",
      state: "",
      recipientName: user?.email?.split("@")[0] || "",
      recipientPhone: "",
      isDefault: false,
    })
  );

  const [shippingMethod, setShippingMethod] = useState<"economico" | "expresso">(() => 
    loadSavedData("checkout_shipping", "economico")
  );
  
  const [addressConfirmed, setAddressConfirmed] = useState(() => 
    loadSavedData("checkout_address_confirmed", false)
  );
  
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "bolsa-uniforme">("stripe");
  const [showBolsaUniformeModal, setShowBolsaUniformeModal] = useState(false);
  const [showStripeCheckout, setShowStripeCheckout] = useState(false);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("checkout_personal", JSON.stringify(personal));
  }, [personal]);

  useEffect(() => {
    localStorage.setItem("checkout_address", JSON.stringify(address));
  }, [address]);

  useEffect(() => {
    localStorage.setItem("checkout_shipping", JSON.stringify(shippingMethod));
  }, [shippingMethod]);

  useEffect(() => {
    localStorage.setItem("checkout_address_confirmed", JSON.stringify(addressConfirmed));
  }, [addressConfirmed]);

  useEffect(() => {
    localStorage.setItem("checkout_completed_steps", JSON.stringify(completedSteps));
  }, [completedSteps]);

  useEffect(() => {
    localStorage.setItem("checkout_current_step", JSON.stringify(currentStep));
  }, [currentStep]);

  const steps: { key: CheckoutStep; label: string }[] = [
    { key: "login", label: "Login" },
    { key: "entrega", label: "Entrega" },
    { key: "pagamento", label: "Pagamento" },
  ];

  const stepIndex = steps.findIndex((s) => s.key === currentStep);
  const shipping = shippingMethod === "expresso" ? 26.90 : 13.90;
  const total = subtotal + shipping;

  const isStepCompleted = (step: CheckoutStep) => completedSteps.includes(step);

  // Ref for step content to scroll to
  const stepContentRef = useRef<HTMLDivElement>(null);

  const scrollToStepContent = () => {
    setTimeout(() => {
      stepContentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const completeCurrentStep = () => {
    if (currentStep === "login") {
      if (!personal.cpf || !personal.phone) {
        toast.error("Preencha todos os campos obrigatórios", { duration: 2000 });
        return;
      }
      setCompletedSteps([...completedSteps, "login"]);
      setCurrentStep("entrega");
      scrollToStepContent();
    } else if (currentStep === "entrega") {
      if (!address.cep || !address.street || !address.number || !address.city || !address.state) {
        toast.error("Preencha todos os campos obrigatórios", { duration: 2000 });
        return;
      }
      setCompletedSteps([...completedSteps, "entrega"]);
      setCurrentStep("pagamento");
      scrollToStepContent();
    }
  };

  const confirmAddress = () => {
    if (!address.cep || !address.street || !address.number || !address.city || !address.state) {
      toast.error("Preencha todos os campos obrigatórios", { duration: 2000 });
      return;
    }
    setAddressConfirmed(true);
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    return value;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    return value;
  };

  const formatDate = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 8) {
      return numbers.replace(/(\d{2})(\d{2})(\d{4})/, "$1/$2/$3");
    }
    return value;
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 8) {
      return numbers.replace(/(\d{5})(\d{3})/, "$1-$2");
    }
    return value;
  };

  // Function to fetch address by CEP using ViaCEP API
  const fetchAddressByCEP = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        toast.error("CEP não encontrado");
        return;
      }
      
      setAddress(prev => ({
        ...prev,
        street: data.logradouro || prev.street,
        neighborhood: data.bairro || prev.neighborhood,
        city: data.localidade || prev.city,
        state: data.uf || prev.state,
      }));
      
      toast.success("Endereço preenchido automaticamente!");
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toast.error("Erro ao buscar o CEP");
    }
  };

  // Handle CEP change with auto-fill
  const handleCepChange = (value: string) => {
    const formattedCep = formatCEP(value);
    setAddress({ ...address, cep: formattedCep });
    
    // Auto-fetch when CEP is complete (8 digits)
    const cleanCep = value.replace(/\D/g, "");
    if (cleanCep.length === 8) {
      fetchAddressByCEP(cleanCep);
    }
  };

  // Desktop Order Summary component
  const OrderSummary = () => (
    <div className="bg-background-primary rounded-2xl p-6">
      <h3 className="text-body-regular font-medium text-text-primary mb-6">Resumo do pedido</h3>
      
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={`${item.productId}-${item.size}`} className="flex gap-3">
            <img
              src={item.productImage}
              alt={item.productName}
              className="w-16 h-20 object-cover bg-background-secondary rounded"
            />
            <div className="flex-1 min-w-0">
              <p className="text-body-sm font-semibold text-text-primary truncate">
                {item.productName}
              </p>
              <p className="text-body-sm text-text-primary mt-1">
                R$ {item.price.toFixed(2).replace(".", ",")}
              </p>
              <p className="text-caption text-text-muted mt-1">
                Tamanho: {item.size} • Quantidade: {item.quantity}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 pt-4 border-t border-border-light">
        <div className="flex justify-between text-body-sm">
          <span className="text-text-secondary">Subtotal</span>
          <span className="text-text-primary">R$ {subtotal.toFixed(2).replace(".", ",")}</span>
        </div>
        {currentStep === "pagamento" && (
          <div className="flex justify-between text-body-sm">
            <span className="text-text-secondary">Frete</span>
            <span className="text-text-primary">R$ {shipping.toFixed(2).replace(".", ",")}</span>
          </div>
        )}
        <div className="flex justify-between text-body-regular font-medium pt-3 border-t border-border-light">
          <span className="text-text-primary">TOTAL</span>
          <span className="text-text-primary">R$ {(currentStep === "pagamento" ? total : subtotal).toFixed(2).replace(".", ",")}</span>
        </div>
      </div>
    </div>
  );

  // Stepper component
  const Stepper = () => (
    <div className="flex items-center justify-center mb-10">
      {steps.map((step, index) => {
        const isCompleted = isStepCompleted(step.key);
        const isCurrent = step.key === currentStep;

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                  isCompleted || isCurrent
                    ? "bg-[#2e3091]"
                    : "bg-background-primary border-2 border-border-light"
                }`}
              >
                {isCompleted && <Check className="w-2.5 h-2.5 text-white" />}
              </div>
              <span
                className={`text-caption mt-2 ${
                  isCompleted || isCurrent ? "text-text-primary font-medium" : "text-text-muted"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-24 md:w-32 h-[2px] mx-2 -mt-6 ${
                  isCompleted ? "bg-[#2e3091]" : "bg-border-light"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  // Completed step card
  const CompletedStepCard = ({ step, title, content, onEdit }: { step: CheckoutStep; title: string; content: string; onEdit: () => void }) => (
    <div className="bg-background-primary rounded-2xl p-5 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-body-regular font-medium text-text-primary">{title}</span>
          <Check className="w-5 h-5 text-[#2e3091]" />
        </div>
        <button
          onClick={onEdit}
          className="text-body-sm font-medium text-text-primary underline"
        >
          EDITAR
        </button>
      </div>
      <p className="text-body-sm text-text-secondary mt-2">{content}</p>
    </div>
  );


  return (
    <div className="min-h-screen flex flex-col bg-background-tertiary">
      <main className="flex-1 pt-[100px]">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
          {/* Stepper */}
          <Stepper />

          <div className="lg:flex lg:gap-8">
            {/* Main Content */}
            <div className="lg:flex-1" ref={stepContentRef}>
              {/* Completed Steps Cards */}
              {isStepCompleted("login") && currentStep !== "login" && (
                <CompletedStepCard
                  step="login"
                  title="Dados pessoais"
                  content={`CPF: ${personal.cpf}`}
                  onEdit={() => {
                    setCompletedSteps(completedSteps.filter(s => s !== "login"));
                    setCurrentStep("login");
                  }}
                />
              )}

              {isStepCompleted("entrega") && currentStep === "pagamento" && (
                <>
                  <CompletedStepCard
                    step="entrega"
                    title="Endereço"
                    content={`${address.street}, ${address.number}, ${address.neighborhood}, ${address.city} - ${address.state}, CEP: ${address.cep}`}
                    onEdit={() => {
                      setCompletedSteps(completedSteps.filter(s => s !== "entrega"));
                      setCurrentStep("entrega");
                      setAddressConfirmed(false);
                    }}
                  />
                  <CompletedStepCard
                    step="entrega"
                    title="Forma de entrega"
                    content={`${shippingMethod === "economico" ? "Econômico" : "Expresso"} - R$ ${shipping.toFixed(2).replace(".", ",")}`}
                    onEdit={() => {
                      setCompletedSteps(completedSteps.filter(s => s !== "entrega"));
                      setCurrentStep("entrega");
                    }}
                  />
                </>
              )}

              {/* Login Step - NO order items preview */}
              {currentStep === "login" && (
                <div>
                  <h2 className="text-h3 font-medium text-text-primary mb-2">
                    Falta pouco{user?.email ? `, ${user.email.split("@")[0]}` : ""}!
                  </h2>
                  <p className="text-body-sm text-text-secondary mb-6">
                    Precisamos dos dados abaixo para continuar sua compra.
                  </p>

                  <div className="bg-background-primary rounded-2xl p-6 mb-6">
                    <div className="space-y-4">
                      <InputField
                        label="CPF"
                        value={personal.cpf}
                        onChange={(v) => setPersonal({ ...personal, cpf: formatCPF(v) })}
                        placeholder="___.___.___-__"
                        required
                      />
                      <InputField
                        label="Telefone"
                        value={personal.phone}
                        onChange={(v) => setPersonal({ ...personal, phone: formatPhone(v) })}
                        placeholder="(__) _____-____"
                        required
                      />
                      <InputField
                        label="Data de nascimento"
                        value={personal.birthDate}
                        onChange={(v) => setPersonal({ ...personal, birthDate: formatDate(v) })}
                        placeholder="__/__/____"
                        required
                      />
                    </div>

                    <button
                      onClick={completeCurrentStep}
                      className="w-full mt-6 bg-[#2e3091] text-white py-4 rounded-full font-medium hover:bg-[#252a7a] transition-colors text-btn"
                    >
                      Salvar e continuar
                    </button>
                  </div>
                </div>
              )}

              {/* Entrega Step - Separated address and shipping */}
              {currentStep === "entrega" && (
                <div>
                  {/* Address Form */}
                  {!addressConfirmed ? (
                    <>
                      <h2 className="text-h3 font-medium text-text-primary mb-6">
                        Cadastre seu endereço
                      </h2>

                      <div className="bg-background-primary rounded-2xl p-6 mb-6">
                        <div className="space-y-4">
                          <InputField
                            label="Identificação do endereço"
                            value={address.label}
                            onChange={(v) => setAddress({ ...address, label: v })}
                            placeholder="Ex: Casa, Trabalho"
                            required
                          />

                          <div className="flex items-center gap-4">
                            <div className="flex-1 md:w-1/3 md:flex-none">
                              <InputField
                                label="CEP"
                                value={address.cep}
                                onChange={handleCepChange}
                                placeholder="_____-___"
                                required
                              />
                            </div>
                            <a 
                              href="https://buscacepinter.correios.com.br/app/endereco/index.php" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-body-sm text-text-primary underline mt-6"
                            >
                              Não sei meu CEP
                            </a>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                              <InputField
                                label="Endereço"
                                value={address.street}
                                onChange={(v) => setAddress({ ...address, street: v })}
                                placeholder="Rua, Logradouro, Avenida, etc"
                                required
                              />
                            </div>
                            <InputField
                              label="Número"
                              value={address.number}
                              onChange={(v) => setAddress({ ...address, number: v })}
                              required
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                              label="Complemento"
                              value={address.complement}
                              onChange={(v) => setAddress({ ...address, complement: v })}
                              placeholder="Ex: Apartamento, Bloco, etc"
                            />
                            <InputField
                              label="Bairro"
                              value={address.neighborhood}
                              onChange={(v) => setAddress({ ...address, neighborhood: v })}
                              placeholder="Ex: Centro, Vila, etc"
                              required
                            />
                          </div>

                          <InputField
                            label="Referência"
                            value={address.reference}
                            onChange={(v) => setAddress({ ...address, reference: v })}
                            placeholder="Ex: Próximo ao mercado, Próximo ao hospital, etc"
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                              label="Estado"
                              value={address.state}
                              onChange={(v) => setAddress({ ...address, state: v })}
                              required
                            />
                            <InputField
                              label="Cidade"
                              value={address.city}
                              onChange={(v) => setAddress({ ...address, city: v })}
                              required
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                              label="Nome do destinatário"
                              value={address.recipientName}
                              onChange={(v) => setAddress({ ...address, recipientName: v })}
                              required
                            />
                            <InputField
                              label="Telefone do destinatário"
                              value={address.recipientPhone}
                              onChange={(v) => setAddress({ ...address, recipientPhone: formatPhone(v) })}
                              required
                            />
                          </div>

                          <label className="flex items-center gap-3 cursor-pointer mt-2">
                            <input
                              type="checkbox"
                              checked={address.isDefault}
                              onChange={(e) => setAddress({ ...address, isDefault: e.target.checked })}
                              className="w-5 h-5 accent-[#2e3091]"
                            />
                            <span className="text-body-sm text-text-secondary">Definir como endereço padrão</span>
                          </label>
                        </div>

                        <button
                          onClick={confirmAddress}
                          className="w-full mt-6 bg-[#2e3091] text-white py-4 rounded-full font-medium hover:bg-[#252a7a] transition-colors text-btn"
                        >
                          Confirmar endereço
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Confirmed Address Card */}
                      <div className="bg-background-primary rounded-2xl p-5 mb-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-body-regular font-medium text-text-primary">Endereço de entrega</span>
                            <Check className="w-5 h-5 text-[#2e3091]" />
                          </div>
                          <button
                            onClick={() => setAddressConfirmed(false)}
                            className="text-body-sm font-medium text-text-primary underline"
                          >
                            EDITAR
                          </button>
                        </div>
                        <p className="text-body-sm text-text-secondary mt-2">
                          {address.street}, {address.number}, {address.neighborhood}, {address.city} - {address.state}, CEP: {address.cep}
                        </p>
                      </div>

                      {/* Shipping Methods - Only shown after address is confirmed */}
                      <h2 className="text-h3 font-medium text-text-primary mb-6">
                        Selecione a forma de entrega
                      </h2>

                      <div className="bg-background-primary rounded-2xl p-6 mb-6">
                        <p className="text-caption text-text-muted mb-4">ENTREGA 1 DE 1</p>

                        {/* Product preview */}
                        <div className="flex gap-3 mb-6">
                          {items.slice(0, 1).map((item) => (
                            <div key={`${item.productId}-${item.size}`} className="flex gap-3">
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                className="w-20 h-24 object-cover bg-background-secondary rounded"
                              />
                              <div>
                                <p className="text-body-sm font-medium text-text-primary">
                                  {item.productName}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Receba em casa */}
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <Home className="w-5 h-5 text-text-muted" />
                            <span className="text-body-sm font-medium text-text-primary">Receba em casa</span>
                          </div>

                          <div className="space-y-3 ml-7">
                            <label className="flex items-center justify-between cursor-pointer">
                              <div className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  checked={shippingMethod === "economico"}
                                  onChange={() => setShippingMethod("economico")}
                                  className="w-5 h-5 accent-[#2e3091]"
                                />
                                <div>
                                  <p className="text-body-sm font-medium text-text-primary">Econômico</p>
                                  <p className="text-caption text-text-muted">Receba até terça-feira, 14 de janeiro</p>
                                </div>
                              </div>
                              <span className="text-body-sm font-medium text-text-primary">R$ 13,90</span>
                            </label>

                            <label className="flex items-center justify-between cursor-pointer">
                              <div className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  checked={shippingMethod === "expresso"}
                                  onChange={() => setShippingMethod("expresso")}
                                  className="w-5 h-5 accent-[#2e3091]"
                                />
                                <div>
                                  <p className="text-body-sm font-medium text-text-primary">Expresso</p>
                                  <p className="text-caption text-text-muted">Receba até sexta-feira, 10 de janeiro</p>
                                </div>
                              </div>
                              <span className="text-body-sm font-medium text-text-primary">R$ 26,90</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={completeCurrentStep}
                        className="w-full bg-[#2e3091] text-white py-4 rounded-full font-medium hover:bg-[#252a7a] transition-colors text-btn"
                      >
                        Selecionar pagamento
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Pagamento Step */}
              {currentStep === "pagamento" && (
                <div>
                  {!showStripeCheckout ? (
                    <>
                      <h2 className="text-h3 font-medium text-text-primary mb-6">
                        Selecionar forma de pagamento
                      </h2>

                      {/* Payment Method Selection */}
                      <div className="space-y-4 mb-6">
                        {/* Stripe Option */}
                        <label 
                          className={`block cursor-pointer rounded-2xl border-2 transition-all ${
                            paymentMethod === "stripe" 
                              ? "border-[#2e3091] bg-[#2e3091]/5" 
                              : "border-border-light bg-background-primary hover:border-text-muted"
                          }`}
                        >
                          <div className="p-5">
                            <div className="flex items-center gap-3 mb-4">
                              <input
                                type="radio"
                                checked={paymentMethod === "stripe"}
                                onChange={() => setPaymentMethod("stripe")}
                                className="w-5 h-5 accent-[#2e3091]"
                              />
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-[#2e3091]" />
                                <span className="text-body-regular font-medium text-text-primary">
                                  Cartão / Pix / Boleto
                                </span>
                              </div>
                            </div>
                            
                            {paymentMethod === "stripe" && (
                              <div className="ml-8 space-y-2">
                                <p className="text-body-sm text-text-secondary">
                                  Escolha sua forma de pagamento preferida:
                                </p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  <span className="text-xs bg-background-secondary px-3 py-1.5 rounded-full border border-border-light">
                                    💳 Cartão de Crédito/Débito
                                  </span>
                                  <span className="text-xs bg-background-secondary px-3 py-1.5 rounded-full border border-border-light">
                                    📱 Pix
                                  </span>
                                  <span className="text-xs bg-background-secondary px-3 py-1.5 rounded-full border border-border-light">
                                    📄 Boleto Bancário
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 pt-2">
                                  <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                    <path d="M9 12l2 2 4-4"/>
                                  </svg>
                                  <span className="text-caption text-text-muted">Pagamento 100% seguro via Stripe</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </label>

                        {/* Bolsa Uniforme Option */}
                        <label 
                          className={`block cursor-pointer rounded-2xl border-2 transition-all ${
                            paymentMethod === "bolsa-uniforme" 
                              ? "border-[#2e3091] bg-[#2e3091]/5" 
                              : "border-border-light bg-background-primary hover:border-text-muted"
                          }`}
                        >
                          <div className="p-5">
                            <div className="flex items-center gap-3 mb-2">
                              <input
                                type="radio"
                                checked={paymentMethod === "bolsa-uniforme"}
                                onChange={() => setPaymentMethod("bolsa-uniforme")}
                                className="w-5 h-5 accent-[#2e3091]"
                              />
                              <div className="flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-[#2e3091]" />
                                <span className="text-body-regular font-medium text-text-primary">
                                  Bolsa Uniforme
                                </span>
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                  Crédito Escolar
                                </span>
                              </div>
                            </div>
                            
                            {paymentMethod === "bolsa-uniforme" && (
                              <div className="ml-8 mt-3">
                                <p className="text-body-sm text-text-secondary">
                                  Pague com o saldo do seu cartão Bolsa Uniforme. 
                                  Você precisará:
                                </p>
                                <ul className="text-body-sm text-text-secondary mt-2 space-y-1">
                                  <li className="flex items-center gap-2">
                                    <span className="w-5 h-5 bg-[#2e3091]/10 rounded-full flex items-center justify-center text-xs text-[#2e3091] font-medium">1</span>
                                    Foto do QR Code do cartão
                                  </li>
                                  <li className="flex items-center gap-2">
                                    <span className="w-5 h-5 bg-[#2e3091]/10 rounded-full flex items-center justify-center text-xs text-[#2e3091] font-medium">2</span>
                                    Sua senha do cartão
                                  </li>
                                </ul>
                              </div>
                            )}
                          </div>
                        </label>
                      </div>

                      <button
                        onClick={() => {
                          if (paymentMethod === "stripe") {
                            setShowStripeCheckout(true);
                          } else {
                            setShowBolsaUniformeModal(true);
                          }
                        }}
                        disabled={isProcessingPayment}
                        className="w-full bg-[#2e3091] text-white py-4 rounded-full font-medium hover:bg-[#252a7a] transition-colors text-btn uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {paymentMethod === "stripe" ? (
                          "Ir para pagamento"
                        ) : (
                          "Pagar com Bolsa Uniforme"
                        )}
                      </button>
                    </>
                  ) : (
                    /* Stripe Custom Payment Form */
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-h3 font-medium text-text-primary">
                          Pagamento
                        </h2>
                        <button
                          onClick={() => setShowStripeCheckout(false)}
                          className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Voltar
                        </button>
                      </div>
                      
                      <div className="bg-background-primary rounded-2xl p-6 mb-6">
                        <StripeCustomPayment
                          items={items.map(item => ({
                            productId: item.productId,
                            productName: item.productName,
                            productImage: item.productImage,
                            price: item.price,
                            size: item.size,
                            quantity: item.quantity,
                            schoolSlug: item.schoolSlug,
                          }))}
                          customerEmail={user?.email || ""}
                          customerName={user?.user_metadata?.name || user?.email?.split("@")[0] || ""}
                          shippingAddress={{
                            cep: address.cep,
                            street: address.street,
                            number: address.number,
                            complement: address.complement,
                            neighborhood: address.neighborhood,
                            city: address.city,
                            state: address.state,
                          }}
                          shipping={shipping}
                          userId={user?.id || ""}
                          total={total}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Bolsa Uniforme Modal */}
              {showBolsaUniformeModal && (
                <BolsaUniformePayment
                  onComplete={async (data) => {
                    console.log("Bolsa Uniforme payment data:", data);
                    // Save to database
                    try {
                      const { error } = await supabase.from("bolsa_uniforme_payments" as any).insert({
                        user_id: user?.id,
                        qr_code_image: data.qrCodeImage,
                        customer_name: user?.user_metadata?.name || user?.email?.split("@")[0] || "Cliente",
                        customer_phone: personal.phone,
                        customer_email: user?.email,
                        total_amount: total,
                        items: items.map(item => ({
                          productId: item.productId,
                          productName: item.productName,
                          productImage: item.productImage,
                          price: item.price,
                          size: item.size,
                          quantity: item.quantity,
                          schoolSlug: item.schoolSlug,
                        })),
                        shipping_address: {
                          cep: address.cep,
                          street: address.street,
                          number: address.number,
                          complement: address.complement,
                          neighborhood: address.neighborhood,
                          city: address.city,
                          state: address.state,
                        },
                        status: "pending",
                      } as any);
                      if (error) {
                        console.error("Error saving bolsa uniforme payment:", error);
                      } else {
                        clearCart();
                      }
                    } catch (err) {
                      console.error("Error:", err);
                    }
                  }}
                  onCancel={() => setShowBolsaUniformeModal(false)}
                />
              )}
            </div>

            {/* Desktop Order Summary Sidebar */}
            <div className="hidden lg:block w-80 shrink-0">
              <div className="sticky top-[120px]">
                <OrderSummary />
              </div>
            </div>
          </div>
        </div>
      </main>

      <CheckoutFooter />
    </div>
  );
}
