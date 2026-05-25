import { MapsExplorerSkeleton } from "@/components/ow/maps/maps-explorer";

export default function MapsLoading() {
  return (
    <main className="min-h-dvh bg-background">
      <section className="border-b bg-muted/30">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-10 sm:px-6 lg:px-8">
          <div className="h-4 w-16 rounded-md bg-brand-orange/30" />
          <div className="h-10 w-full max-w-xl rounded-md bg-muted" />
          <div className="h-5 w-full max-w-2xl rounded-md bg-muted" />
        </div>
      </section>
      <MapsExplorerSkeleton />
    </main>
  );
}
