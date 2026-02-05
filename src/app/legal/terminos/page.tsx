import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description: "Términos y condiciones de uso de Viral Academy.",
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="section-padding bg-gradient-to-b from-primary/5 to-background">
        <div className="container-wide text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Términos y Condiciones
          </h1>
          <p className="text-muted-foreground">
            Última actualización: Enero 2024
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding">
        <div className="container-narrow prose prose-neutral dark:prose-invert max-w-none">
          <h2>1. Aceptación de los Términos</h2>
          <p>
            Al acceder y utilizar la plataforma Viral Academy, aceptas estar sujeto a estos
            Términos y Condiciones. Si no estás de acuerdo con alguna parte de estos términos,
            no debes utilizar nuestros servicios.
          </p>

          <h2>2. Descripción del Servicio</h2>
          <p>
            Viral Academy es una plataforma de educación digital que ofrece cursos, recursos
            y contenido relacionado con marketing digital, inteligencia artificial, mentalidad
            y negocios digitales. Los servicios incluyen:
          </p>
          <ul>
            <li>Acceso a cursos en video</li>
            <li>Clases en vivo semanales</li>
            <li>Recursos descargables</li>
            <li>Comunidad privada</li>
            <li>Certificados de finalización</li>
          </ul>

          <h2>3. Registro y Cuenta</h2>
          <p>
            Para acceder a ciertos servicios, debes crear una cuenta proporcionando información
            precisa y actualizada. Eres responsable de mantener la confidencialidad de tu
            cuenta y contraseña.
          </p>

          <h2>4. Membresía y Pagos</h2>
          <h3>4.1 Planes de Membresía</h3>
          <p>
            Ofrecemos diferentes planes de membresía con distintos niveles de acceso. Los
            precios y características de cada plan están disponibles en nuestra página de
            membresía.
          </p>

          <h3>4.2 Facturación</h3>
          <p>
            Los pagos se procesan de forma recurrente según el plan seleccionado (mensual o
            anual). El cargo se realizará automáticamente a menos que canceles antes de la
            fecha de renovación.
          </p>

          <h3>4.3 Política de Reembolso</h3>
          <p>
            Ofrecemos un período de garantía de 7 días desde la primera compra. Si no estás
            satisfecho con el servicio, puedes solicitar un reembolso completo dentro de este
            período. Después de los 7 días, no se realizarán reembolsos.
          </p>

          <h2>5. Uso del Contenido</h2>
          <h3>5.1 Licencia de Uso</h3>
          <p>
            Al suscribirte, te otorgamos una licencia limitada, no exclusiva y no transferible
            para acceder y utilizar el contenido de la plataforma para uso personal y no
            comercial.
          </p>

          <h3>5.2 Restricciones</h3>
          <p>No está permitido:</p>
          <ul>
            <li>Copiar, distribuir o compartir el contenido con terceros</li>
            <li>Grabar, descargar o reproducir las clases en vivo sin autorización</li>
            <li>Utilizar el contenido con fines comerciales sin permiso</li>
            <li>Compartir credenciales de acceso con otras personas</li>
            <li>Realizar ingeniería inversa o intentar extraer el código fuente</li>
          </ul>

          <h2>6. Propiedad Intelectual</h2>
          <p>
            Todo el contenido de Viral Academy, incluyendo pero no limitado a videos, textos,
            gráficos, logos, imágenes y software, es propiedad de Viral Academy o sus
            licenciantes y está protegido por las leyes de propiedad intelectual.
          </p>

          <h2>7. Conducta del Usuario</h2>
          <p>Al usar la plataforma, te comprometes a:</p>
          <ul>
            <li>No publicar contenido ofensivo, ilegal o inapropiado</li>
            <li>Respetar a otros miembros de la comunidad</li>
            <li>No realizar spam o promociones no autorizadas</li>
            <li>No intentar acceder a áreas restringidas de la plataforma</li>
          </ul>

          <h2>8. Cancelación</h2>
          <h3>8.1 Cancelación por el Usuario</h3>
          <p>
            Puedes cancelar tu membresía en cualquier momento desde tu perfil. La cancelación
            será efectiva al final del período de facturación actual.
          </p>

          <h3>8.2 Cancelación por Viral Academy</h3>
          <p>
            Nos reservamos el derecho de suspender o cancelar tu cuenta si violas estos
            términos o si detectamos actividad fraudulenta.
          </p>

          <h2>9. Limitación de Responsabilidad</h2>
          <p>
            Viral Academy proporciona el servicio &quot;tal cual&quot; y no garantiza resultados
            específicos. No somos responsables de daños indirectos, incidentales o consecuentes
            derivados del uso de la plataforma.
          </p>

          <h2>10. Modificaciones</h2>
          <p>
            Nos reservamos el derecho de modificar estos términos en cualquier momento. Los
            cambios serán notificados a través de la plataforma o por correo electrónico.
            El uso continuado después de los cambios constituye aceptación de los nuevos términos.
          </p>

          <h2>11. Ley Aplicable</h2>
          <p>
            Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier
            disputa será resuelta en los tribunales competentes de Veracruz, México.
          </p>

          <h2>12. Contacto</h2>
          <p>
            Para cualquier pregunta sobre estos términos, puedes contactarnos en:{" "}
            <a href="mailto:legal@viralacademy.com" className="text-primary hover:underline">
              legal@viralacademy.com
            </a>
          </p>

          <div className="mt-8 pt-8 border-t">
            <p className="text-sm text-muted-foreground">
              Al utilizar Viral Academy, confirmas que has leído, entendido y aceptado estos
              Términos y Condiciones. También te recomendamos leer nuestra{" "}
              <Link href="/legal/privacidad" className="text-primary hover:underline">
                Política de Privacidad
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
