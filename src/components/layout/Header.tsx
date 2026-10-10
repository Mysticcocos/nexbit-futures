import { Gift, Headphones, MessageCircle } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useNexbit } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function Header() {
  const t = useT();
  const unread = useNexbit((s) => s.notifications.filter((n) => !n.read).length);
  const tickets = useNexbit((s) => s.tickets.filter((t) => t.status !== "resolved").length);
  const userName = useNexbit((s) => s.userName);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const walletOn = path === "/wallet";
  const badge = unread + tickets;

  return (
    <header className="sticky top-0 z-30 bg-nx-bg/95 px-3 pb-0.5 pt-[max(6px,env(safe-area-inset-top))] backdrop-blur-md">
      <div className="relative flex h-9 items-center justify-between">
        <div className="flex items-center">
          <Link
            to="/profile"
            className="flex size-7 items-center justify-center rounded-full bg-nx-chip text-[10px] font-semibold text-nx-accent"
            aria-label="Profile"
          >
            {initials(userName)}
          </Link>
          <Link to="/support" className="flex size-7 items-center justify-center text-nx-muted" aria-label="Support">
            <Headphones className="size-4" strokeWidth={1.7} />
          </Link>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="flex rounded-full bg-nx-chip p-px">
            <Link
              to="/"
              className={cn(
                "flex h-7 min-w-[72px] items-center justify-center rounded-full px-3 text-[12px] font-semibold",
                !walletOn ? "bg-nx-card text-nx-fg" : "text-nx-muted",
              )}
            >
              {t("exchange")}
            </Link>
            <Link
              to="/wallet"
              className={cn(
                "flex h-7 min-w-[72px] items-center justify-center rounded-full px-3 text-[12px] font-semibold",
                walletOn ? "bg-nx-card text-nx-fg" : "text-nx-muted",
              )}
            >
              {t("wallet")}
            </Link>
          </div>
        </div>

        <div className="flex items-center">
          <Link to="/earn" className="flex size-7 items-center justify-center text-nx-muted" aria-label="Rewards">
            <Gift className="size-4" strokeWidth={1.7} />
          </Link>
          <Link to="/support" className="relative flex size-7 items-center justify-center text-nx-muted" aria-label="Messages">
            <MessageCircle className="size-4" strokeWidth={1.7} />
            {badge > 0 ? (
              <span className="absolute right-0 top-0 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-nx-accent px-0.5 text-[8px] font-bold text-nx-accent-fg">
                {badge > 99 ? "99+" : badge}
              </span>
            ) : null}
          </Link>
        </div>
      </div>
    </header>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
