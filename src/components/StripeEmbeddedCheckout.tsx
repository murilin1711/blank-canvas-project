import { useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { supabase } from "@/integrations/supabase/client";

const stripePromise = loadStripe("pk_test_51Sjq5zE3ZoLTmzUOL1Ls6bmKRH23iWmAtGZ8x6GHMkk90diS0GyCOv9Y9SNEvINzBGaVbqZ2eULMh1x8hK74ld3b00VR2fM3Gj");

interface CartItem {
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  size: string;
  quantity: number;
  schoolSlug: string;
}

interface StripeEmbeddedCheckoutProps {
  items: CartItem[];
  customerEmail: string;
  customerName: string;
  shippingAddress: {
    cep: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  shipping: number;
  userId: string;
}

export function StripeEmbeddedCheckout({
  items,
  customerEmail,
  customerName,
  shippingAddress,
  shipping,
  userId
}: StripeEmbeddedCheckoutProps) {
  const fetchClientSecret = useCallback(async () => {
    const { data, error } = await supabase.functions.invoke("create-embedded-checkout", {
      body: {
        items,
        customerEmail,
        customerName,
        shippingAddress,
        shipping,
        userId,
      },
    });

    if (error || !data?.clientSecret) {
      console.error("Error creating embedded checkout:", error);
      throw new Error("Falha ao criar sessão de pagamento");
    }

    return data.clientSecret;
  }, [items, customerEmail, customerName, shippingAddress, shipping, userId]);

  const options = { fetchClientSecret };

  return (
    <div className="w-full">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
