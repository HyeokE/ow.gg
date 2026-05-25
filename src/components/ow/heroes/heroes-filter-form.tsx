import Link from "next/link";
import { SearchIcon, SlidersHorizontalIcon, XIcon } from "lucide-react";

import type { Role } from "@/lib/overfast";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { cn } from "@/lib/utils";

import { GAMEMODE_OPTIONS, ROLE_OPTIONS } from "./constants";
import type { HeroFilters } from "./filters";

export type RoleFilterOption = {
  key: Role;
  label: string;
};

type HeroesFilterFormProps = {
  filters: HeroFilters;
  resultCount: number;
  roleOptions?: readonly RoleFilterOption[];
  totalCount: number;
};

export function HeroesFilterForm({
  filters,
  resultCount,
  roleOptions = ROLE_OPTIONS,
  totalCount,
}: HeroesFilterFormProps) {
  const hasActiveFilters = Boolean(
    filters.role || filters.gamemode || filters.q
  );

  return (
    <section className="border-b bg-background/95">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              영웅
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {resultCount.toLocaleString("ko-KR")}명 표시
              {resultCount !== totalCount
                ? ` · 검색 전 ${totalCount.toLocaleString("ko-KR")}명`
                : ""}
            </p>
          </div>
          <div className="text-xs font-medium text-muted-foreground">
            locale: ko-kr
          </div>
        </div>

        <form
          action="/heroes"
          className="grid gap-3 rounded-lg border bg-card p-3 shadow-xs sm:grid-cols-[minmax(220px,1fr)_160px_160px_auto_auto] sm:items-end"
        >
          <label className="grid gap-1.5 text-sm font-medium" htmlFor="q">
            검색
            <span className="relative">
              <SearchIcon
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                className="pl-8"
                defaultValue={filters.q}
                id="q"
                maxLength={80}
                name="q"
                placeholder="영웅 이름, 키, 역할"
                type="search"
              />
            </span>
          </label>

          <label className="grid gap-1.5 text-sm font-medium" htmlFor="role">
            역할
            <NativeSelect
              className="w-full"
              defaultValue={filters.role ?? ""}
              id="role"
              name="role"
            >
              <NativeSelectOption value="">전체 역할</NativeSelectOption>
              {roleOptions.map((role) => (
                <NativeSelectOption key={role.key} value={role.key}>
                  {role.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </label>

          <label
            className="grid gap-1.5 text-sm font-medium"
            htmlFor="gamemode"
          >
            게임 모드
            <NativeSelect
              className="w-full"
              defaultValue={filters.gamemode ?? ""}
              id="gamemode"
              name="gamemode"
            >
              <NativeSelectOption value="">전체 모드</NativeSelectOption>
              {GAMEMODE_OPTIONS.map((mode) => (
                <NativeSelectOption key={mode.key} value={mode.key}>
                  {mode.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </label>

          <Button className="w-full sm:w-auto" type="submit">
            <SlidersHorizontalIcon aria-hidden="true" />
            적용
          </Button>

          <Link
            aria-disabled={!hasActiveFilters}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "w-full sm:w-auto",
              !hasActiveFilters && "pointer-events-none opacity-50"
            )}
            href="/heroes"
          >
            <XIcon aria-hidden="true" />
            초기화
          </Link>
        </form>
      </div>
    </section>
  );
}
