import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./providers";


const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://www.coinspulsehq.com'),
  title: {
    default: 'Coinspulse - Premier Institutional Cloud Mining Platform',
    template: '%s | Coinspulse',
  },
  description: 'Access enterprise-grade cloud mining infrastructure. Coinspulse offers institutional-quality hashrate leasing for Bitcoin, Ethereum, and major cryptocurrencies with transparent ROI and secure payouts.',
  keywords: [
    'cloud mining',
    'institutional mining',
    'crypto mining',
    'bitcoin mining',
    'ethereum mining',
    'hashrate leasing',
    'mining investment',
    'cryptocurrency mining',
    'ASIC mining',
    'GPU mining',
    'mining pool',
    'crypto investment',
    'blockchain mining',
    'mining ROI',
    'secure mining',
  ],
  authors: [{ name: 'Coinspulse' }],
  creator: 'Coinspulse',
  publisher: 'Coinspulse',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Coinspulse',
    title: 'Coinspulse - Premier Institutional Cloud Mining Platform',
    description: 'Access enterprise-grade cloud mining infrastructure with transparent ROI and secure payouts.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Coinspulse - Institutional Cloud Mining',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Coinspulse - Premier Institutional Cloud Mining Platform',
    description: 'Access enterprise-grade cloud mining infrastructure with transparent ROI and secure payouts.',
    images: ['/og-image.png'],
    creator: '@coinspulse',
  },
  verification: {
    google: 'your-google-site-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans antialiased tracking-tight leading-relaxed selection:bg-primary/30`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
          {children}
        </ThemeProvider>

      </body>
    </html>
  );
}
