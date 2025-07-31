export type Role = "owner" | "group" | "public";
export type Perm = "r" | "w" | "x";

export type PermState = Record<Role, Record<Perm, boolean>>;

export type SpecialBits = {
  suid: boolean; // setuid
  sgid: boolean; // setgid
  sticky: boolean; // sticky bit
};

export const defaultPermState: PermState = {
  owner: { r: true, w: false, x: false },
  group: { r: true, w: false, x: false },
  public: { r: false, w: false, x: false },
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
    reset,
    denyAll,
    toggle,
    toggleRow,
    toggleCol,
  };
}
