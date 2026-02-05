"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, Settings, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const COOKIE_CONSENT_KEY = "viral-academy-cookie-consent";
const COOKIE_PREFERENCES_KEY = "viral-academy-cookie-preferences";

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

const defaultPreferences: CookiePreferences = {
  necessary: true, // Always true, cannot be disabled
  analytics: false,
  marketing: false,
  functional: false,
};

export function CookieBanner() {
  const [showBanner, setShowBanner] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [preferences, setPreferences] = React.useState<CookiePreferences>(defaultPreferences);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    // Check if user has already given consent
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay to avoid layout shift on page load
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    } else {
      // Load saved preferences
      const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences));
      }
    }
  }, []);

  const saveConsent = (accepted: boolean, prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, accepted ? "accepted" : "rejected");
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    setShowBanner(false);
    setShowSettings(false);

    // Dispatch custom event so other parts of the app can react
    window.dispatchEvent(new CustomEvent("cookieConsentChanged", {
      detail: { accepted, preferences: prefs }
    }));

    // If analytics accepted, you could initialize Google Analytics here
    if (prefs.analytics) {
      initializeAnalytics();
    }
  };

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    saveConsent(true, allAccepted);
  };

  const handleRejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    saveConsent(false, onlyNecessary);
  };

  const handleSavePreferences = () => {
    saveConsent(true, preferences);
  };

  const initializeAnalytics = () => {
    // Initialize Google Analytics or other analytics services
    // This is where you would add gtag or similar
    if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_GA_ID) {
      // Google Analytics initialization would go here
      console.log("Analytics initialized");
    }
  };

  if (!mounted) return null;

  return (
    <>
      {/* Cookie Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-2 sm:p-4 md:p-6"
          >
            <div className="mx-auto max-w-4xl">
              <div className="rounded-xl sm:rounded-2xl border bg-background/95 backdrop-blur-sm shadow-lg p-3 sm:p-4 md:p-6">
                <div className="flex flex-col gap-3 sm:gap-4">
                  {/* Header */}
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Cookie className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2">
                        <Cookie className="h-4 w-4 text-primary sm:hidden" />
                        Usamos cookies
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-3 sm:line-clamp-none">
                        Utilizamos cookies para analizar el uso del sitio, mejorar nuestros servicios
                        y mostrarte contenido relevante.
                      </p>
                      <Link
                        href="/cookies"
                        className="text-xs sm:text-sm text-primary hover:underline mt-1 inline-block"
                      >
                        Política de Cookies
                      </Link>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 -mt-1 -mr-1 h-8 w-8 sm:h-9 sm:w-9"
                      onClick={handleRejectAll}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSettings(true)}
                      className="sm:order-1 text-xs sm:text-sm h-9 sm:h-10"
                    >
                      <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                      Personalizar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRejectAll}
                      className="sm:order-2 text-xs sm:text-sm h-9 sm:h-10"
                    >
                      Rechazar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAcceptAll}
                      className="sm:order-3 text-xs sm:text-sm h-9 sm:h-10"
                    >
                      <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                      Aceptar todo
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Cookie className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Configuración de Cookies
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Personaliza qué cookies quieres permitir. Las necesarias no se pueden desactivar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 sm:py-4">
            {/* Necessary Cookies */}
            <div className="flex items-center justify-between rounded-lg border p-3 sm:p-4">
              <div className="space-y-0.5 flex-1 min-w-0 pr-3">
                <Label className="font-medium text-sm sm:text-base">Necesarias</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Esenciales para el funcionamiento del sitio.
                </p>
              </div>
              <Switch checked={true} disabled className="shrink-0" />
            </div>

            {/* Analytics Cookies */}
            <div className="flex items-center justify-between rounded-lg border p-3 sm:p-4">
              <div className="space-y-0.5 flex-1 min-w-0 pr-3">
                <Label className="font-medium text-sm sm:text-base">Análisis</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Para entender cómo usas el sitio.
                </p>
              </div>
              <Switch
                checked={preferences.analytics}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({ ...prev, analytics: checked }))
                }
                className="shrink-0"
              />
            </div>

            {/* Marketing Cookies */}
            <div className="flex items-center justify-between rounded-lg border p-3 sm:p-4">
              <div className="space-y-0.5 flex-1 min-w-0 pr-3">
                <Label className="font-medium text-sm sm:text-base">Marketing</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Anuncios relevantes según tus intereses.
                </p>
              </div>
              <Switch
                checked={preferences.marketing}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({ ...prev, marketing: checked }))
                }
                className="shrink-0"
              />
            </div>

            {/* Functional Cookies */}
            <div className="flex items-center justify-between rounded-lg border p-3 sm:p-4">
              <div className="space-y-0.5 flex-1 min-w-0 pr-3">
                <Label className="font-medium text-sm sm:text-base">Funcionales</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Recordar tus preferencias.
                </p>
              </div>
              <Switch
                checked={preferences.functional}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({ ...prev, functional: checked }))
                }
                className="shrink-0"
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" size="sm" onClick={handleRejectAll} className="sm:mr-auto text-xs sm:text-sm">
              Rechazar todo
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowSettings(false)} className="text-xs sm:text-sm">
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSavePreferences} className="text-xs sm:text-sm">
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Hook to check cookie consent status
export function useCookieConsent() {
  const [consent, setConsent] = React.useState<{
    hasConsent: boolean;
    preferences: CookiePreferences;
  }>({
    hasConsent: false,
    preferences: defaultPreferences,
  });

  React.useEffect(() => {
    const checkConsent = () => {
      const consentValue = localStorage.getItem(COOKIE_CONSENT_KEY);
      const preferencesValue = localStorage.getItem(COOKIE_PREFERENCES_KEY);

      setConsent({
        hasConsent: consentValue === "accepted",
        preferences: preferencesValue ? JSON.parse(preferencesValue) : defaultPreferences,
      });
    };

    checkConsent();

    // Listen for consent changes
    const handleConsentChange = () => checkConsent();
    window.addEventListener("cookieConsentChanged", handleConsentChange);

    return () => {
      window.removeEventListener("cookieConsentChanged", handleConsentChange);
    };
  }, []);

  return consent;
}
