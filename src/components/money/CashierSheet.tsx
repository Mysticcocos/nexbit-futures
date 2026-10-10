import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, Copy, Search, X } from "lucide-react";
import { CoinIcon } from "@/components/icons/CoinIcon";
import { Backdrop } from "@/components/layout/Sheets";
import { persistAccount } from "@/components/layout/AccountSync";
import { CASH_ASSETS, RECOMMENDED_COINS, cashNetwork, networkIcon } from "@/lib/cashier";
import { cashierGetAddress, cashierWithdraw } from "@/lib/cashier-api";
import { bootstrapAccount } from "@/lib/account";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { useIsDesk } from "@/lib/desk";
import { useNexbit } from "@/lib/store";
import { fmtNum } from "@/lib/format";
import { cn } from "@/lib/utils";

export function CashierSheet({
  mode,
  onClose,
}: {
  mode: "deposit" | "withdraw";
  onClose: () => void;
}) {
  const desk = useIsDesk();
  if (mode === "deposit") return desk ? <DeskDeposit onClose={onClose} /> : <DepositFlow onClose={onClose} />;
  return <WithdrawPanel onClose={onClose} />;
}

type Step = "coin" | "network" | "address";

function useDepositAddress(asset: string, network: string, ready = true) {
  const [info, setInfo] = useState<{ address: string | null; memo?: string | null; confirmations: number; min: number } | null>(null);
  const [err, setErr] = useState("");
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!ready || !asset || !network) return;
    let stop = false;
    setInfo(null);
    setErr("");
    void cashierGetAddress({ data: { asset, network } })
      .then((row) => {
        if (stop) return;
        if (!row.address) setErr("No address");
        else setInfo(row);
      })
      .catch((e: unknown) => {
        if (!stop) setErr(e instanceof Error ? e.message : "Failed");
      });
    return () => {
      stop = true;
    };
  }, [asset, network, ready, tick]);
  return { info, err, retry: () => setTick((n) => n + 1) };
}

function DepositFlow({ onClose }: { onClose: () => void }) {
  const ru = useNexbit((s) => s.locale) === "ru";
  const [step, setStep] = useState<Step>("coin");
  const [asset, setAsset] = useState("USDT");
  const [network, setNetwork] = useState("TRC20");
  const [q, setQ] = useState("");
  const [recent, setRecent] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("nexbit-dep-recent") || "[]") as string[];
    } catch {
      return [];
    }
  });
  const spec = CASH_ASSETS.find((a) => a.id === asset) ?? CASH_ASSETS[0];

  const pickCoin = (id: string) => {
    setAsset(id);
    const next = CASH_ASSETS.find((a) => a.id === id) ?? CASH_ASSETS[0];
    setNetwork(next.networks[0].id);
    const rec = [id, ...recent.filter((x) => x !== id)].slice(0, 8);
    setRecent(rec);
    localStorage.setItem("nexbit-dep-recent", JSON.stringify(rec));
    setStep("network");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-nx-bg">
      <div className="flex h-full w-full max-w-[430px] flex-col">
        {step === "coin" ? (
          <CoinStep ru={ru} q={q} setQ={setQ} recent={recent} onPick={pickCoin} onClose={onClose} />
        ) : null}
        {step === "network" ? (
          <NetworkStep
            ru={ru}
            spec={spec}
            onBack={() => setStep("coin")}
            onPick={(id) => {
              setNetwork(id);
              setStep("address");
            }}
          />
        ) : null}
        {step === "address" ? (
          <AddressStep ru={ru} asset={asset} network={network} setNetwork={setNetwork} onBack={() => setStep("network")} onClose={onClose} />
        ) : null}
      </div>
    </div>
  );
}

