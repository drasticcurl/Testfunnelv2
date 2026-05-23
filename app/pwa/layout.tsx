import type { Metadata, Viewport } from 'next';
import BottomNav from '@/components/pwa/BottomNav';
import PwaHeader from '@/components/pwa/PwaHeader';
import PwaServiceWorker from '@/components/pwa/PwaServiceWorker';

export const metadata: Metadata = {
  title: 'DormíBien — Tu Protocolo de Sueño',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#F8F6F2',
};

export default function PwaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-pwa-bg">
      <PwaServiceWorker />
      <PwaHeader />
      <main className="pb-20 px-4 pt-4 max-w-lg mx-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
