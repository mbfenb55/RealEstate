"use client";

import { useCallback, useEffect, useState } from "react";

import { sampleShoots } from "@/lib/utils";
import type { ShootRecord } from "@/types";

export function useShoots() {
  const [shoots, setShoots] = useState<ShootRecord[]>(sampleShoots);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShoots = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/cekim", {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("Çekim verileri alınamadı.");
      }

      const data = (await response.json()) as { items?: ShootRecord[] };
      setShoots(data.items?.length ? data.items : sampleShoots);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bilinmeyen hata");
      setShoots(sampleShoots);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchShoots();
  }, [fetchShoots]);

  return {
    shoots,
    loading,
    error,
    refetch: fetchShoots
  };
}
