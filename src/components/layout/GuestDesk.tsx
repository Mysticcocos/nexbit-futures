import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { useNexbit } from "@/lib/store";
import { startPriceEngine } from "@/lib/prices";
import { WebHome } from "@/screens/desk/WebHome";

export function GuestDesk() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    const persist = useNexbit.persist;
    const finish = () => {
      if (!alive) return;
      useNexbit.getState().hydrateTheme();
      setReady(true);
    };
    const unsub = persist.onFinishHydration(finish);
    void Promise.resolve(persist.rehydrate()).then(finish).catch(finish);
    if (persist.hasHydrated()) finish();
    return () => {
      alive = false;
      unsub();
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    return startPriceEngine();
  }, [ready]);

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-nx-bg">
        <p className="text-3xl font-extrabold tracking-tight">
          NEX<span className="text-nx-accent">BIT</span>
        </p>
      </div>
    );
  }
  return (
    <>
      <WebHome />
      <Toaster theme="dark" position="top-right" richColors duration={1400} />
    </>
  );
}
