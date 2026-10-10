import { createFileRoute } from "@tanstack/react-router";
import { cashierSecret } from "@/lib/cashier-api";

function checkAuth(request: Request) {
  const hdr = request.headers.get("authorization") ?? "";
  const token = hdr.replace(/^Bearer\s+/i, "").trim();
  const q = new URL(request.url).searchParams.get("secret") ?? "";
  return token === cashierSecret() || q === cashierSecret();
}

export const Route = createFileRoute("/api/watch")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!checkAuth(request)) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
        const { scanAllDeposits } = await import("@/lib/chain-watch.server");
        const out = await scanAllDeposits();
        return Response.json({ ok: true, ...out });
      },
      POST: async ({ request }) => {
        if (!checkAuth(request)) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
        const { scanAllDeposits } = await import("@/lib/chain-watch.server");
        const out = await scanAllDeposits();
        return Response.json({ ok: true, ...out });
      },
    },
  },
});
