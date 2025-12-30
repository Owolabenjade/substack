import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface SubscriptionPlan {
  id: string;
  merchant_id: string;
  plan_id_onchain: number | null;
  name: string;
  description: string | null;
  price_stx: number;
  interval_blocks: number;
  category: string;
  features: string[];
  is_active: boolean;
  subscriber_count: number;
  rating: number | null;
  created_at: string;
  updated_at: string;
  merchant?: {
    display_name: string | null;
    wallet_address: string | null;
  };
}

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select(`
          *,
          merchant:profiles!subscription_plans_merchant_id_fkey(
            display_name,
            wallet_address
          )
        `)
        .eq("is_active", true)
        .order("subscriber_count", { ascending: false });

      if (error) throw error;
      return data as SubscriptionPlan[];
    },
  });
}

export function useMerchantPlans() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["merchant-plans", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("merchant_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SubscriptionPlan[];
    },
    enabled: !!profile?.id,
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (plan: {
      name: string;
      description: string;
      price_stx: number;
      interval_blocks: number;
      category: string;
      features: string[];
    }) => {
      if (!profile?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("subscription_plans")
        .insert({
          merchant_id: profile.id,
          ...plan,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchant-plans"] });
      toast.success("Plan created successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to create plan: ${error.message}`);
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<SubscriptionPlan>;
    }) => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchant-plans"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      toast.success("Plan updated successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to update plan: ${error.message}`);
    },
  });
}
