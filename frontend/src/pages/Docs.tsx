import { motion } from "framer-motion";
import { 
  Book, 
  Code, 
  Wallet, 
  Shield, 
  Zap, 
  Database,
  ExternalLink,
  Terminal,
  FileCode,
  Server
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const docSections = [
  {
    icon: Wallet,
    title: "Getting Started",
    description: "Learn how to connect your wallet, create a vault, and start subscribing.",
    links: [
      { label: "Quick Start Guide", href: "#" },
      { label: "Wallet Setup", href: "#" },
      { label: "Your First Subscription", href: "#" },
    ],
  },
  {
    icon: Database,
    title: "Vault Management",
    description: "Understand how to deposit, withdraw, and manage your vault authorizations.",
    links: [
      { label: "Depositing Funds", href: "#" },
      { label: "Setting Spending Limits", href: "#" },
      { label: "Revoking Authorizations", href: "#" },
    ],
  },
  {
    icon: Server,
    title: "For Merchants",
    description: "Create subscription plans and manage your recurring revenue.",
    links: [
      { label: "Creating Plans", href: "#" },
      { label: "Managing Subscribers", href: "#" },
      { label: "Withdrawing Revenue", href: "#" },
    ],
  },
  {
    icon: Code,
    title: "Smart Contracts",
    description: "Technical documentation for the SubStack Protocol smart contracts.",
    links: [
      { label: "Contract Architecture", href: "#" },
      { label: "subscription-vault.clar", href: "#" },
      { label: "subscription-engine.clar", href: "#" },
    ],
  },
  {
    icon: Terminal,
    title: "API Reference",
    description: "Integrate SubStack Protocol into your application.",
    links: [
      { label: "REST API", href: "#" },
      { label: "WebSocket Events", href: "#" },
      { label: "SDK Documentation", href: "#" },
    ],
  },
  {
    icon: Shield,
    title: "Security",
    description: "Learn about our security model and best practices.",
    links: [
      { label: "Threat Model", href: "#" },
      { label: "Audit Reports", href: "#" },
      { label: "Bug Bounty", href: "#" },
    ],
  },
];

const Docs = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <Book className="w-4 h-4 text-accent" />
              <span className="text-sm text-muted-foreground">Documentation</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Learn <span className="text-gradient-accent">SubStack Protocol</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about building with and using SubStack Protocol.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            <Button variant="heroOutline">
              <FileCode className="w-4 h-4" />
              View on GitHub
              <ExternalLink className="w-4 h-4" />
            </Button>
            <Button variant="outline">
              <Terminal className="w-4 h-4" />
              API Reference
            </Button>
          </motion.div>

          {/* Documentation Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {docSections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="p-6 rounded-2xl glass hover:bg-card/80 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center mb-4">
                  <section.icon className="w-6 h-6 text-accent-foreground" />
                </div>
                <h3 className="font-display font-semibold text-xl mb-2">
                  {section.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {section.description}
                </p>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
                      >
                        <Zap className="w-3 h-3" />
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Technical Specs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16 p-8 rounded-2xl glass-strong"
          >
            <h2 className="font-display text-2xl font-bold mb-6 text-center">
              Technical Specifications
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { label: "Blockchain", value: "Stacks (Bitcoin L2)" },
                { label: "Smart Contract Language", value: "Clarity" },
                { label: "Frontend Framework", value: "React / Next.js" },
                { label: "Wallet Integration", value: "WalletKit SDK" },
                { label: "Chain Queries", value: "Hiro API" },
                { label: "License", value: "MIT" },
              ].map((spec) => (
                <div key={spec.label} className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">{spec.label}</p>
                  <p className="font-medium">{spec.value}</p>
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

export default Docs;
