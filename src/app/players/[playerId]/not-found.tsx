import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

export default function PlayerNotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-12">
      <section className="w-full max-w-md rounded-lg border bg-card p-6 text-card-foreground shadow-xs">
        <h1 className="text-xl font-semibold tracking-tight">
          플레이어를 찾을 수 없습니다
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          OverFast에 검색되지 않았거나 프로필 정보를 가져올 수 없습니다.
        </p>
        <Link
          className={buttonVariants({ className: "mt-5", variant: "outline" })}
          href="/players"
        >
          <ArrowLeft aria-hidden="true" />
          플레이어 검색
        </Link>
      </section>
    </main>
  );
}
