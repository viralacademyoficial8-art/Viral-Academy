import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: "Política de privacidad de Viral Academy. Conoce cómo protegemos tus datos personales.",
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="section-padding bg-gradient-to-b from-primary/5 to-background">
        <div className="container-wide text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Política de Privacidad
          </h1>
          <p className="text-muted-foreground">
            Última actualización: Enero 2024
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding">
        <div className="container-narrow prose prose-neutral dark:prose-invert max-w-none">
          <h2>1. Introducción</h2>
          <p>
            En Viral Academy nos comprometemos a proteger tu privacidad. Esta política
            describe cómo recopilamos, usamos, almacenamos y protegemos tu información
            personal cuando utilizas nuestra plataforma.
          </p>

          <h2>2. Información que Recopilamos</h2>
          <h3>2.1 Información que nos proporcionas</h3>
          <ul>
            <li>
              <strong>Datos de registro:</strong> nombre, correo electrónico, contraseña
            </li>
            <li>
              <strong>Datos de perfil:</strong> foto, biografía, preferencias
            </li>
            <li>
              <strong>Datos de pago:</strong> información de tarjeta (procesada por terceros seguros)
            </li>
            <li>
              <strong>Comunicaciones:</strong> mensajes que nos envías o publicas en la comunidad
            </li>
          </ul>

          <h3>2.2 Información recopilada automáticamente</h3>
          <ul>
            <li>
              <strong>Datos de uso:</strong> cursos vistos, progreso, tiempo en la plataforma
            </li>
            <li>
              <strong>Datos técnicos:</strong> dirección IP, tipo de navegador, dispositivo
            </li>
            <li>
              <strong>Cookies:</strong> para mejorar tu experiencia (ver{" "}
              <Link href="/cookies" className="text-primary hover:underline">
                Política de Cookies
              </Link>)
            </li>
          </ul>

          <h2>3. Cómo Usamos tu Información</h2>
          <p>Utilizamos tu información para:</p>
          <ul>
            <li>Proporcionar y mejorar nuestros servicios</li>
            <li>Procesar pagos y gestionar tu membresía</li>
            <li>Personalizar tu experiencia de aprendizaje</li>
            <li>Enviarte comunicaciones importantes sobre tu cuenta</li>
            <li>Enviarte información sobre nuevos cursos y promociones (con tu consentimiento)</li>
            <li>Analizar el uso de la plataforma para mejorarla</li>
            <li>Prevenir fraudes y garantizar la seguridad</li>
          </ul>

          <h2>4. Base Legal para el Procesamiento</h2>
          <p>Procesamos tu información basándonos en:</p>
          <ul>
            <li>
              <strong>Contrato:</strong> para proporcionar los servicios que solicitaste
            </li>
            <li>
              <strong>Consentimiento:</strong> para comunicaciones de marketing
            </li>
            <li>
              <strong>Interés legítimo:</strong> para mejorar nuestros servicios y prevenir fraudes
            </li>
            <li>
              <strong>Obligación legal:</strong> para cumplir con requisitos fiscales y legales
            </li>
          </ul>

          <h2>5. Compartir Información</h2>
          <p>
            No vendemos tu información personal. Podemos compartirla únicamente con:
          </p>
          <ul>
            <li>
              <strong>Procesadores de pago:</strong> Stripe para procesar pagos de forma segura
            </li>
            <li>
              <strong>Proveedores de servicios:</strong> hosting, email, analytics (bajo acuerdos de confidencialidad)
            </li>
            <li>
              <strong>Autoridades:</strong> cuando sea requerido por ley
            </li>
          </ul>

          <h2>6. Seguridad de los Datos</h2>
          <p>
            Implementamos medidas de seguridad técnicas y organizativas para proteger tu
            información, incluyendo:
          </p>
          <ul>
            <li>Encriptación de datos en tránsito (HTTPS/TLS)</li>
            <li>Encriptación de contraseñas</li>
            <li>Acceso restringido a datos personales</li>
            <li>Monitoreo de seguridad continuo</li>
          </ul>

          <h2>7. Retención de Datos</h2>
          <p>
            Conservamos tu información mientras mantengas una cuenta activa o según sea
            necesario para cumplir con obligaciones legales. Puedes solicitar la eliminación
            de tu cuenta en cualquier momento.
          </p>

          <h2>8. Tus Derechos</h2>
          <p>Tienes derecho a:</p>
          <ul>
            <li>
              <strong>Acceso:</strong> solicitar una copia de tus datos personales
            </li>
            <li>
              <strong>Rectificación:</strong> corregir datos inexactos o incompletos
            </li>
            <li>
              <strong>Eliminación:</strong> solicitar la eliminación de tus datos
            </li>
            <li>
              <strong>Portabilidad:</strong> recibir tus datos en formato estructurado
            </li>
            <li>
              <strong>Oposición:</strong> oponerte al procesamiento de tus datos
            </li>
            <li>
              <strong>Retiro del consentimiento:</strong> retirar tu consentimiento en cualquier momento
            </li>
          </ul>
          <p>
            Para ejercer estos derechos, contáctanos en{" "}
            <a href="mailto:privacidad@viralacademy.com" className="text-primary hover:underline">
              privacidad@viralacademy.com
            </a>
          </p>

          <h2>9. Menores de Edad</h2>
          <p>
            Nuestros servicios están dirigidos a personas mayores de 18 años. No recopilamos
            intencionalmente información de menores de edad. Si descubrimos que hemos
            recopilado datos de un menor, los eliminaremos inmediatamente.
          </p>

          <h2>10. Transferencias Internacionales</h2>
          <p>
            Tu información puede ser transferida y almacenada en servidores ubicados fuera
            de México. Nos aseguramos de que estas transferencias cumplan con las leyes
            aplicables de protección de datos.
          </p>

          <h2>11. Cambios a esta Política</h2>
          <p>
            Podemos actualizar esta política periódicamente. Te notificaremos sobre cambios
            significativos a través de la plataforma o por correo electrónico. Te recomendamos
            revisar esta política regularmente.
          </p>

          <h2>12. Contacto</h2>
          <p>
            Si tienes preguntas sobre esta política o sobre cómo manejamos tus datos,
            contáctanos en:
          </p>
          <ul>
            <li>
              Email:{" "}
              <a href="mailto:privacidad@viralacademy.com" className="text-primary hover:underline">
                privacidad@viralacademy.com
              </a>
            </li>
            <li>
              WhatsApp:{" "}
              <a href="https://wa.me/+522281387768" className="text-primary hover:underline">
                +52 228 138 7768
              </a>
            </li>
          </ul>

          <div className="mt-8 pt-8 border-t">
            <p className="text-sm text-muted-foreground">
              Esta política de privacidad cumple con la Ley Federal de Protección de Datos
              Personales en Posesión de los Particulares (LFPDPPP) de México. También te
              recomendamos leer nuestros{" "}
              <Link href="/legal/terminos" className="text-primary hover:underline">
                Términos y Condiciones
              </Link>{" "}
              y{" "}
              <Link href="/cookies" className="text-primary hover:underline">
                Política de Cookies
              </Link>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
