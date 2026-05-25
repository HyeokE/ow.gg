"use client";

import { useEffect } from "react";
import { RotateCcw, UserX } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function PlayerError({
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
          <UserX aria-hidden="true" className="size-5" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight">
          플레이어 상세를 표시하지 못했습니다
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          플레이어 데이터 요청 중 문제가 발생했습니다.
        </p>
        <Button className="mt-5" onClick={() => unstable_retry()}>
          <RotateCcw aria-hidden="true" />
          다시 시도
        </Button>
      </section>
    </main>
  );
}
