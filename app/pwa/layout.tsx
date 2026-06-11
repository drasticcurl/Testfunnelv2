import type { Metadata, Viewport } from 'next';
import BottomNav from '@/components/pwa/BottomNav';
import AppHeader from '@/components/pwa/AppHeader';
import InstallPrompt from '@/components/pwa/InstallPrompt';
import { PwaServiceWorker } from './PwaServiceWorker';

export const metadata: Metadata = {
  title: 'Método del Agua de Arroz',
  description: 'Tu protocolo personalizado para deshinchar y bajar de peso con el método del agua de arroz',
  manifest: '/pwa-manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Agua de Arroz',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#C0553A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function PwaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream">
      <AppHeader />
      <main className="pb-20 px-4">
        <div className="max-w-md mx-auto py-4">
          {children}
        </div>
      </main>
      <BottomNav />
      <InstallPrompt />
      <PwaServiceWorker />
    </div>
  );
}
