import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";
import { cashierSecret, creditUser, listNewCustodianWallets, markWalletImported } from "@/lib/cashier-api";
import { CASH_ASSETS } from "@/lib/cashier";

function unauthorized() {
  return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
}

function checkAuth(request: Request) {
  const hdr = request.headers.get("authorization") ?? "";
  const token = hdr.replace(/^Bearer\s+/i, "").trim();
  const q = new URL(request.url).searchParams.get("secret") ?? "";
  return token === cashierSecret() || q === cashierSecret();
}

export const Route = createFileRoute("/api/cashier")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!checkAuth(request)) return unauthorized();
        const sql = await getSql();
        const op = new URL(request.url).searchParams.get("op") ?? "pending";
        if (op === "assets") return Response.json({ ok: true, assets: CASH_ASSETS });
        if (op === "wallets") {
          const wallets = await listNewCustodianWallets().catch(() => []);
          return Response.json({ ok: true, wallets });
        }
        const needed = await sql<{
          user_id: string;
          asset: string;
          network: string;
          email: string | null;
        }>`
          select a.user_id, a.asset, a.network, u."email" as email
          from deposit_addresses a
          left join "user" u on u."id" = a.user_id
          where a.source = 'pending' or a.address like 'pending:%'
        `;
        const withdrawals = await sql<{
          id: string;
          user_id: string;
          asset: string;
          network: string;
          amount: number;
          fee: number;
          address: string;
          memo: string | null;
          email: string | null;
        }>`
          select w.id, w.user_id, w.asset, w.network, w.amount, w.fee, w.address, w.memo, u."email" as email
          from cash_withdrawals w
          left join "user" u on u."id" = w.user_id
          where w.status = 'pending'
          order by w.created_at asc
        `;
        return Response.json({
          ok: true,
          provisions: needed,
          withdrawals,
        });
      },
      POST: async ({ request }) => {
        if (!checkAuth(request)) return unauthorized();
        const body = (await request.json()) as Record<string, unknown>;
        const op = String(body.op ?? "");
        const sql = await getSql();

        if (op === "address") {
          const userId = String(body.userId ?? "");
          const asset = String(body.asset ?? "USDT");
          const network = String(body.network ?? "TRC20");
          const address = String(body.address ?? "").trim();
          const memo = body.memo ? String(body.memo) : null;
          if (!userId || !address) return Response.json({ ok: false, error: "userId and address required" }, { status: 400 });
          await sql`
            insert into deposit_addresses (id, user_id, asset, network, address, memo, source)
            values (${`addr_${Date.now().toString(36)}`}, ${userId}, ${asset}, ${network}, ${address}, ${memo}, ${"engine"})
            on conflict (user_id, asset, network)
            do update set address = excluded.address, memo = excluded.memo, source = 'engine'
          `;
          return Response.json({ ok: true });
        }

        if (op === "deposit") {
          const userId = String(body.userId ?? "");
          const asset = String(body.asset ?? "USDT");
          const network = String(body.network ?? "TRC20");
          const amount = Number(body.amount);
          const txid = body.txid ? String(body.txid) : null;
          if (!userId || !Number.isFinite(amount) || amount <= 0) {
            return Response.json({ ok: false, error: "bad deposit" }, { status: 400 });
          }
          const dup = txid
            ? await sql<{ id: string }>`select id from cash_deposits where txid = ${txid} limit 1`
            : [];
          if (dup[0]) return Response.json({ ok: true, duplicate: true });
          const id = `dep_${Date.now().toString(36)}`;
          await sql`
            insert into cash_deposits (id, user_id, asset, network, amount, txid, status)
            values (${id}, ${userId}, ${asset}, ${network}, ${amount}, ${txid}, ${"credited"})
          `;
          await creditUser(userId, asset, amount, `Deposit ${asset}`, txid ?? network);
          return Response.json({ ok: true, id });
        }

        if (op === "imported") {
          const userId = String(body.userId ?? "");
          if (!userId) return Response.json({ ok: false, error: "userId required" }, { status: 400 });
          await markWalletImported(userId);
          return Response.json({ ok: true });
        }

        if (op === "withdraw") {
          const id = String(body.id ?? "");
          const txid = body.txid ? String(body.txid) : null;
          const status = String(body.status ?? "sent");
          if (!id) return Response.json({ ok: false, error: "id required" }, { status: 400 });
          await sql`update cash_withdrawals set status = ${status}, txid = ${txid} where id = ${id}`;
          return Response.json({ ok: true });
        }

        return Response.json({ ok: false, error: "unknown op" }, { status: 400 });
      },
    },
  },
});
