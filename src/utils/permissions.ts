import { Role, Perm, PermState, SpecialBits, OutputOptions } from "./permission.types";

export const defaultPermState: PermState = {
  owner: { r: true, w: true, x: false },
  group: { r: true, w: false, x: false },
  public: { r: true, w: false, x: false },
};

export const defaultSpecialBits: SpecialBits = {
  suid: false,
  sgid: false,
  sticky: false
};

export function isRowSelected(permState: PermState, role: Role, permissions: Perm[]): boolean {
  return permissions.every(perm => permState[role][perm]);
}

export function isColSelected(permState: PermState, perm: Perm, roles: Role[]): boolean {
  return roles.every(role => permState[role][perm]);
}

export function setColumn(state: PermState, perm: Perm, value: boolean): PermState {
  const result: PermState = { ...state };
  for (const role of Object.keys(state) as Role[]) {
    result[role] = { ...state[role], [perm]: value };
  }
  return result;
}

export function setRow(state: PermState, role: Role, value: boolean): PermState {
  return {
    ...state,
    [role]: {
      r: value,
      w: value,
      x: value,
    },
  };
}

export function denyAll(): PermState {
  return {
    owner: { r: false, w: false, x: false },
    group: { r: false, w: false, x: false },
    public: { r: false, w: false, x: false },
  };
}

export function toggleSpecialBit(bits: SpecialBits, key: keyof SpecialBits): SpecialBits {
  return { ...bits, [key]: !bits[key] };
}

export function setSpecialBit(bits: SpecialBits, key: keyof SpecialBits, value: boolean): SpecialBits {
  return { ...bits, [key]: value };
}

function specialBitsToOctal(bits: SpecialBits) {
  let val = 0;
  if (bits.suid) val += 4;
  if (bits.sgid) val += 2;
  if (bits.sticky) val += 1;
  return val;
}

function specialBitsToSymbolic(bits: SpecialBits, symbolic: string) {
  let chars = symbolic.split("");

  if (bits.suid) chars[3] = chars[3] === "x" ? "s" : "S";
  if (bits.sgid) chars[6] = chars[6] === "x" ? "s" : "S";
  if (bits.sticky) chars[9] = chars[9] === "x" ? "t" : "T";

  return chars.join("");
}


export function createPermissionStore(initial: PermState = defaultPermState) {
  let state: PermState = structuredClone(initial);

  function get() {
    return structuredClone(state);
  }

  function set(newState: PermState) {
    state = structuredClone(newState);
    return get();
  }

  function reset() {
    state = structuredClone(defaultPermState);
    return get();
  }

  function denyAll() {
    state = {
      owner: { r: false, w: false, x: false },
      group: { r: false, w: false, x: false },
      public: { r: false, w: false, x: false },
    };
    return get();
  }

  function toggle(role: Role, perm: Perm, value: boolean) {
    state = {
      ...state,
      [role]: { ...state[role], [perm]: value }
    };
    return get();
  }

  function toggleRow(role: Role, permissions: Perm[]) {
    const shouldSelect = !isRowSelected(state, role, permissions);
    state = setRow(state, role, shouldSelect);
    return get();
  }

  function toggleCol(perm: Perm, roles: Role[]) {
    const shouldSelect = !isColSelected(state, perm, roles);
    state = setColumn(state, perm, shouldSelect);
    return get();
  }

  return {
    get,
    set,
    reset,
    denyAll,
    toggle,
    toggleRow,
    toggleCol,
  };
}

export const presets: Record<string, PermState> = {
  "600": { owner: { r: true, w: true, x: false }, group: { r: false, w: false, x: false }, public: { r: false, w: false, x: false } },
  "644": { owner: { r: true, w: true, x: false }, group: { r: true, w: false, x: false }, public: { r: true, w: false, x: false } },
  "700": { owner: { r: true, w: true, x: true }, group: { r: false, w: false, x: false }, public: { r: false, w: false, x: false } },
  "744": { owner: { r: true, w: true, x: true }, group: { r: true, w: false, x: false }, public: { r: true, w: false, x: false } },
  "755": { owner: { r: true, w: true, x: true }, group: { r: true, w: false, x: true }, public: { r: true, w: false, x: true } },
  "775": { owner: { r: true, w: true, x: true }, group: { r: true, w: true, x: true }, public: { r: true, w: false, x: true } },
  "777": { owner: { r: true, w: true, x: true }, group: { r: true, w: true, x: true }, public: { r: true, w: true, x: true } },
  "000": { owner: { r: false, w: false, x: false }, group: { r: false, w: false, x: false }, public: { r: false, w: false, x: false } },
};

