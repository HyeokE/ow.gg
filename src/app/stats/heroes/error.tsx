"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

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
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 text-card-foreground">
        <div className="text-sm font-medium text-destructive">Stats</div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">
          영웅 통계 페이지를 표시하지 못했습니다
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          데이터 섹션 오류는 페이지 안에서 처리하지만, 라우트 렌더링 자체가
          실패했습니다.
        </p>
        <Button className="mt-5" onClick={() => unstable_retry()}>
          <RotateCcw data-icon="inline-start" />
          다시 시도
        </Button>
      </div>
    </main>
  );
}
