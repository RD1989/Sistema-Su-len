import { useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Lead } from "@/lib/kanban";

export const ADMIN_LEADS_QUERY_KEY = ["admin", "leads"] as const;

const PAGE_SIZE = 1000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isTransientError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error ?? "");
  const m = message.toLowerCase();
  return ["failed to fetch", "network", "timeout", "timed out", "503", "502", "504", "aborted"].some((s) =>
    m.includes(s),
  );
};

async function fetchLeadsPage(from: number, to: number) {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;
  return data ?? [];
}

export async function fetchAdminLeads(): Promise<Lead[]> {
  const delays = [0, 500, 1200, 2500];
  let lastError: unknown = null;

  for (let attempt = 0; attempt < delays.length; attempt++) {
    if (delays[attempt] > 0) await sleep(delays[attempt]);
    try {
      const all: Lead[] = [];
      for (let page = 0; page < 20; page++) {
        const from = page * PAGE_SIZE;
        const rows = await fetchLeadsPage(from, from + PAGE_SIZE - 1);
        all.push(...rows);
        if (rows.length < PAGE_SIZE) break;
      }
      return all;
    } catch (error) {
      lastError = error;
      if (!isTransientError(error)) break;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Não foi possível carregar os leads");
}

type LeadUpdater = Lead[] | ((previous: Lead[]) => Lead[]);

export function useAdminLeads({ enabled = true }: { enabled?: boolean } = {}) {
  const queryClient = useQueryClient();
  const [syncing, setSyncing] = useState(false);

  const query = useQuery({
    queryKey: ADMIN_LEADS_QUERY_KEY,
    queryFn: fetchAdminLeads,
    enabled,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const setLeads = useCallback(
    (updater: LeadUpdater) => {
      queryClient.setQueryData<Lead[]>(ADMIN_LEADS_QUERY_KEY, (current = []) =>
        typeof updater === "function" ? updater(current) : updater,
      );
    },
    [queryClient],
  );

  const refresh = useCallback(
    async ({
      showToast = false,
      successMessage = "Leads atualizados",
      errorMessage = "Erro ao carregar leads",
    }: { showToast?: boolean; successMessage?: string; errorMessage?: string } = {}) => {
      if (showToast) setSyncing(true);
      try {
        const result = await query.refetch({ throwOnError: true });
        if (result.error) throw result.error;
        if (showToast) toast.success(successMessage);
      } catch (error) {
        console.error("[admin-leads] fetch failed", error);
        if (showToast || !query.data?.length) toast.error(errorMessage);
      } finally {
        if (showToast) setSyncing(false);
      }
    },
    [query],
  );

  return {
    leads: query.data ?? [],
    loading: enabled && query.isLoading,
    fetching: query.isFetching,
    syncing,
    error: query.error,
    refresh,
    setLeads,
  };
}

export function useAdminLeadsRealtime(enabled: boolean) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel("admin-leads-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, (payload) => {
        queryClient.setQueryData<Lead[]>(ADMIN_LEADS_QUERY_KEY, (current = []) => {
          if (payload.eventType === "INSERT") {
            const next = payload.new as Lead;
            return [next, ...current.filter((lead) => lead.id !== next.id)].sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
            );
          }

          if (payload.eventType === "UPDATE") {
            const next = payload.new as Lead;
            return current.map((lead) => (lead.id === next.id ? next : lead));
          }

          if (payload.eventType === "DELETE") {
            const previous = payload.old as Partial<Lead>;
            return current.filter((lead) => lead.id !== previous.id);
          }

          return current;
        });
      })
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          queryClient.invalidateQueries({ queryKey: ADMIN_LEADS_QUERY_KEY });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, queryClient]);
}