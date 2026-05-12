import type { Metadata } from 'next';
import { LangProvider } from '@/lib/LangContext';

export const metadata: Metadata = {
  title: 'Book your visit · CitasOnDemand',
  description: 'Schedule an appointment online — choose your service, pick a time, and confirm.',
};

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return (
    <LangProvider>
      {children}
    </LangProvider>
  );
}
