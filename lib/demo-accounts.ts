/** Temporary desk logins — replace before production. */
export const DEMO_ACCOUNTS = [
  {
    id: "nexbit-admin",
    role: "admin" as const,
    name: "Admin",
    email: "admin@nexbit.io",
    password: "NexbitAdmin1",
    usdt: 10_000,
  },
  {
    id: "nexbit-user",
    role: "user" as const,
    name: "Trader",
    email: "user@nexbit.io",
    password: "NexbitUser1",
    usdt: 500,
  },
] as const;
