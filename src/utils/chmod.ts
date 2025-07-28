export type Actor = "owner" | "group" | "public";

export interface PermissionState {
  owner: { r: boolean; w: boolean; x: boolean };
  group: { r: boolean; w: boolean; x: boolean };
  public: { r: boolean; w: boolean; x: boolean };
  suid: boolean;
  sgid: boolean;
  sticky: boolean;
}

export function digitFromBits(r: boolean, w: boolean, x: boolean): number {
  return (r ? 4 : 0) + (w ? 2 : 0) + (x ? 1 : 0);
}

export function bitsFromDigit(d: number): { r: boolean; w: boolean; x: boolean } {
  return {
    r: (d & 4) === 4,
    w: (d & 2) === 2,
    x: (d & 1) === 1,
  };
}

export function clampOctalDigitChar(c: string): boolean {
  return /^[0-7]$/.test(c);
}

export function parseOctalToState(
  octal: string,
  base?: PermissionState
): PermissionState | null {
  const s = octal.trim();
  if (!(s.length === 3 || s.length === 4)) return null;
  for (const ch of s) if (!clampOctalDigitChar(ch)) return null;

  const digits = s.split("").map((c) => parseInt(c, 10));
  const special = s.length === 4 ? digits[0] : 0;
  const [u, g, o] = s.length === 4 ? digits.slice(1) : digits;

  const next: PermissionState = base ?? {
    owner: { r: false, w: false, x: false },
    group: { r: false, w: false, x: false },
    public: { r: false, w: false, x: false },
    suid: false,
    sgid: false,
    sticky: false,
  };

  next.owner = bitsFromDigit(u);
  next.group = bitsFromDigit(g);
  next.public = bitsFromDigit(o);
  next.suid = (special & 4) === 4;
  next.sgid = (special & 2) === 2;
  next.sticky = (special & 1) === 1;
  return next;
}

export function toRWXTriplet(
  r: boolean,
  w: boolean,
  x: boolean,
  special: "suid" | "sgid" | "sticky" | null,
  specialEnabled: boolean
): string {
  const R = r ? "r" : "-";
  const W = w ? "w" : "-";

  if (special === "sticky") {
    const X = x ? (specialEnabled ? "t" : "x") : specialEnabled ? "T" : "-";
    return `${R}${W}${X}`;
  }
  if (special === "suid" || special === "sgid") {
    const X = x ? (specialEnabled ? "s" : "x") : specialEnabled ? "S" : "-";
    return `${R}${W}${X}`;
  }

  return `${R}${W}${x ? "x" : "-"}`;
}

export function toEqualsSymbolic(
  p: PermissionState
): { u: string; g: string; o: string } {
  const u: string[] = [];
  if (p.owner.r) u.push("r");
  if (p.owner.w) u.push("w");
  if (p.owner.x) u.push("x");
  if (p.suid) u.push(p.owner.x ? "s" : "S");

  const g: string[] = [];
  if (p.group.r) g.push("r");
  if (p.group.w) g.push("w");
  if (p.group.x) g.push("x");
  if (p.sgid) g.push(p.group.x ? "s" : "S");

  const o: string[] = [];
  if (p.public.r) o.push("r");
  if (p.public.w) o.push("w");
  if (p.public.x) o.push("x");
  if (p.sticky) o.push(p.public.x ? "t" : "T");

  return {
    u: u.join("") || "",
    g: g.join("") || "",
    o: o.join("") || "",
  };
}

export function usePermissionsInitializer(): PermissionState {
  return {
    owner: { r: true, w: true, x: true },
    group: { r: true, w: false, x: true },
    public: { r: true, w: false, x: true },
    suid: false,
    sgid: false,
    sticky: false,
  };
}
