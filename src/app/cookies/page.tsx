import { Metadata } from "next";
import Link from "next/link";
import { Cookie, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Política de Cookies",
  description: "Información sobre el uso de cookies en Viral Academy",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-4xl py-12 px-4">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Cookie className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Política de Cookies</h1>
              <p className="text-muted-foreground">Última actualización: Febrero 2026</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle>¿Qué son las cookies?</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                Las cookies son pequeños archivos de texto que los sitios web colocan en tu dispositivo
                cuando los visitas. Se utilizan ampliamente para hacer que los sitios web funcionen
                de manera más eficiente, así como para proporcionar información a los propietarios del sitio.
              </p>
              <p>
                En Viral Academy utilizamos cookies para mejorar tu experiencia de navegación,
                recordar tus preferencias y entender cómo interactúas con nuestra plataforma.
              </p>
            </CardContent>
          </Card>

          {/* Types of Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>Tipos de cookies que utilizamos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Necessary */}
              <div className="rounded-lg border p-4 bg-green-500/5 border-green-500/20">
                <h3 className="font-semibold text-green-700 dark:text-green-400 mb-2">
                  Cookies Necesarias (Siempre activas)
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Son esenciales para el funcionamiento del sitio web. Sin estas cookies,
                  no podrías navegar por el sitio ni usar funciones básicas.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4">Cookie</th>
                        <th className="text-left py-2 pr-4">Propósito</th>
                        <th className="text-left py-2">Duración</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 pr-4 font-mono text-xs">next-auth.session-token</td>
                        <td className="py-2 pr-4">Mantiene tu sesión iniciada</td>
                        <td className="py-2">Sesión</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 pr-4 font-mono text-xs">next-auth.csrf-token</td>
                        <td className="py-2 pr-4">Protección contra ataques CSRF</td>
                        <td className="py-2">Sesión</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 pr-4 font-mono text-xs">viral-academy-cookie-consent</td>
                        <td className="py-2 pr-4">Guarda tu preferencia de cookies</td>
                        <td className="py-2">1 año</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-mono text-xs">theme</td>
                        <td className="py-2 pr-4">Guarda tu preferencia de tema (claro/oscuro)</td>
                        <td className="py-2">1 año</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Analytics */}
              <div className="rounded-lg border p-4">
                <h3 className="font-semibold mb-2">Cookies de Análisis</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Nos permiten entender cómo los visitantes interactúan con nuestro sitio web,
                  lo que nos ayuda a mejorar su funcionamiento.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4">Cookie</th>
                        <th className="text-left py-2 pr-4">Proveedor</th>
                        <th className="text-left py-2 pr-4">Propósito</th>
                        <th className="text-left py-2">Duración</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 pr-4 font-mono text-xs">_ga</td>
                        <td className="py-2 pr-4">Google Analytics</td>
                        <td className="py-2 pr-4">Distinguir usuarios únicos</td>
                        <td className="py-2">2 años</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 pr-4 font-mono text-xs">_ga_*</td>
                        <td className="py-2 pr-4">Google Analytics</td>
                        <td className="py-2 pr-4">Persistir el estado de la sesión</td>
                        <td className="py-2">2 años</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-mono text-xs">_gid</td>
                        <td className="py-2 pr-4">Google Analytics</td>
                        <td className="py-2 pr-4">Distinguir usuarios</td>
                        <td className="py-2">24 horas</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Marketing */}
              <div className="rounded-lg border p-4">
                <h3 className="font-semibold mb-2">Cookies de Marketing</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Se utilizan para rastrear a los visitantes en los sitios web con el fin de
                  mostrar anuncios relevantes y atractivos para el usuario individual.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4">Cookie</th>
                        <th className="text-left py-2 pr-4">Proveedor</th>
                        <th className="text-left py-2 pr-4">Propósito</th>
                        <th className="text-left py-2">Duración</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 pr-4 font-mono text-xs">_fbp</td>
                        <td className="py-2 pr-4">Facebook</td>
                        <td className="py-2 pr-4">Publicidad en Facebook</td>
                        <td className="py-2">3 meses</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-mono text-xs">_gcl_au</td>
                        <td className="py-2 pr-4">Google Ads</td>
                        <td className="py-2 pr-4">Conversiones de anuncios</td>
                        <td className="py-2">3 meses</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Functional */}
              <div className="rounded-lg border p-4">
                <h3 className="font-semibold mb-2">Cookies Funcionales</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Permiten que el sitio web recuerde las elecciones que haces y proporcione
                  características mejoradas y más personales.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4">Cookie</th>
                        <th className="text-left py-2 pr-4">Propósito</th>
                        <th className="text-left py-2">Duración</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 pr-4 font-mono text-xs">sidebar-collapsed</td>
                        <td className="py-2 pr-4">Recordar estado del menú lateral</td>
                        <td className="py-2">1 año</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-mono text-xs">video-quality</td>
                        <td className="py-2 pr-4">Preferencia de calidad de video</td>
                        <td className="py-2">1 año</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How to manage cookies */}
          <Card>
            <CardHeader>
              <CardTitle>¿Cómo gestionar las cookies?</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                Puedes gestionar tus preferencias de cookies en cualquier momento desde el banner
                que aparece al visitar nuestro sitio, o desde la configuración de tu navegador.
              </p>
              <h4>Configuración del navegador</h4>
              <p>
                La mayoría de los navegadores te permiten controlar las cookies a través de
                sus configuraciones. Aquí tienes enlaces a las instrucciones de los navegadores
                más populares:
              </p>
              <ul>
                <li>
                  <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Google Chrome
                  </a>
                </li>
                <li>
                  <a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Mozilla Firefox
                  </a>
                </li>
                <li>
                  <a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Safari
                  </a>
                </li>
                <li>
                  <a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Microsoft Edge
                  </a>
                </li>
              </ul>
              <p className="text-sm text-muted-foreground">
                Ten en cuenta que si bloqueas todas las cookies, algunas funciones del sitio
                podrían no funcionar correctamente.
              </p>
            </CardContent>
          </Card>

          {/* Third party cookies */}
          <Card>
            <CardHeader>
              <CardTitle>Cookies de terceros</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                Algunos de nuestros servicios utilizan cookies de terceros. Estos proveedores
                tienen sus propias políticas de privacidad:
              </p>
              <ul>
                <li>
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Google (Analytics, Ads)
                  </a>
                </li>
                <li>
                  <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Meta/Facebook
                  </a>
                </li>
                <li>
                  <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Stripe (Pagos)
                  </a>
                </li>
                <li>
                  <a href="https://vimeo.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Vimeo (Videos)
                  </a>
                </li>
                <li>
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    YouTube (Videos)
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Contacto</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                Si tienes preguntas sobre nuestra política de cookies, puedes contactarnos:
              </p>
              <ul>
                <li>Email: <a href="mailto:contacto@viralacademy.com" className="text-primary hover:underline">contacto@viralacademy.com</a></li>
              </ul>
            </CardContent>
          </Card>

          {/* Back to home */}
          <div className="flex justify-center pt-4">
            <Button asChild>
              <Link href="/">
                Volver al inicio
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
