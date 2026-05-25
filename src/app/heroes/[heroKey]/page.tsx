import type { Metadata } from "next";
import { Suspense } from "react";

import { HeroDetail } from "@/components/ow/heroes/hero-detail";
import { HeroDetailSkeleton } from "@/components/ow/heroes/hero-detail-skeleton";

export const revalidate = 3600;

type HeroPageProps = {
  params: Promise<{
    heroKey: string;
  }>;
};

export async function generateMetadata({
  params,
}: HeroPageProps): Promise<Metadata> {
  const { heroKey } = await params;

  return {
    title: `${heroKey} | 영웅 | OW.GG`,
    description: `${heroKey} 영웅 상세 정보`,
  };
}

export default async function HeroPage({ params }: HeroPageProps) {
  const { heroKey } = await params;

  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<HeroDetailSkeleton />} key={heroKey}>
        <HeroDetail heroKey={heroKey} />
      </Suspense>
    </main>
  );
}
