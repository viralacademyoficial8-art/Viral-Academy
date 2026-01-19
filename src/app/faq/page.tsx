"use client";

import { PublicLayout } from "@/components/layouts/public-layout";
import { siteConfig } from "@/config/site";
import { HelpCircle, ChevronDown, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

const faqCategories = [
  {
    title: "Membresía",
    questions: [
      {
        question: "¿Qué incluye la membresía de Viral Academy?",
        answer: `Tu membresía incluye acceso ilimitado a todos los cursos de la plataforma, lives semanales con los mentores, acceso a la comunidad privada, recursos descargables (plantillas, guías, herramientas) y certificados verificables al completar cada curso. Todo por $${siteConfig.pricing.monthly.price} ${siteConfig.pricing.monthly.currency}/mes.`,
      },
      {
        question: "¿Puedo cancelar mi membresía en cualquier momento?",
        answer: "Sí, puedes cancelar tu membresía cuando quieras directamente desde tu panel de usuario. No hay contratos ni penalizaciones. Mantendrás acceso hasta el final de tu período de facturación actual.",
      },
      {
        question: "¿Qué métodos de pago aceptan?",
        answer: "Aceptamos todas las tarjetas de crédito y débito principales (Visa, Mastercard, American Express) a través de Stripe, la plataforma de pagos más segura del mundo.",
      },
      {
        question: "¿Hay algún costo adicional o venta de cursos aparte?",
        answer: "No. Tu membresía incluye absolutamente todo. No hay costos ocultos, upsells ni ventas adicionales dentro de la plataforma.",
      },
      {
        question: "¿Ofrecen reembolsos?",
        answer: "Si no estás satisfecho con la membresía, puedes cancelarla en cualquier momento y no se te volverá a cobrar. No ofrecemos reembolsos por períodos ya pagados, pero puedes seguir usando la plataforma hasta que termine tu ciclo de facturación.",
      },
    ],
  },
  {
    title: "Cursos y Contenido",
    questions: [
      {
        question: "¿Cuántos cursos hay disponibles?",
        answer: "Tenemos una biblioteca creciente de cursos que cubren marketing digital, creación de contenido, inteligencia artificial, automatización, marca personal, e-commerce, mentalidad y negocios. Agregamos nuevo contenido regularmente.",
      },
      {
        question: "¿Puedo ver los cursos a mi propio ritmo?",
        answer: "Absolutamente. Todos los cursos y replays están disponibles 24/7 para que aprendas cuando y donde quieras. No hay fechas límite ni presión para completarlos.",
      },
      {
        question: "¿Los cursos tienen certificado?",
        answer: "Sí. Al completar cada curso y aprobar la evaluación correspondiente, recibirás un certificado verificable que puedes compartir en LinkedIn o incluir en tu portafolio.",
      },
      {
        question: "¿Qué pasa si tengo dudas sobre el contenido?",
        answer: "Puedes hacer preguntas en la comunidad privada o durante los lives semanales. Los mentores y otros alumnos están siempre dispuestos a ayudar.",
      },
    ],
  },
  {
    title: "Lives y Eventos",
    questions: [
      {
        question: "¿Cuándo son los lives semanales?",
        answer: `Tenemos lives programados cada semana: ${siteConfig.mentors.map(m => `${m.liveDay} (${m.liveType})`).join(" y ")}. Recibirás notificaciones antes de cada sesión.`,
      },
      {
        question: "¿Qué pasa si no puedo asistir a un live?",
        answer: "No te preocupes. Todas las sesiones quedan grabadas y disponibles como replays para que las veas cuando quieras.",
      },
      {
        question: "¿Puedo hacer preguntas durante los lives?",
        answer: "Sí, los lives son interactivos. Puedes hacer preguntas en el chat y los mentores las responden en vivo cuando es posible.",
      },
    ],
  },
  {
    title: "Comunidad",
    questions: [
      {
        question: "¿Cómo funciona la comunidad privada?",
        answer: "La comunidad es un espacio exclusivo para miembros donde puedes hacer networking, compartir tus avances, hacer preguntas, y recibir feedback de otros emprendedores y creadores.",
      },
      {
        question: "¿Quién modera la comunidad?",
        answer: "El equipo de Viral Academy modera la comunidad para mantener un ambiente positivo, respetuoso y enfocado en el crecimiento de todos los miembros.",
      },
    ],
  },
  {
    title: "Técnico",
    questions: [
      {
        question: "¿Desde qué dispositivos puedo acceder?",
        answer: "Puedes acceder a Viral Academy desde cualquier dispositivo con conexión a internet: computadora, tablet o celular. La plataforma está optimizada para todos los tamaños de pantalla.",
      },
      {
        question: "¿Necesito descargar alguna aplicación?",
        answer: "No. Todo funciona directamente desde tu navegador web. No necesitas descargar ninguna aplicación adicional.",
      },
      {
        question: "¿Qué hago si tengo problemas técnicos?",
        answer: "Puedes contactarnos por WhatsApp o a través del soporte en la plataforma. Respondemos lo más rápido posible para resolver cualquier inconveniente.",
      },
    ],
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-center justify-between text-left hover:text-primary transition-colors"
      >
        <span className="font-medium pr-4">{question}</span>
        <ChevronDown
          className={cn(
            "w-5 h-5 flex-shrink-0 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          isOpen ? "max-h-96 pb-5" : "max-h-0"
        )}
      >
        <p className="text-muted-foreground leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

export default function FAQPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <HelpCircle className="w-4 h-4" />
              Preguntas Frecuentes
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              ¿Tienes{" "}
              <span className="text-primary">preguntas</span>?
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Encuentra respuestas a las preguntas más comunes sobre Viral Academy.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="py-16 md:py-24 bg-surface-1/50 border-y border-border">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto space-y-12">
            {faqCategories.map((category) => (
              <div key={category.title}>
                <h2 className="text-2xl font-bold mb-6">{category.title}</h2>
                <div className="bg-background rounded-xl border border-border divide-y divide-border">
                  <div className="px-6">
                    {category.questions.map((faq) => (
                      <FAQItem key={faq.question} {...faq} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 md:py-24">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿No encontraste tu respuesta?
            </h2>
            <p className="text-muted-foreground mb-8">
              Contáctanos directamente por WhatsApp y te ayudaremos con cualquier duda.
            </p>
            <Button size="lg" asChild>
              <Link href={siteConfig.links.whatsapp} target="_blank" rel="noopener noreferrer">
                Contactar por WhatsApp
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
