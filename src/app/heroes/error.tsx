"use client";

import { useEffect } from "react";
import { AlertTriangleIcon, RotateCcwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function HeroesError({
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
    <main className="grid min-h-screen place-items-center bg-background px-4 py-12">
      <section className="w-full max-w-md rounded-lg border bg-card p-6 text-card-foreground shadow-xs">
        <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
          <AlertTriangleIcon aria-hidden="true" className="size-5" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight">
          영웅 페이지를 표시하지 못했습니다.
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          일시적인 데이터 요청 오류이거나 예상하지 못한 렌더링 오류입니다.
        </p>
        <Button className="mt-5" onClick={() => unstable_retry()}>
          <RotateCcwIcon aria-hidden="true" />
          다시 시도
        </Button>
      </section>
    </main>
  );
}

