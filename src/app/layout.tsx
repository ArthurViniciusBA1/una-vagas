import './globals.css';

import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import { Toaster } from 'sonner';

const monstserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  title: 'Vagas UNA',
  description: 'Vagas UNA | Una Itabira',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='pt-br'>
      <body className={`${monstserrat.variable} antialiased`}>
        <Toaster richColors position='top-right' duration={4000} />
        {children}
      </body>
    </html>
  );
}
