import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface VaultAuthorization {
  id: string;
  subscriber_id: string;
  merchant_id: string;
  max_per_period: number;
  period_length_blocks: number;
  spent_this_period: number;
  period_start_block: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  merchant?: {
    display_name: string | null;
    wallet_address: string | null;
  };
}

export function useUserAuthorizations() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["user-authorizations", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from("vault_authorizations")
        .select(`
          *,
          merchant:profiles!vault_authorizations_merchant_id_fkey(
            display_name,
            wallet_address
          )
        `)
        .eq("subscriber_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as VaultAuthorization[];
    },
    enabled: !!profile?.id,
  });
}

export function useCreateAuthorization() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (auth: {
      merchant_id: string;
      max_per_period: number;
      period_length_blocks: number;
    }) => {
      if (!profile?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("vault_authorizations")
        .insert({
          subscriber_id: profile.id,
          ...auth,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-authorizations"] });
      toast.success("Authorization created!");
    },
    onError: (error) => {
      toast.error(`Failed to create authorization: ${error.message}`);
    },
  });
}

export function useRevokeAuthorization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (authId: string) => {
      const { data, error } = await supabase
        .from("vault_authorizations")
        .update({ is_active: false })
        .eq("id", authId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-authorizations"] });
      toast.success("Authorization revoked!");
    },
    onError: (error) => {
      toast.error(`Failed to revoke: ${error.message}`);
    },
  });
}
