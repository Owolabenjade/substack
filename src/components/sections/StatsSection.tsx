import { motion } from "framer-motion";

const stats = [
  {
    value: "$275B",
    label: "Global Subscription Economy",
    sublabel: "Growing 18% annually",
  },
  {
    value: "$6.2B",
    label: "Lost to Chargebacks",
    sublabel: "Annually in subscription fraud",
  },
  {
    value: "0.5%",
    label: "Protocol Fee",
    sublabel: "vs 2.9% + $0.30 traditional",
  },
  {
    value: "100%",
    label: "User Control",
    sublabel: "Self-custodied always",
  },
];

const StatsSection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-secondary/10" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-gradient-accent mb-2">
                {stat.value}
              </div>
              <div className="font-medium text-foreground text-sm md:text-base mb-1">
                {stat.label}
              </div>
              <div className="text-muted-foreground text-xs md:text-sm">
                {stat.sublabel}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
