import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Lincoln's 6th Birthday Celebration | RSVP",
  description:
    "Join us for Lincoln's 6th Birthday celebration on Saturday, 20th June 2026 at The Nord Mall, 3rd Floor (Mini Boss Play Area).",
  openGraph: {
    title: "Lincoln's 6th Birthday Celebration 🎂",
    description:
      "You're invited! Join us for Lincoln's 6th Birthday on Saturday, 20th June 2026 at The Nord Mall.",
    type: 'website',
    locale: 'en_KE',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Lincoln's 6th Birthday 🎉",
    description: "RSVP for Lincoln's 6th Birthday — 20 June 2026, The Nord Mall Nairobi",
  },
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎂</text></svg>',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800;900&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
