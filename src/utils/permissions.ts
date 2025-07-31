export type Role = "owner" | "group" | "public";
export type Perm = "r" | "w" | "x";

export type PermState = Record<Role, Record<Perm, boolean>>;

export const defaultPermState: PermState = {
  owner: { r: true, w: false, x: false },
  group: { r: true, w: false, x: false },
  public: { r: false, w: false, x: false },
};

export function toggle(state: PermState, role: Role, perm: Perm): PermState {
  return {
    ...state,
    [role]: {
      ...state[role],
      [perm]: !state[role][perm],
    },
  };
}

export function setColumn(state: PermState, perm: Perm, value: boolean): PermState {
  const result = { ...state };
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

export function allRowSelected(state: PermState, role: Role): boolean {
  return Object.values(state[role]).every(Boolean);
}

export function allColSelected(state: PermState, perm: Perm): boolean {
  return Object.values(state).every(role => role[perm]);
}

export function denyAll(): PermState {
  return {
    owner: { r: false, w: false, x: false },
    group: { r: false, w: false, x: false },
    public: { r: false, w: false, x: false },
  };
}

// utils/permissions.js
export function isRowSelected(permState, role, permissions) {
  return permissions.every(perm => permState[role][perm]);
}

export function isColSelected(permState, perm, roles) {
  return roles.every(role => permState[role][perm]);
}

export function toggleRow(permState, role, permissions) {
  const shouldSelect = !isRowSelected(permState, role, permissions);
  for (const perm of permissions) {
    permState[role][perm] = shouldSelect;
  }
}

export function toggleCol(permState, perm, roles) {
  const shouldSelect = !isColSelected(permState, perm, roles);
  for (const role of roles) {
    permState[role][perm] = shouldSelect;
  }
}

