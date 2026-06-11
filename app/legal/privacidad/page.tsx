import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidad — Chau Hinchazón',
  description: 'Política de privacidad del servicio Chau Hinchazón por hilvanapp.com',
};

export default function PrivacidadPage() {
  return (
    <article className="prose prose-sm max-w-none font-sans text-charcoal">
      <h1 className="font-serif text-2xl text-charcoal mb-2">Política de Privacidad</h1>
      <p className="text-xs text-[#9B9890] mb-8">Última actualización: mayo 2026</p>

      <p>
        En <strong>hilvanapp.com</strong> (&quot;nosotros&quot;) protegemos tus datos personales
        conforme a la Ley N° 25.326 de Protección de Datos Personales de la República Argentina.
      </p>

      <h2>1. Responsable</h2>
      <p>
        Responsable del tratamiento: <strong>hilvanapp.com</strong>.<br />
        Contacto: <a href="mailto:soporte@hilvanapp.com" className="text-sage hover:text-sage-dark">soporte@hilvanapp.com</a>
      </p>

      <h2>2. Datos que recopilamos</h2>
      <ul>
        <li>Email (al completar el quiz o realizar una compra).</li>
        <li>Respuestas del quiz (para generar tu resultado personalizado).</li>
        <li>Preferencias alimentarias que indicás dentro de la app.</li>
      </ul>
      <p>
        <strong>No almacenamos datos de tarjeta de crédito ni datos financieros.</strong> Los pagos
        son procesados por un tercero (Hotmart).
      </p>

      <h2>3. Finalidad</h2>
      <ul>
        <li>Darte acceso al producto digital que compraste.</li>
        <li>Personalizar tu experiencia (recetas, plan alimentario).</li>
        <li>Enviarte comunicaciones relacionadas con tu compra.</li>
        <li>Medir la efectividad de nuestros anuncios publicitarios.</li>
      </ul>

      <h2>4. Consentimiento</h2>
      <p>
        Al proporcionar tus datos, prestás tu consentimiento libre, expreso e informado
        para el tratamiento de los mismos con las finalidades descriptas. Podés revocar
        este consentimiento en cualquier momento contactándonos.
      </p>

      <h2>5. Cookies</h2>
      <p>Usamos cookies para:</p>
      <ul>
        <li>Mantener tu sesión activa (cookie esencial, 30 días).</li>
        <li>Medir el rendimiento de anuncios en redes sociales (cookies de marketing, hasta 90 días).</li>
      </ul>

      <h2>6. Compartición con terceros</h2>
      <p>
        Compartimos datos únicamente con proveedores necesarios para operar el servicio
        (procesador de pagos, plataforma de email marketing, servicios de publicidad).
        No vendemos ni cedemos tus datos a terceros con fines ajenos al servicio.
      </p>

      <h2>7. Tus derechos (Art. 14, Ley 25.326)</h2>
      <p>Podés ejercer en cualquier momento tu derecho de:</p>
      <ul>
        <li><strong>Acceso:</strong> conocer qué datos tenemos sobre vos.</li>
        <li><strong>Rectificación:</strong> corregir datos inexactos.</li>
        <li><strong>Supresión:</strong> solicitar la eliminación de tus datos.</li>
        <li><strong>Confidencialidad:</strong> exigir que no se divulguen.</li>
      </ul>
      <p>
        Para ejercerlos, escribí a{' '}
        <a href="mailto:soporte@hilvanapp.com" className="text-sage hover:text-sage-dark">soporte@hilvanapp.com</a>.
        Respondemos en un máximo de 10 días hábiles.
      </p>
      <p className="text-sm text-[#9B9890]">
        La AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA, en su carácter de Órgano de Control
        de la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que
        interpongan quienes resulten afectados en sus derechos por incumplimiento de las
        normas vigentes en materia de protección de datos personales.
      </p>

      <h2>8. Seguridad</h2>
      <p>
        Adoptamos medidas técnicas y organizativas para proteger tus datos contra
        acceso no autorizado, alteración o destrucción.
      </p>

      <h2>9. Menores</h2>
      <p>
        El servicio no está dirigido a menores de 18 años. No recopilamos
        intencionalmente datos de menores.
      </p>

      <h2>10. Cambios</h2>
      <p>
        Podemos actualizar esta política. Los cambios significativos serán
        notificados por email.
      </p>
    </article>
  );
}
