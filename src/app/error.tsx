"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-3xl flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">페이지를 불러오지 못했습니다.</h1>
        <p className="text-sm text-muted-foreground">
          일시적인 데이터 오류일 수 있습니다. 다시 시도해 주세요.
        </p>
      </div>
      <Button onClick={() => unstable_retry()}>다시 시도</Button>
    </main>
  );
}
