import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser } from "@/lib/auth/verify.server";
import { loadUserWallets } from "@/lib/cashier-api";

export const Route = createFileRoute("/api/wallets")({
  server: {
    handlers: {
      GET: async () => {
        const user = await getSessionUser();
        if (!user) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
        const wallets = await loadUserWallets(user.id);
        return Response.json({ ok: true, ...wallets });
      },
    },
  },
});
