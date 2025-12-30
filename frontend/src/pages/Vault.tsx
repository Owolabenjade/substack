import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Wallet, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Shield, 
  Clock, 
  Ban,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { toast } from "sonner";

// Mock data for authorizations
const mockAuthorizations = [
  {
    id: 1,
    merchant: "CryptoInsights Pro",
    merchantAddress: "SP2...X4K9",
    maxPerPeriod: 15,
    periodLength: "Monthly",
    spentThisPeriod: 8,
    status: "active",
  },
  {
    id: 2,
    merchant: "DeFi Analytics",
    merchantAddress: "SP3...Y7M2",
    maxPerPeriod: 5,
    periodLength: "Monthly",
    spentThisPeriod: 5,
    status: "active",
  },
  {
    id: 3,
    merchant: "NFT Newsletter",
    merchantAddress: "SP1...Z9P5",
    maxPerPeriod: 3,
    periodLength: "Monthly",
    spentThisPeriod: 0,
    status: "paused",
  },
];

const mockSubscriptions = [
  {
    id: 1,
    plan: "CryptoInsights Pro - Premium",
    price: 8,
    nextCharge: "Jan 15, 2025",
    status: "active",
  },
  {
    id: 2,
    plan: "DeFi Analytics - Basic",
    price: 5,
    nextCharge: "Jan 10, 2025",
    status: "active",
  },
];

const Vault = () => {
  const [vaultBalance] = useState(156.5);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const handleDeposit = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    toast.success(`Deposited ${depositAmount} STX to your vault`);
    setDepositAmount("");
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (parseFloat(withdrawAmount) > vaultBalance) {
      toast.error("Insufficient balance");
      return;
    }
    toast.success(`Withdrew ${withdrawAmount} STX from your vault`);
    setWithdrawAmount("");
  };

  const handleRevoke = (merchantName: string) => {
    toast.success(`Authorization revoked for ${merchantName}`);
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
            className="mb-8"
          >
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Your Vault
            </h1>
            <p className="text-muted-foreground">
              Manage your funds and subscription authorizations
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Balance & Actions */}
            <div className="lg:col-span-1 space-y-6">
              {/* Balance Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-2xl glass-strong"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vault Balance</p>
                    <p className="font-display text-2xl font-bold">{vaultBalance} STX</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 text-secondary" />
                  <span>Self-custodied • Fully controlled by you</span>
                </div>
              </motion.div>

              {/* Deposit Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-2xl glass"
              >
                <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                  <ArrowDownToLine className="w-5 h-5 text-secondary" />
                  Deposit STX
                </h3>
                <div className="space-y-3">
                  <Input
                    type="number"
                    placeholder="Amount in STX"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    min="1"
                  />
                  <Button onClick={handleDeposit} variant="success" className="w-full">
                    Deposit to Vault
                  </Button>
                </div>
              </motion.div>

              {/* Withdraw Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 rounded-2xl glass"
              >
                <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                  <ArrowUpFromLine className="w-5 h-5 text-accent" />
                  Withdraw STX
                </h3>
                <div className="space-y-3">
                  <Input
                    type="number"
                    placeholder="Amount in STX"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    min="1"
                    max={vaultBalance}
                  />
                  <Button onClick={handleWithdraw} variant="outline" className="w-full">
                    Withdraw from Vault
                  </Button>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Authorizations & Subscriptions */}
            <div className="lg:col-span-2 space-y-6">
              {/* Active Subscriptions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-6 rounded-2xl glass-strong"
              >
                <h3 className="font-display font-semibold text-xl mb-4">
                  Active Subscriptions
                </h3>
                <div className="space-y-3">
                  {mockSubscriptions.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">{sub.plan}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Clock className="w-4 h-4" />
                          <span>Next charge: {sub.nextCharge}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-display font-bold text-lg">{sub.price} STX</p>
                        <span className="text-xs text-secondary">per month</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Authorizations */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="p-6 rounded-2xl glass-strong"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold text-xl">
                    Merchant Authorizations
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    {mockAuthorizations.length} merchants
                  </span>
                </div>

                <div className="space-y-4">
                  {mockAuthorizations.map((auth) => (
                    <div
                      key={auth.id}
                      className="p-4 rounded-xl bg-muted/30 border border-border/50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{auth.merchant}</p>
                            {auth.status === "paused" && (
                              <span className="px-2 py-0.5 rounded-full bg-destructive/20 text-destructive text-xs">
                                Paused
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{auth.merchantAddress}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevoke(auth.merchant)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Ban className="w-4 h-4 mr-1" />
                          Revoke
                        </Button>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Max/Period</p>
                          <p className="font-medium">{auth.maxPerPeriod} STX</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Period</p>
                          <p className="font-medium">{auth.periodLength}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Spent</p>
                          <p className="font-medium">
                            {auth.spentThisPeriod}/{auth.maxPerPeriod} STX
                          </p>
                        </div>
                      </div>

                      {/* Spending Progress */}
                      <div className="mt-3">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-accent to-orange-400 transition-all"
                            style={{
                              width: `${(auth.spentThisPeriod / auth.maxPerPeriod) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 rounded-lg bg-primary/10 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-primary-foreground shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    Revoking an authorization immediately stops all future charges from that merchant. 
                    Your subscription will be cancelled.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Vault;
