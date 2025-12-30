import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  Users, 
  Clock, 
  Star,
  ChevronRight,
  Sparkles
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock subscription plans
const mockPlans = [
  {
    id: 1,
    name: "CryptoInsights Pro",
    merchant: "CryptoInsights",
    description: "Premium market analysis, trading signals, and weekly reports for serious crypto traders.",
    price: 8,
    interval: "month",
    subscribers: 1250,
    rating: 4.8,
    category: "Analytics",
    features: ["Daily market analysis", "Trading signals", "Weekly reports", "Discord access"],
  },
  {
    id: 2,
    name: "DeFi Analytics Basic",
    merchant: "DeFi Analytics",
    description: "Track your DeFi positions across all major protocols with real-time alerts.",
    price: 5,
    interval: "month",
    subscribers: 890,
    rating: 4.6,
    category: "Analytics",
    features: ["Portfolio tracking", "Real-time alerts", "Protocol analytics"],
  },
  {
    id: 3,
    name: "NFT Alpha Premium",
    merchant: "NFT Alpha",
    description: "Early access to NFT drops, whale wallet tracking, and exclusive alpha.",
    price: 15,
    interval: "month",
    subscribers: 450,
    rating: 4.9,
    category: "NFT",
    features: ["Whale wallet tracking", "Early drop access", "Exclusive Discord", "Mint alerts"],
  },
  {
    id: 4,
    name: "Stacks Dev Tools",
    merchant: "StacksTools",
    description: "Developer tools and APIs for building on Stacks blockchain.",
    price: 25,
    interval: "month",
    subscribers: 320,
    rating: 4.7,
    category: "Development",
    features: ["API access", "SDK tools", "Priority support", "Documentation"],
  },
  {
    id: 5,
    name: "Crypto Education Pro",
    merchant: "CryptoAcademy",
    description: "Learn DeFi, trading, and blockchain development from industry experts.",
    price: 12,
    interval: "month",
    subscribers: 2100,
    rating: 4.5,
    category: "Education",
    features: ["Video courses", "Live workshops", "Certificates", "Community"],
  },
  {
    id: 6,
    name: "DAO Governance Suite",
    merchant: "DAOTools",
    description: "Complete toolkit for DAO participation and governance tracking.",
    price: 10,
    interval: "month",
    subscribers: 180,
    rating: 4.4,
    category: "Governance",
    features: ["Proposal alerts", "Voting reminders", "Analytics dashboard", "Multi-DAO support"],
  },
];

const categories = ["All", "Analytics", "NFT", "Development", "Education", "Governance"];

const Browse = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPlan, setSelectedPlan] = useState<typeof mockPlans[0] | null>(null);
  const [sortBy, setSortBy] = useState("popular");

  const filteredPlans = mockPlans
    .filter((plan) => {
      const matchesSearch = plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || plan.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "popular") return b.subscribers - a.subscribers;
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0;
    });

  const handleSubscribe = (planName: string) => {
    toast.success(`Subscribed to ${planName}!`);
    setSelectedPlan(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
              Discover <span className="text-gradient-accent">Subscriptions</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Browse and subscribe to premium Web3 services. All subscriptions are managed 
              through your self-custodied vault.
            </p>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col md:flex-row gap-4 mb-8"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search subscriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2 mb-8"
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {category}
              </button>
            ))}
          </motion.div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="group p-6 rounded-2xl glass hover:bg-card/80 transition-all cursor-pointer"
                onClick={() => setSelectedPlan(plan)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/20 text-primary-foreground">
                      {plan.category}
                    </span>
                    <h3 className="font-display font-semibold text-lg mt-2">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.merchant}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-xl">{plan.price} STX</p>
                    <p className="text-xs text-muted-foreground">/{plan.interval}</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {plan.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {plan.subscribers.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-accent" />
                      {plan.rating}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>

          {filteredPlans.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No subscriptions found matching your criteria.</p>
            </div>
          )}
        </div>
      </main>

      {/* Plan Detail Modal */}
      <Dialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedPlan && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/20 text-primary-foreground">
                    {selectedPlan.category}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="w-4 h-4 text-accent" />
                    {selectedPlan.rating}
                  </span>
                </div>
                <DialogTitle className="font-display text-2xl">{selectedPlan.name}</DialogTitle>
                <DialogDescription className="text-base">
                  by {selectedPlan.merchant}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                <p className="text-muted-foreground">{selectedPlan.description}</p>

                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    What's Included
                  </h4>
                  <ul className="space-y-2">
                    {selectedPlan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-muted/50 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Subscription Price</p>
                    <p className="font-display text-2xl font-bold">
                      {selectedPlan.price} STX<span className="text-sm text-muted-foreground font-normal">/{selectedPlan.interval}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    {selectedPlan.subscribers.toLocaleString()} subscribers
                  </div>
                </div>

                <Button 
                  variant="hero" 
                  className="w-full" 
                  size="lg"
                  onClick={() => handleSubscribe(selectedPlan.name)}
                >
                  Subscribe Now
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  You'll need to authorize {selectedPlan.price} STX/month from your vault. 
                  Cancel anytime instantly.
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Browse;
