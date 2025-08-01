export type Role = "owner" | "group" | "public";
export type Perm = "r" | "w" | "x";

export type PermState = Record<Role, Record<Perm, boolean>>;

export type SpecialBits = {
  suid: boolean; // setuid
  sgid: boolean; // setgid
  sticky: boolean; // sticky bit
};

export type OutputOptions = {
  recursive: boolean; // -R
  verbose: boolean; // -v
  changes: boolean; // -c
  silent: boolean; // -f
};
