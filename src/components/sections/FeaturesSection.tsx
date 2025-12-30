import { motion } from "framer-motion";
import { 
  Vault, 
  Shield, 
  Zap, 
  Eye, 
  CreditCard, 
  TrendingUp,
  Ban,
  Clock,
  BarChart3
} from "lucide-react";

const subscriberFeatures = [
  {
    icon: Vault,
    title: "Self-Custodied Vaults",
    description: "Your funds stay in your personal vault. No merchant ever holds your payment credentials.",
  },
  {
    icon: Zap,
    title: "Instant Cancellation",
    description: "Cancel any subscription with one click. Your funds are immediately protected.",
  },
  {
    icon: Eye,
    title: "Full Transparency",
    description: "See exactly what each merchant can charge. No hidden fees or surprise debits.",
  },
  {
    icon: CreditCard,
    title: "Single Dashboard",
    description: "Manage all your Web3 subscriptions from one unified interface.",
  },
];

const merchantFeatures = [
  {
    icon: Shield,
    title: "Guaranteed Payments",
    description: "When funds are available, payments always succeed. No failed card charges.",
  },
  {
    icon: Ban,
    title: "Zero Chargebacks",
    description: "Impossible by design. Save thousands in dispute fees and fraud losses.",
  },
  {
    icon: Clock,
    title: "Lower Fees",
    description: "Only 0.5% per transaction vs 2.9% + $0.30 with traditional processors.",
  },
  {
    icon: BarChart3,
    title: "On-Chain Analytics",
    description: "Real-time subscriber data and revenue metrics directly from the blockchain.",
  },
];

const FeatureCard = ({ icon: Icon, title, description, index, isRight }: {
  icon: React.ElementType;
  title: string;
  description: string;
  index: number;
  isRight?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, x: isRight ? 30 : -30 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="group p-6 rounded-2xl glass hover:bg-card/80 transition-all duration-300"
  >
    <div className="flex items-start gap-4">
      <div className={`p-3 rounded-xl ${isRight ? 'bg-gradient-accent' : 'bg-gradient-primary'} shrink-0`}>
        <Icon className="w-6 h-6 text-foreground" />
      </div>
      <div>
        <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  </motion.div>
);

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Built for <span className="text-gradient-accent">Everyone</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Whether you're subscribing to services or monetizing your content, SubStack Protocol puts you in control.
          </p>
        </motion.div>

        {/* Two Column Features */}
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Subscribers Column */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary-foreground text-sm font-medium mb-3">
                For Subscribers
              </span>
              <h3 className="font-display text-2xl font-bold">
                Never Lose Control of Your Funds
              </h3>
            </motion.div>
            <div className="space-y-4">
              {subscriberFeatures.map((feature, index) => (
                <FeatureCard key={feature.title} {...feature} index={index} />
              ))}
            </div>
          </div>

          {/* Merchants Column */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <span className="inline-block px-3 py-1 rounded-full bg-accent/20 text-foreground text-sm font-medium mb-3">
                For Merchants
              </span>
              <h3 className="font-display text-2xl font-bold">
                Recurring Revenue, Reinvented
              </h3>
            </motion.div>
            <div className="space-y-4">
              {merchantFeatures.map((feature, index) => (
                <FeatureCard key={feature.title} {...feature} index={index} isRight />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
