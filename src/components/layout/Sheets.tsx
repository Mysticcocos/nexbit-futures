import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, LifeBuoy, Search, Star, X } from "lucide-react";
import { toast } from "sonner";
import { MARKETS } from "@/lib/markets";
import { bookBalances, useNexbit } from "@/lib/store";
import { fmtPrice, fmtTime } from "@/lib/format";
import { CoinIcon } from "@/components/icons/CoinIcon";
import { CashierSheet } from "@/components/money/CashierSheet";
import { ConvertPanel } from "@/components/trade/ConvertPanel";
import { cn } from "@/lib/utils";
import type { TransferBook } from "@/lib/types";

export function Backdrop({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button type="button" className="absolute inset-0 bg-nx-bg/70" onClick={onClose} aria-label="Close" />
      <div className="relative w-full max-w-[430px] rounded-t-nx-lg border border-nx-border bg-nx-card p-4 pb-[max(16px,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-nx-lg">
        {children}
      </div>
    </div>
  );
}

export function SearchSheet({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const setPair = useNexbit((s) => s.setPair);
  const watch = useNexbit((s) => s.watchlist);
  const toggle = useNexbit((s) => s.toggleWatchlist);
  const prices = useNexbit((s) => s.prices);
  const nav = useNavigate();
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return MARKETS.filter(
      (m) => !s || m.id.toLowerCase().includes(s) || m.name.toLowerCase().includes(s) || m.base.toLowerCase().includes(s),
    );
  }, [q]);

  return (
    <Backdrop onClose={onClose}>
      <div className="mb-3 flex items-center gap-2">
        <Search className="size-4 text-nx-muted" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search pairs"
          className="h-11 flex-1 rounded-nx-sm bg-nx-chip px-3 text-sm outline-none"
        />
        <button type="button" onClick={onClose} className="size-10 text-nx-muted" aria-label="Close">
          <X className="mx-auto size-5" />
        </button>
      </div>
      <ul className="max-h-[60vh] space-y-1 overflow-y-auto">
        {list.map((m) => {
          const t = prices[m.id];
          return (
            <li key={m.id} className="flex items-center gap-2">
              <button
                type="button"
                className="flex min-w-0 flex-1 items-center gap-3 rounded-nx-sm px-2 py-2 text-left hover:bg-nx-chip"
                onClick={() => {
                  setPair(m.id);
                  onClose();
                  void nav({ to: "/trade" });
                }}
              >
                <CoinIcon symbol={m.base} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{m.id}</span>
                  <span className="text-[11px] text-nx-muted">{m.name}</span>
                </span>
                <span className="text-right text-sm tabular">{t ? fmtPrice(t.price) : "—"}</span>
              </button>
              <button
                type="button"
                onClick={() => toggle(m.id)}
                className="size-10 text-nx-muted"
                aria-label="Favorite"
              >
                <Star className={cn("mx-auto size-4", watch.includes(m.id) && "fill-nx-accent text-nx-accent")} />
              </button>
            </li>
          );
        })}
      </ul>
    </Backdrop>
  );
}

export function BellSheet({ onClose }: { onClose: () => void }) {
  const notes = useNexbit((s) => s.notifications);
  const mark = useNexbit((s) => s.markNotificationsRead);
  return (
    <Backdrop onClose={onClose}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Bell className="size-4 text-nx-accent" /> Notifications
        </h2>
        <button type="button" onClick={() => { mark(); onClose(); }} className="text-xs text-nx-accent">
          Mark read
        </button>
      </div>
      <ul className="max-h-[55vh] space-y-2 overflow-y-auto">
        {notes.map((n) => (
          <li key={n.id} className="rounded-nx-sm bg-nx-chip px-3 py-3">
            <p className="text-sm font-medium">{n.title}</p>
            <p className="text-xs text-nx-muted">{n.body}</p>
            <p className="mt-1 text-[10px] text-nx-muted">{fmtTime(n.at)}</p>
          </li>
        ))}
      </ul>
    </Backdrop>
  );
}

