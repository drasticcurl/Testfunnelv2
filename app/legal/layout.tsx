'use client';

import { useRouter } from 'next/navigation';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-cream">
      {/* Botón volver */}
      <header className="max-w-2xl mx-auto px-5 pt-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm font-sans text-sage hover:text-sage-dark transition-colors"
        >
          <span aria-hidden="true">←</span>
          Volver
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8">
        {children}
      </main>

      <footer className="py-6 px-5 text-center border-t border-sand/40">
        <p className="text-xs font-sans text-[#9B9890]">
          © {new Date().getFullYear()} Anti-Hinchazón · hilvanapp.com
        </p>
      </footer>
    </div>
  );
}
