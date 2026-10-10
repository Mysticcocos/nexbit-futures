import type { PriceTick } from "./markets";
import { useNexbit } from "./store";

async function fetchRemote(): Promise<Record<string, PriceTick> | null> {
  try {
    const res = await fetch("/api/tickers", { cache: "no-store" });
    if (!res.ok) return null;
    const body = (await res.json()) as { ok?: boolean; ticks?: Record<string, PriceTick> };
    if (!body.ok || !body.ticks || !Object.keys(body.ticks).length) return null;
    return body.ticks;
  } catch {
    return null;
  }
}

export function startPriceEngine(): () => void {
  let live = true;

  const tick = async () => {
    if (!live) return;
    const remote = await fetchRemote();
    if (!live || !remote) return;
    useNexbit.getState().applyPrices(remote);
  };

  void tick();
  const id = window.setInterval(() => void tick(), 2500);
  return () => {
    live = false;
    window.clearInterval(id);
  };
}
