"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Link from 'next/link';

const COOKIE_CONSENT_KEY = "osklen_cookie_consent_dismissed";

export default function CookieBanner() {
  const [isMounted, setIsMounted] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    const hasDismissed = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!hasDismissed) {
      // Delay to allow slide-up animation
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
      className={`fixed bottom-0 left-0 right-0 z-[9999] bg-background-secondary border-t border-border-light text-text-secondary shadow-md transition-transform duration-500 ease-out ${
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
            <h3 className="font-semibold text-base text-text-primary tracking-[-0.02em] leading-[1.1]">
              Cookies
            </h3>
            <p className="mt-2 text-[13px] text-text-tertiary tracking-[-0.02em] leading-snug max-w-lg">
              Utilizamos cookies para melhorar a sua experiência no site. Ao continuar navegando, você concorda com a nossa{" "}
              <Link href="/politica-de-privacidade" className="underline hover:text-text-primary transition-colors">
                Política de Privacidade
              </Link>
              .
            </p>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            <button
              onClick={handleDismiss}
              className="text-[14px] underline whitespace-nowrap text-text-secondary hover:text-text-primary tracking-[-0.02em] transition-colors"
            >
              Continuar sem aceitar
            </button>
            <button
              onClick={handleDismiss}
              aria-label="Fechar aviso de cookies"
              className="w-7 h-7 flex items-center justify-center rounded-full bg-input hover:bg-border transition-colors group"
            >
              <X size={16} className="text-text-muted group-hover:text-text-secondary transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
