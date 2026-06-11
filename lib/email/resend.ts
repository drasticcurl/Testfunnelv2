/**
 * Cliente Resend para emails transaccionales del funnel.
 *
 * Emails que se envían:
 *   1. Post-quiz: "Tu diagnóstico está listo" (email de bienvenida)
 *   2. (Futuro) Follow-up sequence días 1-7
 *
 * Config:
 *   - RESEND_API_KEY: API key de Resend
 *   - RESEND_FROM_EMAIL: email from (ej: "Protocolo Anti-Hinchazón <hola@anti-hinchazon.com>")
 *
 * Si falta config, no envía (modo degradado, no rompe el funnel).
 */

import { Resend } from 'resend';

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  if (resendClient) return resendClient;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    // eslint-disable-next-line no-console
    console.warn('[resend] RESEND_API_KEY no configurada. Emails deshabilitados.');
    return null;
  }
  resendClient = new Resend(key);
  return resendClient;
}

const DEFAULT_FROM = 'Método del Agua de Arroz <hola@aguadearroz.com>';

interface SendDiagnosticoParams {
  to: string;
  nombre?: string;
  tipoNombre: string;
  severidad: number;
}

/**
 * Envía el email post-quiz "Tu diagnóstico está listo".
 * Retorna true si se envió, false si no (por falta de config o error).
 */
export async function sendDiagnosticoEmail({
  to,
  nombre,
  tipoNombre,
  severidad,
}: SendDiagnosticoParams): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const from = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM;
  const saludo = nombre ? `${nombre}, ` : '';

  try {
    await resend.emails.send({
      from,
      to,
      subject: `${saludo}tu diagnóstico: ${tipoNombre}`,
      html: buildDiagnosticoHtml({ nombre, tipoNombre, severidad }),
    });
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[resend] Error enviando email:', err);
    return false;
  }
}

/**
 * HTML inline del email de diagnóstico.
 * Simple, mobile-first, sin imágenes pesadas.
 */
function buildDiagnosticoHtml({
  nombre,
  tipoNombre,
  severidad,
}: {
  nombre?: string;
  tipoNombre: string;
  severidad: number;
}): string {
  const saludo = nombre ? `Hola ${nombre}` : 'Hola';

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FAF8F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF8F5;padding:40px 20px;">
<tr><td align="center">
<table width="100%" style="max-width:520px;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #EFECE7;">
  <tr><td style="background:#7A9B7E;padding:24px 32px;text-align:center;">
    <h1 style="margin:0;color:#fff;font-size:22px;font-weight:600;">${saludo}, tu diagnóstico está listo</h1>
  </td></tr>
  <tr><td style="padding:32px;">
    <p style="margin:0 0 16px;font-size:16px;color:#2D3A2E;line-height:1.6;">
      Según tus respuestas, tu tipo de hinchazón es:
    </p>
    <div style="background:#FAF8F5;border-left:4px solid #E07856;padding:16px 20px;border-radius:6px;margin-bottom:20px;">
      <p style="margin:0;font-size:20px;font-weight:600;color:#E07856;">${tipoNombre}</p>
      <p style="margin:6px 0 0;font-size:14px;color:#5C5852;">Severidad: ${severidad}/10</p>
    </div>
    <p style="margin:0 0 16px;font-size:15px;color:#5C5852;line-height:1.6;">
      Ya tenés tu plan personalizado esperándote. Accedé ahora para empezar tu protocolo de 7 días:
    </p>
    <p style="text-align:center;margin:24px 0;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://anti-hinchazon.com'}/quiz" style="display:inline-block;background:#E07856;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:600;">
        VER MI PLAN PERSONALIZADO →
      </a>
    </p>
    <p style="margin:24px 0 0;font-size:13px;color:#9B9890;line-height:1.5;">
      Si no completaste tu compra, tu diagnóstico queda guardado por 72 horas. Después se elimina automáticamente.
    </p>
  </td></tr>
  <tr><td style="background:#FAF8F5;padding:16px 32px;text-align:center;">
    <p style="margin:0;font-size:11px;color:#9B9890;">
      © ${new Date().getFullYear()} hilvanapp.com · 
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://anti-hinchazon.com'}/legal/privacidad" style="color:#9B9890;">Privacidad</a>
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}



