import Link from "next/link";
import { BarChart3, MapIcon, Search, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/heroes", label: "히어로", icon: Shield },
  { href: "/stats/heroes", label: "통계", icon: BarChart3 },
  { href: "/players", label: "플레이어", icon: Search },
  { href: "/maps", label: "맵", icon: MapIcon },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            OW
          </span>
          <span>ow.gg</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Button
              key={item.href}
              nativeButton={false}
              render={<Link href={item.href} />}
              size="sm"
              variant="ghost"
            >
              <item.icon className="size-4" />
              {item.label}
            </Button>
          ))}
        </nav>
      </div>
    </header>
  );
}
