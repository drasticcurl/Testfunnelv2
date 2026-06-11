import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Método del Agua de Arroz — Test Personalizado Anti-Hinchazón',
  description:
    'Una nutricionista argentina revela el método del agua de arroz que está deshinchando y bajando de peso a miles de mujeres. Hacé el test de 3 minutos y recibí tu protocolo personalizado gratis.',
  openGraph: {
    title: 'Método del Agua de Arroz — Test Personalizado',
    description:
      'Descubrí el método del agua de arroz que deshincha y baja de peso. Test gratis de 3 minutos — protocolo personalizado basado en tu perfil.',
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
