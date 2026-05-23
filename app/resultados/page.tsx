/**
 * /resultados - carta de ventas dinamica del Quiz Anti-Hinchazon.
 *
 * Server component: parsea los searchParams, calcula el orden de renderizado
 * y compone los bloques que conforman la pagina.
 *
 * Se llega aca desde:
 *   /quiz -> SlideLoading -> buildResultsUrl(answers) -> /resultados?...
 *
 * Estructura optimizada basada en investigación de funnels de Noom, BetterMe,
 * Alen Sultanic (Automatic Clients), Heyflow, y Maria Wendt:
 *
 *  1. DiagnosticoHero (resultado inmediato — recompensa al quiz)
 *  2. ResumenRespuestas (espejo — "te escuché")
 *  3. PorQueFracaso + LasTresCausas (reencuadre — "no es tu culpa")
 *  4. MicroSocialProof (primer golpe de proof ANTES del producto)
 *  5. PresentacionProducto (prescriptivo, no comercial)
 *  6. TablaComparativa (ancla de valor vs nutricionista)
 *  7. ComoFunciona (reduce ansiedad post-compra)
 *  8. Testimonios (proof extenso)
 *  9. ParaQuienNoEs (disqualification → genera confianza)
 * 10. PrecioStack (value stack)
 * 11. Garantia
 * 12. CTAFinal (sin timer, con urgencia suave)
 * 13. FAQ
 *
 * Documento canonico: docs/03-RESULTADOS.md
 */

import { parseParams, buildCheckoutUrl } from '@/lib/parse-resultados';

import { DiagnosticoHero } from '@/components/resultados/DiagnosticoHero';
import { ResumenRespuestas } from '@/components/resultados/ResumenRespuestas';
import { PorQueFracaso } from '@/components/resultados/PorQueFracaso';
import { LasTresCausas } from '@/components/resultados/LasTresCausas';
import { MicroSocialProof } from '@/components/resultados/MicroSocialProof';
import { PresentacionProducto } from '@/components/resultados/PresentacionProducto';
import { BioCreadora } from '@/components/resultados/BioCreadora';
import { TablaComparativa } from '@/components/resultados/TablaComparativa';
import { ComoFunciona } from '@/components/resultados/ComoFunciona';
import { Testimonios } from '@/components/resultados/Testimonios';
import { ParaQuienNoEs } from '@/components/resultados/ParaQuienNoEs';
import { Garantia } from '@/components/resultados/Garantia';
import { PrecioStack } from '@/components/resultados/PrecioStack';
import { CTAFinal } from '@/components/resultados/CTAFinal';
import { FAQ } from '@/components/resultados/FAQ';
import { CTAMid } from '@/components/resultados/CTAMid';
import { StickyCTA } from '@/components/resultados/StickyCTA';
import { ViewContentTracker } from '@/components/resultados/ViewContentTracker';

export const metadata = {
  title: 'Tu diagnóstico personalizado · Anti-Hinchazón',
  description:
    'Tu plan personalizado para revertir tu tipo de hinchazón en 7 días.',
  robots: { index: false, follow: false }, // pagina con datos del usuario, no indexar
};

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default function ResultadosPage({ searchParams }: PageProps) {
  const params = parseParams(searchParams);
  const checkoutUrl = buildCheckoutUrl();

  return (
    <main className="min-h-screen bg-cream">
      <ViewContentTracker tipo={params.tipo} />

      {/* 1. Diagnóstico — recompensa inmediata */}
      <DiagnosticoHero params={params} />

      {/* 2. Espejo — "según tus respuestas" */}
      <ResumenRespuestas params={params} />

      {/* 3. Reencuadre — por qué nada funcionó + las 3 causas reales */}
      <PorQueFracaso params={params} />
      <LasTresCausas />

      {/* 4. Micro social proof — antes del producto */}
      <MicroSocialProof />

      {/* 5. Presentación prescriptiva del producto */}
      <PresentacionProducto params={params} />

      {/* 5.5 Bio de la creadora — confianza */}
      <BioCreadora />

      {/* 5.6 CTA mid-page — para quienes ya están convencidos */}
      <CTAMid />

      {/* 6. Tabla comparativa — ancla de valor */}
      <TablaComparativa />

      {/* 7. Cómo funciona — reduce ansiedad */}
      <ComoFunciona />

      {/* 8. Testimonios completos */}
      <Testimonios />

      {/* 9. Para quién NO es / SÍ es — disqualification */}
      <ParaQuienNoEs />

      {/* 10. Value stack + precio */}
      <PrecioStack />

      {/* 11. Garantía */}
      <Garantia />

      {/* 12. CTA final — sin timer, urgencia suave */}
      <CTAFinal checkoutUrl={checkoutUrl} />

      {/* 13. FAQ */}
      <FAQ />

      {/* Footer legal */}
      <footer className="py-6 px-5 text-center space-y-2">
        <p className="text-xs font-sans text-[#9B9890] max-w-lg mx-auto leading-relaxed">
          Este contenido es educativo y está basado en literatura científica general
          sobre salud digestiva y microbiota intestinal. No constituye diagnóstico,
          tratamiento ni consejo médico profesional. Los resultados del test son
          orientativos y no reemplazan la consulta con un profesional de la salud.
        </p>
        <p className="text-xs font-sans text-[#9B9890]">
          © {new Date().getFullYear()} hilvanapp.com ·{' '}
          <a href="/legal/privacidad" className="underline hover:text-charcoal">Privacidad</a>
          {' · '}
          <a href="/legal/terminos" className="underline hover:text-charcoal">Términos</a>
        </p>
      </footer>

      {/* Espacio extra al final para que StickyCTA mobile no tape contenido */}
      <div className="h-20 md:h-0" aria-hidden="true" />

      <StickyCTA />
    </main>
  );
}
