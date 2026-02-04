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
            className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
          >
            <div className="mx-auto max-w-4xl">
              <div className="rounded-2xl border bg-background/95 backdrop-blur-sm shadow-lg p-4 md:p-6">
                <div className="flex flex-col gap-4">
                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Cookie className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        Usamos cookies para mejorar tu experiencia
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Utilizamos cookies propias y de terceros para analizar el uso del sitio web,
                        mejorar nuestros servicios y mostrarte publicidad relacionada con tus preferencias.
                        Puedes aceptar todas las cookies, rechazarlas o personalizar tu configuración.
                      </p>
                      <Link
                        href="/cookies"
                        className="text-sm text-primary hover:underline mt-1 inline-block"
                      >
                        Leer nuestra Política de Cookies
                      </Link>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 -mt-1 -mr-1"
                      onClick={handleRejectAll}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setShowSettings(true)}
                      className="sm:order-1"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Personalizar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleRejectAll}
                      className="sm:order-2"
                    >
                      Rechazar todo
                    </Button>
                    <Button
                      onClick={handleAcceptAll}
                      className="sm:order-3"
                    >
                      <Check className="h-4 w-4 mr-2" />
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5 text-primary" />
              Configuración de Cookies
            </DialogTitle>
            <DialogDescription>
              Personaliza qué tipos de cookies quieres permitir. Las cookies necesarias
              no se pueden desactivar ya que son esenciales para el funcionamiento del sitio.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Necessary Cookies */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5 flex-1">
                <Label className="font-medium">Cookies Necesarias</Label>
                <p className="text-sm text-muted-foreground">
                  Esenciales para el funcionamiento del sitio. Incluyen autenticación,
                  seguridad y preferencias básicas.
                </p>
              </div>
              <Switch checked={true} disabled className="ml-4" />
            </div>

            {/* Analytics Cookies */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5 flex-1">
                <Label className="font-medium">Cookies de Análisis</Label>
                <p className="text-sm text-muted-foreground">
                  Nos ayudan a entender cómo usas el sitio para mejorar tu experiencia.
                  Incluyen Google Analytics.
                </p>
              </div>
              <Switch
                checked={preferences.analytics}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({ ...prev, analytics: checked }))
                }
                className="ml-4"
              />
            </div>

            {/* Marketing Cookies */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5 flex-1">
                <Label className="font-medium">Cookies de Marketing</Label>
                <p className="text-sm text-muted-foreground">
                  Permiten mostrarte anuncios relevantes basados en tus intereses.
                  Incluyen Facebook Pixel y Google Ads.
                </p>
              </div>
              <Switch
                checked={preferences.marketing}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({ ...prev, marketing: checked }))
                }
                className="ml-4"
              />
            </div>

            {/* Functional Cookies */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5 flex-1">
                <Label className="font-medium">Cookies Funcionales</Label>
                <p className="text-sm text-muted-foreground">
                  Mejoran la funcionalidad del sitio recordando tus preferencias
                  como idioma, región y personalización.
                </p>
              </div>
              <Switch
                checked={preferences.functional}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({ ...prev, functional: checked }))
                }
                className="ml-4"
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleRejectAll} className="sm:mr-auto">
              Rechazar todo
            </Button>
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSavePreferences}>
              Guardar preferencias
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
