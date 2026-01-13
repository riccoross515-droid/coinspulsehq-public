import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Coinspulse support team. We\'re here to assist you with cloud mining operations, contract inquiries, and technical support.',
  keywords: ['contact coinspulse', 'mining support', 'customer service', 'crypto mining help', 'hashrate support'],
  openGraph: {
    title: 'Contact Coinspulse Support | Cloud Mining Assistance',
    description: 'Have questions about our mining operations? Our team is ready to help optimize your cloud mining experience.',
    url: '/contact',
    type: 'website',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact Coinspulse",
    "description": "Contact page for Coinspulse cloud mining platform",
    "mainEntity": {
      "@type": "Organization",
      "@id": "https://www.coinspulsehq.com/#organization",
      "name": "Coinspulse",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Customer Support",
        "availableLanguage": "English"
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {children}
    </>
  );
}
