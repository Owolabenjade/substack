import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

const comparisons = [
  {
    feature: "Fund Custody",
    traditional: "Merchant holds credentials",
    substack: "User-controlled vault",
  },
  {
    feature: "Cancellation",
    traditional: "Request-based, 24-48 hours",
    substack: "Instant, on-chain",
  },
  {
    feature: "Chargebacks",
    traditional: "2-3% industry average",
    substack: "Impossible by design",
  },
  {
    feature: "Processing Fee",
    traditional: "2.9% + $0.30",
    substack: "0.5% flat",
  },
  {
    feature: "Transparency",
    traditional: "Opaque processing",
    substack: "Full on-chain audit trail",
  },
  {
    feature: "Payment Failures",
    traditional: "Card expiry issues",
    substack: "Pre-funded vaults",
  },
];

const ComparisonSection = () => {
  return (
    <section className="py-24 relative">
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
            Why <span className="text-gradient-accent">SubStack</span>?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See how we compare to traditional subscription services
          </p>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto rounded-2xl glass overflow-hidden"
        >
          {/* Header */}
          <div className="grid grid-cols-3 gap-4 p-4 md:p-6 bg-muted/50 border-b border-border">
            <div className="text-sm font-medium text-muted-foreground">Feature</div>
            <div className="text-sm font-medium text-muted-foreground text-center">Traditional Services</div>
            <div className="text-sm font-medium text-accent text-center">SubStack Protocol</div>
          </div>

          {/* Rows */}
          {comparisons.map((row, index) => (
            <motion.div
              key={row.feature}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className={`grid grid-cols-3 gap-4 p-4 md:p-6 ${
                index !== comparisons.length - 1 ? "border-b border-border/50" : ""
              }`}
            >
              <div className="font-medium text-sm md:text-base">{row.feature}</div>
              <div className="flex items-center justify-center gap-2 text-center">
                <X className="w-4 h-4 text-destructive shrink-0 hidden sm:block" />
                <span className="text-muted-foreground text-xs md:text-sm">{row.traditional}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-center">
                <Check className="w-4 h-4 text-secondary shrink-0 hidden sm:block" />
                <span className="text-foreground text-xs md:text-sm font-medium">{row.substack}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ComparisonSection;
