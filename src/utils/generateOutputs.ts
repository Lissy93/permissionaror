// Import types for permissions and special bits
import type { PermState, SpecialBits, OutputOptions } from "./permissions.ts";

/**
 * Generates chmod outputs based on the current permission state and special bits.
 * @param state - The current permission state.
 * @param specialBits - The special bits (suid, sgid, sticky).
 * @returns An object containing the octal and symbolic representations.
 */
export function generateChmodOutputs(
  state: PermState,
  specialBits: SpecialBits = {},
  outputOptions: OutputOptions = {},
  filename: string = "",
) {
  const roles = ["owner", "group", "public"] as const;
  const perms = ["r", "w", "x"] as const;
  const bitValues = { r: 4, w: 2, x: 1 };

  // Get octal value for each role (owner/group/public)
  function getOctalDigit(role: typeof roles[number]) {
    return perms.reduce((acc, p) => acc + (state[role][p] ? bitValues[p] : 0), 0);
  }

  // Special bits → first octal digit
  function getSpecialBitsOctal(bits: SpecialBits) {
    let value = 0;
    if (bits.suid) value += 4;
    if (bits.sgid) value += 2;
    if (bits.sticky) value += 1;
    return value;
  }

  // Generate base octal
  const ownerOct = getOctalDigit("owner");
  const groupOct = getOctalDigit("group");
  const publicOct = getOctalDigit("public");

  // Octal with special bits
  const specialOct = getSpecialBitsOctal(specialBits);
  const octal3 = `${ownerOct}${groupOct}${publicOct}`;
  const octal4 = `${specialOct}${octal3}`;

  // Build symbolic representation
  let symbolic = `-${roles.map(r =>
    perms.map(p => state[r][p] ? p : "-").join("")
  ).join("")}`;

  // Replace execute bits with s/t where special bits apply
  const symbolicArr = symbolic.split("");

  // setuid → replace owner's execute (index 3)
  if (specialBits?.suid) {
    symbolicArr[3] = state.owner.x ? "s" : "S";
  }
  // setgid → replace group's execute (index 6)
  if (specialBits?.sgid) {
    symbolicArr[6] = state.group.x ? "s" : "S";
  }
  // sticky → replace other's execute (index 9)
  if (specialBits?.sticky) {
    symbolicArr[9] = state.public.x ? "t" : "T";
  }
  symbolic = symbolicArr.join("");

  // Symbolic (equals form)
  const symbolicEquals = roles.map((r, i) => {
    const permsStr = perms.map(p => state[r][p] ? p : "").join("");
    // Append s/t to symbolic equals when special bits apply
    let finalPerms = permsStr;
    if (i === 0 && specialBits.suid) finalPerms += "s";
    if (i === 1 && specialBits.sgid) finalPerms += "s";
    if (i === 2 && specialBits.sticky) finalPerms += "t";
    return `${"ugo"[i]}=${finalPerms}`;
  }).join(",");

  const selectedFlats = [];
  if (outputOptions.recursive) selectedFlats.push("R");
  if (outputOptions.verbose) selectedFlats.push("v");
  if (outputOptions.changes) selectedFlats.push("c");
  if (outputOptions.silent) selectedFlats.push("f");

  const flags = selectedFlats.length ? '-' + selectedFlats.join("") : "";

  const target = filename || "file.txt";

  return {
    octal3,
    octal4,
    symbolic,
    symbolicEquals,
    flags,
    target,
  };
}
