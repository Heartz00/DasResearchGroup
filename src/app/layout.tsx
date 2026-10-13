import type { Metadata } from 'next';
import './globals.css';
import './refinement.css';
const origin = process.env.SITE_URL || 'http://localhost:3000';
export const metadata: Metadata = {
  metadataBase: new URL(origin),
  title: {
    default: 'Das Research Group | SMU Chemistry',
    template: '%s | Das Research Group',
  },
  description:
    'Synthetic nanoscience with atomic precision at Southern Methodist University.',
  openGraph: {
    title: 'Das Research Group',
    description: 'Synthetic nanoscience with atomic precision at SMU.',
    type: 'website',
    siteName: 'Das Research Group',
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
