import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Background Remover',
  description: 'Remove image backgrounds instantly with AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
