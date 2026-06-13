"use client";

import { useMemo } from "react";

import { useAuth } from "@/hooks/useAuth";

export function useCredits() {
  const { profile } = useAuth();

  const credits = useMemo(() => profile?.credits ?? 0, [profile?.credits]);

  return {
    credits
  };
}
