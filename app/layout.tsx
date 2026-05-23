import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Test Anti-Hinchazón — Descubrí Tu Tipo',
  description:
    'Hacé el test de 2 minutos y descubrí cuál de los 4 tipos de hinchazón abdominal estás sufriendo. Más de 12.000 mujeres ya lo hicieron.',
  openGraph: {
    title: 'Test Anti-Hinchazón — Descubrí Tu Tipo',
    description:
      'Test personalizado de 2 minutos para identificar tu tipo de hinchazón y recibir un plan específico.',
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
      </head>
      <body>{children}</body>
    </html>
  );
}
