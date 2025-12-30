import { motion } from "framer-motion";
import { Wallet, PiggyBank, Settings, RefreshCw } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Wallet,
    title: "Connect Your Wallet",
    description: "Link your Stacks wallet (Leather, Xverse) with one click. Your keys, your control.",
    color: "accent",
  },
  {
    number: "02",
    icon: PiggyBank,
    title: "Fund Your Vault",
    description: "Deposit STX into your personal vault. These funds are only ever accessible by you.",
    color: "primary",
  },
  {
    number: "03",
    icon: Settings,
    title: "Set Spending Limits",
    description: "Authorize merchants with specific spending caps. They can never charge more than you allow.",
    color: "secondary",
  },
  {
    number: "04",
    icon: RefreshCw,
    title: "Subscriptions Execute",
    description: "Payments happen automatically. Keepers trigger charges, merchants receive funds, you stay in control.",
    color: "accent",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            How <span className="text-gradient-accent">It Works</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get started in minutes. Maintain control forever.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative max-w-4xl mx-auto">
          {/* Connection Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-accent via-primary to-secondary hidden sm:block" />

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative flex items-start gap-6 mb-12 last:mb-0 ${
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              }`}
            >
              {/* Icon */}
              <div className={`shrink-0 relative z-10 ${index % 2 === 0 ? "md:mr-auto" : "md:ml-auto"}`}>
                <div className={`w-16 h-16 rounded-2xl bg-gradient-${step.color} flex items-center justify-center shadow-lg`}>
                  <step.icon className="w-7 h-7 text-foreground" />
                </div>
              </div>

              {/* Content */}
              <div className={`flex-1 p-6 rounded-2xl glass max-w-md ${
                index % 2 === 0 ? "md:text-left" : "md:text-right md:ml-auto"
              }`}>
                <span className="text-accent font-display font-bold text-sm">{step.number}</span>
                <h3 className="font-display font-semibold text-xl mt-1 mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
