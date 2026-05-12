import type { Metadata } from 'next';
import './globals.css';
import { LangProvider } from '@/lib/LangContext';

export const metadata: Metadata = {
  title: 'CitasOnDemand · Booking Admin',
  description: 'Appointment booking management for businesses',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
