import { motion } from "framer-motion";
import { Shield, Users, Zap, Target, Globe, Lock } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              About <span className="text-gradient-accent">SubStack Protocol</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              SubStack Protocol is a decentralized subscription management system built on the 
              Stacks blockchain. We enable merchants to create recurring payment plans while 
              allowing subscribers to maintain full custody of their funds through personal 
              vaults with granular spending authorizations.
            </p>
          </motion.div>

          {/* Vision & Mission */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="p-8 rounded-2xl glass-strong"
            >
              <Target className="w-10 h-10 text-accent mb-4" />
              <h2 className="font-display text-2xl font-bold mb-4">Our Vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                To become the standard infrastructure for recurring payments in Web3, enabling 
                any blockchain application to offer subscription services with user-first custody 
                and transparency.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="p-8 rounded-2xl glass-strong"
            >
              <Globe className="w-10 h-10 text-secondary mb-4" />
              <h2 className="font-display text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                Empower merchants and subscribers with trustless recurring payment infrastructure 
                that prioritizes user control, eliminates payment disputes, and reduces costs 
                for all participants.
              </p>
            </motion.div>
          </div>

          {/* How It's Different */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-16"
          >
            <h2 className="font-display text-3xl font-bold text-center mb-8">
              What Makes Us Different
            </h2>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-8">
              Unlike traditional subscription services where merchants hold payment credentials, 
              SubStack inverts the model: users deposit funds into self-custodied vaults and 
              authorize specific spending limits per merchant.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl glass text-center">
                <Lock className="w-8 h-8 text-accent mx-auto mb-3" />
                <h3 className="font-display font-semibold mb-2">User Custody</h3>
                <p className="text-sm text-muted-foreground">
                  Subscribers always control their funds through personal vaults
                </p>
              </div>
              <div className="p-6 rounded-xl glass text-center">
                <Zap className="w-8 h-8 text-secondary mx-auto mb-3" />
                <h3 className="font-display font-semibold mb-2">Instant Control</h3>
                <p className="text-sm text-muted-foreground">
                  Cancel any subscription immediately with one click
                </p>
              </div>
              <div className="p-6 rounded-xl glass text-center">
                <Shield className="w-8 h-8 text-accent mx-auto mb-3" />
                <h3 className="font-display font-semibold mb-2">Zero Chargebacks</h3>
                <p className="text-sm text-muted-foreground">
                  Disputes are impossible by design, protecting merchants
                </p>
              </div>
            </div>
          </motion.div>

          {/* Guiding Principles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-8 rounded-2xl glass-strong"
          >
            <h2 className="font-display text-3xl font-bold text-center mb-8">
              Guiding Principles
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "User custody above all", desc: "Subscribers must always control their funds" },
                { title: "Transparency by default", desc: "All subscription logic verifiable on-chain" },
                { title: "Simplicity over complexity", desc: "Minimize smart contract attack surface" },
                { title: "Merchant-friendly", desc: "Make Web3 subscriptions as easy as Stripe" },
                { title: "Progressive decentralization", desc: "Start simple, decentralize keepers over time" },
                { title: "Bitcoin-secured", desc: "Built on Stacks for Bitcoin finality" },
              ].map((principle, i) => (
                <div key={i} className="p-4 rounded-lg bg-muted/30">
                  <h3 className="font-display font-semibold mb-2">{principle.title}</h3>
                  <p className="text-sm text-muted-foreground">{principle.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