function CoinStep({
  ru,
  q,
  setQ,
  recent,
  onPick,
  onClose,
}: {
  ru: boolean;
  q: string;
  setQ: (v: string) => void;
  recent: string[];
  onPick: (id: string) => void;
  onClose: () => void;
}) {
  const s = q.trim().toLowerCase();
  const list = useMemo(
    () =>
      CASH_ASSETS.filter((a) => !s || a.id.toLowerCase().includes(s) || a.name.toLowerCase().includes(s)).sort((a, b) =>
        a.id.localeCompare(b.id),
      ),
    [s],
  );
  const letters = [...new Set(list.map((a) => a.id[0]!.toUpperCase()))];
  const rec = RECOMMENDED_COINS.filter((id) => CASH_ASSETS.some((a) => a.id === id));

  return (
    <>
      <header className="flex h-12 shrink-0 items-center px-3">
        <button type="button" onClick={onClose} className="flex size-9 items-center justify-center" aria-label="Back">
          <ChevronLeft className="size-5" />
        </button>
        <p className="flex-1 text-center text-[16px] font-semibold">{ru ? "Выбрать монету" : "Select coin"}</p>
        <span className="size-9" />
      </header>
      <div className="px-4">
        <div className="flex h-11 items-center gap-2 rounded-xl bg-nx-chip px-3">
          <Search className="size-4 text-nx-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={ru ? "Поиск" : "Search"} className="h-11 flex-1 bg-transparent text-[14px] outline-none" />
        </div>
        <div className="mt-3 rounded-xl bg-nx-chip px-3 py-3 text-[12px] text-nx-muted">
          {ru ? "Как внести депозит" : "How to deposit"}
          <span className="ml-2 text-nx-fg">{ru ? "Подробнее →" : "More →"}</span>
        </div>
      </div>
      <div className="relative min-h-0 flex-1 overflow-y-auto px-4 pb-8 pt-4">
        {recent.length ? (
          <>
            <p className="mb-2 text-[12px] text-nx-muted">{ru ? "Поиск по истории" : "Recent"}</p>
            <div className="mb-4 flex flex-wrap gap-2">
              {recent.map((id) => (
                <button key={id} type="button" onClick={() => onPick(id)} className="h-8 rounded-full bg-nx-chip px-3 text-[13px] font-medium">
                  {id}
                </button>
              ))}
            </div>
          </>
        ) : null}
        <p className="mb-2 text-[12px] text-nx-muted">{ru ? "Рекомендуем" : "Recommended"}</p>
        <div className="mb-5 flex flex-wrap gap-2">
          {rec.map((id) => (
            <button key={id} type="button" onClick={() => onPick(id)} className="h-8 rounded-full bg-nx-chip px-3 text-[13px] font-medium">
              {id}
            </button>
          ))}
        </div>
        {letters.map((L) => (
          <div key={L} id={`coin-${L}`}>
            <p className="sticky top-0 bg-nx-bg py-1 text-[12px] font-semibold text-nx-muted">{L}</p>
            {list
              .filter((a) => a.id[0]?.toUpperCase() === L)
              .map((a) => (
                <button key={a.id} type="button" onClick={() => onPick(a.id)} className="flex w-full items-center gap-3 py-2.5">
                  <CoinIcon symbol={a.id} size="md" />
                  <span className="text-left">
                    <span className="block text-[15px] font-semibold">{a.id}</span>
                    <span className="text-[12px] text-nx-muted">{a.name}</span>
                  </span>
                </button>
              ))}
          </div>
        ))}
        <div className="pointer-events-none absolute right-1 top-24 flex flex-col items-center text-[10px] leading-4 text-nx-muted">
          {letters.map((L) => (
            <span key={L}>{L}</span>
          ))}
        </div>
      </div>
    </>
  );
}

