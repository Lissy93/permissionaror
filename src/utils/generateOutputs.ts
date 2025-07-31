import type { PermState } from "./permissions.ts";

export function generateChmodOutputs(state: PermState) {
  const roles = ["owner", "group", "public"] as const;
  const perms = ["r", "w", "x"] as const;

  const bitValues = { r: 4, w: 2, x: 1 };

  function getOctalDigit(role: typeof roles[number]) {
    return perms.reduce((acc, p) => acc + (state[role][p] ? bitValues[p] : 0), 0);
  }

  const octal3 = roles.map(getOctalDigit).join("");
  const specialBits =
    (state.owner.x && state.group.x && state.public.x ? 1 : 0) * 1000; // Example
  const octal4 = (specialBits + parseInt(octal3, 10)).toString();

  const symbolic = `-${roles.map(r =>
    perms.map(p => state[r][p] ? p : "-").join("")
  ).join("")}`;

  const symbolicEquals = roles.map((r, i) =>
    `${"ugo"[i]}=${perms.map(p => state[r][p] ? p : "").join("")}`
  ).join(",");

  return {
    octal3,
    octal4,
    symbolic,
    symbolicEquals
  };
}
