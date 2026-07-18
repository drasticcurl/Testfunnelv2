import type { Metadata } from 'next';
import './globals.css';

// Metadata neutral (zona-safe). Todas las páginas heredan estos defaults
// salvo que definan los suyos propios. NO usar términos clínicos
// ("hinchazón / inflamación / intestino") ni claims ("deshincha / baja de peso")
// acá — son lo primero que lee el crawler de Meta y la primera señal de
// "Health & Wellness sensitive category" que recortar tu optimización.
export const metadata: Metadata = {
  title: 'Método del Agua de Arroz — Test Personalizado',
  description:
    'Una nutricionista argentina te enseña un ritual matutino con agua de arroz. Hacé el test de 3 minutos y recibí tu plan personalizado según tu rutina.',
  openGraph: {
    title: 'Método del Agua de Arroz — Test Personalizado',
    description:
      'Descubrí el ritual del agua de arroz de la nutricionista Natalia Reyes. Test gratis de 3 minutos — recibí tu plan personalizado.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        {/* Verificación de dominio Meta */}
        <meta name="facebook-domain-verification" content="1jsua87k7olyx9yevsy391idke885v" />
        {/* UTMify — captura de UTMs (global, todas las páginas) */}
        <script
          src="https://cdn.utmify.com.br/scripts/utms/latest.js"
          data-utmify-prevent-xcod-sck=""
          data-utmify-prevent-subids=""
          async
          defer
        />
        {/* Meta Pixel */}
        {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
                fbq('track', 'PageView');
              `,
            }}
          />
        )}
        {/* TikTok Pixel — aditivo y aislado del de Meta. Se inyecta solo si
            NEXT_PUBLIC_TIKTOK_PIXEL_ID está seteada (igual patrón que fbq).
            `ttq.page()` es el PageView de TikTok. Los eventos custom
            (ViewContent, InitiateCheckout, CompletePayment) se disparan en sus
            componentes, al lado de los `fbq` ya existentes. */}
        {process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                !function (w, d, t) {
                  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};

                  ttq.load('${process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID}');
                  ttq.page();
                }(window, document, 'ttq');
              `,
            }}
          />
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
