import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeftIcon,
  BadgeInfoIcon,
  BookOpenIcon,
  ClapperboardIcon,
  HeartPulseIcon,
  MapPinIcon,
  ShieldIcon,
  SparklesIcon,
  SwordsIcon,
} from "lucide-react";

import {
  OverfastApiError,
  type Ability,
  type Hero,
  type HeroKey,
  type HitPoints,
  type Perk,
  type StadiumPower,
  type StoryChapter,
} from "@/lib/overfast";
import { createOverfastServerApi } from "@/lib/overfast/server";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

import {
  DEFAULT_HERO_LOCALE,
  getRoleLabel,
  getSubroleLabel,
} from "./constants";
import { ExternalImage } from "./external-image";

async function getHero(heroKey: string) {
  const api = await createOverfastServerApi();

  try {
    return await api.getHero(heroKey as HeroKey, {
      locale: DEFAULT_HERO_LOCALE,
    });
  } catch (error) {
    if (
      error instanceof OverfastApiError &&
      (error.status === 404 || error.status === 422)
    ) {
      notFound();
    }

    throw error;
  }
}

function getBackgroundUrl(hero: Hero) {
  const backgrounds = hero.backgrounds ?? [];

  return (
    backgrounds.find((background) => background.sizes.includes("xl+"))?.url ??
    backgrounds.find((background) => background.sizes.includes("lg"))?.url ??
    backgrounds.at(-1)?.url ??
    hero.portrait ??
    null
  );
}

function heroHeaderStyle(hero: Hero): CSSProperties | undefined {
  const url = getBackgroundUrl(hero);

  if (!url) {
    return undefined;
  }

  return {
    backgroundImage: `linear-gradient(90deg, rgb(11 15 20 / 0.94) 0%, rgb(11 15 20 / 0.78) 42%, rgb(11 15 20 / 0.32) 100%), url("${url.replaceAll('"', '\\"')}")`,
  };
}

