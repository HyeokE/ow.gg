import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";

import type { HeroShort } from "@/lib/overfast";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  getGamemodeLabel,
  getRoleLabel,
  getSubroleLabel,
} from "./constants";
import { ExternalImage } from "./external-image";

type HeroCardProps = {
  hero: HeroShort;
};

export function HeroCard({ hero }: HeroCardProps) {
  return (
    <Link
      className="group block h-full rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      href={`/heroes/${hero.key}`}
    >
      <Card className="h-full rounded-lg border-0 py-0 ring-1 ring-border transition-all duration-200 group-hover:-translate-y-0.5 group-hover:ring-foreground/25">
        <CardContent className="px-0">
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-lg bg-[radial-gradient(circle_at_50%_10%,var(--accent),var(--muted)_58%,var(--background))]">
            <ExternalImage
              alt={`${hero.name} 초상화`}
              className="absolute inset-0 h-full w-full object-contain object-bottom p-4 transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              src={hero.portrait}
            />
            <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-card to-transparent" />
          </div>
        </CardContent>
        <CardHeader className="gap-1 px-4 pb-0">
          <CardTitle className="line-clamp-1 text-lg">{hero.name}</CardTitle>
          <CardDescription className="line-clamp-1">
            {getRoleLabel(hero.role)} · {getSubroleLabel(hero.subrole)}
          </CardDescription>
          <CardAction>
            <Badge variant="secondary">{getRoleLabel(hero.role)}</Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="mt-auto justify-between gap-2 rounded-b-lg bg-muted/35 px-4 py-3">
          <div className="flex flex-wrap gap-1">
            {hero.gamemodes.map((mode) => (
              <Badge key={mode} variant="outline">
                {getGamemodeLabel(mode)}
              </Badge>
            ))}
          </div>
          <ArrowUpRightIcon
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
          />
        </CardFooter>
      </Card>
    </Link>
  );
}

