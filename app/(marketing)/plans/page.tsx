import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Check, Star, Info, Cpu, Zap, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function PlansPage() {
  const plans = [
    {
      name: "Standard Contract",
      roi: "0.5% Daily",
      min: "$500",
      max: "$999",
      features: ["ASIC Hashrate Allocation", "Daily Mining Output", "24/7 Hardware Monitoring", "12 Months Fixed Contract"],
      recommended: false,
    },
    {
      name: "Professional Contract",
      roi: "1.2% Daily",
      min: "$1,000",
      max: "$9,999",
      features: ["Priority ASIC Queue", "Enhanced Pool Optimization", "Dedicated Rig Manager", "Weekly Technical Analysis", "12 Months Fixed Contract"],
      recommended: true,
    },
    {
      name: "Institutional Contract",
      roi: "2.5% Daily",
      min: "$10,000",
      max: "No Limit",
      features: ["Custom Cluster Provisioning", "VIP Pool Switching", "Institutional Hardware Access", "Daily Performance Reports", "12 Months Fixed Contract"],
      recommended: false,
    },
  ];

  return (
    <div className="min-h-screen pt-24 px-6 pb-20 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
          Mining Hashrate Contracts
        </h1>
        <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
          Lease high-performance computing power from our global datacenters. All hashpower is backed by physical ASIC and GPU hardware clusters.
        </p>
      </div>

      {/* Withdrawal Warning Banner */}
      <div className="max-w-4xl mx-auto mb-16 p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex gap-4 items-start">
        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-500">
            <Info className="h-6 w-6" />
        </div>
        <div>
            <h4 className="font-bold text-amber-700 dark:text-amber-400 mb-1">Important Contract Terms</h4>
            <p className="text-sm text-amber-600/80 dark:text-amber-500/80 leading-relaxed font-medium">
                Mining contracts are subject to a <span className="font-bold uppercase">12-month fixed term</span>. To ensure hardware stability and network security, both initial capital and accrued mining rewards are processed for withdrawal <span className="underline decoration-2 underline-offset-4">only upon contract maturity</span>.
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {plans.map((plan) => (
          <Card 
            key={plan.name} 
            className={`p-8 relative transition-all duration-300 hover:-translate-y-2 border-border flex flex-col h-full ${
              plan.recommended ? 'border-primary shadow-2xl shadow-primary/10 bg-card' : 'bg-card/50'
            }`}
          >
            {plan.recommended && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
                <Star className="h-3 w-3 fill-current" /> Most Popular
              </div>
            )}
            
            <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2 text-foreground">{plan.name}</h3>
                <div className="text-4xl font-bold text-primary mb-1">{plan.roi}</div>
                <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Expected Daily Output</p>
            </div>
            
            <div className="space-y-4 mb-8">
               <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground text-sm">Lease Minimum</span>
                  <span className="font-bold text-foreground text-sm">{plan.min}</span>
               </div>
               <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground text-sm">Lease Maximum</span>
                  <span className="font-bold text-foreground text-sm">{plan.max}</span>
               </div>
               <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground text-sm">Hardware Term</span>
                  <span className="font-bold text-foreground text-sm">12 Months Fixed</span>
               </div>
            </div>

            <ul className="space-y-3 mb-12 flex-1">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-foreground/80">
                  <div className={`rounded-full p-1 ${plan.recommended ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <Check className="h-3 w-3" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <Link href="/auth" className="w-full">
              <Button 
                  variant={plan.recommended ? 'primary' : 'outline'} 
                  className="w-full font-bold h-12"
                  size="lg"
              >
                Start {plan.name} Contract
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
