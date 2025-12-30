import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Wallet } from "lucide-react";

const CTASection = () => {
  return (
    <section id="merchants" className="py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Subscriber CTA */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="p-8 rounded-3xl glass-strong"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center mb-6">
                <Wallet className="w-7 h-7 text-foreground" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-3">
                Ready to Subscribe?
              </h3>
              <p className="text-muted-foreground mb-6">
                Connect your wallet, fund your vault, and take control of your subscriptions. 
                Never worry about forgotten trials or surprise charges again.
              </p>
              <Button variant="hero" size="lg" className="w-full sm:w-auto">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Button>
            </motion.div>

            {/* Merchant CTA */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-8 rounded-3xl border-2 border-accent/30 bg-card/30 backdrop-blur-xl"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-accent flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="font-display text-2xl font-bold mb-3">
                Launch Your Plans
              </h3>
              <p className="text-muted-foreground mb-6">
                Create subscription tiers, accept crypto payments, and say goodbye to chargebacks. 
                Join the future of recurring revenue.
              </p>
              <Button variant="heroOutline" size="lg" className="w-full sm:w-auto">
                Merchant Dashboard
                <ArrowRight className="w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
