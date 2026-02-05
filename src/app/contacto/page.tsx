import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageCircle, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Ponte en contacto con el equipo de Viral Academy. Estamos aquí para ayudarte.",
};

export default function ContactoPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="section-padding bg-gradient-to-b from-primary/5 to-background">
        <div className="container-wide text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Contáctanos
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            ¿Tienes alguna pregunta o necesitas ayuda? Estamos aquí para ti.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">Información de contacto</h2>
                <p className="text-muted-foreground">
                  Puedes comunicarte con nosotros a través de cualquiera de estos canales.
                  Respondemos lo más pronto posible.
                </p>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <MessageCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">WhatsApp</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        La forma más rápida de contactarnos
                      </p>
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={siteConfig.links.whatsapp}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Enviar mensaje
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Email</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Para consultas detalladas
                      </p>
                      <a
                        href="mailto:contacto@viralacademy.com"
                        className="text-sm text-primary hover:underline"
                      >
                        contacto@viralacademy.com
                      </a>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Horario de atención</h3>
                      <p className="text-sm text-muted-foreground">
                        Lunes a Viernes: 9:00 AM - 6:00 PM (CST)
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Sábados: 10:00 AM - 2:00 PM (CST)
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Ubicación</h3>
                      <p className="text-sm text-muted-foreground">
                        Veracruz, México
                      </p>
                      <p className="text-sm text-muted-foreground">
                        (Operamos 100% en línea)
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Envíanos un mensaje</CardTitle>
                  <CardDescription>
                    Completa el formulario y te responderemos a la brevedad.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre</Label>
                        <Input id="nombre" placeholder="Tu nombre" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="tu@email.com" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="asunto">Asunto</Label>
                      <Input id="asunto" placeholder="¿En qué podemos ayudarte?" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mensaje">Mensaje</Label>
                      <Textarea
                        id="mensaje"
                        placeholder="Escribe tu mensaje aquí..."
                        rows={5}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Enviar mensaje
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <p className="text-sm text-muted-foreground text-center mt-4">
                Al enviar este formulario, aceptas nuestra{" "}
                <Link href="/legal/privacidad" className="text-primary hover:underline">
                  Política de Privacidad
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
