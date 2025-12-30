import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Subscription {
  id: string;
  subscriber_id: string;
  plan_id: string;
  status: "active" | "paused" | "cancelled";
  start_block: number | null;
  last_charged_block: number | null;
  next_charge_at: string | null;
  created_at: string;
  updated_at: string;
  plan?: {
    name: string;
    price_stx: number;
    interval_blocks: number;
    merchant: {
      display_name: string | null;
      wallet_address: string | null;
    };
  };
}

export function useUserSubscriptions() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["user-subscriptions", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from("subscriptions")
        .select(`
          *,
          plan:subscription_plans(
            name,
            price_stx,
            interval_blocks,
            merchant:profiles!subscription_plans_merchant_id_fkey(
              display_name,
              wallet_address
            )
          )
        `)
        .eq("subscriber_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Subscription[];
    },
    enabled: !!profile?.id,
  });
}

export function usePlanSubscribers(planId: string) {
  return useQuery({
    queryKey: ["plan-subscribers", planId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select(`
          *,
          subscriber:profiles!subscriptions_subscriber_id_fkey(
            display_name,
            wallet_address
          )
        `)
        .eq("plan_id", planId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!planId,
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (planId: string) => {
      if (!profile?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("subscriptions")
        .insert({
          subscriber_id: profile.id,
          plan_id: planId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-subscriptions"] });
      toast.success("Subscribed successfully!");
    },
    onError: (error) => {
      if (error.message.includes("duplicate key")) {
        toast.error("You're already subscribed to this plan");
      } else {
        toast.error(`Subscription failed: ${error.message}`);
      }
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subscriptionId: string) => {
      const { data, error } = await supabase
        .from("subscriptions")
        .update({ status: "cancelled" })
        .eq("id", subscriptionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-subscriptions"] });
      toast.success("Subscription cancelled");
    },
    onError: (error) => {
      toast.error(`Failed to cancel: ${error.message}`);
    },
  });
}