// ─── Email post-compra: Bienvenida + acceso a la app ────────────────────────

interface SendBienvenidaParams {
  to: string;
  nombre?: string;
  plan: string; // '1sem', '4sem', '8sem'
}

/**
 * Envía el email post-compra "¡Bienvenida! Tu acceso está listo".
 * Se dispara desde el webhook de Hotmart cuando se confirma el pago.
 */
export async function sendBienvenidaEmail({
  to,
  nombre,
  plan,
}: SendBienvenidaParams): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const from = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM;
  const saludo = nombre ? `${nombre}, ` : '';
  const planLabel = plan === '8sem' ? '8 semanas' : plan === '4sem' ? '4 semanas' : '7 días';

  try {
    await resend.emails.send({
      from,
      to,
      subject: `${saludo}¡tu acceso a Chau Hinchazón está listo! 🎉`,
      html: buildBienvenidaHtml({ nombre, planLabel }),
    });
    return true;
  } catch (err) {
    console.error('[resend] Error enviando email bienvenida:', err);
    return false;
  }
}

function buildBienvenidaHtml({
  nombre,
  planLabel,
}: {
  nombre?: string;
  planLabel: string;
}): string {
  const saludo = nombre ? `¡Hola ${nombre}!` : '¡Hola!';
  const appUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://anti-hinchazon.com'}/pwa/login`;

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FAF8F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF8F5;padding:40px 20px;">
<tr><td align="center">
<table width="100%" style="max-width:520px;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #EFECE7;">
  <tr><td style="background:#5B8A60;padding:24px 32px;text-align:center;">
    <h1 style="margin:0;color:#fff;font-size:22px;font-weight:600;">${saludo} Tu plan está activo 🎉</h1>
  </td></tr>
  <tr><td style="padding:32px;">
    <p style="margin:0 0 16px;font-size:16px;color:#2D3A2E;line-height:1.6;">
      ¡Felicitaciones! Tu plan de <strong>${planLabel}</strong> ya está activo y listo para usar.
    </p>
    <div style="background:#E8EFE9;border-radius:8px;padding:20px;margin-bottom:20px;">
      <p style="margin:0 0 8px;font-size:14px;color:#5C5852;font-weight:600;">¿Cómo accedo?</p>
      <p style="margin:0;font-size:14px;color:#5C5852;line-height:1.6;">
        Tocá el botón de abajo y entrá con el email con el que compraste. No necesitás descargar nada — funciona directo desde el celular.
      </p>
    </div>
    <p style="text-align:center;margin:24px 0;">
      <a href="${appUrl}" style="display:inline-block;background:#5B8A60;color:#fff;padding:16px 36px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:600;">
        ENTRAR A MI PLAN →
      </a>
    </p>
    <div style="background:#FAF8F5;border-radius:8px;padding:16px;margin-top:20px;">
      <p style="margin:0 0 8px;font-size:13px;color:#5C5852;font-weight:600;">Tu primer día incluye:</p>
      <p style="margin:0;font-size:13px;color:#5C5852;line-height:1.8;">
        ✅ Protocolo del Día 1 paso a paso<br>
        ✅ Lista de alimentos inflamatorios a evitar<br>
        ✅ Receta antiinflamatoria del día<br>
        ✅ Ritual matutino de 5 minutos
      </p>
    </div>
    <p style="margin:24px 0 0;font-size:13px;color:#9B9890;line-height:1.5;">
      Si tenés alguna duda, respondé este email y te ayudamos. 💚
    </p>
  </td></tr>
  <tr><td style="background:#FAF8F5;padding:16px 32px;text-align:center;">
    <p style="margin:0;font-size:11px;color:#9B9890;">
      © ${new Date().getFullYear()} Chau Hinchazón · 
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://anti-hinchazon.com'}/legal/privacidad" style="color:#9B9890;">Privacidad</a>
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}