function Section({
  children,
  description,
  icon,
  title,
}: {
  children: ReactNode;
  description?: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <section className="grid gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            {icon}
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          {description ? (
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function InfoTile({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 text-lg font-semibold text-card-foreground">
        {value}
      </div>
    </div>
  );
}

function EmptyPanel({ title }: { title: string }) {
  return (
    <Empty className="min-h-48 border border-dashed">
      <EmptyMedia variant="icon">
        <BadgeInfoIcon aria-hidden="true" />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>OverFast 응답에 해당 데이터가 없습니다.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function HitPointsPanel({ hitpoints }: { hitpoints?: HitPoints | null }) {
  if (!hitpoints) {
    return <InfoTile label="생명력" value="정보 없음" />;
  }

  const segments = [
    {
      label: "생명력",
      value: hitpoints.health,
      className: "bg-emerald-500",
    },
    {
      label: "방어력",
      value: hitpoints.armor,
      className: "bg-amber-500",
    },
    {
      label: "보호막",
      value: hitpoints.shields,
      className: "bg-sky-500",
    },
  ].filter((segment) => segment.value > 0);

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            기본 생명력
          </div>
          <div className="mt-2 text-3xl font-semibold">
            {hitpoints.total.toLocaleString("ko-KR")}
          </div>
        </div>
        <HeartPulseIcon aria-hidden="true" className="size-5 text-primary" />
      </div>
      <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-muted">
        {segments.map((segment) => (
          <div
            className={segment.className}
            key={segment.label}
            style={{ width: `${(segment.value / hitpoints.total) * 100}%` }}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
        {segments.map((segment) => (
          <span key={segment.label}>
            {segment.label} {segment.value.toLocaleString("ko-KR")}
          </span>
        ))}
      </div>
    </div>
  );
}

function HeroHeader({ hero }: { hero: Hero }) {
  return (
    <header
      className="relative isolate overflow-hidden bg-foreground bg-cover bg-center text-background"
      style={heroHeaderStyle(hero)}
    >
      <div className="absolute inset-0 bg-linear-to-t from-black/35 via-transparent to-black/20" />
      <div className="relative mx-auto grid min-h-[520px] w-full max-w-7xl items-end gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8 lg:py-14">
        <div className="max-w-3xl">
          <Link
            className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-background/75 transition-colors hover:text-background"
            href="/heroes"
          >
            <ArrowLeftIcon aria-hidden="true" className="size-4" />
            영웅 목록
          </Link>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-background text-foreground">
              {getRoleLabel(hero.role)}
            </Badge>
            <Badge className="border-background/30 text-background" variant="outline">
              {getSubroleLabel(hero.subrole)}
            </Badge>
          </div>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-7xl">
            {hero.name}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-background/80 sm:text-lg">
            {hero.description || "영웅 설명이 없습니다."}
          </p>
        </div>

        <div className="mx-auto w-full max-w-[330px] self-end">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-background/15 bg-background/10 shadow-2xl backdrop-blur-sm">
            <ExternalImage
              alt={`${hero.name} 초상화`}
              className="absolute inset-0 h-full w-full object-contain object-bottom p-4"
              fetchPriority="high"
              src={hero.portrait}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

function BasicStats({ hero }: { hero: Hero }) {
  return (
    <Section
      description="역할, 생명력, 배경 정보를 한눈에 확인합니다."
      icon={<ShieldIcon aria-hidden="true" className="size-5" />}
      title="기본 스탯"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <HitPointsPanel hitpoints={hero.hitpoints} />
        <InfoTile label="역할" value={getRoleLabel(hero.role)} />
        <InfoTile label="세부 역할" value={getSubroleLabel(hero.subrole)} />
        <InfoTile
          label="출신지"
          value={
            <span className="inline-flex items-center gap-2">
              <MapPinIcon aria-hidden="true" className="size-4" />
              {hero.location || "정보 없음"}
            </span>
          }
        />
        <InfoTile
          label="나이"
          value={hero.age === null ? "정보 없음" : `${hero.age}세`}
        />
        <InfoTile label="생일" value={hero.birthday ?? "정보 없음"} />
      </div>
    </Section>
  );
}

function AbilityCard({ ability }: { ability: Ability }) {
  const videoUrl = ability.video?.link?.mp4 ?? ability.video?.link?.webm;

  return (
    <article className="grid overflow-hidden rounded-lg border bg-card md:grid-cols-[160px_1fr]">
      <div className="relative min-h-40 bg-muted">
        <ExternalImage
          alt={`${ability.name} 영상 썸네일`}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          src={ability.video?.thumbnail}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/55 to-transparent" />
        <ExternalImage
          alt={`${ability.name} 아이콘`}
          className="absolute bottom-3 left-3 size-12 rounded-lg border border-white/20 bg-black/30 p-2"
          loading="lazy"
          src={ability.icon}
        />
      </div>
      <div className="flex flex-col gap-3 p-4">
        <h3 className="text-lg font-semibold">{ability.name}</h3>
        <p className="text-sm leading-6 text-muted-foreground">
          {ability.description || "능력 설명이 없습니다."}
        </p>
        {videoUrl ? (
          <a
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-auto w-fit")}
            href={videoUrl}
            rel="noreferrer"
            target="_blank"
          >
            <ClapperboardIcon aria-hidden="true" />
            영상
          </a>
        ) : null}
      </div>
    </article>
  );
}

function AbilitiesSection({ abilities }: { abilities: Ability[] }) {
  return (
    <Section
      description="영웅의 전투 루프를 구성하는 핵심 능력입니다."
      icon={<SwordsIcon aria-hidden="true" className="size-5" />}
      title="능력"
    >
      {abilities.length === 0 ? (
        <EmptyPanel title="등록된 능력이 없습니다." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {abilities.map((ability) => (
            <AbilityCard ability={ability} key={ability.name} />
          ))}
        </div>
      )}
    </Section>
  );
}

function PerkCard({ perk }: { perk: Perk }) {
  return (
    <article className="flex gap-3 rounded-lg border bg-card p-4">
      <ExternalImage
        alt={`${perk.name} 아이콘`}
        className="size-11 shrink-0 rounded-lg bg-muted p-2"
        loading="lazy"
        src={perk.icon}
      />
      <div>
        <h4 className="font-semibold">{perk.name}</h4>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {perk.description || "perk 설명이 없습니다."}
        </p>
      </div>
    </article>
  );
}

function PerksSection({ hero }: { hero: Hero }) {
  const minor = hero.perks?.minor ?? [];
  const major = hero.perks?.major ?? [];

  return (
    <Section
      description="Minor와 Major perk를 분리해 빌드 선택지를 비교합니다."
      icon={<SparklesIcon aria-hidden="true" className="size-5" />}
      title="Perk"
    >
      {minor.length === 0 && major.length === 0 ? (
        <EmptyPanel title="등록된 perk가 없습니다." />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="grid gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Minor
            </h3>
            {minor.length > 0 ? (
              minor.map((perk) => <PerkCard key={perk.name} perk={perk} />)
            ) : (
              <EmptyPanel title="Minor perk가 없습니다." />
            )}
          </div>
          <div className="grid gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Major
            </h3>
            {major.length > 0 ? (
              major.map((perk) => <PerkCard key={perk.name} perk={perk} />)
            ) : (
              <EmptyPanel title="Major perk가 없습니다." />
            )}
          </div>
        </div>
      )}
    </Section>
  );
}

function StadiumPowerCard({ power }: { power: StadiumPower }) {
  return (
    <article className="rounded-lg border bg-card p-4">
      <ExternalImage
        alt={`${power.name} 아이콘`}
        className="mb-4 size-12 rounded-lg bg-muted p-2"
        loading="lazy"
        src={power.icon}
      />
      <h3 className="font-semibold">{power.name}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {power.description || "스타디움 파워 설명이 없습니다."}
      </p>
    </article>
  );
}

function StadiumPowersSection({
  powers,
}: {
  powers?: StadiumPower[] | null;
}) {
  const items = powers ?? [];

  return (
    <Section
      description="스타디움 모드에서 선택 가능한 강화 효과입니다."
      icon={<BadgeInfoIcon aria-hidden="true" className="size-5" />}
      title="Stadium Powers"
    >
      {items.length === 0 ? (
        <EmptyPanel title="스타디움 파워가 없습니다." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((power) => (
            <StadiumPowerCard key={power.name} power={power} />
          ))}
        </div>
      )}
    </Section>
  );
}

function StoryChapterCard({ chapter }: { chapter: StoryChapter }) {
  return (
    <article className="grid overflow-hidden rounded-lg border bg-card lg:grid-cols-[280px_1fr]">
      <div className="relative min-h-56 bg-muted">
        <ExternalImage
          alt={`${chapter.title} 이미지`}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          src={chapter.picture}
        />
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold">{chapter.title}</h3>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          {chapter.content}
        </p>
      </div>
    </article>
  );
}

function StorySection({ hero }: { hero: Hero }) {
  const story = hero.story;
  const chapters = story?.chapters ?? [];

  return (
    <Section
      description="영웅 배경 서사와 공식 미디어를 확인합니다."
      icon={<BookOpenIcon aria-hidden="true" className="size-5" />}
      title="Story"
    >
      {!story ? (
        <EmptyPanel title="스토리 데이터가 없습니다." />
      ) : (
        <div className="grid gap-5">
          <div className="rounded-lg border bg-card p-5">
            <p className="text-sm leading-7 text-muted-foreground">
              {story.summary || "스토리 요약이 없습니다."}
            </p>
            {story.media?.link ? (
              <a
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4 w-fit")}
                href={story.media.link}
                rel="noreferrer"
                target="_blank"
              >
                <ClapperboardIcon aria-hidden="true" />
                {story.media.type}
              </a>
            ) : null}
          </div>
          {chapters.length > 0 ? (
            <div className="grid gap-4">
              {chapters.map((chapter) => (
                <StoryChapterCard chapter={chapter} key={chapter.title} />
              ))}
            </div>
          ) : (
            <EmptyPanel title="스토리 챕터가 없습니다." />
          )}
        </div>
      )}
    </Section>
  );
}

export async function HeroDetail({ heroKey }: { heroKey: string }) {
  const hero = await getHero(heroKey);

  return (
    <div className="min-h-screen bg-background">
      <HeroHeader hero={hero} />
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-10 sm:px-6 lg:px-8">
        <BasicStats hero={hero} />
        <AbilitiesSection abilities={hero.abilities ?? []} />
        <PerksSection hero={hero} />
        <StadiumPowersSection powers={hero.stadium_powers} />
        <StorySection hero={hero} />
      </div>
    </div>
  );
}
