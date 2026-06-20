'use client';

import { RetryableErrorView } from "@/components/errors/RetryableErrorView";

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return <RetryableErrorView error={error} reset={reset} title="Bir hata olustu" />;
}
