import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Lead = Database["public"]["Tables"]["leads"]["Row"];

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchLeads() {
    setLoading(true);
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) {
      setError(error.message);
      setLeads([]);
    } else {
      setLeads(data ?? []);
      setError(null);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchLeads();
    // realtime updates
    const channel = supabase
      .channel("leads-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leads" },
        () => fetchLeads(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updateStatus(id: string, status: Lead["status"]) {
    const prev = leads;
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l)));
    const { error } = await supabase.from("leads").update({ status }).eq("id", id);
    if (error) {
      setLeads(prev);
      throw new Error(error.message);
    }
  }

  return { leads, loading, error, refetch: fetchLeads, updateStatus };
}