export function MoreSheet({ onClose }: { onClose: () => void }) {
  const items = [
    { to: "/wallet", label: "Wallet" },
    { to: "/p2p", label: "P2P" },
    { to: "/futures", label: "Futures" },
    { to: "/copy", label: "Copy" },
    { to: "/earn", label: "Earn" },
    { to: "/alerts", label: "Alerts" },
    { to: "/activity", label: "Activity" },
    { to: "/profile", label: "Account" },
    { to: "/support", label: "Support" },
    { to: "/markets", label: "Markets" },
    { to: "/admin", label: "Admin" },
  ] as const;
  return (
    <Backdrop onClose={onClose}>
      <h2 className="mb-3 text-base font-semibold">More</h2>
      <div className="grid grid-cols-2 gap-2">
        {items.map((it) => (
          <Link
            key={it.to}
            to={it.to}
            onClick={onClose}
            className="rounded-nx-sm bg-nx-chip px-3 py-4 text-sm font-medium"
          >
            {it.label}
          </Link>
        ))}
      </div>
    </Backdrop>
  );
}

export function ConvertSheet({ onClose }: { onClose: () => void }) {
  return (
    <Backdrop onClose={onClose}>
      <ConvertPanel />
    </Backdrop>
  );
}

export function MoneySheet({
  mode,
  onClose,
}: {
  mode: "deposit" | "withdraw" | "transfer";
  onClose: () => void;
}) {
  if (mode === "deposit" || mode === "withdraw") {
    return <CashierSheet mode={mode} onClose={onClose} />;
  }
  return <TransferSheet onClose={onClose} />;
}

function TransferSheet({ onClose }: { onClose: () => void }) {
  const [amt, setAmt] = useState("500");
  const [from, setFrom] = useState<TransferBook>("spot");
  const [to, setTo] = useState<TransferBook>("futures");
  const transfer = useNexbit((s) => s.transfer);
  const liquid = useNexbit((s) => s.liquidUsdt);
  const futures = useNexbit((s) => s.futuresUsdt);
  const earn = useNexbit((s) => s.earn);
  const books = bookBalances({ liquidUsdt: liquid, futuresUsdt: futures, earn });

  const go = () => {
    const n = Number(amt);
    const r = transfer(from, to, n);
    if (!r.ok) toast.error(r.error);
    else {
      toast.success(`Moved to ${to}`);
      onClose();
    }
  };

  return (
    <Backdrop onClose={onClose}>
      <h2 className="mb-1 text-base font-semibold">Transfer</h2>
      <div className="mb-3 grid grid-cols-2 gap-2">
        <BookPick label="From" value={from} onChange={setFrom} books={books} />
        <BookPick label="To" value={to} onChange={setTo} books={books} />
      </div>
      <p className="mb-2 text-[11px] text-nx-muted">Available {books[from].toFixed(2)} USDT</p>
      <input
        inputMode="decimal"
        value={amt}
        onChange={(e) => setAmt(e.target.value)}
        className="mb-3 h-11 w-full rounded-nx-sm bg-nx-chip px-3 text-lg tabular outline-none"
      />
      <button type="button" onClick={go} className="h-11 w-full rounded-nx-sm bg-nx-accent font-semibold text-nx-accent-fg">
        Confirm
      </button>
    </Backdrop>
  );
}

function BookPick({
  label,
  value,
  onChange,
  books,
}: {
  label: string;
  value: TransferBook;
  onChange: (v: TransferBook) => void;
  books: Record<TransferBook, number>;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] text-nx-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as TransferBook)}
        className="h-10 w-full rounded-nx-sm bg-nx-chip px-2 text-[13px] outline-none"
      >
        <option value="spot">Spot · {books.spot.toFixed(0)}</option>
        <option value="futures">Futures · {books.futures.toFixed(0)}</option>
        <option value="earn">Earn · {books.earn.toFixed(0)}</option>
      </select>
    </label>
  );
}

export function SupportFab() {
  return (
    <Link
      to="/support"
      className="absolute bottom-[92px] right-4 z-40 flex size-12 items-center justify-center rounded-full bg-nx-accent text-nx-accent-fg shadow-lg transition-transform duration-150 ease-out active:scale-[0.96]"
      aria-label="Support"
    >
      <LifeBuoy className="size-5" strokeWidth={2} />
    </Link>
  );
}
