import type { Metadata } from 'next';
import '../styles/globals.css';
import Sidebar from '@/components/Sidebar';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'ThesisMate AI',
  description: 'Academic workflow assistant for thesis research and writing.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <Providers>
          <main className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 p-6 md:p-8">
              {children}
            </div>
          </main>
        </Providers>
      </body>
    </html>
  );
}
