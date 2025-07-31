export type Role = "owner" | "group" | "public";
export type Perm = "r" | "w" | "x";

export type PermState = Record<Role, Record<Perm, boolean>>;

export const defaultPermState: PermState = {
  owner: { r: true, w: false, x: false },
  group: { r: true, w: false, x: false },
  public: { r: false, w: false, x: false },
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
