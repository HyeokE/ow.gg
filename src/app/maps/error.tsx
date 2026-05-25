"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function MapsError({
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
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <Alert className="max-w-xl">
        <AlertTitle>Maps could not be loaded</AlertTitle>
        <AlertDescription className="mt-2">
          The map data request failed. Retry the route segment to request the
          latest cached OverFast response again.
        </AlertDescription>
        <div className="mt-5">
          <Button onClick={() => unstable_retry()}>
            <RotateCcw data-icon="inline-start" />
            Retry
          </Button>
        </div>
      </Alert>
    </main>
  );
}