export function setFromPreset(state: PermState, preset: string): PermState {
  return presets[preset] ? structuredClone(presets[preset]) : state;
}

export function matchPreset(state: PermState): string | null {
  for (const [key, value] of Object.entries(presets)) {
    if (JSON.stringify(state) === JSON.stringify(value)) {
      return key;
    }
  }
  return null;
}

export function fromOctal(octal: string): PermState | null {
  const match = octal.trim().match(/^[0-7]{3,4}$/);
  if (!match) return null;

  let oct = octal.length === 4 ? octal.slice(1) : octal; // strip special bits if present
  const roles: Role[] = ["owner", "group", "public"];
  const perms: Perm[] = ["r", "w", "x"];

  const newState: PermState = {
    owner: { r: false, w: false, x: false },
    group: { r: false, w: false, x: false },
    public: { r: false, w: false, x: false },
  };

  roles.forEach((role, i) => {
    const digit = parseInt(oct[i], 10);
    perms.forEach((p, bitIndex) => {
      const bitValue = [4, 2, 1][bitIndex];
      newState[role][p] = (digit & bitValue) !== 0;
    });
  });

  return newState;
}

export function validateOctal(octal: string): boolean {
  return /^[0-7]{3,4}$/.test(octal.trim());
}


export function generatePermissionExplanation(
  state: PermState,
  t: (key: string) => string
) {
  const roles: Role[] = ["owner", "group", "public"];
  const perms: Perm[] = ["r", "w", "x"];
  const bitValues = { r: 4, w: 2, x: 1 };

  const getOctalDigit = (role: Role) =>
    perms.reduce((acc, p) => acc + (state[role][p] ? bitValues[p] : 0), 0);

  const joinPerms = (pList: Perm[]) =>
    pList.length
      ? pList.map(p => t(`explain.permissions.${p}`)).join(` ${t("explain.explanation.and")} `)
      : t("explain.permissions.none");

  const octal3 = roles.map(getOctalDigit).join("");
  const customKey = `customExplanations.${octal3}`;
  const custom = t(customKey);

  if (custom && custom !== customKey && custom.length) return [custom];

  const permsForRole = (role: Role) => ({
    allowed: perms.filter(p => state[role][p]),
    denied: perms.filter(p => !state[role][p])
  });

  // --- Special case: only one role has permissions ---
  const roleAccessCount = roles.map(r => perms.some(p => state[r][p]));
  if (roleAccessCount.filter(Boolean).length === 1) {
    const r = roles[roleAccessCount.indexOf(true)];
    const { allowed, denied } = permsForRole(r);
    return [
      `${t(`explain.roles.${r}`)} ${t("explain.explanation.can")} ${joinPerms(allowed)}, ` +
      `${t("explain.explanation.butNot")} ${joinPerms(denied)}; ${t("explain.explanation.noAccessForOthers")}.`
    ];
  }

  // --- Special case: all roles have the same permissions ---
  if (roles.every(r => JSON.stringify(state[r]) === JSON.stringify(state[roles[0]]))) {
    const { allowed, denied } = permsForRole(roles[0]);
    return [
      `${t("explain.everyone")} ${allowed.length
        ? `${t("explain.explanation.can")} ${joinPerms(allowed)}, ${t("explain.explanation.butNot")} ${joinPerms(denied)}`
        : t("explain.explanation.cannotDoAnything")}.`
    ];
  }

  // --- Default: per-role explanation ---
  return roles.map(role => {
    const { allowed, denied } = permsForRole(role);

    let sentence = `${t(`explain.roles.${role}`)} ` +
      (allowed.length
        ? `${t("explain.explanation.can")} ${joinPerms(allowed)}`
        : `${t("explain.explanation.cannot")} ${joinPerms(perms)}`);

    if (allowed.length && denied.length) {
      sentence += `, ${t("explain.explanation.butNot")} ${joinPerms(denied)}`;
    }

    return sentence + ".";
  });
}



