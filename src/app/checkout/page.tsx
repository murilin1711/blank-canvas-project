import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Footer from "@/components/sections/footer";
import { ArrowLeft, Check, Home, MapPin, ChevronDown, CreditCard, Loader2, Wallet } from "lucide-react";
import { BolsaUniformePayment } from "@/components/BolsaUniformePayment";
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

  const [currentStep, setCurrentStep] = useState<CheckoutStep>("login");

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      toast.info("Faça login para continuar com a compra");
      navigate("/auth", { state: { from: "/checkout" } });
    }
  }, [user, loading, navigate]);
  const [completedSteps, setCompletedSteps] = useState<CheckoutStep[]>([]);
  
  const [personal, setPersonal] = useState<PersonalData>({
    cpf: "",
    phone: "",
    birthDate: "",
  });

  const [address, setAddress] = useState<AddressData>({
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
  });

  const [shippingMethod, setShippingMethod] = useState<"economico" | "expresso" | "loja">("economico");
  
  const [showOrderItems, setShowOrderItems] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "bolsa-uniforme">("stripe");
  const [showBolsaUniformeModal, setShowBolsaUniformeModal] = useState(false);

  const steps: { key: CheckoutStep; label: string }[] = [
    { key: "login", label: "Login" },
    { key: "entrega", label: "Entrega" },
    { key: "pagamento", label: "Pagamento" },
  ];

  const stepIndex = steps.findIndex((s) => s.key === currentStep);
  const shipping = shippingMethod === "expresso" ? 26.90 : shippingMethod === "loja" ? 0 : 13.90;
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

  const handleStripeCheckout = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para finalizar a compra");
      return;
    }

    setIsProcessingPayment(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: {
          items: items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            productImage: item.productImage,
            price: item.price,
            size: item.size,
            quantity: item.quantity,
            schoolSlug: item.schoolSlug,
          })),
          customerEmail: user.email,
          customerName: user.user_metadata?.name || user.email?.split("@")[0],
          shippingAddress: {
            cep: address.cep,
            street: address.street,
            number: address.number,
            complement: address.complement,
            neighborhood: address.neighborhood,
            city: address.city,
            state: address.state,
          },
          shipping,
          userId: user.id,
        },
      });

      if (error) {
        console.error("Error creating checkout session:", error);
        toast.error("Erro ao processar pagamento. Tente novamente.");
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error("Erro ao redirecionar para o pagamento");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Erro ao processar pagamento. Tente novamente.");
    } finally {
      setIsProcessingPayment(false);
    }
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

  // Desktop Order Summary component
  const OrderSummary = () => (
    <div className="bg-background-primary">
      <h3 className="text-body-regular font-medium text-text-primary mb-6">Resumo do pedido</h3>
      
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={`${item.productId}-${item.size}`} className="flex gap-3">
            <img
              src={item.productImage}
              alt={item.productName}
              className="w-16 h-20 object-cover bg-background-secondary"
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

  // Mobile Order Summary (collapsible)
  const MobileOrderSummary = () => (
    <div className="lg:hidden bg-background-secondary rounded-2xl p-4 mb-6">
      <button
        onClick={() => setShowOrderItems(!showOrderItems)}
        className="w-full flex items-center justify-between"
      >
        <span className="text-body-sm font-medium text-text-primary">VER ITENS DO PEDIDO</span>
        <ChevronDown className={`w-5 h-5 text-text-muted transition-transform ${showOrderItems ? "rotate-180" : ""}`} />
      </button>
      
      <AnimatePresence>
        {showOrderItems && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-3">
              {items.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="flex gap-3">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-14 h-18 object-cover bg-background-primary"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-body-sm font-semibold text-text-primary truncate">
                      {item.productName}
                    </p>
                    <p className="text-caption text-text-muted mt-1">
                      Tamanho: {item.size} • Qtd: {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 pt-4 border-t border-border-light space-y-2">
        <div className="flex justify-between text-body-sm">
          <span className="text-text-secondary">Subtotal</span>
          <span className="font-medium text-text-primary">R$ {subtotal.toFixed(2).replace(".", ",")}</span>
        </div>
        {(currentStep === "entrega" || currentStep === "pagamento") && (
          <div className="flex justify-between text-body-sm">
            <span className="text-text-secondary">Frete</span>
            <span className="text-text-primary">R$ {shipping.toFixed(2).replace(".", ",")}</span>
          </div>
        )}
        <div className="flex justify-between text-body-regular font-medium pt-2 border-t border-border-light">
          <span className="text-text-primary">TOTAL</span>
          <span className="text-text-primary">R$ {total.toFixed(2).replace(".", ",")}</span>
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
        const isPast = index < stepIndex;

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
    <div className="bg-background-secondary rounded-2xl p-5 mb-4">
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
    <main className="min-h-screen bg-background-primary pt-[100px]">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {/* Back button - mobile only */}
        <button
          onClick={() => navigate(-1)}
          className="lg:hidden flex items-center gap-2 text-text-tertiary hover:text-text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-body-sm">Voltar</span>
        </button>

        {/* Stepper */}
        <Stepper />

        <div className="lg:flex lg:gap-12">
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
                  }}
                />
                <CompletedStepCard
                  step="entrega"
                  title="Forma de entrega"
                  content={`${shippingMethod === "economico" ? "Econômico" : shippingMethod === "expresso" ? "Expresso" : "Retire na loja"} - R$ ${shipping.toFixed(2).replace(".", ",")}`}
                  onEdit={() => {
                    setCompletedSteps(completedSteps.filter(s => s !== "entrega"));
                    setCurrentStep("entrega");
                  }}
                />
              </>
            )}

            {/* Login Step */}
            {currentStep === "login" && (
              <div>
                <h2 className="text-h3 font-medium text-text-primary mb-2">
                  Falta pouco{user?.email ? `, ${user.email.split("@")[0]}` : ""}!
                </h2>
                <p className="text-body-sm text-text-secondary mb-6">
                  Precisamos dos dados abaixo para continuar sua compra.
                </p>

                <div className="bg-background-secondary rounded-2xl p-6 mb-6">
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

            {/* Entrega Step */}
            {currentStep === "entrega" && (
              <div>
                {/* Address Selection/Form */}
                <h2 className="text-h3 font-medium text-text-primary mb-6">
                  {showAddressForm ? "Cadastre seu endereço" : "Selecione o endereço de entrega"}
                </h2>

                {showAddressForm && (
                  <div className="bg-background-secondary rounded-2xl p-6 mb-6">
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
                            onChange={(v) => setAddress({ ...address, cep: formatCEP(v) })}
                            placeholder="_____-___"
                            required
                          />
                        </div>
                        <button className="text-body-sm text-text-primary underline mt-6">
                          Não sei meu CEP
                        </button>
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
                  </div>
                )}

                {/* Shipping Methods */}
                <h2 className="text-h3 font-medium text-text-primary mb-6 mt-8">
                  Selecione a forma de entrega
                </h2>

                <div className="bg-background-secondary rounded-2xl p-6 mb-6">
                  <p className="text-caption text-text-muted mb-4">ENTREGA 1 DE 1</p>

                  {/* Product preview */}
                  <div className="flex gap-3 mb-6">
                    {items.slice(0, 1).map((item) => (
                      <div key={`${item.productId}-${item.size}`} className="flex gap-3">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-20 h-24 object-cover bg-background-primary"
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
                  <div className="mb-6">
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
                            <p className="text-caption text-text-muted">Receba até terça-feira, 6 de janeiro</p>
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
                            <p className="text-caption text-text-muted">Receba até segunda-feira, 30 de dezembro</p>
                          </div>
                        </div>
                        <span className="text-body-sm font-medium text-text-primary">R$ 26,90</span>
                      </label>
                    </div>
                  </div>

                  {/* Retire na loja */}
                  <div className="pt-4 border-t border-border-light">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="w-5 h-5 text-text-muted" />
                      <span className="text-body-sm font-medium text-text-primary">Retire na loja</span>
                    </div>

                    <div className="ml-7">
                      <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            checked={shippingMethod === "loja"}
                            onChange={() => setShippingMethod("loja")}
                            className="w-5 h-5 accent-[#2e3091]"
                          />
                          <div>
                            <p className="text-body-sm font-medium text-text-primary">Loja Centro</p>
                            <p className="text-caption text-text-muted">6.0 km</p>
                            <p className="text-caption text-text-muted">Em até 5 horas</p>
                          </div>
                        </div>
                        <span className="text-body-sm font-medium text-green-600 border border-green-600 px-3 py-1 rounded-full">
                          GRÁTIS
                        </span>
                      </label>

                      <button className="text-body-sm text-text-primary underline mt-3 ml-8">
                        VER OUTRAS LOJAS
                      </button>
                    </div>
                  </div>

                  {/* Info box */}
                  <div className="mt-6 pt-4 border-t border-border-light">
                    <p className="text-body-sm font-medium text-text-primary mb-2">
                      Entrega pela loja e Retire na loja
                    </p>
                    <p className="text-caption text-text-secondary">
                      <strong>Troca/devolução:</strong> Para essas modalidades de entrega, a troca e a devolução só estará disponível através da loja que fez a entrega do produto. Não será possível trocar ou devolver o item para o ecommerce.
                    </p>
                  </div>
                </div>

                <button
                  onClick={completeCurrentStep}
                  className="w-full bg-[#2e3091] text-white py-4 rounded-full font-medium hover:bg-[#252a7a] transition-colors text-btn"
                >
                  Selecionar pagamento
                </button>
              </div>
            )}

            {/* Pagamento Step */}
            {currentStep === "pagamento" && (
              <div>
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
                        : "border-gray-200 bg-background-secondary hover:border-gray-300"
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
                            Você será redirecionado para o Stripe para escolher:
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="text-xs bg-white px-3 py-1.5 rounded-full border border-gray-200">
                              💳 Cartão de Crédito/Débito
                            </span>
                            <span className="text-xs bg-white px-3 py-1.5 rounded-full border border-gray-200">
                              📱 Pix
                            </span>
                            <span className="text-xs bg-white px-3 py-1.5 rounded-full border border-gray-200">
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
                        : "border-gray-200 bg-background-secondary hover:border-gray-300"
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

                {/* Mobile summary */}
                <MobileOrderSummary />

                <button
                  onClick={() => {
                    if (paymentMethod === "stripe") {
                      handleStripeCheckout();
                    } else {
                      setShowBolsaUniformeModal(true);
                    }
                  }}
                  disabled={isProcessingPayment}
                  className="w-full bg-[#2e3091] text-white py-4 rounded-full font-medium hover:bg-[#252a7a] transition-colors text-btn uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processando...
                    </>
                  ) : paymentMethod === "stripe" ? (
                    "Ir para pagamento"
                  ) : (
                    "Pagar com Bolsa Uniforme"
                  )}
                </button>
              </div>
            )}

            {/* Bolsa Uniforme Modal */}
            {showBolsaUniformeModal && (
              <BolsaUniformePayment
                onComplete={(data) => {
                  console.log("Bolsa Uniforme payment data:", data);
                  setShowBolsaUniformeModal(false);
                  toast.success("Pagamento enviado! Aguarde a confirmação.");
                  // Here you would send the data to your backend
                  navigate("/checkout/sucesso");
                }}
                onCancel={() => setShowBolsaUniformeModal(false)}
              />
            )}

            {/* Mobile Order Summary for Login step */}
            {currentStep === "login" && <MobileOrderSummary />}
          </div>

          {/* Desktop Order Summary Sidebar */}
          <div className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-[120px]">
              <OrderSummary />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
