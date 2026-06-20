'use client';

import { RetryableErrorView } from "@/components/errors/RetryableErrorView";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return <RetryableErrorView error={error} reset={reset} title="Beklenmedik bir hata olustu" fullScreen />;
}
