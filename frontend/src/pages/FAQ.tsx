import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, HelpCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const faqData = [
  {
    category: "General",
    questions: [
      {
        q: "What is SubStack Protocol?",
        a: "SubStack Protocol is a decentralized subscription management system built on the Stacks blockchain. It enables merchants to create recurring payment plans while allowing subscribers to maintain full custody of their funds through personal vaults with granular spending authorizations."
      },
      {
        q: "How is SubStack different from traditional subscriptions?",
        a: "Unlike traditional subscriptions where merchants hold your payment credentials, SubStack inverts the model. You deposit funds into a self-custodied vault and authorize specific spending limits per merchant. This means you always control your funds and can cancel instantly."
      },
      {
        q: "What blockchain does SubStack run on?",
        a: "SubStack Protocol is built on Stacks, a Bitcoin Layer 2 blockchain. This means all transactions are ultimately secured by Bitcoin's proof-of-work consensus."
      },
    ]
  },
  {
    category: "For Subscribers",
    questions: [
      {
        q: "How do I create a vault?",
        a: "Simply connect your Stacks wallet (Leather or Xverse) and your personal vault is automatically created. You can then deposit STX to fund your subscriptions."
      },
      {
        q: "What are spending authorizations?",
        a: "When you subscribe to a service, you authorize the merchant to charge up to a specific amount per period (e.g., 10 STX/month). They can never charge more than your authorization, and you can revoke it instantly at any time."
      },
      {
        q: "Can I cancel my subscription anytime?",
        a: "Yes! Unlike traditional subscriptions, cancellation is instant and on-chain. Simply revoke the merchant's authorization and no future charges can occur. Your remaining vault funds are immediately protected."
      },
      {
        q: "What happens if I don't have enough funds in my vault?",
        a: "If your vault balance is insufficient when a charge is due, the charge will fail. Your subscription may be paused until you add more funds. Merchants cannot overdraft your vault."
      },
    ]
  },
  {
    category: "For Merchants",
    questions: [
      {
        q: "How do I create a subscription plan?",
        a: "Connect your wallet, access the Merchant Dashboard, and click 'Create Plan'. Set your plan name, price in STX, billing interval, and description. Your plan will be immediately available for subscribers."
      },
      {
        q: "How do I get paid?",
        a: "When a subscriber's charge is executed, the funds are transferred from their vault to your merchant balance. You can withdraw your available balance at any time to your connected wallet."
      },
      {
        q: "What are the fees?",
        a: "SubStack Protocol charges only 0.5% per successful charge—significantly lower than the 2.9% + $0.30 of traditional payment processors. Of this, 0.3% goes to the protocol treasury and 0.2% to keepers who execute charges."
      },
      {
        q: "Can subscribers chargeback payments?",
        a: "No. Chargebacks are impossible by design. Once a subscriber has authorized and funded their vault, and the charge is executed, the payment is final and on-chain. This protects merchants from fraud and disputes."
      },
    ]
  },
  {
    category: "Security",
    questions: [
      {
        q: "Is my money safe in the vault?",
        a: "Yes. Your vault is a smart contract where only you (the vault owner) can withdraw funds. Merchants can only debit the authorized amount when conditions are met. The contracts are open-source and audited."
      },
      {
        q: "What happens if a merchant tries to overcharge me?",
        a: "They can't. The smart contract enforces your authorization limits. Even if a merchant tries to charge more than authorized, the transaction will fail. Your spending limits are enforced on-chain."
      },
      {
        q: "Can I lose my funds if SubStack shuts down?",
        a: "No. SubStack Protocol is fully decentralized. Your vault and funds exist on the Stacks blockchain, not on our servers. Even if our frontend goes offline, you can interact with the contracts directly."
      },
    ]
  },
];

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const filteredFaq = faqData
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (q) =>
          q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.a.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.questions.length > 0);

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
              <HelpCircle className="w-4 h-4 text-accent" />
              <span className="text-sm text-muted-foreground">Help Center</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked <span className="text-gradient-accent">Questions</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Find answers to common questions about SubStack Protocol
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-xl mx-auto mb-12"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </motion.div>

          {/* FAQ Sections */}
          <div className="max-w-3xl mx-auto space-y-8">
            {filteredFaq.map((category, categoryIndex) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + categoryIndex * 0.05 }}
              >
                <h2 className="font-display text-xl font-bold mb-4 text-accent">
                  {category.category}
                </h2>
                <div className="space-y-3">
                  {category.questions.map((item, index) => {
                    const itemId = `${category.category}-${index}`;
                    const isOpen = openItems.includes(itemId);

                    return (
                      <div
                        key={index}
                        className="rounded-xl glass overflow-hidden"
                      >
                        <button
                          onClick={() => toggleItem(itemId)}
                          className="w-full flex items-center justify-between p-4 text-left"
                        >
                          <span className="font-medium pr-4">{item.q}</span>
                          <ChevronDown
                            className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4">
                            <p className="text-muted-foreground text-sm leading-relaxed">
                              {item.a}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-xl mx-auto mt-16 p-8 rounded-2xl glass-strong text-center"
          >
            <h3 className="font-display text-xl font-bold mb-2">
              Still have questions?
            </h3>
            <p className="text-muted-foreground mb-4">
              Join our Discord community or reach out on Twitter for support.
            </p>
            <div className="flex justify-center gap-3">
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-[#5865F2] text-white text-sm font-medium hover:bg-[#5865F2]/90 transition-colors"
              >
                Join Discord
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors"
              >
                Follow on Twitter
              </a>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
