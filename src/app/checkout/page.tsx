import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import CheckoutFooter from "@/components/sections/checkout-footer";
import { Check, Home, ChevronDown, CreditCard, Wallet, X, Truck, AlertCircle, MapPin } from "lucide-react";
import { BolsaUniformePayment } from "@/components/BolsaUniformePayment";
import { StripeCustomPayment } from "@/components/StripeCustomPayment";
import { MercadoPagoPixPayment } from "@/components/MercadoPagoPixPayment";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import pixLogo from "@/assets/payment/pix.png";

// Input field component - MUST be outside main component to prevent focus loss
const InputField = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  className = "",
  type = "text",
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  type?: string;
  maxLength?: number;
}) => (
  <div className={className}>
    <div className="flex justify-between items-baseline mb-2">
      <label className="block text-body-sm text-text-primary">
        {label}{required && "*"}
      </label>
      {maxLength && (
        <span className={`text-xs ${value.length >= maxLength ? "text-red-500 font-medium" : "text-text-muted"}`}>
          {value.length}/{maxLength}
        </span>
      )}
    </div>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(maxLength ? e.target.value.slice(0, maxLength) : e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
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
  const { items, subtotal, clearCart, hasFreeShipping } = useCart();
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

  // States for saving preferences
  const [savePersonalData, setSavePersonalData] = useState(() => 
    loadSavedData("checkout_save_personal", true)
  );
  const [saveAddressData, setSaveAddressData] = useState(() => 
    loadSavedData("checkout_save_address", true)
  );

  // Always start from login step, but data will be pre-filled
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("login");

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      toast.info("Faça login para continuar com a compra");
      navigate("/auth", { state: { from: "/checkout" } });
    }
  }, [user, loading, navigate]);

  // Track user activity when they start checkout
  useEffect(() => {
    if (user && items.length > 0) {
      trackActivity("checkout_started", `Iniciou checkout com ${items.length} itens`, {
        items: items.map(i => ({ name: i.productName, size: i.size, price: i.price })),
        subtotal
      });
    }
  }, [user]);

  const trackActivity = async (type: string, description: string, metadata?: any) => {
    if (!user) return;
    try {
      await supabase.from("user_activities").insert({
        user_id: user.id,
        activity_type: type,
        description,
        metadata
      });
    } catch (error) {
      console.error("Error tracking activity:", error);
    }
  };

  // Always start with no completed steps - user must go through each step
  const [completedSteps, setCompletedSteps] = useState<CheckoutStep[]>([]);
  
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

  // Load shipping from cart page selection
  const [cartShippingData, setCartShippingData] = useState<any>(null);
  const [shippingMethod, setShippingMethod] = useState<string>(() => 
    loadSavedData("checkout_shipping", "economico")
  );
  const [shippingPrices, setShippingPrices] = useState<{ economico: number }>({ economico: 13.90 });
  const [cartShippingOptions, setCartShippingOptions] = useState<any>(null);

  // Load shipping selection from cart page
  useEffect(() => {
    try {
      const saved = localStorage.getItem("checkout_shipping_selection");
      if (saved) {
        const data = JSON.parse(saved);
        setCartShippingData(data);
        setShippingMethod(data.selectedId);
        if (data.allOptions) {
          setCartShippingOptions({ melhorEnvio: data.allOptions.melhorEnvio ?? [] });
if (!data.selectedId?.startsWith("me-") && data.selectedId !== "free") {
            setShippingMethod("");
          }
        }
      }
    } catch (e) {
      console.error("Error loading cart shipping:", e);
    }
  }, []);
  
  // Always start with address not confirmed - user must confirm each time
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "pix" | "bolsa-uniforme">("stripe");
  const [showBolsaUniformeModal, setShowBolsaUniformeModal] = useState(false);
  const [showStripeCheckout, setShowStripeCheckout] = useState(false);
  const [showPixPayment, setShowPixPayment] = useState(false);

  // Bolsa Uniforme split payment: produtos pagos → frete pendente
  const BOLSA_LIMIT = 970;
  const MAX_BU_CARDS = 3;
  const [bolsaCards, setBolsaCards] = useState<{qrCodeImage: string; password: string; amount: number}[]>([]);
  const [bolsaUniformeCompleted, setBolsaUniformeCompleted] = useState(false);
  const [bolsaMultiCard, setBolsaMultiCard] = useState<boolean | null>(null);
  const [showBolsaMultiCardQuestion, setShowBolsaMultiCardQuestion] = useState(false);
  const [showBolsaRemainderChoice, setShowBolsaRemainderChoice] = useState(false);
  const [bolsaRemainderMethod, setBolsaRemainderMethod] = useState<"stripe" | "pix">("pix");
  const [showBolsaRemainderStripe, setShowBolsaRemainderStripe] = useState(false);
  const [showBolsaRemainderPix, setShowBolsaRemainderPix] = useState(false);
  const [shippingPaymentMethod, setShippingPaymentMethod] = useState<"stripe" | "pix">("pix");
  const [showShippingStripe, setShowShippingStripe] = useState(false);
  const [showShippingPix, setShowShippingPix] = useState(false);
  const [bolsaPaymentId, setBolsaPaymentId] = useState<string | null>(null);
  const [shippingPaid, setShippingPaid] = useState(false);

  // Detecta se o endereço é de Anápolis (normaliza acentos)
  const isAnapolisCity = (city: string) =>
    city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === "anapolis";

  // Save data to localStorage whenever it changes (respecting save preferences)
  useEffect(() => {
    if (savePersonalData) {
      localStorage.setItem("checkout_personal", JSON.stringify(personal));
    }
  }, [personal, savePersonalData]);

  useEffect(() => {
    if (saveAddressData) {
      localStorage.setItem("checkout_address", JSON.stringify(address));
    }
  }, [address, saveAddressData]);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem("checkout_save_personal", JSON.stringify(savePersonalData));
  }, [savePersonalData]);

  useEffect(() => {
    localStorage.setItem("checkout_save_address", JSON.stringify(saveAddressData));
  }, [saveAddressData]);

  useEffect(() => {
    localStorage.setItem("checkout_shipping", JSON.stringify(shippingMethod));
  }, [shippingMethod]);

  const steps: { key: CheckoutStep; label: string }[] = [
    { key: "login", label: "Login" },
    { key: "entrega", label: "Entrega" },
    { key: "pagamento", label: "Pagamento" },
  ];

  const stepIndex = steps.findIndex((s) => s.key === currentStep);
  
  const getShippingPrice = () => {
    if (hasFreeShipping || shippingMethod === "free") return 0;
    if (shippingMethod.startsWith("me-")) {
      const meOption = cartShippingOptions?.melhorEnvio?.find((o: any) => `me-${o.id}` === shippingMethod);
      if (meOption) return meOption.price;
    }
    return shippingPrices.economico;
  };
  const shipping = getShippingPrice();
  const total = subtotal + shipping;
  const bolsaUsed = bolsaCards.reduce((sum, c) => sum + c.amount, 0);
  const bolsaRemainder = Math.max(0, subtotal - bolsaUsed);
  // Frete nunca é pago pelo Bolsa Uniforme — sempre cobrado à parte via Stripe/Pix
  const bolsaRemainderTotal = bolsaRemainder;
  const bolsaCurrentMax = Math.min(BOLSA_LIMIT, bolsaRemainder); // máximo para o próximo cartão

  const getShippingLabel = () => {
    if (hasFreeShipping || shippingMethod === "free") return "🚚 Frete Grátis";
    if (cartShippingOptions) {
      if (shippingMethod.startsWith("me-")) {
        const meOption = cartShippingOptions.melhorEnvio?.find((o: any) => `me-${o.id}` === shippingMethod);
        if (meOption) return `${meOption.company} - ${meOption.name}`;
      }
    }
    return "Econômico";
  };

  const isStepCompleted = (step: CheckoutStep) => completedSteps.includes(step);

  // Ref for step content to scroll to
  const stepContentRef = useRef<HTMLDivElement>(null);

  const scrollToStepContent = () => {
    setTimeout(() => {
      stepContentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const isValidCPF = (cpf: string): boolean => {
    const stripped = cpf.replace(/\D/g, "");
    if (stripped.length !== 11) return false;
    // Reject all same digits
    if (/^(\d)\1{10}$/.test(stripped)) return false;
    // Validate check digits
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(stripped[i]) * (10 - i);
    let remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    if (remainder !== parseInt(stripped[9])) return false;
    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(stripped[i]) * (11 - i);
    remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    if (remainder !== parseInt(stripped[10])) return false;
    return true;
  };

  const isValidPhone = (phone: string): boolean => {
    const stripped = phone.replace(/\D/g, "");
    return stripped.length === 10 || stripped.length === 11;
  };

  const completeCurrentStep = () => {
    if (currentStep === "login") {
      if (!personal.cpf || !personal.phone) {
        toast.error("Preencha todos os campos obrigatórios", { duration: 2000 });
        return;
      }
      if (!isValidCPF(personal.cpf)) {
        toast.error("CPF inválido. Verifique o número informado.", { duration: 3000 });
        return;
      }
      if (!isValidPhone(personal.phone)) {
        toast.error("Telefone inválido. Informe DDD + número.", { duration: 3000 });
        return;
      }
      
      // Clear saved data if user unchecked save option
      if (!savePersonalData) {
        localStorage.removeItem("checkout_personal");
      }

      // Persiste CPF e telefone no perfil para o admin poder visualizar
      if (user) {
        supabase
          .from("profiles")
          .update({ cpf: personal.cpf, phone: personal.phone })
          .eq("user_id", user.id)
          .then(() => {});
      }

      setCompletedSteps([...completedSteps, "login"]);
      setCurrentStep("entrega");
      scrollToStepContent();
    } else if (currentStep === "entrega") {
      if (!address.cep || !address.street || !address.number || !address.city || !address.state) {
        toast.error("Preencha todos os campos obrigatórios", { duration: 2000 });
        return;
      }
      
      // Clear saved data if user unchecked save option
      if (!saveAddressData) {
        localStorage.removeItem("checkout_address");
      }
      
      setCompletedSteps([...completedSteps, "entrega"]);
      setCurrentStep("pagamento");
      scrollToStepContent();
    }
  };

  const confirmAddress = async () => {
    if (!address.cep || !address.street || !address.number || !address.city || !address.state) {
      toast.error("Preencha todos os campos obrigatórios", { duration: 2000 });
      return;
    }

    // Frete não disponível para Anápolis — redirecionar para a loja física
    if (isAnapolisCity(address.city)) {
      toast.error("Entrega não disponível para Anápolis. Por favor, visite nossa loja.", { duration: 5000 });
      return;
    }

    setAddressConfirmed(true);

    const cleanCep = address.cep.replace(/\D/g, "");

    // Frete grátis: confirmar endereço sem chamar ME
    if (hasFreeShipping || shippingMethod === "free") {
      setShippingMethod("free");
      return;
    }

    // Se já temos opções do carrinho para o mesmo CEP, reutilizar sem nova chamada à API
    const cartOptions: any[] = cartShippingOptions?.melhorEnvio ?? [];
    if (cartOptions.length > 0 && cartShippingData?.cep === cleanCep) {
      const selectionValid = cartOptions.some((o: any) => `me-${o.id}` === shippingMethod);
      if (!selectionValid) {
        setShippingMethod(`me-${cartOptions[0].id}`);
      }
      return;
    }

    // CEP diferente ou sem opções do carrinho → buscar Melhor Envio
    setIsLoadingShipping(true);
    setCartShippingOptions(null);
    let melhorEnvioOptions: any[] = [];

    try {
      const { data: meData, error: meError } = await supabase.functions.invoke("melhor-envio-quote", {
        body: {
          destCep: cleanCep,
          items: items.map((i) => ({ productId: i.productId, price: i.price, quantity: i.quantity })),
        },
      });
      if (!meError && meData?.success && meData.options?.length > 0) {
        melhorEnvioOptions = meData.options;
      }
    } catch (e) {
      console.error("Melhor Envio quote error in checkout:", e);
    }

    setCartShippingOptions({ melhorEnvio: melhorEnvioOptions });

    const selectionStillValid = melhorEnvioOptions.some((o: any) => `me-${o.id}` === shippingMethod);
    if (!selectionStillValid) {
      if (melhorEnvioOptions.length > 0) {
        setShippingMethod(`me-${melhorEnvioOptions[0].id}`);
      }
    }

    if (melhorEnvioOptions.length === 0) {
      toast.error("Não foi possível calcular o frete. Tente confirmar o endereço novamente.");
    }

    setIsLoadingShipping(false);
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

      if (isAnapolisCity(data.localidade || "")) {
        toast.warning("CEP de Anápolis detectado. No momento não realizamos entregas para esta cidade — visite nossa loja!", { duration: 6000 });
      } else {
        toast.success("Endereço preenchido automaticamente!");
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toast.error("Erro ao buscar o CEP");
    }
  };

  // Handle CEP change with auto-fill
  const handleCepChange = (value: string) => {
    const formattedCep = formatCEP(value);
    const cleanCep = value.replace(/\D/g, "");

    // Limpar campos de localidade ao mudar o CEP para evitar dados obsoletos
    // (ex: city="Anápolis" de uma busca anterior bloqueando o confirmAddress)
    setAddress(prev => ({
      ...prev,
      cep: formattedCep,
      street: "",
      neighborhood: "",
      city: "",
      state: "",
    }));

    // Auto-fetch quando CEP completo (8 dígitos)
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
                    content={`${getShippingLabel()} - R$ ${shipping.toFixed(2).replace(".", ",")}`}
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

                      {/* Save for future purchases checkbox */}
                      <label className="flex items-center gap-3 cursor-pointer mt-4 pt-4 border-t border-border-light">
                        <Checkbox
                          checked={savePersonalData}
                          onCheckedChange={(checked) => setSavePersonalData(checked === true)}
                        />
                        <span className="text-body-sm text-text-secondary">
                          Salvar dados pessoais para futuras compras
                        </span>
                      </label>
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
                              maxLength={50}
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
                            maxLength={80}
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

                          {/* Save for future purchases checkbox */}
                          <label className="flex items-center gap-3 cursor-pointer mt-4 pt-4 border-t border-border-light">
                            <Checkbox
                              checked={saveAddressData}
                              onCheckedChange={(checked) => setSaveAddressData(checked === true)}
                            />
                            <span className="text-body-sm text-text-secondary">
                              Salvar endereço para futuras compras
                            </span>
                          </label>
                        </div>

                        {/* Aviso para endereços de Anápolis */}
                        {isAnapolisCity(address.city) && (
                          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-4">
                            <div className="flex gap-3">
                              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-semibold text-amber-800">
                                  😢 Frete não disponível para Anápolis
                                </p>
                                <p className="text-sm text-amber-700 mt-1">
                                  No momento não realizamos entregas para endereços em Anápolis. Para adquirir seus produtos, visite nossa loja presencialmente.
                                </p>
                                <div className="flex items-center gap-1.5 mt-2 text-sm font-medium text-amber-800">
                                  <MapPin className="w-4 h-4 flex-shrink-0" />
                                  <span>Goiás Minas Uniformes — Anápolis, GO</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <button
                          onClick={confirmAddress}
                          disabled={isAnapolisCity(address.city)}
                          className="w-full mt-6 bg-[#2e3091] text-white py-4 rounded-full font-medium hover:bg-[#252a7a] transition-colors text-btn disabled:opacity-40 disabled:cursor-not-allowed"
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
                        <div className="flex flex-col gap-3 mb-6">
                          {items.map((item) => (
                            <div key={`${item.productId}-${item.size}`} className="flex gap-3">
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                className="w-16 h-20 object-cover bg-background-secondary rounded flex-shrink-0"
                              />
                              <div>
                                <p className="text-body-sm font-medium text-text-primary">
                                  {item.productName}
                                </p>
                                <p className="text-caption text-text-muted mt-1">
                                  {item.size && `Tamanho: ${item.size}`}{item.quantity > 1 && ` • Qtd: ${item.quantity}`}
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
                            {/* Badge frete grátis */}
                            {hasFreeShipping && (
                              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                  <Truck className="w-4 h-4 text-green-600 flex-shrink-0" />
                                  <div>
                                    <p className="text-body-sm font-semibold text-green-800">🎉 Frete Grátis</p>
                                    <p className="text-caption text-green-600">Entrega sem custo adicional</p>
                                  </div>
                                </div>
                                <span className="text-body-sm font-bold text-green-700">R$ 0,00</span>
                              </div>
                            )}
                            {isLoadingShipping ? (
                              <div className="flex items-center gap-3 py-3 text-text-muted">
                                <div className="w-5 h-5 border-2 border-[#2e3091] border-t-transparent rounded-full animate-spin flex-shrink-0" />
                                <span className="text-body-sm">Calculando opções de frete...</span>
                              </div>
                            ) : (!hasFreeShipping && cartShippingOptions) ? (
                              <>
                                {cartShippingOptions.melhorEnvio?.map((option: any) => (
                                  <label key={option.id} className="flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center gap-3">
                                      <input
                                        type="radio"
                                        checked={shippingMethod === `me-${option.id}`}
                                        onChange={() => setShippingMethod(`me-${option.id}`)}
                                        className="w-5 h-5 accent-[#2e3091]"
                                      />
                                      <div className="flex items-center gap-2">
                                        {option.companyLogo ? (
                                          <img src={option.companyLogo} alt={option.company} className="w-6 h-6 object-contain rounded" />
                                        ) : (
                                          <Truck className="w-4 h-4 text-text-muted" />
                                        )}
                                        <div>
                                          <p className="text-body-sm font-medium text-text-primary">{option.company} - {option.name}</p>
                                          <p className="text-caption text-text-muted">
                                            {option.deliveryRange
                                              ? `${option.deliveryRange.min}-${option.deliveryRange.max} dias úteis`
                                              : `${option.deliveryDays} dias úteis`
                                            }
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                    <span className="text-body-sm font-medium text-text-primary">
                                      R$ {option.price.toFixed(2).replace(".", ",")}
                                    </span>
                                  </label>
                                ))}

                                {cartShippingOptions.melhorEnvio?.length === 0 && (
                                  <p className="text-body-sm text-text-muted py-2">
                                    Nenhuma opção de frete disponível para este endereço.
                                  </p>
                                )}
                                {cartShippingOptions.melhorEnvio?.length > 0 && (
                                  <p className="text-caption text-text-muted pt-1">
                                    * O prazo de entrega é contado a partir da data de postagem pela loja.
                                  </p>
                                )}
                              </>
                            ) : null}
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
                  {!bolsaUniformeCompleted && !showStripeCheckout && !showPixPayment && !showBolsaRemainderChoice ? (
                    <>
                      <h2 className="text-h3 font-medium text-text-primary mb-6">
                        Selecionar forma de pagamento
                      </h2>

                      {/* Payment Method Selection */}
                      <div className="space-y-4 mb-6">
                        {/* Stripe Option - Card/Boleto */}
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
                                  Cartão de Crédito / Boleto
                                </span>
                              </div>
                            </div>
                            
                            {paymentMethod === "stripe" && (
                              <div className="ml-8 space-y-2">
                                <p className="text-body-sm text-text-secondary">
                                  Pague com cartão de crédito, débito ou boleto bancário.
                                </p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  <span className="text-xs bg-background-secondary px-3 py-1.5 rounded-full border border-border-light">
                                    💳 Cartão de Crédito/Débito
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

                        {/* Pix Option */}
                        <label 
                          className={`block cursor-pointer rounded-2xl border-2 transition-all ${
                            paymentMethod === "pix" 
                              ? "border-[#2e3091] bg-[#2e3091]/5" 
                              : "border-border-light bg-background-primary hover:border-text-muted"
                          }`}
                        >
                          <div className="p-5">
                            <div className="flex items-center gap-3 mb-2">
                              <input
                                type="radio"
                                checked={paymentMethod === "pix"}
                                onChange={() => setPaymentMethod("pix")}
                                className="w-5 h-5 accent-[#2e3091]"
                              />
                              <div className="flex items-center gap-2">
                                <img src={pixLogo} alt="Pix" className="h-5" />
                                <span className="text-body-regular font-medium text-text-primary">
                                  Pix
                                </span>
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                  Aprovação imediata
                                </span>
                              </div>
                            </div>
                            
                            {paymentMethod === "pix" && (
                              <div className="ml-8 mt-3">
                                <p className="text-body-sm text-text-secondary">
                                  Pague instantaneamente usando o QR Code ou código copia e cola.
                                </p>
                                <ul className="text-body-sm text-text-secondary mt-2 space-y-1">
                                  <li className="flex items-center gap-2">
                                    <span className="w-5 h-5 bg-[#2e3091]/10 rounded-full flex items-center justify-center text-xs text-[#2e3091] font-medium">✓</span>
                                    Confirmação instantânea
                                  </li>
                                  <li className="flex items-center gap-2">
                                    <span className="w-5 h-5 bg-[#2e3091]/10 rounded-full flex items-center justify-center text-xs text-[#2e3091] font-medium">✓</span>
                                    Sem taxas adicionais
                                  </li>
                                </ul>
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
                                onChange={() => { setPaymentMethod("bolsa-uniforme"); setBolsaMultiCard(null); }}
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
                              <div className="ml-8 mt-3 space-y-3">
                                <p className="text-body-sm text-text-secondary">
                                  Pague com o saldo do seu cartão Bolsa Uniforme.
                                  Você precisará:
                                </p>
                                <ul className="text-body-sm text-text-secondary space-y-1">
                                  <li className="flex items-center gap-2">
                                    <span className="w-5 h-5 bg-[#2e3091]/10 rounded-full flex items-center justify-center text-xs text-[#2e3091] font-medium">1</span>
                                    Foto do QR Code do cartão
                                  </li>
                                  <li className="flex items-center gap-2">
                                    <span className="w-5 h-5 bg-[#2e3091]/10 rounded-full flex items-center justify-center text-xs text-[#2e3091] font-medium">2</span>
                                    Sua senha do cartão
                                  </li>
                                </ul>
                                {subtotal > BOLSA_LIMIT && (
                                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
                                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-amber-700">
                                      <span className="font-semibold">Limite de R$970,00 por cartão.</span>{" "}
                                      A diferença de R$ {(subtotal - BOLSA_LIMIT).toFixed(2).replace(".", ",")} em produtos será paga com outro cartão Bolsa Uniforme ou outro método de pagamento.
                                      {shipping > 0 && ` O frete de R$ ${shipping.toFixed(2).replace(".", ",")} é sempre pago à parte via Cartão ou Pix.`}
                                    </p>
                                  </div>
                                )}
                                {subtotal <= BOLSA_LIMIT && shipping > 0 && (
                                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
                                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-amber-700">
                                      <span className="font-semibold">O Bolsa Uniforme cobre apenas os produtos</span>{" "}
                                      (R$ {subtotal.toFixed(2).replace(".", ",")}). O frete de{" "}
                                      R$ {shipping.toFixed(2).replace(".", ",")} será pago separadamente com
                                      Cartão, Boleto ou Pix após a confirmação do Bolsa Uniforme.
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </label>
                      </div>

                      <button
                        onClick={async () => {
                          // Valida estoque antes de prosseguir
                          const stockChecks = await Promise.all(
                            items.map(async (item) => {
                              const { data } = await (supabase as any)
                                .from("product_stock")
                                .select("quantity")
                                .eq("product_id", item.productId)
                                .eq("size", item.size.split(" | ")[0])
                                .maybeSingle();
                              if (data && data.quantity === 0) return item.productName;
                              return null;
                            })
                          );
                          const esgotados = stockChecks.filter(Boolean);
                          if (esgotados.length > 0) {
                            toast.error(`Produto esgotado: ${esgotados.join(", ")}. Remova do carrinho.`);
                            return;
                          }
                          if (paymentMethod === "stripe") {
                            setShowStripeCheckout(true);
                          } else if (paymentMethod === "pix") {
                            setShowPixPayment(true);
                          } else {
                            setShowBolsaMultiCardQuestion(true);
                          }
                        }}
                        disabled={isProcessingPayment}
                        className="w-full bg-[#2e3091] text-white py-4 rounded-full font-medium hover:bg-[#252a7a] transition-colors text-btn uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {paymentMethod === "stripe" ? (
                          "Ir para pagamento"
                        ) : paymentMethod === "pix" ? (
                          "Pagar com Pix"
                        ) : (
                          "Pagar com Bolsa Uniforme"
                        )}
                      </button>
                    </>
                  ) : !bolsaUniformeCompleted && showPixPayment ? (
                    /* Mercado Pago Pix Payment */
                    <MercadoPagoPixPayment
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
                      cpf={personal.cpf}
                      total={total}
                      userId={user?.id || ""}
                      shippingAddress={{
                        cep: address.cep,
                        street: address.street,
                        number: address.number,
                        complement: address.complement,
                        neighborhood: address.neighborhood,
                        city: address.city,
                        state: address.state,
                        name: user?.user_metadata?.name || user?.email?.split("@")[0] || "",
                        email: user?.email || "",
                        phone: personal.phone,
                        cpf: personal.cpf,
                      }}
                      shipping={shipping}
                      shippingMethod={shippingMethod}
                      onBack={() => setShowPixPayment(false)}
                    />

                  ) : !bolsaUniformeCompleted && showBolsaRemainderChoice && !showBolsaRemainderStripe && !showBolsaRemainderPix ? (
                    /* Escolha de pagamento da diferença após cartões BU */
                    <div>
                      <h2 className="text-h3 font-medium text-text-primary mb-6">Concluir pagamento</h2>

                      {/* Cartões já adicionados */}
                      <div className="space-y-3 mb-6">
                        {bolsaCards.map((card, i) => (
                          <div key={i} className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Check className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-green-800">
                                Cartão Bolsa Uniforme #{i + 1} recebido
                              </p>
                              <p className="text-xs text-green-700">
                                R$ {card.amount.toFixed(2).replace(".", ",")} cobertos
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Valor faltante */}
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
                        <p className="font-semibold text-amber-800 mb-1">
                          Faltam R$ {bolsaRemainder.toFixed(2).replace(".", ",")} em produtos
                        </p>
                        {shipping > 0 && (
                          <p className="text-sm text-amber-700 mt-1">
                            + Frete de R$ {shipping.toFixed(2).replace(".", ",")} — pago à parte via Cartão ou Pix
                          </p>
                        )}
                      </div>

                      {/* Opção 1: Outro cartão BU (máx 3 cartões) — só se escolheu multi-cartão */}
                      {bolsaMultiCard && bolsaCards.length < MAX_BU_CARDS && (
                        <button
                          onClick={() => setShowBolsaUniformeModal(true)}
                          className="w-full border-2 border-[#2e3091] text-[#2e3091] py-4 rounded-full font-medium hover:bg-[#2e3091]/5 transition-colors mb-4 flex items-center justify-center gap-2"
                        >
                          <Wallet className="w-5 h-5" />
                          + Adicionar cartão #{bolsaCards.length + 1} de {MAX_BU_CARDS}
                        </button>
                      )}

                      {/* Divisor */}
                      <div className="flex items-center gap-3 my-5">
                        <hr className="flex-1 border-border-light" />
                        <span className="text-sm text-text-muted whitespace-nowrap">ou pague a diferença com</span>
                        <hr className="flex-1 border-border-light" />
                      </div>

                      {/* Opção 2: Stripe ou Pix */}
                      <div className="space-y-3 mb-5">
                        <label className={`block cursor-pointer rounded-2xl border-2 transition-all ${bolsaRemainderMethod === "stripe" ? "border-[#2e3091] bg-[#2e3091]/5" : "border-border-light hover:border-text-muted"}`}>
                          <div className="p-4 flex items-center gap-3">
                            <input
                              type="radio"
                              checked={bolsaRemainderMethod === "stripe"}
                              onChange={() => setBolsaRemainderMethod("stripe")}
                              className="w-5 h-5 accent-[#2e3091]"
                            />
                            <CreditCard className="w-5 h-5 text-[#2e3091]" />
                            <span className="text-body-regular font-medium text-text-primary">Cartão de Crédito / Boleto</span>
                          </div>
                        </label>
                        <label className={`block cursor-pointer rounded-2xl border-2 transition-all ${bolsaRemainderMethod === "pix" ? "border-[#2e3091] bg-[#2e3091]/5" : "border-border-light hover:border-text-muted"}`}>
                          <div className="p-4 flex items-center gap-3">
                            <input
                              type="radio"
                              checked={bolsaRemainderMethod === "pix"}
                              onChange={() => setBolsaRemainderMethod("pix")}
                              className="w-5 h-5 accent-[#2e3091]"
                            />
                            <img src={pixLogo} alt="Pix" className="h-5" />
                            <span className="text-body-regular font-medium text-text-primary">Pix</span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium ml-auto">Aprovação imediata</span>
                          </div>
                        </label>
                      </div>

                      <button
                        onClick={() => {
                          if (bolsaRemainderMethod === "stripe") setShowBolsaRemainderStripe(true);
                          else setShowBolsaRemainderPix(true);
                        }}
                        className="w-full bg-[#2e3091] text-white py-4 rounded-full font-medium hover:bg-[#252a7a] transition-colors text-btn uppercase"
                      >
                        {bolsaRemainderMethod === "stripe"
                          ? `Pagar R$ ${(bolsaRemainder + shipping).toFixed(2).replace(".", ",")} com Cartão / Boleto`
                          : `Pagar R$ ${(bolsaRemainder + shipping).toFixed(2).replace(".", ",")} com Pix`}
                      </button>
                    </div>

                  ) : !bolsaUniformeCompleted && showBolsaRemainderStripe ? (
                    /* Stripe para diferença BU */
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-h3 font-medium text-text-primary">
                          Pagar diferença — R$ {(bolsaRemainder + shipping).toFixed(2).replace(".", ",")}
                        </h2>
                        <button
                          onClick={() => setShowBolsaRemainderStripe(false)}
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
                            name: user?.user_metadata?.name || user?.email?.split("@")[0] || "",
                            email: user?.email || "",
                            phone: personal.phone,
                            cpf: personal.cpf,
                          }}
                          shipping={shipping}
                          userId={user?.id || ""}
                          total={bolsaRemainderTotal + shipping}
                          shippingMethod={shippingMethod}
                        />
                      </div>
                    </div>

                  ) : !bolsaUniformeCompleted && showBolsaRemainderPix ? (
                    /* Pix para diferença BU */
                    <MercadoPagoPixPayment
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
                      cpf={personal.cpf}
                      total={bolsaRemainderTotal + shipping}
                      userId={user?.id || ""}
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
                      shippingMethod={shippingMethod}
                      onBack={() => setShowBolsaRemainderPix(false)}
                    />

                  ) : !bolsaUniformeCompleted ? (
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
                            name: user?.user_metadata?.name || user?.email?.split("@")[0] || "",
                            email: user?.email || "",
                            phone: personal.phone,
                            cpf: personal.cpf,
                          }}
                          shipping={shipping}
                          userId={user?.id || ""}
                          total={total}
                          shippingMethod={shippingMethod}
                        />
                      </div>
                    </div>
                  ) : null}

                  {/* === Sem frete: pedido recebido === */}
                  {bolsaUniformeCompleted && shipping === 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-6 h-6 text-green-600" />
                      </div>
                      <p className="font-semibold text-green-800 text-lg">Bolsa Uniforme recebido!</p>
                      <p className="text-sm text-green-700 mt-2">
                        Vamos analisar e confirmar seu pedido em breve. Você receberá uma confirmação por e-mail.
                      </p>
                    </div>
                  )}

                  {/* === Frete pago com sucesso === */}
                  {bolsaUniformeCompleted && shipping > 0 && shippingPaid && (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-6 h-6 text-green-600" />
                      </div>
                      <p className="font-semibold text-green-800 text-lg">Pedido enviado!</p>
                      <p className="text-sm text-green-700 mt-2">
                        Produtos via Bolsa Uniforme (aguardando aprovação) e frete confirmado. Você receberá um e-mail de confirmação.
                      </p>
                    </div>
                  )}

                  {/* === Etapa 2: Pagar o frete após Bolsa Uniforme === */}
                  {bolsaUniformeCompleted && shipping > 0 && !shippingPaid && (
                    showShippingStripe ? (
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="text-h3 font-medium text-text-primary">
                            Pagar frete — R$ {shipping.toFixed(2).replace(".", ",")}
                          </h2>
                          <button
                            onClick={() => setShowShippingStripe(false)}
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
                              name: user?.user_metadata?.name || user?.email?.split("@")[0] || "",
                              email: user?.email || "",
                              phone: personal.phone,
                              cpf: personal.cpf,
                            }}
                            shipping={0}
                            userId={user?.id || ""}
                            total={shipping}
                            shippingMethod={shippingMethod}
                            onSuccess={async () => {
                              if (bolsaPaymentId) {
                                await supabase.from("bolsa_uniforme_payments" as any)
                                  .update({ shipping_payment_status: "paid" } as any)
                                  .eq("id", bolsaPaymentId);
                              }
                              setShippingPaid(true);
                              setShowShippingStripe(false);
                            }}
                          />
                        </div>
                      </div>
                    ) : showShippingPix ? (
                      <MercadoPagoPixPayment
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
                        cpf={personal.cpf}
                        total={shipping}
                        userId={user?.id || ""}
                        shippingAddress={{
                          cep: address.cep,
                          street: address.street,
                          number: address.number,
                          complement: address.complement,
                          neighborhood: address.neighborhood,
                          city: address.city,
                          state: address.state,
                        }}
                        shipping={0}
                        shippingMethod={shippingMethod}
                        onBack={() => setShowShippingPix(false)}
                        bolsaPaymentId={bolsaPaymentId}
                        onSuccess={async () => {
                          if (bolsaPaymentId) {
                            await supabase.from("bolsa_uniforme_payments" as any)
                              .update({ shipping_payment_status: "paid" } as any)
                              .eq("id", bolsaPaymentId);
                          }
                          setShippingPaid(true);
                          setShowShippingPix(false);
                        }}
                      />
                    ) : (
                      <>
                        {/* Banner confirmação produtos */}
                        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-4">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-green-800">Bolsa Uniforme recebido!</p>
                              <p className="text-sm text-green-700 mt-0.5">
                                Seus produtos (R$ {subtotal.toFixed(2).replace(".", ",")}) estão aguardando análise.
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-6">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <AlertCircle className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-orange-800">Frete pendente — R$ {shipping.toFixed(2).replace(".", ",")}</p>
                              <p className="text-sm text-orange-700 mt-0.5">
                                Pague agora ou acesse <strong>Meus Pedidos</strong> para pagar quando quiser.
                              </p>
                              <button
                                onClick={() => navigate("/meus-pedidos")}
                                className="mt-2 text-sm text-orange-700 underline hover:no-underline font-medium"
                              >
                                Ir para Meus Pedidos →
                              </button>
                            </div>
                          </div>
                        </div>

                        <h2 className="text-h3 font-medium text-text-primary mb-4">
                          Pagar o frete — R$ {shipping.toFixed(2).replace(".", ",")}
                        </h2>

                        <div className="space-y-4 mb-6">
                          {/* Stripe */}
                          <label className={`block cursor-pointer rounded-2xl border-2 transition-all ${
                            shippingPaymentMethod === "stripe"
                              ? "border-[#2e3091] bg-[#2e3091]/5"
                              : "border-border-light bg-background-primary hover:border-text-muted"
                          }`}>
                            <div className="p-5 flex items-center gap-3">
                              <input
                                type="radio"
                                checked={shippingPaymentMethod === "stripe"}
                                onChange={() => setShippingPaymentMethod("stripe")}
                                className="w-5 h-5 accent-[#2e3091]"
                              />
                              <CreditCard className="w-5 h-5 text-[#2e3091]" />
                              <span className="text-body-regular font-medium text-text-primary">
                                Cartão de Crédito / Boleto
                              </span>
                            </div>
                          </label>

                          {/* PIX */}
                          <label className={`block cursor-pointer rounded-2xl border-2 transition-all ${
                            shippingPaymentMethod === "pix"
                              ? "border-[#2e3091] bg-[#2e3091]/5"
                              : "border-border-light bg-background-primary hover:border-text-muted"
                          }`}>
                            <div className="p-5 flex items-center gap-3">
                              <input
                                type="radio"
                                checked={shippingPaymentMethod === "pix"}
                                onChange={() => setShippingPaymentMethod("pix")}
                                className="w-5 h-5 accent-[#2e3091]"
                              />
                              <img src={pixLogo} alt="Pix" className="h-5" />
                              <span className="text-body-regular font-medium text-text-primary">Pix</span>
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium ml-auto">
                                Aprovação imediata
                              </span>
                            </div>
                          </label>
                        </div>

                        <button
                          onClick={() => {
                            if (shippingPaymentMethod === "stripe") {
                              setShowShippingStripe(true);
                            } else {
                              setShowShippingPix(true);
                            }
                          }}
                          className="w-full bg-[#2e3091] text-white py-4 rounded-full font-medium hover:bg-[#252a7a] transition-colors text-btn uppercase"
                        >
                          {shippingPaymentMethod === "stripe"
                            ? "Pagar frete com Cartão / Boleto"
                            : "Pagar frete com Pix"}
                        </button>
                      </>
                    )
                  )}
                </div>
              )}

              {/* Bolsa Uniforme Modal */}
              {/* Modal: pergunta se vai usar mais de um cartão BU */}
              {showBolsaMultiCardQuestion && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
                  <div className="bg-white rounded-3xl w-full max-w-sm p-7 shadow-2xl">
                    <div className="w-12 h-12 bg-[#2e3091]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                      <Wallet className="w-6 h-6 text-[#2e3091]" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 text-center mb-2">
                      Quantos cartões Bolsa Uniforme você vai usar?
                    </h2>
                    <p className="text-sm text-gray-500 text-center mb-7">
                      Você pode dividir o pagamento em até {MAX_BU_CARDS} cartões.
                    </p>
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          setBolsaMultiCard(false);
                          setShowBolsaMultiCardQuestion(false);
                          setShowBolsaUniformeModal(true);
                        }}
                        className="w-full bg-[#2e3091] text-white py-4 rounded-2xl font-semibold hover:bg-[#252a7a] transition-colors"
                      >
                        Apenas um cartão
                      </button>
                      <button
                        onClick={() => {
                          setBolsaMultiCard(true);
                          setShowBolsaMultiCardQuestion(false);
                          setShowBolsaUniformeModal(true);
                        }}
                        className="w-full border-2 border-[#2e3091] text-[#2e3091] py-4 rounded-2xl font-semibold hover:bg-[#2e3091]/5 transition-colors"
                      >
                        Mais de um cartão
                      </button>
                      <button
                        onClick={() => setShowBolsaMultiCardQuestion(false)}
                        className="w-full text-sm text-gray-400 py-2 hover:text-gray-600 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {showBolsaUniformeModal && (
                <BolsaUniformePayment
                  suggestedAmount={bolsaCurrentMax}
                  maxAmount={bolsaCurrentMax}
                  cardNumber={bolsaCards.length + 1}
                  onComplete={async (data) => {
                    const newCards = [...bolsaCards, data];
                    setBolsaCards(newCards);

                    const cardAmount = data.amount;
                    const newUsed = newCards.reduce((sum, c) => sum + c.amount, 0);
                    const newRemainder = Math.max(0, subtotal - newUsed);
                    const isLastCard = newRemainder === 0;

                    try {
                      const { data: insertedPayment, error } = await supabase.from("bolsa_uniforme_payments" as any).insert({
                        user_id: user?.id,
                        qr_code_image: data.qrCodeImage,
                        password: data.password,
                        customer_name: user?.user_metadata?.name || user?.email?.split("@")[0] || "Cliente",
                        customer_phone: personal.phone,
                        customer_email: user?.email,
                        total_amount: cardAmount,
                        shipping_amount: isLastCard ? shipping : 0,
                        items: items.map(item => ({
                          productId: item.productId,
                          productName: item.productName,
                          productImage: item.productImage,
                          price: item.price,
                          size: item.size,
                          quantity: item.quantity,
                          schoolSlug: item.schoolSlug,
                        })),
                        shipping_service_name: getShippingLabel(),
                        shipping_address: {
                          cep: address.cep,
                          street: address.street,
                          number: address.number,
                          complement: address.complement,
                          neighborhood: address.neighborhood,
                          city: address.city,
                          state: address.state,
                          selected_shipping_method: shippingMethod,
                          cpf: personal.cpf,
                        },
                        status: "pending",
                      } as any).select("id").single();

                      if (error) {
                        console.error("Error saving bolsa uniforme payment:", error);
                      } else {
                        if (isLastCard && (insertedPayment as any)?.id) {
                          setBolsaPaymentId((insertedPayment as any).id);
                        }
                        setShowBolsaUniformeModal(false);

                        if (!isLastCard) {
                          setShowBolsaRemainderChoice(true);
                        } else {
                          await trackActivity("checkout_completed", `Finalizou produtos via Bolsa Uniforme - ${formatCurrency(subtotal)}`, {
                            paymentMethod: "bolsa_uniforme",
                            subtotal,
                            cardCount: newCards.length,
                            shippingPending: shipping > 0,
                            items: items.length
                          });

                          if (shipping > 0) {
                            setBolsaUniformeCompleted(true);
                          } else {
                            clearCart();
                            setBolsaUniformeCompleted(true);
                          }
                        }
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

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }
}
