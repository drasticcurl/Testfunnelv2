import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Términos y Condiciones — Chau Hinchazón',
  description: 'Términos y condiciones del servicio Chau Hinchazón por hilvanapp.com',
};

export default function TerminosPage() {
  return (
    <article className="prose prose-sm max-w-none font-sans text-charcoal">
      <h1 className="font-serif text-2xl text-charcoal mb-2">Términos y Condiciones</h1>
      <p className="text-xs text-[#9B9890] mb-8">Última actualización: mayo 2026</p>

      <p>
        Al usar <strong>chauhinchazon.hilvanapp.com</strong> aceptás estos términos.
        Si no estás de acuerdo, no uses el servicio.
      </p>

      <h2>1. Qué es el servicio</h2>
      <p>
        <strong>Chau Hinchazón</strong> es un producto digital educativo que incluye un plan
        alimentario, recetas y guías accesibles desde una aplicación web tras la compra.
      </p>
      <ul>
        <li>Producto principal (Plan 7 días): $6.000 ARS</li>
        <li>Extensión opcional (Programa 30 días): $9.990 ARS</li>
      </ul>

      <h2>2. Aviso de salud</h2>
      <p>
        El contenido es <strong>exclusivamente educativo e informativo</strong>.
        No constituye consejo médico ni diagnóstico. Si tenés una condición médica,
        alergias, estás embarazada o tomás medicación, consultá a un profesional
        antes de modificar tu alimentación.
      </p>

      <h2>3. Acceso</h2>
      <ul>
        <li>El acceso se otorga tras la confirmación de pago.</li>
        <li>Ingresás con el email que usaste para comprar.</li>
        <li>El acceso es personal e intransferible.</li>
      </ul>

      <h2>4. Pagos</h2>
      <ul>
        <li>Los pagos se procesan a través de Hotmart.</li>
        <li>Precios en dólares estadounidenses (USD). Hotmart puede aplicar conversión según tu país.</li>
        <li>No almacenamos datos de tarjeta.</li>
      </ul>

      <h2>5. Garantía de 7 días</h2>
      <p>
        Si no estás conforme, podés solicitar un reembolso dentro de los 7 días
        posteriores a la compra, sin preguntas.
      </p>
      <ul>
        <li>Solicitalo en Hotmart o escribí a{' '}
          <a href="mailto:soporte@hilvanapp.com" className="text-sage hover:text-sage-dark">soporte@hilvanapp.com</a>.
        </li>
        <li>Una vez reembolsado, se revoca el acceso al producto.</li>
      </ul>

      <h2>6. Propiedad intelectual</h2>
      <ul>
        <li>Todo el contenido es propiedad de hilvanapp.com.</li>
        <li>Podés usarlo para tu uso personal.</li>
        <li>No podés copiar, redistribuir, revender ni compartir el contenido.</li>
      </ul>

      <h2>7. Uso aceptable</h2>
      <ul>
        <li>No compartir tu acceso con terceros.</li>
        <li>No usar herramientas automatizadas para extraer contenido.</li>
        <li>No usar el servicio con fines ilegales.</li>
      </ul>

      <h2>8. Limitación de responsabilidad</h2>
      <ul>
        <li>No garantizamos resultados específicos — cada cuerpo es diferente.</li>
        <li>Nuestra responsabilidad máxima se limita al monto pagado.</li>
      </ul>

      <h2>9. Ley aplicable</h2>
      <p>
        Estos términos se rigen por las leyes de la República Argentina.
        Ante cualquier controversia, serán competentes los tribunales ordinarios
        de la Ciudad Autónoma de Buenos Aires.
      </p>

      <h2>10. Contacto</h2>
      <p>
        <a href="mailto:soporte@hilvanapp.com" className="text-sage hover:text-sage-dark">soporte@hilvanapp.com</a>
      </p>
    </article>
  );
}
