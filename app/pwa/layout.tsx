import type { Metadata, Viewport } from 'next';
import BottomNav from '@/components/pwa/BottomNav';
import AppHeader from '@/components/pwa/AppHeader';
import InstallPrompt from '@/components/pwa/InstallPrompt';
import { PwaServiceWorker } from './PwaServiceWorker';

export const metadata: Metadata = {
  title: 'Protocolo Anti-Hinchazón',
  description: 'Tu plan personalizado para desinflamar tu abdomen',
  manifest: '/pwa-manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Anti-Hinchazón',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#7A9B7E',
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
