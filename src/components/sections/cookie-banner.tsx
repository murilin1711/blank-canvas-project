"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Link } from 'react-router-dom';

const COOKIE_CONSENT_KEY = "osklen_cookie_consent_dismissed";

export default function CookieBanner() {
  const [isMounted, setIsMounted] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    const hasDismissed = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!hasDismissed) {
      const timer = setTimeout(() => {
        setIsDismissed(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
    setIsDismissed(true);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[9999] bg-secondary border-t border-border text-secondary-foreground shadow-md transition-transform duration-500 ease-out ${
        isDismissed ? "translate-y-full" : "translate-y-0"
      }`}
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de cookies"
      hidden={isDismissed}
    >
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-[30px] py-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-8">
          <div className="text-center lg:text-left">
            <h3 className="font-semibold text-body-lg text-foreground">Cookies</h3>
            <p className="mt-2 text-body-regular text-muted-foreground max-w-lg">
              Utilizamos cookies para melhorar a sua experiência no site. Ao continuar navegando, você concorda com a nossa{" "}
              <Link
                to="/politica-de-privacidade"
                className="underline hover:text-foreground transition-colors"
              >
                Política de Privacidade
              </Link>
              .
            </p>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            <button
              onClick={handleDismiss}
              className="text-body-regular underline whitespace-nowrap text-muted-foreground hover:text-foreground transition-colors"
            >
              Continuar sem aceitar
            </button>
            <button
              onClick={handleDismiss}
              aria-label="Fechar aviso de cookies"
              className="w-7 h-7 flex items-center justify-center rounded-full bg-muted hover:bg-border transition-colors group"
            >
              <X
                size={16}
                className="text-muted-foreground group-hover:text-foreground transition-colors"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
