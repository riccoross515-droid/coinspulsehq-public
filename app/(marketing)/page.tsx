import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Shield, Zap, TrendingUp, Globe, Smartphone, Lock, Cpu, Server, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { CryptoTicker } from "../components/CryptoTicker";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Home',
  description: 'Coinspulse offers enterprise-grade cloud mining infrastructure with institutional-quality hashrate leasing for Bitcoin, Ethereum, and major cryptocurrencies.',
  keywords: ['cloud mining platform', 'institutional mining', 'bitcoin cloud mining', 'ethereum mining', 'hashrate leasing', 'crypto mining investment'],
  openGraph: {
    title: 'Coinspulse - Premier Institutional Cloud Mining Platform',
    description: 'Lease premium hashrate from global datacenters. Professional-grade mining hardware working for you 24/7.',
    url: '/',
    type: 'website',
  },
};

export default async function Home() {
  // Server-side fetch
  let cryptoData = [];
  try {
     const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false",
      { headers: { "Accept": "application/json" }, next: { revalidate: 60 } }
    );
    if (res.ok) {
        cryptoData = await res.json();
    } else {
        throw new Error("API call failed");
    }
  } catch (e) {
      console.error("Home page fetch error, using fallback", e);
      // Fallback data
      cryptoData = [
        { id: "bitcoin", symbol: "btc", name: "Bitcoin", current_price: 90543, price_change_percentage_24h: -0.58, image: "https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png" },
        { id: "ethereum", symbol: "eth", name: "Ethereum", current_price: 3092, price_change_percentage_24h: -0.34, image: "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png" },
        { id: "ripple", symbol: "xrp", name: "XRP", current_price: 2.09, price_change_percentage_24h: -0.27, image: "https://coin-images.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png" },
        { id: "solana", symbol: "sol", name: "Solana", current_price: 145.20, price_change_percentage_24h: 3.45, image: "https://coin-images.coingecko.com/coins/images/4128/large/solana.png" },
        { id: "binancecoin", symbol: "bnb", name: "BNB", current_price: 602.15, price_change_percentage_24h: 0.15, image: "https://coin-images.coingecko.com/coins/images/825/large/bnb-icon2_2x.png" },
      ];
  }

  const features = [
    {
      icon: Cpu,
      title: "Top-Tier Hardware",
      description: "Access institutional-grade ASIC clusters and high-performance GPU arrays from anywhere in the world.",
    },
    {
      icon: ShieldCheck,
      title: "Secure Payouts",
      description: "Mining rewards are calculated daily and secured using multi-sig cold storage protocols until contract maturity.",
    },
    {
      icon: Zap,
      title: "Optimized Output",
      description: "Our AI-driven pool switching technology ensures your leased hashrate is always mining the most profitable blocks.",
    },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.coinspulsehq.com/#organization",
        "name": "Coinspulse",
        "url": "https://www.coinspulsehq.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.coinspulsehq.com/logo.png"
        },
        "description": "Premier institutional cloud mining platform offering enterprise-grade hashrate leasing",
        "sameAs": [
          "https://twitter.com/coinspulse",
          "https://linkedin.com/company/coinspulse"
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://www.coinspulsehq.com/#website",
        "url": "https://www.coinspulsehq.com",
        "name": "Coinspulse",
        "publisher": {
          "@id": "https://www.coinspulsehq.com/#organization"
        }
      },
      {
        "@type": "Service",
        "name": "Cloud Mining Services",
        "provider": {
          "@id": "https://www.coinspulsehq.com/#organization"
        },
        "serviceType": "Cryptocurrency Cloud Mining",
        "description": "Institutional-grade cloud mining infrastructure for Bitcoin, Ethereum, and major cryptocurrencies"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen pt-16 pb-12">
      <CryptoTicker data={cryptoData} />
      
      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-32 overflow-hidden mx-auto max-w-7xl">
        <div className="text-center z-10 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-6 animate-fade-in">
            <Server className="h-3 w-3" />
            Institutional Cloud Mining Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-linear-to-r from-foreground to-muted-foreground bg-clip-text text-transparent leading-[1.1]">
            Next-Gen <span className="text-[#333] dark:text-primary">Cloud Mining</span> <br />
            Institutional Power, Individual Access
          </h1>
          <p className="text-muted-foreground text-xl md:text-2xl max-w-2xl mx-auto mb-10 leading-relaxed text-balance">
            Lease premium hashrate from our global datacenters. Professional-grade mining hardware working for you 24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth">
              <Button size="lg" className="text-base h-12 md:h-14 md:text-lg font-bold">Start Mining Now</Button>
            </Link>
            <Link href="/plans">
              <Button size="lg" variant="outline" className="text-base h-12 md:h-14 md:text-lg font-bold">Lease Hashrate</Button>
            </Link>
          </div>
        </div>
        
        {/* Background Glow Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
      </section>

      {/* Features Section */}
      <section id="about" className="px-6 py-24 max-w-7xl mx-auto relative">
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[800px] h-[800px] bg-primary/2 rounded-full blur-[120px] -z-10" /> 
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Technical Supremacy in Mining</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We leverage enterprise-grade infrastructure and innovative software to deliver maximum hashrate efficiency.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="p-8 group hover:bg-muted/50 border-border hover:border-primary/20 transition-all duration-300">
              <feature.icon className="h-12 w-12 text-[#333] dark:text-primary mb-6 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </section>


       {/* Trust/Stats Section */}
       <section className="px-6 py-20 bg-muted/20">
        <div className="max-w-7xl mx-auto text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-border">
                <div className="p-6">
                    <Server className="h-8 w-8 text-[#333] dark:text-primary mx-auto mb-4 opacity-80" />
                    <h4 className="text-4xl font-bold mb-2 text-foreground">450+ PH/s</h4>
                    <p className="text-muted-foreground text-sm uppercase tracking-wider">Total Active Hashrate</p>
                </div>
                <div className="p-6">
                    <Smartphone className="h-8 w-8 text-[#333] dark:text-primary mx-auto mb-4 opacity-80" />
                    <h4 className="text-4xl font-bold mb-2 text-foreground">8 Datacenters</h4>
                    <p className="text-muted-foreground text-sm uppercase tracking-wider">Global Locations</p>
                </div>
                <div className="p-6">
                    <Lock className="h-8 w-8 text-[#333] dark:text-primary mx-auto mb-4 opacity-80" />
                    <h4 className="text-4xl font-bold mb-2 text-foreground">99.9% Uptime</h4>
                    <p className="text-muted-foreground text-sm uppercase tracking-wider">Hardware Guarantee</p>
                 </div>
            </div>
        </div>
       </section>

       {/* Final CTA Section */}
       <section className="px-6 py-32 border-t border-border bg-background">
           <div className="max-w-4xl mx-auto text-center">
               <h2 className="text-4xl md:text-5xl font-bold mb-8 text-foreground tracking-tight">
                   Ready to Start Your Mining Journey?
               </h2>
               <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
                   Join the future of decentralized computing. Lease professional-grade power today and start earning rewards.
               </p>
               
               {/* Withdrawal Notice */}
               <div className="mb-12 inline-block px-6 py-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-amber-600 dark:text-amber-500 text-sm font-medium animate-pulse">
                Important: Mining contracts are fixed-term (1 year). Capital and accrued rewards are eligible for withdrawal upon contract maturity.
               </div>

               <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                   <Link href="/auth">
                    <Button size="lg" className="min-w-[240px] text-lg h-14 bg-foreground text-background hover:bg-foreground/90 hover:opacity-100 shadow-xl shadow-foreground/10 font-bold">
                        Create Mining Account
                    </Button>
                   </Link>
                   <Link href="/plans">
                    <Button size="lg" variant="outline" className="min-w-[240px] text-lg h-14 bg-transparent border-input hover:bg-muted text-foreground font-bold">
                        View Mining Contracts
                    </Button>
                   </Link>
               </div>
           </div>
       </section>
    </div>
    </>
  );
}
