import { Resend } from "resend";

// Lazy initialization to avoid errors during build time
let resendInstance: Resend | null = null;

function getResend(): Resend {
  if (!resendInstance) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Viral Academy <noreply@viralacademy.com>";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    });

    if (error) {
      console.error("Email send error:", error);
      throw new Error(error.message);
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

// ============================================
// EMAIL TEMPLATES
// ============================================

export const emailTemplates = {
  // Welcome email after registration
  welcome: (name: string) => ({
    subject: "¡Bienvenido a Viral Academy!",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #7c3aed; margin: 0;">Viral Academy</h1>
  </div>

  <h2>¡Hola ${name}!</h2>

  <p>Nos emociona tenerte como parte de la familia Viral Academy. Has tomado una gran decisión al invertir en tu educación y crecimiento.</p>

  <p>Esto es lo que puedes hacer ahora:</p>

  <ul>
    <li><strong>Explora los cursos</strong> - Tenemos contenido de marketing, contenido viral, IA y mentalidad</li>
    <li><strong>Únete a los lives</strong> - Lunes con Susy (Mindset) y Miércoles con Leo (Marketing)</li>
    <li><strong>Conecta en la comunidad</strong> - Conoce a otros emprendedores como tú</li>
  </ul>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://viral-academy.vercel.app"}/app/dashboard" style="display: inline-block; background-color: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
      Ir a mi Dashboard
    </a>
  </div>

  <p>¿Tienes preguntas? Responde a este email y te ayudaremos.</p>

  <p>¡A romperla!</p>
  <p><strong>El equipo de Viral Academy</strong></p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
  <p style="font-size: 12px; color: #888; text-align: center;">
    © ${new Date().getFullYear()} Viral Academy. Todos los derechos reservados.
  </p>
</body>
</html>
    `,
    text: `¡Hola ${name}!\n\nNos emociona tenerte como parte de la familia Viral Academy.\n\nExplora los cursos, únete a los lives y conecta en la comunidad.\n\n¡A romperla!\nEl equipo de Viral Academy`,
  }),

  // Subscription activated
  subscriptionActivated: (name: string) => ({
    subject: "¡Tu membresía está activa!",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #7c3aed; margin: 0;">Viral Academy</h1>
  </div>

  <h2>¡Felicidades ${name}!</h2>

  <p>Tu membresía <strong>Viral Master Pack</strong> ha sido activada exitosamente.</p>

  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p style="margin: 0;"><strong>Ahora tienes acceso a:</strong></p>
    <ul style="margin: 10px 0 0 0; padding-left: 20px;">
      <li>Todos los cursos premium</li>
      <li>Lives semanales exclusivos</li>
      <li>Comunidad de emprendedores</li>
      <li>Recursos y plantillas</li>
      <li>Certificados de finalización</li>
    </ul>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://viral-academy.vercel.app"}/app/cursos" style="display: inline-block; background-color: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
      Comenzar a Aprender
    </a>
  </div>

  <p>Gracias por confiar en nosotros. Estamos comprometidos con tu éxito.</p>

  <p><strong>El equipo de Viral Academy</strong></p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
  <p style="font-size: 12px; color: #888; text-align: center;">
    © ${new Date().getFullYear()} Viral Academy. Todos los derechos reservados.
  </p>
</body>
</html>
    `,
    text: `¡Felicidades ${name}!\n\nTu membresía Viral Master Pack ha sido activada exitosamente.\n\nAhora tienes acceso a todos los cursos premium, lives semanales, comunidad y más.\n\n¡Gracias por confiar en nosotros!\nEl equipo de Viral Academy`,
  }),

  // Payment failed
  paymentFailed: (name: string) => ({
    subject: "Problema con tu pago - Acción requerida",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #7c3aed; margin: 0;">Viral Academy</h1>
  </div>

  <h2>Hola ${name},</h2>

  <p>Intentamos procesar tu pago de membresía pero no pudimos completarlo.</p>

  <p>Para mantener tu acceso a Viral Academy, por favor actualiza tu método de pago lo antes posible.</p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://viral-academy.vercel.app"}/app/membresia" style="display: inline-block; background-color: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
      Actualizar Método de Pago
    </a>
  </div>

  <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>

  <p><strong>El equipo de Viral Academy</strong></p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
  <p style="font-size: 12px; color: #888; text-align: center;">
    © ${new Date().getFullYear()} Viral Academy. Todos los derechos reservados.
  </p>
</body>
</html>
    `,
    text: `Hola ${name},\n\nIntentamos procesar tu pago de membresía pero no pudimos completarlo.\n\nPor favor actualiza tu método de pago en: ${process.env.NEXT_PUBLIC_APP_URL || "https://viral-academy.vercel.app"}/app/membresia\n\nEl equipo de Viral Academy`,
  }),

  // Live reminder
  liveReminder: (name: string, liveTitle: string, liveDate: string, meetingUrl: string) => ({
    subject: `Recordatorio: ${liveTitle} - Mañana`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #7c3aed; margin: 0;">Viral Academy</h1>
  </div>

  <h2>¡Hola ${name}!</h2>

  <p>Te recordamos que mañana tenemos un live que no te puedes perder:</p>

  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin: 0 0 10px 0; color: #7c3aed;">${liveTitle}</h3>
    <p style="margin: 0;">📅 <strong>${liveDate}</strong></p>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${meetingUrl}" style="display: inline-block; background-color: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
      Agregar a Calendario
    </a>
  </div>

  <p>¡Te esperamos!</p>
  <p><strong>El equipo de Viral Academy</strong></p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
  <p style="font-size: 12px; color: #888; text-align: center;">
    © ${new Date().getFullYear()} Viral Academy. Todos los derechos reservados.
  </p>
</body>
</html>
    `,
    text: `¡Hola ${name}!\n\nTe recordamos que mañana tenemos:\n\n${liveTitle}\n📅 ${liveDate}\n\n¡Te esperamos!\nEl equipo de Viral Academy`,
  }),

  // Course completion certificate
  courseCompleted: (name: string, courseName: string, certificateUrl: string) => ({
    subject: `¡Felicidades! Completaste ${courseName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #7c3aed; margin: 0;">Viral Academy</h1>
  </div>

  <div style="text-align: center; margin-bottom: 30px;">
    <span style="font-size: 60px;">🎉</span>
  </div>

  <h2 style="text-align: center;">¡Felicidades ${name}!</h2>

  <p style="text-align: center; font-size: 18px;">Has completado exitosamente el curso:</p>

  <h3 style="text-align: center; color: #7c3aed; font-size: 24px;">${courseName}</h3>

  <p style="text-align: center;">Tu certificado está listo para descargar.</p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${certificateUrl}" style="display: inline-block; background-color: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
      Ver mi Certificado
    </a>
  </div>

  <p>¡Sigue aprendiendo y creciendo!</p>
  <p><strong>El equipo de Viral Academy</strong></p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
  <p style="font-size: 12px; color: #888; text-align: center;">
    © ${new Date().getFullYear()} Viral Academy. Todos los derechos reservados.
  </p>
</body>
</html>
    `,
    text: `¡Felicidades ${name}!\n\nHas completado exitosamente el curso: ${courseName}\n\nDescarga tu certificado en: ${certificateUrl}\n\n¡Sigue aprendiendo!\nEl equipo de Viral Academy`,
  }),
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export async function sendWelcomeEmail(email: string, name: string) {
  const template = emailTemplates.welcome(name);
  return sendEmail({
    to: email,
    ...template,
  });
}

export async function sendSubscriptionActivatedEmail(email: string, name: string) {
  const template = emailTemplates.subscriptionActivated(name);
  return sendEmail({
    to: email,
    ...template,
  });
}

export async function sendPaymentFailedEmail(email: string, name: string) {
  const template = emailTemplates.paymentFailed(name);
  return sendEmail({
    to: email,
    ...template,
  });
}

export async function sendLiveReminderEmail(
  email: string,
  name: string,
  liveTitle: string,
  liveDate: string,
  meetingUrl: string
) {
  const template = emailTemplates.liveReminder(name, liveTitle, liveDate, meetingUrl);
  return sendEmail({
    to: email,
    ...template,
  });
}

export async function sendCourseCompletedEmail(
  email: string,
  name: string,
  courseName: string,
  certificateUrl: string
) {
  const template = emailTemplates.courseCompleted(name, courseName, certificateUrl);
  return sendEmail({
    to: email,
    ...template,
  });
}

// Password Reset Email
interface PasswordResetEmailParams {
  to: string;
  resetUrl: string;
  userName: string;
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
  userName,
}: PasswordResetEmailParams) {
  return sendEmail({
    to,
    subject: "Recupera tu contraseña - Viral Academy",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperar contraseña</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #171717; border-radius: 12px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px; text-align: center;">
              <h1 style="color: #d4ff00; margin: 0; font-size: 24px;">Viral Academy</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 0 32px 32px;">
              <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #ffffff; text-align: center;">
                Recupera tu contraseña
              </h2>

              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #a1a1aa; text-align: center;">
                Hola ${userName},
              </p>

              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #a1a1aa; text-align: center;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta en Viral Academy. Haz clic en el botón de abajo para crear una nueva contraseña.
              </p>

              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 8px 0 24px;">
                    <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background-color: #d4ff00; color: #0a0a0a; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                      Restablecer contraseña
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #71717a; text-align: center;">
                Este enlace expirará en 1 hora.
              </p>

              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #71717a; text-align: center;">
                Si no solicitaste restablecer tu contraseña, puedes ignorar este correo de forma segura.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 32px;">
              <div style="height: 1px; background-color: #27272a;"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #52525b; text-align: center;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:
              </p>
              <p style="margin: 0; font-size: 12px; color: #3b82f6; text-align: center; word-break: break-all;">
                ${resetUrl}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 32px 32px;">
              <p style="margin: 0; font-size: 12px; color: #52525b; text-align: center;">
                © ${new Date().getFullYear()} Viral Academy. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `
Hola ${userName},

Recibimos una solicitud para restablecer la contraseña de tu cuenta en Viral Academy.

Haz clic en el siguiente enlace para crear una nueva contraseña:
${resetUrl}

Este enlace expirará en 1 hora.

Si no solicitaste restablecer tu contraseña, puedes ignorar este correo de forma segura.

© ${new Date().getFullYear()} Viral Academy. Todos los derechos reservados.
    `,
  });
}
