import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

export default function HeroNotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-12">
      <section className="w-full max-w-md rounded-lg border bg-card p-6 text-card-foreground shadow-xs">
        <h1 className="text-xl font-semibold tracking-tight">
          영웅을 찾을 수 없습니다.
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          OverFast에 등록되지 않았거나 아직 공개되지 않은 영웅입니다.
        </p>
        <Link
          className={buttonVariants({ className: "mt-5", variant: "outline" })}
          href="/heroes"
        >
          <ArrowLeftIcon aria-hidden="true" />
          영웅 목록
        </Link>
      </section>
    </main>
  );
}

