import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  TrendingUp,
  Users,
  DollarSign,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  ArrowUpRight,
  Calendar
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data
const mockPlans = [
  {
    id: 1,
    name: "Basic Plan",
    price: 5,
    interval: "Monthly",
    subscribers: 156,
    revenue: 780,
    status: "active",
  },
  {
    id: 2,
    name: "Pro Plan",
    price: 15,
    interval: "Monthly",
    subscribers: 89,
    revenue: 1335,
    status: "active",
  },
  {
    id: 3,
    name: "Enterprise",
    price: 50,
    interval: "Monthly",
    subscribers: 12,
    revenue: 600,
    status: "active",
  },
];

const mockSubscribers = [
  { id: 1, address: "SP2X...K4M9", plan: "Pro Plan", since: "Dec 15, 2024", status: "active" },
  { id: 2, address: "SP3Y...L7N2", plan: "Basic Plan", since: "Dec 10, 2024", status: "active" },
  { id: 3, address: "SP1Z...P9Q5", plan: "Pro Plan", since: "Dec 8, 2024", status: "active" },
  { id: 4, address: "SP4A...R2S8", plan: "Enterprise", since: "Dec 5, 2024", status: "active" },
  { id: 5, address: "SP5B...T4U1", plan: "Basic Plan", since: "Dec 1, 2024", status: "churned" },
];

const MerchantDashboard = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [planName, setPlanName] = useState("");
  const [planPrice, setPlanPrice] = useState("");
  const [planDescription, setPlanDescription] = useState("");

  const totalRevenue = mockPlans.reduce((acc, plan) => acc + plan.revenue, 0);
  const totalSubscribers = mockPlans.reduce((acc, plan) => acc + plan.subscribers, 0);

  const handleCreatePlan = () => {
    if (!planName || !planPrice) {
      toast.error("Please fill in all required fields");
      return;
    }
    toast.success(`Plan "${planName}" created successfully!`);
    setIsCreateOpen(false);
    setPlanName("");
    setPlanPrice("");
    setPlanDescription("");
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
            className="flex items-start justify-between mb-8"
          >
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                Merchant Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage your subscription plans and track revenue
              </p>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button variant="hero">
                  <Plus className="w-4 h-4" />
                  Create Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-display">Create New Plan</DialogTitle>
                  <DialogDescription>
                    Set up a new subscription plan for your subscribers
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Plan Name</label>
                    <Input
                      placeholder="e.g., Pro Plan"
                      value={planName}
                      onChange={(e) => setPlanName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Price (STX/month)</label>
                    <Input
                      type="number"
                      placeholder="e.g., 10"
                      value={planPrice}
                      onChange={(e) => setPlanPrice(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <Textarea
                      placeholder="Describe what's included in this plan..."
                      value={planDescription}
                      onChange={(e) => setPlanDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <Button onClick={handleCreatePlan} variant="hero" className="w-full">
                    Create Plan
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl glass-strong"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-accent-foreground" />
                </div>
                <span className="flex items-center gap-1 text-sm text-secondary">
                  <ArrowUpRight className="w-4 h-4" />
                  +12%
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="font-display text-2xl font-bold">{totalRevenue} STX</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-2xl glass-strong"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-success flex items-center justify-center">
                  <Users className="w-6 h-6 text-foreground" />
                </div>
                <span className="flex items-center gap-1 text-sm text-secondary">
                  <ArrowUpRight className="w-4 h-4" />
                  +8%
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Active Subscribers</p>
              <p className="font-display text-2xl font-bold">{totalSubscribers}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-2xl glass-strong"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-foreground" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Active Plans</p>
              <p className="font-display text-2xl font-bold">{mockPlans.length}</p>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Plans List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 rounded-2xl glass-strong"
            >
              <h3 className="font-display font-semibold text-xl mb-4">
                Your Plans
              </h3>
              <div className="space-y-4">
                {mockPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{plan.name}</p>
                        <span className="px-2 py-0.5 rounded-full bg-secondary/20 text-secondary text-xs">
                          {plan.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {plan.subscribers} subscribers • {plan.revenue} STX/mo
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-lg">
                        {plan.price} STX
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Plan
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Deactivate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Subscribers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-6 rounded-2xl glass-strong"
            >
              <h3 className="font-display font-semibold text-xl mb-4">
                Recent Subscribers
              </h3>
              <div className="space-y-3">
                {mockSubscribers.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-orange-400 flex items-center justify-center text-sm font-bold text-accent-foreground">
                        {sub.address.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{sub.address}</p>
                        <p className="text-xs text-muted-foreground">{sub.plan}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {sub.since}
                      </div>
                      {sub.status === "churned" ? (
                        <span className="text-xs text-destructive">Churned</span>
                      ) : (
                        <span className="text-xs text-secondary">Active</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Withdraw Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 p-6 rounded-2xl border-2 border-accent/30 bg-card/30"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-semibold text-xl mb-1">
                  Available for Withdrawal
                </h3>
                <p className="text-muted-foreground">
                  Revenue collected from subscriber charges
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-display text-3xl font-bold text-gradient-accent">
                    2,715 STX
                  </p>
                  <p className="text-sm text-muted-foreground">≈ $5,430 USD</p>
                </div>
                <Button variant="hero" size="lg">
                  Withdraw
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MerchantDashboard;
