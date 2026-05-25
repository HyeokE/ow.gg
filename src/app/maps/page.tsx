import type { Metadata } from "next";
import { Suspense } from "react";

import {
  MapsExplorer,
  MapsExplorerSkeleton,
} from "@/components/ow/maps/maps-explorer";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Overwatch Maps",
  description: "Browse Overwatch maps by game mode and search.",
};

type MapsPageProps = {
  searchParams: Promise<{
    gamemode?: string | string[];
    search?: string | string[];
  }>;
};

export default function MapsPage({ searchParams }: MapsPageProps) {
  return (
    <main className="min-h-dvh bg-background">
      <section className="border-b bg-muted/30">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-brand-orange">Maps</p>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <h1 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
                  Overwatch map atlas
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                  Filter battlefields by game mode, search by map or location,
                  and scan screenshots without leaving the server-rendered flow.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                <div className="rounded-lg border bg-background px-4 py-3">
                  <p className="text-xs text-muted-foreground">Source</p>
                  <p className="mt-1 font-medium">OverFast API</p>
                </div>
                <div className="rounded-lg border bg-background px-4 py-3">
                  <p className="text-xs text-muted-foreground">Cache</p>
                  <p className="mt-1 font-medium">ISR 24h</p>
                </div>
                <div className="rounded-lg border bg-background px-4 py-3 max-sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Navigation</p>
                  <p className="mt-1 font-medium">Links + GET</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Suspense fallback={<MapsExplorerSkeleton />}>
        <MapsExplorer searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
