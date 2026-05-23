/**
 * Email 2 — Follow-up 24h post-quiz.
 *
 * Se envía a personas que completaron el quiz pero NO compraron.
 * Estrategia: story-based + 10% off con cupón VOLVISTE10.
 *
 * Este email NO se envía automáticamente todavía (necesita cron).
 * Por ahora se testea vía /api/test-email con type="followup".
 */

import { Resend } from 'resend';

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  if (resendClient) return resendClient;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  resendClient = new Resend(key);
  return resendClient;
}

const DEFAULT_FROM = 'Protocolo Anti-Hinchazón <hola@anti-hinchazon.com>';

interface SendFollowupParams {
  to: string;
  nombre?: string;
  tipoNombre: string;
}

/**
 * Envía el email de follow-up (24h) con story + 10% off.
 */
export async function sendFollowupEmail({
  to,
  nombre,
  tipoNombre,
}: SendFollowupParams): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const from = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM;
  const saludo = nombre || 'Hola';

  try {
    await resend.emails.send({
      from,
      to,
      subject: `${saludo}, lo que le pasó a Carolina cuando dejó de hacer dieta`,
      html: buildFollowupHtml({ nombre, tipoNombre }),
    });
    return true;
  } catch (err) {
    console.error('[resend] Error enviando followup:', err);
    return false;
  }
}

function buildFollowupHtml({
  nombre,
  tipoNombre,
}: {
  nombre?: string;
  tipoNombre: string;
}): string {
  const saludo = nombre ? `Hola ${nombre}` : 'Hola';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://anti-hinchazon.com';
  const checkoutBase = process.env.NEXT_PUBLIC_HOTMART_CHECKOUT_URL || 'https://pay.hotmart.com/PLACEHOLDER';
  const checkoutWithCoupon = `${checkoutBase}${checkoutBase.includes('?') ? '&' : '?'}coupon=VOLVISTE10&utm_source=email&utm_medium=followup&utm_campaign=24h`;

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FAF8F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF8F5;padding:40px 20px;">
<tr><td align="center">
<table width="100%" style="max-width:520px;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #EFECE7;">
  <tr><td style="padding:32px;">

    <p style="margin:0 0 20px;font-size:16px;color:#2D3A2E;line-height:1.7;">
      ${saludo},
    </p>

    <p style="margin:0 0 16px;font-size:16px;color:#2D3A2E;line-height:1.7;">
      Ayer hiciste el test y te dio <strong style="color:#E07856;">${tipoNombre}</strong>. Quería contarte algo rápido.
    </p>

    <p style="margin:0 0 16px;font-size:16px;color:#2D3A2E;line-height:1.7;">
      Carolina (42 años, Buenos Aires) tenía exactamente tu mismo tipo. Probó keto, probó ayuno, se sacó el gluten. Nada. Seguía con la panza dura todas las tardes.
    </p>

    <p style="margin:0 0 16px;font-size:16px;color:#2D3A2E;line-height:1.7;">
      Cuando empezó el protocolo, al <strong>día 3</strong> ya notó la diferencia. No hizo nada extremo — solo cambió 3 alimentos y siguió el plan de la app.
    </p>

    <p style="margin:0 0 16px;font-size:16px;color:#5C5852;line-height:1.7;font-style:italic;">
      "Voy por el día 5 y ya se me nota la diferencia en la panza. No lo podía creer."
    </p>

    <div style="background:#FAF8F5;border-radius:8px;padding:20px;margin:24px 0;text-align:center;">
      <p style="margin:0 0 8px;font-size:14px;color:#5C5852;">
        Tu plan personalizado sigue disponible.
      </p>
      <p style="margin:0 0 4px;font-size:14px;color:#5C5852;">
        Y porque volviste, te dejo un <strong style="color:#E07856;">10% OFF</strong> que no está en la página:
      </p>
      <p style="margin:12px 0 0;">
        <span style="font-size:24px;font-weight:700;color:#E07856;">$8.991</span>
        <span style="font-size:14px;color:#9B9890;text-decoration:line-through;margin-left:8px;">$9.990</span>
      </p>
    </div>

    <p style="text-align:center;margin:24px 0;">
      <a href="${checkoutWithCoupon}" style="display:inline-block;background:#E07856;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:600;">
        EMPEZAR CON 10% OFF →
      </a>
    </p>

    <p style="margin:24px 0 0;font-size:13px;color:#9B9890;line-height:1.5;">
      El cupón es válido por 48 horas. Después vuelve al precio normal.
    </p>

    <p style="margin:16px 0 0;font-size:13px;color:#9B9890;line-height:1.5;">
      Si tenés alguna duda, respondé este email y te contesto personalmente.
    </p>

  </td></tr>
  <tr><td style="background:#FAF8F5;padding:16px 32px;text-align:center;">
    <p style="margin:0;font-size:11px;color:#9B9890;">
      © ${new Date().getFullYear()} hilvanapp.com · 
      <a href="${siteUrl}/legal/privacidad" style="color:#9B9890;">Privacidad</a> ·
      <a href="${siteUrl}/legal/terminos" style="color:#9B9890;">Términos</a>
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}
