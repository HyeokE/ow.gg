import type { HeroGamemode, Locale, Role, SubRole } from "@/lib/overfast";

export const DEFAULT_HERO_LOCALE = "ko-kr" satisfies Locale;
export const HEROES_REVALIDATE_SECONDS = 60 * 60;

export const ROLE_OPTIONS = [
  { key: "tank", label: "돌격" },
  { key: "damage", label: "공격" },
  { key: "support", label: "지원" },
] as const satisfies readonly { key: Role; label: string }[];

export const GAMEMODE_OPTIONS = [
  { key: "quickplay", label: "빠른 대전" },
  { key: "stadium", label: "스타디움" },
] as const satisfies readonly { key: HeroGamemode; label: string }[];

const SUBROLE_LABELS = {
  flanker: "플랭커",
  recon: "정찰",
  sharpshooter: "저격",
  specialist: "전문가",
  medic: "치유",
  survivor: "생존",
  tactician: "전술",
  bruiser: "브루저",
  initiator: "개시",
  stalwart: "수비",
} as const satisfies Record<SubRole, string>;

export function getRoleLabel(role: Role | string | null | undefined) {
  return ROLE_OPTIONS.find((option) => option.key === role)?.label ?? "역할";
}

export function getGamemodeLabel(
  gamemode: HeroGamemode | string | null | undefined
) {
  return (
    GAMEMODE_OPTIONS.find((option) => option.key === gamemode)?.label ??
    "게임 모드"
  );
}

export function getSubroleLabel(subrole: SubRole | string | null | undefined) {
  if (!subrole) {
    return "세부 역할 없음";
  }

  return SUBROLE_LABELS[subrole as SubRole] ?? subrole;
}