function NetworkStep({
  ru,
  spec,
  onBack,
  onPick,
}: {
  ru: boolean;
  spec: (typeof CASH_ASSETS)[number];
  onBack: () => void;
  onPick: (id: string) => void;
}) {
  return (
    <>
      <header className="flex h-12 shrink-0 items-center px-3">
        <p className="flex-1 text-[16px] font-semibold">{ru ? "Выберите тип сети" : "Select network"}</p>
        <button type="button" onClick={onBack} className="flex size-9 items-center justify-center" aria-label="Close">
          <X className="size-5" />
        </button>
      </header>
      <div className="mx-4 rounded-xl bg-nx-chip px-3 py-3 text-[12px] leading-4 text-nx-muted">
        {ru
          ? "Убедитесь, что вы вносите средства в сеть того же типа, с которой будете выводить."
          : "Make sure you deposit on the same network you will withdraw from."}
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto px-4 py-2">
        {spec.networks.map((n) => (
          <li key={n.id}>
            <button type="button" onClick={() => onPick(n.id)} className="flex w-full items-start gap-3 py-3.5 text-left">
              <CoinIcon symbol={networkIcon(n.id)} size="md" />
              <span>
                <span className="block text-[15px] font-semibold">{n.label}</span>
                <span className="mt-0.5 block text-[12px] text-nx-muted">
                  {ru ? `Завершение депозита: ${n.confirmations} подтверждений` : `Arrival: ${n.confirmations} confirmations`}
                </span>
                <span className="block text-[12px] text-nx-muted">
                  {ru ? `Мин. сумма депозита: ${n.min} ${spec.id}` : `Min. deposit: ${n.min} ${spec.id}`}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

function AddressStep({
  ru,
  asset,
  network,
  setNetwork,
  onBack,
  onClose,
}: {
  ru: boolean;
  asset: string;
  network: string;
  setNetwork: (v: string) => void;
  onBack: () => void;
  onClose: () => void;
}) {
  const spec = CASH_ASSETS.find((a) => a.id === asset) ?? CASH_ASSETS[0];
  const net = cashNetwork(asset, network);
  const { info, err, retry } = useDepositAddress(asset, network);

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success(ru ? "Скопировано" : "Copied");
  };

  const explorer =
    network === "TRC20"
      ? `https://tronscan.org/#/address/${info?.address ?? ""}`
      : network === "SOL"
        ? `https://solscan.io/account/${info?.address ?? ""}`
        : network === "BTC"
          ? `https://mempool.space/address/${info?.address ?? ""}`
          : `https://etherscan.io/address/${info?.address ?? ""}`;

  return (
    <>
      <header className="flex h-12 shrink-0 items-center px-3">
        <button type="button" onClick={onBack} className="flex size-9 items-center justify-center" aria-label="Back">
          <ChevronLeft className="size-5" />
        </button>
        <p className="flex flex-1 items-center justify-center gap-2 text-[16px] font-semibold">
          <CoinIcon symbol={asset} size="xs" />
          {asset}-{ru ? "Депозит" : "Deposit"}
        </p>
        <span className="size-9" />
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
        <button type="button" onClick={onBack} className="mx-auto mb-3 flex items-center gap-1 text-[13px] text-nx-muted">
          {ru ? "Сеть:" : "Network:"} {net.label} ▾
        </button>
        {info?.address ? (
          <>
            <img
              alt=""
              className="mx-auto size-44 rounded-2xl bg-white p-3"
              src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(info.address)}`}
            />
            <div className="mt-4 rounded-xl bg-nx-chip px-3 py-3">
              <p className="text-[11px] text-nx-muted">{ru ? "Адрес кошелька" : "Wallet address"}</p>
              <div className="mt-1 flex items-start gap-2">
                <p className="min-w-0 flex-1 break-all font-mono text-[13px] leading-5">{info.address}</p>
                <button type="button" onClick={() => void copy(info.address!)} className="flex size-8 shrink-0 items-center justify-center rounded-full bg-nx-card">
                  <Copy className="size-3.5" />
                </button>
              </div>
            </div>
            <dl className="mt-4 space-y-2 text-[13px]">
              <div className="flex justify-between gap-3">
                <dt className="text-nx-muted">{ru ? "Минимальная сумма депозита" : "Minimum deposit"}</dt>
                <dd>
                  {net.min} {asset}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-nx-muted">{ru ? "Поступление депозита" : "Deposit arrival"}</dt>
                <dd>
                  {net.confirmations} {ru ? "подтверждений" : "confirmations"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-nx-muted">{ru ? "Сеть" : "Network"}</dt>
                <dd>{net.label}</dd>
              </div>
            </dl>
            <p className="mt-3 text-[11px] leading-4 text-nx-muted">
              {ru
                ? "Этот адрес закреплён за вашим аккаунтом навсегда. Отправляйте только выбранный актив в этой сети."
                : "This address is permanently bound to your account. Send only the selected asset on this network."}
            </p>
            {network === "TRC20" ? (
              <a href={explorer} target="_blank" rel="noreferrer" className="mt-2 inline-block text-[12px] text-nx-accent">
                Tronscan →
              </a>
            ) : (
              <a href={explorer} target="_blank" rel="noreferrer" className="mt-2 inline-block text-[12px] text-nx-accent">
                Explorer →
              </a>
            )}
            <div className="mt-6 grid grid-cols-2 gap-2">
              <button type="button" onClick={onClose} className="h-11 rounded-full border border-nx-border text-[14px] font-medium">
                {ru ? "Сохранить" : "Save"}
              </button>
              <button type="button" onClick={() => void copy(info.address!)} className="h-11 rounded-full bg-nx-accent text-[14px] font-semibold text-nx-accent-fg">
                {ru ? "Копировать адрес" : "Copy address"}
              </button>
            </div>
          </>
        ) : (
          <div className="py-16 text-center">
            <p className="text-sm text-nx-muted">{err ? err : ru ? "Готовим ваш адрес…" : "Preparing your address…"}</p>
            {err ? (
              <button type="button" onClick={retry} className="mt-3 text-[13px] text-nx-accent">
                {ru ? "Повторить" : "Retry"}
              </button>
            ) : null}
          </div>
        )}
        <select
          value={network}
          onChange={(e) => setNetwork(e.target.value)}
          className="sr-only"
          aria-hidden
        >
          {spec.networks.map((n) => (
            <option key={n.id} value={n.id}>
              {n.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

function DeskDeposit({ onClose }: { onClose: () => void }) {
  const ru = useNexbit((s) => s.locale) === "ru";
  const [asset, setAsset] = useState("");
  const [network, setNetwork] = useState("");
  const spec = CASH_ASSETS.find((a) => a.id === asset);
  const { info, err, retry } = useDepositAddress(asset, network, Boolean(asset && network));
  const rec = RECOMMENDED_COINS.filter((id) => CASH_ASSETS.some((a) => a.id === id));

  const pickCoin = (id: string) => {
    setAsset(id);
    setNetwork("");
  };

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success(ru ? "Скопировано" : "Copied");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-nx-bg">
      <div className="mx-auto max-w-[1080px] px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} className="flex size-9 items-center justify-center rounded-full hover:bg-nx-chip" aria-label="Close">
              <ChevronLeft className="size-5" />
            </button>
            <h1 className="text-[28px] font-semibold">{ru ? "Депозит" : "Deposit"}</h1>
          </div>
          <button
            type="button"
            onClick={() => toast.message(ru ? "Фиат скоро" : "Fiat coming soon")}
            className="flex h-9 items-center rounded-full bg-nx-chip px-4 text-[13px]"
          >
            {ru ? "Фиат-депозит" : "Fiat Deposit"}
          </button>
        </div>

        <div className="grid grid-cols-[1.15fr_0.85fr] gap-10">
          <div className="rounded-2xl bg-nx-card p-6">
            <StepRow n={1} active={!asset} done={Boolean(asset)}>
              <p className="text-[16px] font-semibold">{ru ? "Выберите монету" : "Choose coin to deposit"}</p>
              <select
                value={asset}
                onChange={(e) => pickCoin(e.target.value)}
                className="mt-3 h-11 w-full rounded-lg bg-nx-chip px-3 text-[14px] outline-none"
              >
                <option value="">{ru ? "Выберите" : "Please Select"}</option>
                {CASH_ASSETS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.id} — {a.name}
                  </option>
                ))}
              </select>
              <div className="mt-3 flex flex-wrap gap-2">
                {rec.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => pickCoin(id)}
                    className={cn(
                      "flex h-9 items-center gap-1.5 rounded-full bg-nx-chip px-3 text-[13px]",
                      asset === id && "ring-1 ring-nx-accent",
                    )}
                  >
                    <CoinIcon symbol={id} size="xs" /> {id}
                  </button>
                ))}
              </div>
            </StepRow>

            <StepRow n={2} active={Boolean(asset) && !network} done={Boolean(network)}>
              <p className="text-[16px] font-semibold">{ru ? "Выберите сеть" : "Choose a Chain"}</p>
              <select
                value={network}
                disabled={!spec}
                onChange={(e) => setNetwork(e.target.value)}
                className="mt-3 h-11 w-full rounded-lg bg-nx-chip px-3 text-[14px] outline-none disabled:opacity-40"
              >
                <option value="">{ru ? "Выберите сеть" : "Select chain"}</option>
                {(spec?.networks ?? []).map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.label}
                  </option>
                ))}
              </select>
            </StepRow>

            <StepRow n={3} active={Boolean(asset && network)} done={Boolean(info?.address)} last>
              <p className="text-[16px] font-semibold">{ru ? "Подтвердите детали" : "Confirm deposit details"}</p>
              {asset && network ? (
                info?.address ? (
                  <div className="mt-4 flex gap-5">
                    <img
                      alt=""
                      className="size-36 rounded-xl bg-white p-2"
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(info.address)}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] text-nx-muted">{ru ? "Адрес кошелька" : "Wallet address"}</p>
                      <p className="mt-1 break-all font-mono text-[13px]">{info.address}</p>
                      <p className="mt-3 text-[12px] text-nx-muted">
                        {ru ? "Мин." : "Min."} {cashNetwork(asset, network).min} {asset} · {cashNetwork(asset, network).confirmations} {ru ? "подтв." : "conf."}
                      </p>
                      <button type="button" onClick={() => void copy(info.address!)} className="mt-3 h-9 rounded-full bg-nx-accent px-4 text-[13px] font-semibold text-nx-accent-fg">
                        {ru ? "Копировать адрес" : "Copy address"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 text-[13px] text-nx-muted">
                    {err || (ru ? "Готовим ваш адрес…" : "Preparing your address…")}
                    {err ? (
                      <button type="button" onClick={retry} className="ml-2 text-nx-accent">
                        {ru ? "Повторить" : "Retry"}
                      </button>
                    ) : null}
                  </div>
                )
              ) : (
                <p className="mt-2 text-[13px] text-nx-muted">{ru ? "Сначала выберите монету и сеть." : "Select a coin and chain first."}</p>
              )}
            </StepRow>
          </div>

          <aside>
            <p className="text-[18px] font-semibold">FAQ</p>
            <ul className="mt-4 space-y-3 text-[13px] text-nx-muted">
              <li>{ru ? "Как сделать депозит" : "How to Make a Deposit"}</li>
              <li className="text-nx-accent">{ru ? "Правила восстановления неподдерживаемого депозита" : "Unsupported Deposit Recovery Procedure Rules"}</li>
              <li>{ru ? "FAQ — крипто-депозит" : "FAQ — Crypto Deposit"}</li>
              <li>{ru ? "Как восстановить депозит без memo/tag" : "How to Recover a Deposit with Wrong or Missing Tag/Memo"}</li>
            </ul>
            <hr className="my-5 border-nx-border" />
            <p className="text-[13px] text-nx-muted">{ru ? "Депозит не зачислился?" : "Deposits yet to be credited?"}</p>
            <p className="mt-2 text-[13px] text-nx-muted">{ru ? "Адрес закреплён за вашим аккаунтом навсегда." : "This address is permanently bound to your account."}</p>
          </aside>
        </div>
      </div>
    </div>
  );
}

function StepRow({
  n,
  active,
  done,
  last,
  children,
}: {
  n: number;
  active: boolean;
  done: boolean;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("relative flex gap-4", !last && "pb-8")}>
      {!last ? <span className="absolute left-[15px] top-8 h-[calc(100%-16px)] w-px bg-nx-border" /> : null}
      <span
        className={cn(
          "relative z-[1] flex size-8 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold",
          done || active ? "bg-nx-accent text-nx-accent-fg" : "bg-nx-chip text-nx-muted",
        )}
      >
        {n}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function WithdrawPanel({ onClose }: { onClose: () => void }) {
  const user = useCurrentUser();
  const hydrate = useNexbit((s) => s.hydrateAccount);
  const liquid = useNexbit((s) => s.liquidUsdt);
  const holdings = useNexbit((s) => s.holdings);
  const [asset, setAsset] = useState("USDT");
  const [network, setNetwork] = useState("TRC20");
  const [address, setAddress] = useState("");
  const [memo, setMemo] = useState("");
  const [amount, setAmount] = useState("");
  const net = cashNetwork(asset, network);
  const avail = asset === "USDT" ? liquid : (holdings[asset] ?? 0);
  const n = Number(amount) || 0;

  return (
    <Backdrop onClose={onClose}>
      <h2 className="mb-3 text-base font-semibold">Withdraw</h2>
      <AssetNet asset={asset} network={network} onAsset={setAsset} onNetwork={setNetwork} />
      <p className="mt-2 text-[11px] text-nx-muted">
        Available {fmtNum(avail, 6)} {asset} · fee {net.fee} · min {net.min}
      </p>
      <input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder={`${network} address`}
        className="mt-2 h-10 w-full rounded-md bg-nx-chip px-3 text-sm outline-none"
      />
      {net.memo ? (
        <input
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="Memo / tag"
          className="mt-2 h-10 w-full rounded-md bg-nx-chip px-3 text-sm outline-none"
        />
      ) : null}
      <input
        inputMode="decimal"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
        className="mt-2 h-10 w-full rounded-md bg-nx-chip px-3 text-sm tabular outline-none"
      />
      <p className="mt-1 text-[11px] text-nx-muted">
        You receive {Math.max(0, n).toFixed(6)} {asset}. Fee {net.fee} {asset} extra.
      </p>
      <button
        type="button"
        className="mt-3 h-11 w-full rounded-md bg-nx-accent font-semibold text-nx-accent-fg"
        onClick={() => {
          void persistAccount()
            .catch(() => undefined)
            .then(() =>
              cashierWithdraw({
                data: { asset, network, address, amount: n, memo: memo || undefined },
              }),
            )
            .then(async () => {
              if (user) {
                const snap = await bootstrapAccount({ data: { displayName: user.displayName ?? "Trader" } });
                hydrate(user.id, snap);
              }
              toast.success("Withdrawal queued");
              onClose();
            })
            .catch((e: unknown) => toast.error(e instanceof Error ? e.message : "Failed"));
        }}
      >
        Confirm withdraw
      </button>
    </Backdrop>
  );
}

function AssetNet({
  asset,
  network,
  onAsset,
  onNetwork,
}: {
  asset: string;
  network: string;
  onAsset: (v: string) => void;
  onNetwork: (v: string) => void;
}) {
  const spec = CASH_ASSETS.find((a) => a.id === asset)!;
  return (
    <div className="grid grid-cols-2 gap-2">
      <label className="block">
        <span className="mb-1 block text-[11px] text-nx-muted">Coin</span>
        <div className="flex h-10 items-center gap-2 rounded-md bg-nx-chip px-2">
          <CoinIcon symbol={asset} size="xs" />
          <select value={asset} onChange={(e) => onAsset(e.target.value)} className="h-10 flex-1 bg-transparent text-sm outline-none">
            {CASH_ASSETS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.id}
              </option>
            ))}
          </select>
        </div>
      </label>
      <label className="block">
        <span className="mb-1 block text-[11px] text-nx-muted">Network</span>
        <select value={network} onChange={(e) => onNetwork(e.target.value)} className="h-10 w-full rounded-md bg-nx-chip px-2 text-sm outline-none">
          {spec.networks.map((n) => (
            <option key={n.id} value={n.id}>
              {n.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}